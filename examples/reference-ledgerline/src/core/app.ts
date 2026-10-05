import { z } from 'zod';
import { MemoryStore } from './store.ts';
import { newRecord, runPipeline } from './pipeline.ts';
import { verifyRequest } from './sign.ts';
import { DEFAULT_GUARD, type DraftGuard } from './draft.ts';
import type { IngestRequest, ModelSeam } from './types.ts';

const IngestSchema = z.object({
  document: z.object({
    pages: z.number().int().positive(),
    textLayer: z.array(z.object({ text: z.string(), hidden: z.boolean().optional() })),
    scanned: z.boolean().optional(),
    ocrFixtureText: z.string().optional(),
  }),
  emailBody: z.string().optional(),
});
const MessageSchema = z.object({ kind: z.enum(['email', 'reply']), body: z.string().min(1) });

export interface AppOptions {
  seam: ModelSeam;
  /** Shared secret for portal-to-worker signing. Without it every authenticated route returns 503. */
  secret: string | undefined;
  /** Runs work after the response is returned: ctx.waitUntil on Workers, a detached promise on Node. */
  schedule: (work: Promise<unknown>) => void;
  /** Enables /_test/reset and the seeded-regression guard. Never set in production. */
  testMode?: boolean;
  guard?: DraftGuard;
}

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export function createApp(opts: AppOptions) {
  const store = new MemoryStore();
  const guard = opts.testMode && opts.guard ? opts.guard : DEFAULT_GUARD;

  async function handle(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;
    if (req.method === 'GET' && path === '/healthz') return json({ ok: true });

    const body = req.method === 'GET' ? '' : await req.text();
    if (!opts.secret) return json({ error: 'server has no shared secret configured' }, 503);
    if (!(await verifyRequest(opts.secret, req, path, body))) return json({ error: 'bad signature' }, 401);

    if (opts.testMode && req.method === 'POST' && path === '/_test/reset') {
      store.clear();
      return json({ ok: true });
    }

    if (req.method === 'POST' && path === '/invoices') {
      const parsed = IngestSchema.safeParse(safeJson(body));
      if (!parsed.success) return json({ error: 'invalid body', issues: parsed.error.issues.length }, 400);
      const input = parsed.data as IngestRequest;
      const rec = newRecord(store);
      opts.schedule(runPipeline(rec, input, { store, seam: opts.seam, guard }));
      return json({ id: rec.id, status: rec.status }, 202);
    }

    const m = path.match(/^\/invoices\/([\w-]+)(\/messages)?$/);
    if (m) {
      const rec = store.get(m[1]!);
      if (!rec) return json({ error: 'not found' }, 404);
      if (req.method === 'GET' && !m[2]) return json(rec);
      if (req.method === 'POST' && m[2]) {
        const parsed = MessageSchema.safeParse(safeJson(body));
        if (!parsed.success) return json({ error: 'invalid body' }, 400);
        // Messages are content. They never change status, flags or drafts.
        rec.contentNotes.push({ kind: parsed.data.kind, untrusted: true, text: parsed.data.body });
        rec.trace.push({ span: 'message.attached', detail: { kind: parsed.data.kind } });
        return json(rec);
      }
    }
    return json({ error: 'not found' }, 404);
  }

  return { fetch: handle, store };
}

function safeJson(s: string): unknown {
  try { return JSON.parse(s); } catch { return undefined; }
}
