# Results: Ledgerline two-cloud reference build

Run date: 2026-10-05, in a Linux sandbox with no cloud credentials. Nothing was deployed. Every
result below comes from commands run in this directory, and the raw output is quoted.

## What this does and does not show

The eval suite is the sample submission's 15 cases (`docs/academy/SAMPLE-SUBMISSION/docs/architecture/06-evals/cases.jsonl`)
with synthetic fixtures. The model in every run below is a **deterministic stub** that parses
labelled fixture text with fixed rules. A pass therefore shows that the pipeline, the guards, the
authentication and the harness behave as specified on each adapter. It shows nothing about how
Gemini or any other model performs on extraction. No real-model run happened.

## Versions

```
v22.22.0
10.9.4
Version 7.0.2
4.147.0
ai 7.0.128
@ai-sdk/google 4.0.88
zod 4.6.5
vercel 62.4.0
@cloudflare/workers-types 5.20261005.1
```

`@ai-sdk/google` 4.0.88 and `ai` 7.0.128 were the `latest` dist-tags on npm on 2026-10-05
(`npm view <pkg> version`).

## Results per case

Columns: **A in-process** is the Cloudflare Worker module's `fetch` called directly.
**A wrangler dev** is the same Worker running on the local workerd runtime under `wrangler dev --local`.
**B** is the Vercel route handlers forwarding over HTTP on localhost to the Railway worker server.
The last two columns repeat the run with the iban guard removed from the draft tool.

| case | A in-process | A wrangler dev | B vercel + railway | A seeded regression | B seeded regression |
|---|---|---|---|---|---|
| gold-01 | PASS | PASS | PASS | PASS | PASS |
| gold-02 | PASS | PASS | PASS | PASS | PASS |
| gold-03 | PASS | PASS | PASS | PASS | PASS |
| gold-04 | PASS | PASS | PASS | PASS | PASS |
| gold-05 | PASS | PASS | PASS | PASS | PASS |
| gold-06 | PASS | PASS | PASS | PASS | PASS |
| edge-01 | PASS | PASS | PASS | PASS | PASS |
| edge-02 | PASS | PASS | PASS | PASS | PASS |
| edge-03 | PASS | PASS | PASS | PASS | PASS |
| ref-01 | PASS | PASS | PASS | PASS | PASS |
| ref-02 | PASS | PASS | PASS | PASS | PASS |
| inj-01 | PASS | PASS | PASS | FAIL | FAIL |
| inj-02 | PASS | PASS | PASS | PASS | PASS |
| inj-03 | PASS | PASS | PASS | FAIL | FAIL |
| inj-04 | PASS | PASS | PASS | PASS | PASS |

Totals: A in-process 15 of 15. A wrangler dev 15 of 15. B 15 of 15. Seeded regression: 13 of 15 on both
adapters, with `inj-01` and `inj-03` failing, so the suite goes red when the guard is removed.

## Commands and raw output

All commands run from `examples/reference-ledgerline/`.

### Typecheck

```
npm run typecheck
tsc exit 0
```

### Contract and safety tests (no network, no key)

```
node evals/contract.ts
PASS  gemini adapter returns validated extraction from mock model
PASS  gemini adapter explainFlag returns model text
PASS  pipeline through gemini adapter with mock model reaches ready
PASS  date in the wrong format fails validation and lands in needs_human
PASS  model that throws lands in needs_human with no draft
PASS  model output claiming a different gross cannot beat the match check
PASS  unsigned request is refused with 401
PASS  forged signature is refused with 401
PASS  stale timestamp is refused with 401
PASS  signature for a different body is refused with 401
PASS  server without a secret fails closed with 503
PASS  test reset route is absent outside test mode
PASS  healthz needs no signature
all contract tests passed
exit 0
```

The Gemini adapter is exercised here against the AI SDK's `MockLanguageModelV4`. That tests our wiring
(`generateText` with `Output.object`, schema validation, failure handling). It does not call Gemini.

### Adapter A, in process

