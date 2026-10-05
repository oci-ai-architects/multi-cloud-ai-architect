# Target A: Cloudflare Worker + Gemini

Status: runs locally under `wrangler dev --local`; never deployed. Config is checked only by
`wrangler deploy --dry-run` and a local run. Cloudflare's hosted docs were not readable when this was
written (see ../../RESULTS.md), so anything about production behaviour is [UNVERIFIED].

## Local run

```bash
cd examples/reference-ledgerline
npm ci
cd targets/cloudflare
printf 'LEDGERLINE_TEST=1\nLEDGERLINE_SHARED_SECRET=local-test-secret\nMODEL_PROVIDER=stub\n' > .dev.vars   # gitignored
npx wrangler dev --local --port 8787
# in another shell, from examples/reference-ledgerline
node evals/run.ts --adapter a-wrangler
```

The harness signs with `test-secret-not-a-credential` (`evals/targets.ts`). Put that value in `.dev.vars`
as `LEDGERLINE_SHARED_SECRET` to run the command above unchanged.

## Deploy (human gate: this provisions and spends)

```bash
cd examples/reference-ledgerline
npx wrangler login
npx wrangler secret put LEDGERLINE_SHARED_SECRET --config targets/cloudflare/wrangler.jsonc
npx wrangler secret put GOOGLE_GENERATIVE_AI_API_KEY --config targets/cloudflare/wrangler.jsonc
npx wrangler deploy --config targets/cloudflare/wrangler.jsonc
```

Never set `LEDGERLINE_TEST` on a deployed Worker. It enables a state-reset route and the stub model.

## Eval against the deployed Worker

`evals/run.ts --adapter a-wrangler --base-url https://<your-worker>` requires the test routes, which are off in production by design.
Run it against a separate preview Worker that sets `LEDGERLINE_TEST=1` and `MODEL_PROVIDER=gemini`, with your key as a secret.
Because the shared secret in `evals/targets.ts` is a placeholder, change `TEST_SECRET` locally to match your preview secret and do not commit it.

## Known limits

- Records live in isolate memory and vanish on eviction. A Durable Object or D1 store is not built.
- `ctx.waitUntil` limits for long jobs were not checked against current Cloudflare documentation.
