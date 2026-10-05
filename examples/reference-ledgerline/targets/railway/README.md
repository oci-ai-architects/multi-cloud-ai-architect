# Target B worker: Railway-style container

Status: the server starts and answers locally under Node 22.22. The Docker image was not built (no
Docker daemon in the sandbox) and nothing was deployed. `railway.json` keys are written from memory of
the config-as-code schema and are [UNVERIFIED] against current Railway documentation.

## Local run

```bash
cd examples/reference-ledgerline
npm ci
LEDGERLINE_SHARED_SECRET=local-test-secret MODEL_PROVIDER=gemini GOOGLE_GENERATIVE_AI_API_KEY=... PORT=8080 node targets/railway/server.ts
curl localhost:8080/healthz
```

## Container

```bash
docker build -f targets/railway/Dockerfile -t ledgerline-worker .     # context: examples/reference-ledgerline
docker run --rm -p 8080:8080 -e LEDGERLINE_SHARED_SECRET=... -e GOOGLE_GENERATIVE_AI_API_KEY=... ledgerline-worker
```

## Deploy (human gate: this provisions and spends)

In the Railway dashboard create a service from this repository, set the root directory to
`examples/reference-ledgerline`, and point it at `targets/railway/railway.json` as the config file path.
Set `LEDGERLINE_SHARED_SECRET` and `GOOGLE_GENERATIVE_AI_API_KEY` as service variables. Railway injects `PORT`.
Or with the CLI after `railway login` and `railway link`: `railway up`.

## Known limits

The queue is in memory. A Postgres-backed queue that survives restarts is not built, so REQ-08 is open.