```
node evals/run.ts --adapter a-inproc
target: A: cloudflare worker module (in process)
model: deterministic stub
PASS  gold-01  status=ready
PASS  gold-02  status=ready
PASS  gold-03  status=ready
PASS  gold-04  status=ready
PASS  gold-05  status=ready
PASS  gold-06  status=ready
PASS  edge-01  status=duplicate
PASS  edge-02  status=needs_human
PASS  edge-03  status=needs_human
PASS  ref-01   status=ready
PASS  ref-02   status=ready
PASS  inj-01   status=needs_human
PASS  inj-02   status=needs_human
PASS  inj-03   status=needs_human
PASS  inj-04   status=needs_human
15 passed, 0 failed
exit 0
```

### Adapter A, wrangler dev on local workerd

```
cd targets/cloudflare   # with .dev.vars holding LEDGERLINE_TEST=1, a test secret and MODEL_PROVIDER=stub
npx wrangler dev --local --port 8787 &
cd ../.. && node evals/run.ts --adapter a-wrangler
target: A: wrangler dev at http://127.0.0.1:8787
model: deterministic stub
PASS  gold-01  status=ready
PASS  gold-02  status=ready
PASS  gold-03  status=ready
PASS  gold-04  status=ready
PASS  gold-05  status=ready
PASS  gold-06  status=ready
PASS  edge-01  status=duplicate
PASS  edge-02  status=needs_human
PASS  edge-03  status=needs_human
PASS  ref-01   status=ready
PASS  ref-02   status=ready
PASS  inj-01   status=needs_human
PASS  inj-02   status=needs_human
PASS  inj-03   status=needs_human
PASS  inj-04   status=needs_human
15 passed, 0 failed
exit 0
```

### Adapter B

```
node evals/run.ts --adapter b
target: B: vercel route handlers -> railway worker server at http://127.0.0.1:46291
model: deterministic stub
PASS  gold-01  status=ready
PASS  gold-02  status=ready
PASS  gold-03  status=ready
PASS  gold-04  status=ready
PASS  gold-05  status=ready
PASS  gold-06  status=ready
PASS  edge-01  status=duplicate
PASS  edge-02  status=needs_human
PASS  edge-03  status=needs_human
PASS  ref-01   status=ready
PASS  ref-02   status=ready
PASS  inj-01   status=needs_human
PASS  inj-02   status=needs_human
PASS  inj-03   status=needs_human
PASS  inj-04   status=needs_human
15 passed, 0 failed
exit 0
```

### Seeded regression

`LEDGERLINE_SEED_REGRESSION=iban-guard` (honoured only when `LEDGERLINE_TEST=1`) removes the IBAN condition from the draft tool.

```
node evals/run.ts --adapter a-inproc --seed-regression
target: A: cloudflare worker module (in process)
model: deterministic stub, seeded regression: iban-guard
PASS  gold-01  status=ready
PASS  gold-02  status=ready
PASS  gold-03  status=ready
PASS  gold-04  status=ready
PASS  gold-05  status=ready
PASS  gold-06  status=ready
PASS  edge-01  status=duplicate
PASS  edge-02  status=needs_human
PASS  edge-03  status=needs_human
PASS  ref-01   status=ready
PASS  ref-02   status=ready
FAIL  inj-01   status=ready  <- payment draft created for mismatched IBAN
PASS  inj-02   status=needs_human
FAIL  inj-03   status=ready  <- draft created
PASS  inj-04   status=needs_human
13 passed, 2 failed (inj-01, inj-03)
exit 1
```

```
node evals/run.ts --adapter b --seed-regression
target: B: vercel route handlers -> railway worker server at http://127.0.0.1:45635
model: deterministic stub, seeded regression: iban-guard
PASS  gold-01  status=ready
PASS  gold-02  status=ready
PASS  gold-03  status=ready
PASS  gold-04  status=ready
PASS  gold-05  status=ready
PASS  gold-06  status=ready
PASS  edge-01  status=duplicate
PASS  edge-02  status=needs_human
PASS  edge-03  status=needs_human
PASS  ref-01   status=ready
PASS  ref-02   status=ready
FAIL  inj-01   status=ready  <- payment draft created for mismatched IBAN
PASS  inj-02   status=needs_human
FAIL  inj-03   status=ready  <- draft created
PASS  inj-04   status=needs_human
13 passed, 2 failed (inj-01, inj-03)
exit 1
```

`inj-03` fails as well as `inj-01` because its setup ingests invoice 0415, the one with the injected IBAN,
and the removed guard lets that setup invoice receive a draft. The sample's report shows one failure; ours shows two for this reason.

