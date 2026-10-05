# Target B portal: Vercel route handlers

Status: handlers were called as plain functions in the eval harness and forwarded over localhost HTTP to
the worker. `vercel build` and a preview deploy were not run. The `api/` layout for a non-Next.js project and the
`vercel.json` `functions` key are [UNVERIFIED] against current Vercel documentation (vercel.com was blocked in the sandbox).

The portal holds no model key and does no extraction. It checks a bearer token, signs the request and forwards it to the worker.
Clerk SSO is not built; `PORTAL_API_TOKEN` stands in.

## Local check

```bash
cd examples/reference-ledgerline
npm ci
node evals/run.ts --adapter b
```

## Deploy (human gate: this provisions and spends)

```bash
cd examples/reference-ledgerline/targets/vercel
npx vercel login
npx vercel link
npx vercel env add PORTAL_API_TOKEN production
npx vercel env add LEDGERLINE_SHARED_SECRET production
npx vercel env add RAILWAY_WORKER_URL production      # https://<your-railway-domain>
npx vercel deploy
```

`LEDGERLINE_SHARED_SECRET` must equal the worker's value. The project root is `targets/vercel`, and its code
imports nothing from `../../src`, so no "files outside root" setting is needed.

## Routes

| method | path | forwards to worker |
|---|---|---|
| POST | /api/invoices | POST /invoices |
| GET | /api/invoices/:id | GET /invoices/:id |
| POST | /api/invoices/:id/messages | POST /invoices/:id/messages |
