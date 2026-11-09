---
name: pack-cloudflare
description: Architecture decisions for running AI agents on Cloudflare (Workers, Durable Objects, Agents SDK, Project Think, Workers AI, AI Gateway, AI Search, Sandbox, MCP server portals). Use when choosing whether an agent workload belongs on Cloudflare, sizing it against Workers and Durable Objects limits, estimating cost, placing AI Gateway as a cross-cloud model front door, or reviewing a Cloudflare agent design for security, state durability and eval coverage. Trigger on "Cloudflare agent", "Durable Objects agent", "Workers AI", "AI Gateway", "McpAgent", "edge agent", "remote MCP on Cloudflare". Do not use for wrangler syntax or SDK API detail; the official cloudflare/skills pack covers that.
metadata:
  version: "1.0.0"
  asOf: "2026-10-05"
  scope: decision-layer
  official-skills: https://github.com/cloudflare/skills
---

# Cloudflare pack: edge agents and the model front door

This pack decides *whether* and *how* an agent workload fits Cloudflare. For API usage, install the
official skills (`npx skills add cloudflare/skills`, Apache-2.0, 16 skills incl. `agents-sdk`,
`durable-objects`, `workers-best-practices`, `wrangler`). This file covers what those skills leave
out: the cross-provider choice, hard limits that shape the design, cost envelopes, and the review.

Facts below carry `asOf` and a source. Prices and limits live in `prices.json`; re-check before quoting.

## 1. When Cloudflare is the right column

