---
name: pack-google-cloud
description: Architecture decisions for AI agents on Google Cloud under the 2026 Gemini Enterprise Agent Platform naming (formerly Vertex AI) - ADK in Python/Go/Java/TS, A2A, Agent Runtime (Agent Engine), Sessions and Memory Bank, Cloud Run, GKE, Google-managed remote MCP servers, MCP Toolbox for Databases, agents-cli, Well-Architected AI/ML perspective. Use when choosing the GCP runtime for an agent, picking ADK workflow patterns, wiring agents to BigQuery/AlloyDB/Spanner through MCP, estimating Agent Runtime cost, preparing for the Professional Agentic Architect exam, or reviewing a GCP agent design. Trigger on "Vertex AI agent", "Agent Engine", "Agent Runtime", "ADK", "A2A on GCP", "Gemini Enterprise Agent Platform", "Memory Bank". Not for ADK or gcloud syntax; google/skills and google/agents-cli cover that.
metadata:
  version: "1.0.0"
  asOf: "2026-10-05"
  scope: decision-layer
  official-skills: https://github.com/google/skills
---

# Google Cloud pack: ADK, A2A and managed agent runtime

Naming first, because it breaks searches: at Cloud Next on 2026-04-22 Google renamed Vertex AI to
**Gemini Enterprise Agent Platform**; Agent Engine now appears as **Agent Runtime** in the
Architecture Center, and docs and samples still mix both names
([AIwire](https://www.hpcwire.com/aiwire/2026/04/23/google-unveils-gemini-enterprise-agent-platform/)).
Search both terms.

Install the official layers instead of rewriting them: [google/skills](https://github.com/google/skills)
(Apache-2.0, 155 SKILL.md files including Well-Architected skills and `agent-platform-deploy`,
`eval-flywheel`) and [google/agents-cli](https://github.com/google/agents-cli) (scaffold, deploy, eval,
observability). This pack is the decision layer above them.

## 1. When Google Cloud is the right column

| Workload signal | Fit | Why |
|---|---|---|
| Agent grounded in BigQuery, AlloyDB, Spanner, Cloud SQL, Firestore | Strong | Google-managed remote MCP servers for those products ([supported products](https://docs.cloud.google.com/mcp/supported-products)) plus open-source [MCP Toolbox](https://github.com/googleapis/mcp-toolbox) |
| Multi-agent system across teams or vendors | Strong | ADK + A2A; the Architecture Center multi-agent pattern uses A2A between coordinator and subagents ([multi-agent system](https://docs.cloud.google.com/architecture/multiagent-ai-system)) |
| Python team wanting a managed runtime with sessions and long-term memory | Strong | Agent Runtime + Sessions + Memory Bank |
| Multi-tenant SaaS agent | Good | Official [multi-tenant agentic pattern](https://docs.cloud.google.com/architecture/multi-tenant-agentic-ai-system) |
| Gemini-first, multimodal (live audio/video) | Strong | Gemini Live API; `gemini-live-api-dev` official skill |
| Must use Claude or open models | Good | Model Garden hosts third-party models; "200+ models incl. Claude" is a third-party figure [UNVERIFIED] |
| Edge-latency, per-user stateful agents at global scale | Medium | Cloud Run/Agent Runtime are regional; compare Cloudflare Durable Objects |
| Small team, TS web app, no GCP footprint | Weak | Vercel or Cloudflare give a shorter path |

## 2. Runtime selection (Architecture Center, last reviewed 2026-04-21)

Source: [Choose agentic AI architecture components](https://docs.cloud.google.com/architecture/choose-agentic-ai-architecture-components).

| Need | Runtime | Choose when | Avoid when |
|---|---|---|---|
| Python agent, minimal ops | **Agent Runtime** (Agent Engine) | You want managed sessions, memory, deploy via `adk deploy agent_engine` | You need custom sidecars, non-Python stacks, or fine network control |
| Containerised agent, any language, scale to zero | **Cloud Run** | Event-driven or HTTP agents; `adk deploy cloud_run`; remote MCP servers | Work holds a single request beyond Cloud Run's request timeout [check current limit] |
| Complex, stateful, GPU-adjacent, many agents | **GKE** | You already run a platform team; need fine infra control; `adk deploy gke`; GKE MCP server | You do not have Kubernetes operators on staff |

Framework: ADK is the recommended default; Genkit when you need fine-grained control of agent logic.
ADK 2.x adds graph `Workflow` objects with edges alongside the classic `SequentialAgent`,
`ParallelAgent` and `LoopAgent` (per adk-python repo samples via Context7, read 2026-10-05).

Memory (same source): in-memory for dev; for production keep the app stateless and use Redis,
Firestore or Agent Platform Sessions for short-term state, and Memory Bank for long-term memory.

Tools (same source, ranked): built-in tools, then MCP, then Apigee API Hub for enterprise API
governance, then custom function tools. Google explicitly warns about tool bloat: limit definitions,
use primitive types, disclose progressively.

## 3. Mapping to the AgentCore capability model

| Capability | GCP choice |
|---|---|
| Harness | ADK (Python, Go, Java, TS), agents-cli scaffolds |
| Runtime | Agent Runtime, Cloud Run, GKE |
| Memory | Sessions (short-term), Memory Bank (long-term) |
| Tool gateway | Google-managed remote MCP servers, MCP Toolbox, Apigee API Hub |
| Model gateway | Model Garden endpoints; no first-party multi-provider gateway comparable to Cloudflare/Vercel AI Gateway [UNVERIFIED] |
| Agent-to-agent | A2A (Linux Foundation project, Apache-2.0) |
| Code execution | Agent Runtime code execution; Cloud Run jobs |
| Identity | Service accounts per agent, Workload Identity; IAM conditions |
| Policy / guardrails | Model Armor [UNVERIFIED: not re-checked this session]; VPC Service Controls |
| Evals | `adk eval` with eval sets and LLM-judge criteria; agents-cli eval skills |
| Observability | Cloud Trace / Logging; agents-cli observability skill |

## 4. Cost envelopes and gotchas

Rows in `prices.json`. Agent Runtime figures come from the official pricing page as returned by a
search snippet on 2026-10-05 (the page itself exceeded fetch limits), so treat them as
**[UNVERIFIED by direct read]** until opened in a browser:
[pricing](https://cloud.google.com/products/gemini-enterprise-agent-platform/pricing).

- Agent Compute about **$0.085 per vCPU-hour** and Agent Memory about **$0.009 per GiB-hour**.
- **Sessions and Memory Bank are billed in compute-hour equivalents**: 1 vCPU-hour ($0.085) per 3M read operations; Memory Bank writes 1 vCPU-hour per 1M write operations. Memory Bank billing started **2026-09-01**. Designs from before September that assumed free memory are now under-costed.
- Model tokens dominate most agent bills; runtime is usually the smaller line. Budget both.
- Savings plans (1-year, 3-year flexible) exist for committed usage.

## 5. Security controls

| Risk | Control |
|---|---|
| Agent identity sprawl | One service account per agent, never the default compute SA; least-privilege IAM per tool |
| Data exfiltration from BigQuery/AlloyDB tools | VPC Service Controls perimeter around data and agent projects; MCP Toolbox with parameterised queries, not free SQL |
| Prompt injection via retrieved content | Treat retrieval output as data; content screening at ingress [UNVERIFIED: Model Armor coverage not re-checked] |
| Cross-tenant memory | Tenant-scoped session and Memory Bank keys; follow the multi-tenant reference pattern |
| A2A trust | Authenticate agent cards; allowlist peer agents; log every delegated task |

## 6. Eval checklist

- [ ] `adk eval` eval set per user journey, with LLM-judge criteria and a deterministic tool-trajectory check.
- [ ] Same eval set run against the agent on a second cloud (portability evidence for the ADR).
- [ ] Memory test: the agent recalls facts across sessions and forgets on deletion request.
- [ ] Tool-bloat test: measure accuracy as the tool count grows; cap tools per agent at the knee.
- [ ] Cost per completed task including Sessions and Memory Bank operations.

## 7. Anti-patterns

- Searching only for "Vertex AI" and missing 2026 docs, or only the new name and missing samples.
- Exposing a free-form SQL tool over BigQuery to an agent. Use Toolbox-defined parameterised tools.
- One giant coordinator agent with 60 tools instead of A2A subagents with 5 to 10 each.
- Building on [agent-starter-pack](https://github.com/GoogleCloudPlatform/agent-starter-pack) without checking it is still maintained (no pushes since 2026-07-21, while agents-cli kept moving).

## 8. What the official skills do not say

- Google is the only provider that ships its **Well-Architected Framework as agent skills** (in google/skills). Use them for the GCP column of a review; use `architect-method` for the cross-cloud scoring.
- **Professional Agentic Architect** certification: $200 at GA, registration opens 2026-11-02, valid 1 year, exam plus hands-on labs ([cert page](https://cloud.google.com/learn/certification/agentic-architect)). The first hyperscaler professional exam titled for agentic architecture.
- [google/mcp](https://github.com/google/mcp) says it is "not an officially supported Google product"; cite the linked servers, not the catalogue.

## Sources
[Choose agentic components](https://docs.cloud.google.com/architecture/choose-agentic-ai-architecture-components) · [Multi-agent system](https://docs.cloud.google.com/architecture/multiagent-ai-system) · [Multi-tenant](https://docs.cloud.google.com/architecture/multi-tenant-agentic-ai-system) · [MCP overview](https://docs.cloud.google.com/mcp/overview) · [Agent Platform pricing](https://cloud.google.com/products/gemini-enterprise-agent-platform/pricing) · [ADK](https://adk.dev/) · [A2A](https://github.com/a2aproject/A2A) · research: `docs/research/providers/google-cloud.md`
