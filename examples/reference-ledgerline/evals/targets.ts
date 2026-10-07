import { signRequest } from '../src/core/sign.ts';
import { startWorker } from '../targets/railway/server.ts';
import cloudflareWorker from '../targets/cloudflare/worker.ts';

export const TEST_SECRET = 'test-secret-not-a-credential';
export const PORTAL_TOKEN = 'test-portal-token-not-a-credential';

export interface Target {
  name: string;
  /** Sends a request as the harness (signed for worker targets, bearer for the portal). */
  call(method: string, path: string, body?: unknown): Promise<{ status: number; json: any }>;
  reset(): Promise<void>;
  close(): Promise<void>;
}

export interface TargetEnv { stubOrReal: 'stub' | 'gemini'; seedRegression?: string; apiKey?: string }

function workerEnv(t: TargetEnv) {
  return {
    LEDGERLINE_TEST: '1',
    LEDGERLINE_SHARED_SECRET: TEST_SECRET,
    MODEL_PROVIDER: t.stubOrReal,
    ...(t.apiKey ? { GOOGLE_GENERATIVE_AI_API_KEY: t.apiKey } : {}),
    ...(t.seedRegression ? { LEDGERLINE_SEED_REGRESSION: t.seedRegression } : {}),
  };
}

async function signedCall(base: string | null, handler: ((r: Request) => Promise<Response>) | null, method: string, path: string, body?: unknown) {
  const payload = body === undefined ? '' : JSON.stringify(body);
  const headers = { 'content-type': 'application/json', ...(await signRequest(TEST_SECRET, method, path, payload)) };
  const init = { method, headers, ...(method === 'GET' ? {} : { body: payload }) };
  const res = base ? await fetch(new URL(path, base), init) : await handler!(new Request(`http://worker.test${path}`, init));
  return { status: res.status, json: await res.json() };
}

/** Adapter A, in process: calls the Worker module's fetch handler directly with a ctx that collects waitUntil work. */
export function cloudflareInProcess(t: TargetEnv): Target {
  const pending: Promise<unknown>[] = [];
  const ctx = { waitUntil: (p: Promise<unknown>) => { pending.push(p); }, passThroughOnException() {} } as unknown as ExecutionContext;
  const env = workerEnv(t);
  const handler = (r: Request) => cloudflareWorker.fetch(r, env, ctx);
  const call = (m: string, p: string, b?: unknown) => signedCall(null, handler, m, p, b);
  return { name: 'A: cloudflare worker module (in process)', call, reset: async () => { await call('POST', '/_test/reset', {}); }, close: async () => { await Promise.allSettled(pending); } };
}

/** Adapter A, over HTTP: a running `wrangler dev` instance. */
export function cloudflareHttp(baseUrl: string): Target {
  const call = (m: string, p: string, b?: unknown) => signedCall(baseUrl, null, m, p, b);
  return { name: `A: wrangler dev at ${baseUrl}`, call, reset: async () => { await call('POST', '/_test/reset', {}); }, close: async () => {} };
}

/** Adapter B: Vercel route handlers forward over real HTTP (localhost) to the Railway worker server. */
export async function vercelRailway(t: TargetEnv): Promise<Target> {
  const { server, port } = await startWorker(workerEnv(t), 0);
  const workerUrl = `http://127.0.0.1:${port}`;
  process.env.RAILWAY_WORKER_URL = workerUrl;
  process.env.LEDGERLINE_SHARED_SECRET = TEST_SECRET;
  process.env.PORTAL_API_TOKEN = PORTAL_TOKEN;
  const ingestRoute = await import('../targets/vercel/api/invoices/index.ts');
  const getRoute = await import('../targets/vercel/api/invoices/[id].ts');
  const msgRoute = await import('../targets/vercel/api/invoices/[id]/messages.ts');
  const call: Target['call'] = async (method, path, body) => {
    const init = { method, headers: { authorization: `Bearer ${PORTAL_TOKEN}`, 'content-type': 'application/json' }, ...(body === undefined || method === 'GET' ? {} : { body: JSON.stringify(body) }) };
    const req = new Request(`https://portal.test/api${path}`, init);
    let res: Response;
    if (method === 'POST' && path === '/invoices') res = await ingestRoute.POST(req);
    else if (method === 'GET' && /^\/invoices\/[\w-]+$/.test(path)) res = await getRoute.GET(req);
    else if (method === 'POST' && /^\/invoices\/[\w-]+\/messages$/.test(path)) res = await msgRoute.POST(req);
    else throw new Error(`no portal route for ${method} ${path}`);
    return { status: res.status, json: await res.json() };
  };
  return {
    name: `B: vercel route handlers -> railway worker server at ${workerUrl}`,
    call,
    reset: async () => { await signedCall(workerUrl, null, 'POST', '/_test/reset', {}); },
    close: async () => { await new Promise<void>((r) => server.close(() => r())); },
  };
}