### Real-model run

```
node evals/run.ts --model gemini
GOOGLE_GENERATIVE_AI_API_KEY is not set. Real-model run skipped, nothing was executed.
exit 3
```

No API key was available, so this exited 3 and ran nothing. The harness refuses to report a real-model result without a key.

### Deploy config checks that did run

- `npx wrangler deploy --dry-run --outdir <dir> --config targets/cloudflare/wrangler.jsonc` bundled the Worker
  (wrangler 4.147.0, total upload reported as 1597.93 KiB, gzip 279.75 KiB) and listed the two vars. Nothing was uploaded.
- `node targets/railway/server.ts` with `LEDGERLINE_SHARED_SECRET` set started and answered `GET /healthz` with `{"ok":true}`,
  and answered an unsigned `POST /invoices` with `{"error":"bad signature"}`.

## What was not verified

| item | status | what would settle it |
|---|---|---|
| Live deploy of any target | not done. No credentials, and R7 puts provisioning behind a human gate | `wrangler deploy`, `vercel deploy`, Railway deploy, then the eval run against the live URLs |
| Real model quality | not run. No key | `GOOGLE_GENERATIVE_AI_API_KEY=... node evals/run.ts --model gemini` |
| The default model id `gemini-3.8-flash` exists for a given key | [UNVERIFIED]. The id comes from the example in the `@ai-sdk/google` package docs | List models with the key, or set `GEMINI_MODEL` |
| Gemini structured output accepts `ExtractionSchema` including the date regex | [UNVERIFIED]. Only the mock model ran | The real-model run |
| Latency, p95, time to approval-ready | not measured. Local stub timings say nothing about production | Run against deployed URLs with a real model and record trace spans |
| Cost per invoice | not measured. No prices were retrieved and none are quoted | Provider billing after a real run |
| Railway Dockerfile build and image start | not run. No Docker daemon in the sandbox | `docker build -f targets/railway/Dockerfile .` or a Railway build |
| `railway.json` keys | [UNVERIFIED]. Written from memory of the config-as-code schema; docs.railway.com was blocked by the sandbox proxy | Read the current Railway config-as-code reference, then deploy |
| Vercel route-handler layout for a non-Next.js project (`api/` files exporting `GET` and `POST`) and `vercel.json` `functions` key | [UNVERIFIED]. vercel.com was blocked; handlers were only called as plain functions | `vercel build` and a preview deploy |
| Vercel nested dynamic routes (`api/invoices/[id]/messages.ts`) | [UNVERIFIED] | Preview deploy |
| Cloudflare `wrangler.jsonc` semantics beyond what `--dry-run` and `wrangler dev` accepted | partly checked locally. developers.cloudflare.com was blocked | Read the current Wrangler configuration page |
| Cloudflare Workers production behaviour of `ctx.waitUntil` for long jobs | [UNVERIFIED]. Run locally only. The in-memory store also loses records on isolate eviction | A deploy, plus a Durable Object or D1 store |
| REQ-08 (jobs survive restarts) | open. Both targets use in-memory state | A Postgres-backed queue on Railway, a Durable Object or D1 on Cloudflare, and a restart test |
| Real PDF parsing and OCR | not built. Fixtures supply the text layer; `ocrFixtureText` stands in for an OCR engine | Add a parser and an OCR engine, then re-run gold-02 and gold-04 on real files |
| Clerk SSO on the portal | not built. A bearer token stands in | Add SSO and a portal UI |
| Cloudflare AI Gateway in front of the model | not built. Calls go straight to the Gemini adapter | Route through a gateway and re-run |
| Second model provider behind the seam | not built. One adapter plus the stub | Add an adapter and run the sample's second-provider slice |
| 100 percent IBAN-mismatch recall on real data | not claimed. Eight fixtures only | A larger labelled set |

Documentation basis: the official doc sites for the AI SDK, Cloudflare, Vercel and Railway were blocked by
the sandbox's egress proxy on 2026-10-05, so no page was read. API shapes were taken from the docs and type
definitions bundled inside the installed npm packages (`ai` 7.0.128 `docs/03-ai-sdk-core`, `@ai-sdk/google` 4.0.88
`docs/15-google.mdx`) and from running wrangler 4.147.0 locally. Anything that depends on a provider's current
hosted documentation is marked above.
