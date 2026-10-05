// Usage:
//   node evals/run.ts --adapter <a-inproc|a-wrangler|b> [--model stub|gemini] [--seed-regression] [--base-url URL] [--json out.json]
// Exit code: 0 all pass, 1 any case failed, 3 requested real model without an API key (nothing run).
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FIXTURES } from './fixtures.ts';
import { CHECKS } from './checks.ts';
import { cloudflareHttp, cloudflareInProcess, vercelRailway, type Target } from './targets.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (name: string) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const adapter = opt('--adapter') ?? 'a-inproc';
const model = (opt('--model') ?? 'stub') as 'stub' | 'gemini';
const seed = args.includes('--seed-regression') ? 'iban-guard' : undefined;
const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (model === 'gemini' && !apiKey) {
  console.error('GOOGLE_GENERATIVE_AI_API_KEY is not set. Real-model run skipped, nothing was executed.');
  process.exit(3);
}

const tenv = { stubOrReal: model, ...(seed ? { seedRegression: seed } : {}), ...(apiKey ? { apiKey } : {}) };
const target: Target =
  adapter === 'a-inproc' ? cloudflareInProcess(tenv)
  : adapter === 'a-wrangler' ? cloudflareHttp(opt('--base-url') ?? 'http://127.0.0.1:8787')
  : adapter === 'b' ? await vercelRailway(tenv)
  : (() => { throw new Error(`unknown adapter ${adapter}`); })();

async function settle(id: string): Promise<{ rec: any; ms: number }> {
  const t0 = performance.now();
  for (;;) {
    const r = await target.call('GET', `/invoices/${id}`);
    if (r.status !== 200) throw new Error(`GET ${id} -> ${r.status}`);
    if (r.json.status !== 'queued' && r.json.status !== 'processing') return { rec: r.json, ms: Math.round(performance.now() - t0) };
    if (performance.now() - t0 > 5 * 60 * 1000) throw new Error('timeout waiting for job');
    await new Promise((r2) => setTimeout(r2, 10));
  }
}

const cases = readFileSync(path.join(here, 'cases.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const results: Array<{ id: string; pass: boolean; failures: string[]; note: string }> = [];

for (const c of cases) {
  const fx = FIXTURES[c.fixture];
  const check = CHECKS[c.id];
  if (!fx || !check) { results.push({ id: c.id, pass: false, failures: ['no fixture or check defined'], note: '' }); continue; }
  try {
    await target.reset();
    const setupIds: string[] = [];
    for (const s of fx.setup) {
      const r = await target.call('POST', '/invoices', s);
      if (r.status !== 202) throw new Error(`setup ingest -> ${r.status}`);
      await settle(r.json.id);
      setupIds.push(r.json.id);
    }
    let rec: any; let before: any; let submitMs = 0; let settleMs = 0;
    if (fx.action.type === 'ingest') {
      const t0 = performance.now();
      const r = await target.call('POST', '/invoices', fx.action.req);
      submitMs = Math.round(performance.now() - t0);
      if (r.status !== 202) throw new Error(`ingest -> ${r.status} ${JSON.stringify(r.json)}`);
      const s = await settle(r.json.id);
      rec = s.rec; settleMs = s.ms + submitMs;
    } else {
      before = (await target.call('GET', `/invoices/${setupIds[0]}`)).json;
      const r = await target.call('POST', `/invoices/${setupIds[0]}/messages`, { kind: fx.action.kind, body: fx.action.body });
      if (r.status !== 200) throw new Error(`message -> ${r.status}`);
      rec = (await target.call('GET', `/invoices/${setupIds[0]}`)).json;
    }
    const failures = check({ rec, before, submitMs, settleMs, srcDir: path.join(here, '..', 'src') });
    results.push({ id: c.id, pass: failures.length === 0, failures, note: `status=${rec.status}` });
  } catch (err) {
    results.push({ id: c.id, pass: false, failures: [`harness error: ${err instanceof Error ? err.message : String(err)}`], note: '' });
  }
}
await target.close();

console.log(`target: ${target.name}`);
console.log(`model: ${model === 'stub' ? 'deterministic stub' : 'gemini'}${seed ? `, seeded regression: ${seed}` : ''}`);
for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.id.padEnd(8)} ${r.note}${r.failures.length ? '  <- ' + r.failures.join('; ') : ''}`);
const failed = results.filter((r) => !r.pass);
console.log(`${results.length - failed.length} passed, ${failed.length} failed${failed.length ? ` (${failed.map((f) => f.id).join(', ')})` : ''}`);
const out = opt('--json');
if (out) writeFileSync(out, JSON.stringify({ target: target.name, model, seed: seed ?? null, results }, null, 2));
process.exit(failed.length ? 1 : 0);
