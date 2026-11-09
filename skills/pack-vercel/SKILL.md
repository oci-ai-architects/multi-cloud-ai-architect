---
name: pack-vercel
description: Architecture decisions for running AI agents on Vercel (AI SDK, eve, Workflow SDK / Vercel Workflows, Vercel Sandbox, AI Gateway, Chat SDK, Vercel Connect, Fluid Compute functions, Vercel MCP and mcp-handler). Use when deciding whether an agent belongs on Vercel, sizing it against function duration and payload limits, choosing between a plain function, a durable Workflow and a Sandbox, estimating Fluid Compute and Sandbox cost, or reviewing a Vercel agent design for durability, approvals, isolation and evals. Trigger on "Vercel agent", "AI SDK agent", "Vercel Workflow", "Vercel Sandbox", "AI Gateway on Vercel", "maxDuration", "eve framework". Not for Next.js or AI SDK API syntax; the official vercel-labs/agent-skills and vercel-plugin cover that.
metadata:
  version: "1.0.0"
  asOf: "2026-10-05"
  scope: decision-layer
  official-skills: https://github.com/vercel-labs/agent-skills
---

# Vercel pack: TypeScript agents with durable steps

Vercel's 2026 "Agent Stack" (AI SDK 7, AI Gateway, Workflow SDK, Sandbox, Chat SDK, presented as GA at
Ship 2026, [recap](https://vercel.com/blog/vercel-ship-2026-recap)) is the shortest path from a web app
to a production agent in TypeScript. This pack decides when that path is right and where it breaks.

Official material to install alongside: [vercel/vercel-plugin](https://github.com/vercel/vercel-plugin)
and [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills). The latter had **no licence
file detected** on 2026-10-05, so link to it and do not copy from it.

## 1. When Vercel is the right column

| Workload signal | Fit | Why |
|---|---|---|
| Agent lives inside a Next.js / web product, streams UI, needs previews per PR | Strong | Same deploy unit as the app; preview URLs give per-PR eval targets |
| TypeScript team; agent loop is mostly I/O (model and tool calls) | Strong | Fluid Compute bills Active CPU, and I/O wait does not count ([limits](https://vercel.com/docs/functions/limitations), last updated 2026-08-24) |
| Multi-step jobs that wait on humans or webhooks for hours to months | Strong | Vercel Workflows: `'use workflow'` / `'use step'`, sleep and hooks, resumes across deploys ([docs](https://vercel.com/docs/workflows), 2026-09-04) |
| Agent runs generated code, tests repos, executes benchmarks | Strong | Sandbox: Firecracker microVMs, up to 24 h per session on Pro, 10,000 concurrent ([Sandbox pricing](https://vercel.com/docs/sandbox/pricing), 2026-09-10) |
| One agent on Slack, Discord, GitHub and web | Good | Chat SDK |
| Python-first data or ML agent with heavy native deps | Medium | Python runtime exists (500 MB bundles, large functions to 5 GB beta), but the stack's centre of gravity is TS |
| Needs GPUs, private VPC peering by default, or long-lived stateful processes | Weak | No GPU functions; Secure Compute and Static IPs are paid add-ons; use Railway, a hyperscaler, or Sandbox |
| Regulated data that must stay in one hyperscaler account | Weak | Keep runtime there; Vercel can still host the front end |

## 2. Choosing the execution primitive

| Need | Primitive | Hard limit that decides it (asOf 2026-10-05) |
|---|---|---|
| Single request, answer streams back in under ~5 min | Vercel Function (Fluid) | Default 300 s; Pro/Ent max 800 s; 1800 s extended max in beta. 504 on timeout |
| Agent loop with retries, approvals, waits, crash recovery | Vercel Workflow | No duration limit for the run; each step is a function call, so each step still obeys function limits |
| Untrusted code, shell, filesystem, browsers, long builds | Vercel Sandbox | Session max 45 min Hobby, 24 h Pro/Ent; default timeout 5 min; Pro max 8 vCPU / 16 GB |
| Request or response body over 4.5 MB | Blob upload + reference | 4.5 MB payload cap returns 413 |
| Many open files or sockets per instance | Pool connections | 1,024 file descriptors shared across concurrent executions |

The common failure: one long agent loop inside a single function with `maxDuration` cranked up. It
dies at the cap, loses state, and bills memory the whole time. Move the loop into a Workflow and make
each tool call a step.

## 3. Building blocks mapped to the AgentCore capability model

| Capability | Vercel choice | Note |
|---|---|---|
| Harness | AI SDK 7 agent, or **eve** (Apache-2.0, [vercel/eve](https://github.com/vercel/eve)) | eve is how Vercel builds its own agents; treat it as opinionated and young |
| Runtime | Fluid Compute functions + Workflows | |
| Memory | Bring your own (Marketplace Postgres, Redis); Workflow state for run-scoped memory | No managed long-term agent memory service [UNVERIFIED: none found in docs this session] |
| Tool gateway | MCP via `mcp-handler` (host your own) and Vercel Connect (credential/tool broker, GA) | mcp-handler had no licence file detected on 2026-10-05 |
| Model gateway | AI Gateway | No markup on tokens, BYOK has no fee on the paid tier ([pricing](https://vercel.com/docs/ai-gateway/pricing), 2026-09-08) |
| Code execution | Sandbox | |
| Identity | Vercel Connect; team RBAC; OIDC federation to clouds | |
| Observability | Workflow traces, AI Gateway trace drains (OTel) | Trace drains: $0.05 per 1,000 traces, no Pro allowance |
| Ops agent | Vercel Agent (public beta) | Investigates alerts, opens PRs |
| Platform MCP | `https://mcp.vercel.com` (OAuth) | Docs, projects, deployments, logs |

## 4. Reference architectures

1. **Durable approval agent**: Next.js route starts a Workflow; each tool call is a step; a hook waits for a human approval link (Slack via Chat SDK); Sandbox runs any generated code; AI Gateway fronts models with a team budget. Vercel's own guide: [Durable agent approval workflows](https://vercel.com/kb/guide/agent-approval-workflow-stack-guide).
2. **Coding / research agent**: Workflow orchestrates; each task gets a fresh Sandbox from a snapshot; results land in Blob; preview deployment is the eval target. Templates: [open-agents](https://github.com/vercel-labs/open-agents) (MIT), [coding-agent-template](https://github.com/vercel-labs/coding-agent-template).
3. **Hosted MCP server**: `mcp-handler` on a Next.js route, auth through Vercel Connect or your IdP, rate limited by firewall rules.
4. **Cross-cloud**: Vercel hosts UI + Workflow orchestration; heavy or data-local tools run as MCP servers on AWS/GCP/Azure; AI Gateway routes to Bedrock or Vertex with BYOK so the cloud contract still pays.

## 5. Cost envelopes and gotchas

Prices in `prices.json` (sources: [pricing](https://vercel.com/pricing), [Sandbox pricing](https://vercel.com/docs/sandbox/pricing), [AI Gateway pricing](https://vercel.com/docs/ai-gateway/pricing); asOf 2026-10-05).

- **Pro is $20 per developer seat per month with $20 usage credit.** Agents burn credit through Active CPU ($0.128/h), provisioned memory ($0.0106/GB-h) and invocations ($0.60/1M) from "starting at" rates; regions differ.
- **Provisioned memory bills while the function waits on the model.** CPU does not. A 4 GB function waiting 60 s on a slow model costs memory-time; right-size memory before raising `maxDuration`.
- **Sandbox memory dominates its bill.** Vercel's own examples assume 10% CPU utilisation, and memory is about three quarters of the cost. Each vCPU carries 2 GB, billed in 1-minute minimums. Stop sandboxes explicitly.
- **Sandbox egress and exposed ports are billable; downloads are free.** A sandbox serving a preview over a port pays both directions.
- **Workflow Events cost $20 per 1M** plus $0.50/GB written and $0.50/GB-month retained. A chatty agent that emits an event per token chunk gets expensive; emit per step.
- **AI Gateway add-ons** (team-wide ZDR, provider allowlist: $0.10 per 1,000 requests each; custom reporting writes) are off by default. Per-request equivalents are free.
- **Hobby is not for production agents:** Sandbox pauses when quotas are hit, 45-minute sessions, 300 s functions.

## 6. Security controls

| Risk | Control |
|---|---|
| Agent executes generated code | Sandbox only, never the function; no production secrets in sandbox env; network egress restricted where the SDK allows |
| Excessive agency | Every write tool is a Workflow step behind a hook that needs human approval for irreversible actions |
| Provider data retention | Per-request ZDR routing on AI Gateway (Pro/Ent); provider allowlist for regulated tenants |
| Credential sprawl in agents | Vercel Connect brokers credentials; never put long-lived cloud keys in env when OIDC federation works |
| Workflow run data exposure | Run data includes inputs/outputs; restrict "Workflow Run Data Viewer"; redact PII before it enters a step |
| Cost runaway | AI Gateway budgets per team/project/key; Spend Management alerts and pause |

## 7. Eval checklist

- [ ] Every PR preview runs the eval suite against its own deployment URL before merge.
- [ ] Timeout test: the slowest real task completes as a Workflow, and no single step approaches 800 s.
- [ ] Crash test: kill a run mid-step (redeploy), confirm it resumes from the last completed step without duplicating side effects (idempotency keys on write tools).
- [ ] Gateway fallback: force the primary provider to fail; measure quality and latency on the fallback.
- [ ] Sandbox escape and egress test on the code tool.
- [ ] Cost per completed task from usage data against the spec's budget.

## 8. Anti-patterns

- Raising `maxDuration` to 800 s instead of moving the loop into a Workflow.
- Shipping base64 files through function bodies past 4.5 MB.
- Running generated code in the request function "because it is quick".
- Writing a custom model router on top of AI Gateway's fallback and budgets.
- Copying content from `vercel-labs/agent-skills` into your own pack: there is no licence on it.

## 9. What the official skills do not say

- Vercel has **no architecture centre and no Well-Architected framework**; sections 6 and 7 stand in for one, keyed to the AWS Agentic AI Lens through `architect-method`.
- There is **no individual Vercel certification**, only firm-level partner certification. Assess people with a design review.
- Lock-in sits in Workflows (directive-based durable execution) and Connect. AI SDK and Chat SDK are portable. Keep tool logic in plain functions callable outside a workflow so the orchestration layer can be swapped.

## Sources
[Ship 2026 recap](https://vercel.com/blog/vercel-ship-2026-recap) · [Functions limits](https://vercel.com/docs/functions/limitations) · [Workflows](https://vercel.com/docs/workflows) · [Sandbox pricing](https://vercel.com/docs/sandbox/pricing) · [AI Gateway pricing](https://vercel.com/docs/ai-gateway/pricing) · [Pricing](https://vercel.com/pricing) · [Vercel MCP](https://vercel.com/docs/agent-resources/vercel-mcp) · research: `docs/research/providers/vercel.md`
