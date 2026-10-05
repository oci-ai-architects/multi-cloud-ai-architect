# Ledgerline reference build

A small agentic service built from the sample submission's spec
(`docs/academy/SAMPLE-SUBMISSION/SPEC.md`): supplier invoices go in, approval-ready payment drafts
come out, and nothing in the system can pay, approve or edit vendor data. One portable core, two
deployment targets, one eval suite.

This is a reference build with synthetic fixtures. It was run locally only. Nothing was deployed, and
no real model was called. Read [RESULTS.md](RESULTS.md) for what ran and what did not.

Licence: Apache-2.0, as the repository (`../../LICENSE`).

## Layout

```
src/core/        portable core: pipeline, guards, store, request signing, HTTP app (no cloud imports)
src/adapters/    model seam adapters: gemini (AI SDK) and a deterministic stub for tests
targets/cloudflare/   target A: Worker + wrangler.jsonc
targets/vercel/       target B portal: route handlers that forward to the worker
targets/railway/      target B worker: Node server, Dockerfile, railway.json
evals/           the 15 sample cases, fixtures, checks, runner, contract tests
```

## Design in five lines

1. The model does two bounded tasks through a seam: `extractInvoice` and `explainFlag`. It holds no tools.
2. Code does everything with consequences: duplicate check, IBAN compare (`src/core/iban.ts`), three-way match (`src/core/match.ts`), and the single draft tool (`src/core/draft.ts`) that refuses unless IBAN matches, the match passed and the invoice is not a duplicate.
3. Invoice text, email bodies and supplier replies are untrusted content. They are wrapped before any model call and never change status.
4. Any failure ends in `needs_human` with a reason. Nothing is dropped silently.
5. Portal to worker calls are HMAC-signed with a 5-minute window. A server without a secret refuses every authenticated route.

## Targets

| | A: Cloudflare + Gemini | B: Vercel + Railway |
|---|---|---|
| Entry | Worker `fetch` (`targets/cloudflare/worker.ts`) | Vercel route handlers (`targets/vercel/api/`) forward to a Node worker (`targets/railway/server.ts`) |
| Long runs | `ctx.waitUntil` after a 202 | detached promise in a long-lived process |
| State | in-memory per isolate | in-memory per process |
| Model | Gemini through the AI SDK, same adapter | same adapter |
| Guide | [targets/cloudflare/README.md](targets/cloudflare/README.md) | [targets/vercel/README.md](targets/vercel/README.md), [targets/railway/README.md](targets/railway/README.md) |

## Run the evals

Requires Node 22.18 or later (the code runs with Node's built-in type stripping).

```bash
cd examples/reference-ledgerline
npm ci
npm run typecheck
node evals/contract.ts                       # adapter and auth tests, no network
node evals/run.ts --adapter a-inproc         # target A, Worker module in process
node evals/run.ts --adapter b                # target B, portal handlers to worker over localhost HTTP
node evals/run.ts --adapter a-inproc --seed-regression   # must exit 1 (guard removed)

# real model, only if you set a key; exits 3 and runs nothing without one
GOOGLE_GENERATIVE_AI_API_KEY=... node evals/run.ts --adapter a-inproc --model gemini
```

Exit codes: 0 all pass, 1 any case failed, 3 real model requested without a key.

Eval grading is deterministic assertions on the JSON result and trace. No model judges any field.
The stub reads labelled fixture text with fixed rules, so a stub run checks the pipeline and guards,
and says nothing about model quality.

## What is deliberately missing

Real PDF parsing and OCR, durable job storage, clerk SSO and a portal UI, an AI gateway, and a second
model provider. Each is listed in RESULTS.md with the command that would settle it.
