// Contract and safety tests that need no network and no API key.
//   node evals/contract.ts
// 1. The Gemini adapter code path, run against the AI SDK's mock model (tests our wiring, not Gemini).
// 2. Safe failure: model error and schema-invalid output end in needs_human with no draft.
// 3. Authentication: unsigned, forged, stale and unconfigured requests are refused.
import { MockLanguageModelV4 } from 'ai/test';
import { geminiSeam } from '../src/adapters/gemini.ts';
import { createApp } from '../src/core/app.ts';
import { signRequest } from '../src/core/sign.ts';
import { stubSeam } from '../src/adapters/stub.ts';
import { FIXTURES } from './fixtures.ts';
import type { ModelSeam } from '../src/core/types.ts';

const SECRET = 'contract-secret-not-a-credential';
let failed = 0;
const t = async (name: string, fn: () => Promise<void>) => {
  try { await fn(); console.log(`PASS  ${name}`); } catch (e) { failed++; console.log(`FAIL  ${name}  <- ${e instanceof Error ? e.message : e}`); }
};
const eq = (a: unknown, b: unknown, msg: string) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${msg}: got ${JSON.stringify(a)}, want ${JSON.stringify(b)}`); };

const usage = { inputTokens: { total: 1, noCache: 1, cacheRead: undefined, cacheWrite: undefined }, outputTokens: { total: 1, text: 1, reasoning: undefined } };
const mock = (text: string) => new MockLanguageModelV4({ doGenerate: async () => ({ content: [{ type: 'text', text }], finishReason: { unified: 'stop', raw: undefined }, usage, warnings: [] }) });

const good = { supplier: 'Acme Tools BV', invoiceNumber: '0412', date: '2026-09-03', currency: 'EUR', net: 1200, tax: 252, gross: 1452, iban: 'NL91ABNA0417164300', poNumber: 'PO-2291', lines: [{ description: 'Hex bolts', amount: 1200 }] };

async function run(seam: ModelSeam) {
  const app = createApp({ seam, secret: SECRET, schedule: (p) => { pending.push(p); }, testMode: true });
  const pending: Promise<unknown>[] = [];
  const call = async (method: string, path: string, body?: unknown) => {
    const payload = body === undefined ? '' : JSON.stringify(body);
    const res = await app.fetch(new Request(`http://t.test${path}`, { method, headers: await signRequest(SECRET, method, path, payload), ...(method === 'GET' ? {} : { body: payload }) }));
    return { status: res.status, json: await res.json() as any };
  };
  const post = await call('POST', '/invoices', (FIXTURES['gold-01']!.action as any).req);
  await Promise.all(pending);
  return (await call('GET', `/invoices/${post.json.id}`)).json;
}

await t('gemini adapter returns validated extraction from mock model', async () => {
  const out = await geminiSeam({ model: mock(JSON.stringify(good)) }).extractInvoice('x');
  eq(out, good, 'extraction');
});
await t('gemini adapter explainFlag returns model text', async () => {
  eq(await geminiSeam({ model: mock('Flagged for review.') }).explainFlag({ flags: [], untrustedInvoiceText: 'x' }), 'Flagged for review.', 'text');
});
await t('pipeline through gemini adapter with mock model reaches ready', async () => {
  const rec = await run(geminiSeam({ model: mock(JSON.stringify(good)) }));
  eq(rec.status, 'ready', 'status');
});
await t('date in the wrong format fails validation and lands in needs_human', async () => {
  const rec = await run(geminiSeam({ model: mock(JSON.stringify({ ...good, date: '03-09-2026' })) }));
  eq([rec.status, !!rec.draftId], ['needs_human', false], 'status and draft');
});
await t('model that throws lands in needs_human with no draft', async () => {
  const seam: ModelSeam = { id: 'throws', extractInvoice: async () => { throw new Error('upstream 503'); }, explainFlag: async () => '' };
  const rec = await run(seam);
  eq([rec.status, !!rec.draftId], ['needs_human', false], 'status and draft');
});
await t('model output claiming a different gross cannot beat the match check', async () => {
  const rec = await run(geminiSeam({ model: mock(JSON.stringify({ ...good, gross: 9800, net: 9800, tax: 0, lines: [{ description: 'x', amount: 9800 }] })) }));
  eq([rec.matchStatus, !!rec.draftId], ['mismatch', false], 'match and draft');
});

async function authApp(secret: string | undefined, testMode = false) {
  const app = createApp({ seam: stubSeam(), secret, schedule: () => {}, testMode });
  return app;
}
const body = JSON.stringify((FIXTURES['gold-01']!.action as any).req);
await t('unsigned request is refused with 401', async () => {
  const r = await (await authApp(SECRET)).fetch(new Request('http://t.test/invoices', { method: 'POST', body }));
  eq(r.status, 401, 'status');
});
await t('forged signature is refused with 401', async () => {
  const h = await signRequest('wrong-secret', 'POST', '/invoices', body);
  const r = await (await authApp(SECRET)).fetch(new Request('http://t.test/invoices', { method: 'POST', headers: h, body }));
  eq(r.status, 401, 'status');
});
await t('stale timestamp is refused with 401', async () => {
  const h = await signRequest(SECRET, 'POST', '/invoices', body, Date.now() - 10 * 60 * 1000);
  const r = await (await authApp(SECRET)).fetch(new Request('http://t.test/invoices', { method: 'POST', headers: h, body }));
  eq(r.status, 401, 'status');
});
await t('signature for a different body is refused with 401', async () => {
  const h = await signRequest(SECRET, 'POST', '/invoices', '{}');
  const r = await (await authApp(SECRET)).fetch(new Request('http://t.test/invoices', { method: 'POST', headers: h, body }));
  eq(r.status, 401, 'status');
});
await t('server without a secret fails closed with 503', async () => {
  const r = await (await authApp(undefined)).fetch(new Request('http://t.test/invoices', { method: 'POST', body }));
  eq(r.status, 503, 'status');
});
await t('test reset route is absent outside test mode', async () => {
  const h = await signRequest(SECRET, 'POST', '/_test/reset', '{}');
  const r = await (await authApp(SECRET, false)).fetch(new Request('http://t.test/_test/reset', { method: 'POST', headers: h, body: '{}' }));
  eq(r.status, 404, 'status');
});
await t('healthz needs no signature', async () => {
  eq((await (await authApp(SECRET)).fetch(new Request('http://t.test/healthz'))).status, 200, 'status');
});

console.log(failed ? `${failed} failed` : 'all contract tests passed');
process.exit(failed ? 1 : 0);