| Workload signal | Fit | Why |
|---|---|---|
| Many small, long-lived, per-user or per-entity agents (one agent per user, per ticket, per repo) | Strong | Agents SDK maps each agent instance to a Durable Object with its own SQLite, WebSockets, alarms and schedule ([Agents docs](https://developers.cloudflare.com/agents/)) |
| Global low-latency chat or voice front end with streaming | Strong | Isolates run near the user; HTTP duration has no enforced limit while the client stays connected ([Workers limits](https://developers.cloudflare.com/workers/platform/limits/), asOf 2026-10-05) |
| Remote MCP servers for third parties (OAuth, per-session state) | Strong | `McpAgent` plus Durable Objects gives per-session state without running servers ([MCP on Agents](https://developers.cloudflare.com/agents/tools/mcp/)) |
| One gateway in front of several model providers (Bedrock, Azure, Vertex, OpenAI, Anthropic, Workers AI) | Strong | AI Gateway core features (analytics, caching, rate limiting) are free; provider inference passes through with no markup; Unified Billing adds a 5% fee on purchased credits ([AI Gateway pricing](https://developers.cloudflare.com/ai-gateway/reference/pricing/), asOf 2026-10-05) |
| Agent runs untrusted or generated code | Good | Dynamic Workers for isolate-speed code; Sandbox SDK for a full shell and filesystem ([Sandbox](https://developers.cloudflare.com/agents/tools/sandbox/)) |
| Heavy Python ML stack, GPU fine-tuning, large native deps | Weak | Isolates have 128 MB memory and a 64 MiB script limit; use Sandbox/containers or another cloud |
| Long single CPU-bound step over 5 minutes | Weak | Paid CPU cap is 5 min per invocation (default 30 s); split into Workflows steps or move the step |
| Enterprise data gravity already in one hyperscaler VPC | Weak to medium | Keep the agent near the data; still consider AI Gateway as the model control plane in front of it |

Rule of thumb: Cloudflare wins on *state-per-entity at global scale* and on *the gateway layer*. It
loses on *heavy compute* and *hyperscaler data gravity*.

## 2. Service selection for agent building blocks

| Capability (AgentCore vocabulary) | Cloudflare choice | Notes |
|---|---|---|
| Harness / agent loop | Agents SDK `Agent` class, or Project Think (opinionated harness, preview) | Think uses Fibers for checkpointing and a Session API ([Think docs](https://developers.cloudflare.com/agents/harnesses/think/)) |
| Runtime | Workers + Durable Objects | One DO per agent instance; DO is single-threaded, so concurrency is per entity |
| Short-term memory | DO SQLite (10 GB per object on Paid) | [DO limits](https://developers.cloudflare.com/durable-objects/platform/limits/), asOf 2026-10-05 |
| Long-term / semantic memory | AI Search (formerly AutoRAG) or Vectorize | AI Search is managed hybrid retrieval per instance |
| Tool gateway | MCP server portals; `McpAgent` for servers you host | Portals are named in the [enterprise agent workspace ref-arch](https://developers.cloudflare.com/reference-architecture/diagrams/ai/enterprise-ai-agent-workspace/) |
| Model gateway | AI Gateway | Caching, rate limits, retries, fallback, logs |
| Inference | Workers AI, or any provider through AI Gateway | Workers AI: $0.011 per 1,000 Neurons, 10,000 Neurons/day free |
| Code execution | Dynamic Workers (isolate), Sandbox SDK (container) | Sandbox SDK licence reads NOASSERTION on GitHub: check before vendoring |
| Browser | Browser Rendering | |
| Durable multi-step execution | Workflows, DO alarms, Think Fibers | Alarms and queue consumers get 15 min wall time |
| Identity / auth | Cloudflare Access (Zero Trust) in front of agent and MCP endpoints | |
| Observability | Workers Logs, Workers Observability, AI Gateway logs | Export via Logpush or OTel to your eval store |

## 3. Reference architectures (official, then what to add)

1. **Enterprise AI agent workspace** ([ref-arch](https://developers.cloudflare.com/reference-architecture/diagrams/ai/enterprise-ai-agent-workspace/)): Workers + Agents SDK orchestrate, DO hold state, AI Gateway governs models, MCP portals govern tools, Sandbox/Browser execute. Add: an eval harness reading AI Gateway logs, Access policies per tool, and a per-agent budget.
2. **Enterprise AI vibe-coding platform** ([ref-arch](https://developers.cloudflare.com/reference-architecture/diagrams/ai/enterprise-ai-vibe-coding-platform/)). Open-source reference: [cloudflare/vibesdk](https://github.com/cloudflare/vibesdk) (MIT).
3. **Cross-cloud front door** (this pack's pattern): AI Gateway in front of Bedrock, Azure, Vertex and Workers AI, with the agent runtime on whichever cloud owns the data. Gives one place for rate limits, caching, logs and fallback. Weigh against Vercel AI Gateway (no token markup, BYOK free on paid tier) when the app already lives on Vercel.

## 4. Limits that change the design (asOf 2026-10-05)

| Limit | Value | Design consequence | Source |
|---|---|---|---|
| CPU per invocation | Free 10 ms; Paid default 30 s, max 5 min | Model calls are I/O, not CPU, so long LLM waits are fine; heavy parsing is not | [Workers limits](https://developers.cloudflare.com/workers/platform/limits/) |
| Isolate memory | 128 MB | Stream large documents; never load a whole PDF corpus in one isolate | same |
| Subrequests | Free 50; Paid 10,000 default (up to 10M) | Tool-heavy loops on Free fail fast; budget subrequests per agent turn | same |
| Script size | 64 MiB uncompressed | Big SDK bundles (some vendor SDKs) may not fit; call providers over fetch | same |
| Cron / DO alarm / queue consumer wall time | 15 min | Chunk long jobs into resumable steps | same |
| DO storage | 10 GB per object (SQLite, Paid) | Per-agent memory is bounded; archive old turns to R2 | [DO limits](https://developers.cloudflare.com/durable-objects/platform/limits/) |
| DO throughput | ~1,000 req/s soft limit per object | A single "global coordinator" DO is a bottleneck; shard by tenant or entity | same |

## 5. Cost envelopes and gotchas

Prices in `prices.json` (source: [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), asOf 2026-10-05).

- **Base:** Workers Paid is $5/month and includes 10M requests and 30M CPU-ms.
- **DO duration is the hidden meter.** Billed in GB-s while the object is active ($12.50 per million GB-s past 400,000 included). An agent that keeps a WebSocket open without hibernation bills duration the whole time. Use the WebSocket Hibernation API and let idle agents evict.
- **DO SQLite writes** cost $1.00 per million rows past 50M included. Chatty memory (one row per token chunk) multiplies this; batch writes per turn.
- **Workers AI Neurons** are model-specific. Convert using the per-model token prices on the pricing page, never assume a flat rate.
- **AI Gateway Unified Billing** adds 5% to purchased credits. BYOK through the gateway avoids it.
- **AI Gateway logs:** limits changed for gateways created after 2026-09-24 (they follow Workers Logs pricing). Check which regime applies before promising retention.

## 6. Security controls

| Risk (OWASP LLM / agentic) | Control on Cloudflare |
|---|---|
| Unauthenticated agent or MCP endpoint | Cloudflare Access in front of every agent route and MCP portal; OAuth for third-party MCP clients |
| Tool overreach / excessive agency | One MCP portal per trust tier; scoped tokens per tool; human approval via the SDK's human-in-the-loop flow for writes |
| Prompt injection via fetched content | Treat Browser Rendering and AI Search results as data; strip instructions before they reach the system prompt; AI Gateway guardrails where enabled [UNVERIFIED: guardrail feature set not re-checked this session] |
| Generated code escaping | Run it in Dynamic Workers or Sandbox, never in the agent's own isolate; no secrets in the sandbox env |
| Cross-tenant memory leak | One DO per tenant or user; never key memory by a client-supplied id without auth |
| Cost abuse (loops) | Per-agent turn and token budget stored in the DO; AI Gateway rate limits per key |

## 7. Eval checklist (run before calling it production)

- [ ] Trajectory eval: the same task set replayed against the agent, with tool-call traces pulled from AI Gateway logs.
- [ ] Hibernation test: open 1,000 idle sessions, confirm DO duration does not grow linearly.
- [ ] Limit test: the largest real input completes under 128 MB and inside the CPU cap.
- [ ] Failure test: primary model provider returns 429/5xx, gateway fallback answers, quality delta measured.
- [ ] Isolation test: tenant A cannot read tenant B's DO by guessing an id.
- [ ] Cost test: cost per completed task measured from usage, compared with the spec's NFR budget.

## 8. Anti-patterns

- One global Durable Object coordinating all agents. Shard by entity.
- Holding WebSockets without hibernation on idle agents. Duration bills while you sleep.
- Running a Python data-science agent in an isolate. Use Sandbox/containers or another cloud.
- Treating Project Think (preview) as a stable contract for a regulated workload. Pin versions and keep an exit to the plain Agents SDK.
- Writing your own model router when AI Gateway (or Vercel AI Gateway) already does fallback and caching.

## 9. What the official skills do not say

- No Well-Architected framework exists for Cloudflare; section 6 and 7 are this pack's substitute, keyed to the AWS Agentic AI Lens (see `architect-method`).
- No Workers/AI certification exists (only security and networking credentials). Teams cannot hire against a badge; assess with a design review instead.
- Portability exit: [workerd](https://github.com/cloudflare/workerd) (Apache-2.0) runs Workers code self-hosted, but Durable Objects storage semantics do not come with it. Keep agent state behind an interface if exit matters.

## Sources
[Agents docs](https://developers.cloudflare.com/agents/) · [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/) · [Workers limits](https://developers.cloudflare.com/workers/platform/limits/) · [DO limits](https://developers.cloudflare.com/durable-objects/platform/limits/) · [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/) · [AI Gateway pricing](https://developers.cloudflare.com/ai-gateway/reference/pricing/) · [cloudflare/skills](https://github.com/cloudflare/skills) · [mcp-server-cloudflare](https://github.com/cloudflare/mcp-server-cloudflare) · research: `docs/research/providers/cloudflare.md`
