---
name: pack-railway
description: Architecture decisions for hosting AI agents and their supporting services on Railway (container services, Postgres/pgvector, Redis, volumes, private networking, serverless sleep, sandboxes, templates, remote MCP at mcp.railway.com, railway agent CLI). Use when deciding whether an agent backend, MCP server, worker queue or self-hosted vector store belongs on Railway, estimating cost from per-second vCPU and RAM rates, checking plan limits, or reviewing a Railway agent deployment for reliability, secrets and eval coverage. Trigger on "deploy agent to Railway", "Railway MCP", "railway agent", "Railway template for agents", "long-running agent worker", "cheap always-on agent backend". Not for CLI syntax; the official railwayapp/railway-skills use-railway skill covers that.
metadata:
  version: "1.0.0"
  asOf: "2026-10-05"
  scope: decision-layer
  official-skills: https://github.com/railwayapp/railway-skills
---

# Railway pack: the always-on container column

Railway is a PaaS, not an AI platform: no model API, no agent framework, no gateway, **no GPUs**
([Jupyter guide](https://docs.railway.com/guides/jupyter-server-team) states services run on CPU only,
read 2026-10-05). Its value for agent work is a cheap, long-running, container-shaped home for the
parts serverless platforms handle badly: stateful workers, MCP servers, queues, Postgres with pgvector,
and self-hosted open-source agent stacks from the template marketplace.

Official skill: [railwayapp/railway-skills](https://github.com/railwayapp/railway-skills) (MIT, one
skill `use-railway`, install with `railway skills install`). The old standalone MCP repo was archived
2026-05-23; MCP now ships in the CLI and as remote OAuth MCP at `mcp.railway.com`
([changelog 2026-04-17](https://railway.com/changelog/2026-04-17-remote-mcp)).

## 1. When Railway is the right column

| Workload signal | Fit | Why |
|---|---|---|
| Agent process that must run for hours: queue consumer, scheduler, websocket server, long tool loop | Strong | Plain containers, no request timeout model; scale with replicas |
| Framework-agnostic agent (ADK, Strands, LangGraph, AI SDK, Agent Framework) packaged as a container | Strong | Railpack builds most repos with zero config |
| Self-hosted MCP servers, Postgres + pgvector, Redis, Langfuse, n8n beside the agent | Strong | Private networking by service name inside a project |
| Prototype to small production for a team without a cloud platform group | Strong | Per-second billing; Pro is $20/workspace/month with $20 usage included |
| Agent that provisions its own infra (agent-operated PaaS demo) | Good | Remote MCP over OAuth plus `railway agent` for multi-step ops |
| GPU inference or fine-tuning | No | CPU only; call hosted inference (Bedrock, Vertex, Foundry, Workers AI, gateways) |
| Strict enterprise network isolation, VPC peering to a hyperscaler, data residency attestations | Weak | Check Enterprise terms; default is a shared PaaS |
| Spiky stateless request/response with long idle periods | Medium | Serverless sleep helps, but Vercel or Workers fit better |

## 2. Topology patterns

1. **Agent worker + queue**: web service accepts requests and enqueues (Redis or Postgres `SKIP LOCKED`); worker service runs the agent loop with no timeout; results back to Postgres; client polls or subscribes. This is the standard answer when a Vercel function times out.
2. **MCP server farm**: one service per MCP server, each with its own secrets; only a gateway service is public; the rest are private-network only.
3. **RAG backbone**: Postgres with pgvector on a volume, ingestion worker, retrieval API. Pro volumes default to 50 GB.
4. **Hybrid**: UI and Workflow orchestration on Vercel; long-running agent workers and stateful MCP servers on Railway; models through a gateway. Keep the Railway services private and authenticate the Vercel caller.

## 3. Plan limits that shape the design (asOf 2026-10-05)

| Limit | Free | Hobby | Pro | Source |
|---|---|---|---|---|
| Plan price | $0 ($1 usage) | $5 incl. $5 usage | $20/workspace incl. $20 usage | [pricing](https://railway.com/pricing) |
| Max vCPU / RAM per service | 1 / 0.5 GB | 48 / 48 GB | 1,000 / 1 TB | same |
| Max replicas | 1 | 6 | 42 | same |
| Default volume size | 0.5 GB | 5 GB | 50 GB | [volumes](https://docs.railway.com/volumes/reference) |
| Volumes per project | 1 | 10 | 20 (raisable) | same |

Serverless sleep: a service with no outbound packets for about 5 minutes is put to sleep, in practice
5 to 10 minutes after last outbound traffic. **Private-network traffic counts as outbound and keeps the
service awake** ([serverless](https://docs.railway.com/deployments/serverless)). An agent that polls
Redis every 10 seconds never sleeps.

## 4. Cost envelopes

Rates in `prices.json` ([pricing](https://railway.com/pricing), asOf 2026-10-05):
about $20 per vCPU-month and $10 per GB-month of RAM for containers, $0.15 per GB-month of volume,
$0.05 per GB egress. Sandboxes bill at VM rates (about $50 per vCPU-month and $50 per GB-month).

- Agents are memory-bound, not CPU-bound: a Python agent with a 1 GB working set idles at about $10/month in RAM alone. Measure RSS before sizing.
- Every replica bills. Scale replicas on queue depth, not by default.
- Egress at $0.05/GB matters for agents that stream large tool outputs to clients or pull large documents repeatedly; cache in a volume.
- Use usage limits (hard caps) on the workspace; an agent bug that loops tool calls burns model spend elsewhere, but a fork bomb of workers burns Railway spend here.

## 5. Security controls

| Risk | Control |
|---|---|
| Public MCP server with no auth | Only one public service; MCP servers private-network only; OAuth or signed service tokens at the edge service |
| Secrets in images or repos | Railway variables per environment; sealed variables for credentials; never bake keys into Dockerfiles |
| Agent with broad platform rights (railway agent / MCP) | Use a project-scoped token; review every infra-changing action; do not give the product agent the deploy token |
| Data exfiltration through egress | No built-in egress allowlist [UNVERIFIED]: enforce at the app layer (tool allowlists, URL allowlists in fetch tools) |
| Noisy neighbour / runaway cost | Workspace usage limits and replica caps |

## 6. Eval checklist

- [ ] PR environments run the eval suite against an isolated copy of the agent and its database.
- [ ] Restart test: kill the worker mid-task; the job is re-delivered and side effects are idempotent.
- [ ] Sleep test: confirm whether the service should sleep; if it should, verify no private-network polling keeps it awake.
- [ ] Load test: replicas scale on queue depth without duplicate processing.
- [ ] Backup test: restore the pgvector volume into a fresh environment and rerun retrieval evals.

## 7. Anti-patterns

- Hosting a local LLM on CPU to "save on API costs". Measure tokens per second first; it rarely wins.
- Treating the stale [railwayapp/templates](https://github.com/railwayapp/templates) repo (last push 2024-05-22) as the template source. The live marketplace is the source.
- Exposing every service publicly because private networking was not configured.
- Running the eval harness against production data in the same environment.

## 8. What the official skill does not say

- Railway has **no architecture centre, no well-architected guidance and no certification**. This pack plus `architect-method` is the review.
- Template kickback: verified template authors earn 15% of usage, 25% if they also answer user questions ([partners](https://docs.railway.com/templates/partners)). A team that publishes its reference agent as a template gets paid for keeping it current.
- Railway publishes `llms.txt` / `llms-full.txt` and agent-tuned markdown; ground agents in those instead of scraping HTML.

## Sources
[Pricing](https://railway.com/pricing) · [Serverless](https://docs.railway.com/deployments/serverless) · [Volumes](https://docs.railway.com/volumes/reference) · [Remote MCP changelog](https://railway.com/changelog/2026-04-17-remote-mcp) · [Template partners](https://docs.railway.com/templates/partners) · [railway-skills](https://github.com/railwayapp/railway-skills) · research: `docs/research/providers/railway.md`
