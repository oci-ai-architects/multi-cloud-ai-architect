import { createServer, type Server } from 'node:http';
import { createApp } from '../../src/core/app.ts';
import { guardFromEnv, seamFromEnv, type SeamEnv } from '../../src/adapters/index.ts';

export interface WorkerEnv extends SeamEnv {
  LEDGERLINE_SHARED_SECRET?: string;
  LEDGERLINE_SEED_REGRESSION?: string;
}

/**
 * Long-run worker. Jobs run detached from the HTTP response on a plain Node process.
 * The queue is in memory. A Postgres-backed queue that survives restarts is not built (REQ-08 is open).
 */
export function startWorker(env: WorkerEnv, port: number): Promise<{ server: Server; port: number }> {
  const app = createApp({
    seam: seamFromEnv(env),
    secret: env.LEDGERLINE_SHARED_SECRET,
    schedule: (p) => { void p.catch(() => {}); },
    testMode: env.LEDGERLINE_TEST === '1',
    guard: guardFromEnv(env),
  });
  const server = createServer(async (req, res) => {
    const chunks: Buffer[] = [];
    for await (const c of req) chunks.push(c as Buffer);
    const body = Buffer.concat(chunks);
    const request = new Request(`http://${req.headers.host ?? 'localhost'}${req.url ?? '/'}`, {
      method: req.method ?? 'GET',
      headers: req.headers as Record<string, string>,
      ...(body.length > 0 ? { body } : {}),
    });
    const response = await app.fetch(request);
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  });
  return new Promise((resolve) => {
    server.listen(port, () => {
      const addr = server.address();
      resolve({ server, port: typeof addr === 'object' && addr ? addr.port : port });
    });
  });
}

// Entrypoint when run as a container: node targets/railway/server.ts
if (import.meta.url === `file://${process.argv[1]}`) {
  const env = process.env as WorkerEnv;
  const port = Number(process.env.PORT ?? 8080);
  if (!env.LEDGERLINE_SHARED_SECRET) {
    console.error('LEDGERLINE_SHARED_SECRET is required');
    process.exit(1);
  }
  const { port: bound } = await startWorker(env, port);
  console.log(`ledgerline worker listening on ${bound}`);
}
