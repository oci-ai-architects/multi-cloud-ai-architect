---
name: pack-azure
description: Architecture decisions for AI agents on Microsoft Azure - Microsoft Foundry (formerly Azure AI Foundry), Foundry Agent Service (Foundry-native and hosted agents), Microsoft Agent Framework 1.0 (.NET and Python, successor to Semantic Kernel and AutoGen), Foundry MCP Server and Azure MCP Server, AI Landing Zone, Azure Well-Architected AI workloads, and the Azure Architecture Center orchestration patterns (sequential, concurrent, group chat, handoff, magentic). Use when choosing an Azure runtime for an agent, picking an orchestration pattern, migrating from Semantic Kernel or AutoGen, landing agents in an enterprise subscription, or reviewing an Azure agent design. Trigger on "Foundry agent", "Azure AI Foundry", "Agent Framework", "magentic", "handoff pattern", "AI Landing Zone", "Copilot Studio vs Foundry", "AI-103". Not for SDK syntax; microsoft/skills covers that.
metadata:
  version: "1.0.0"
  asOf: "2026-10-05"
  scope: decision-layer
  official-skills: https://github.com/microsoft/skills
---

# Azure pack: Foundry, Agent Framework and the orchestration vocabulary

Azure brings two assets every agent architect should reuse, whatever the cloud: the **complexity
ladder** and the **five orchestration pattern names** from the Azure Architecture Center
([AI agent orchestration patterns](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns),
ms.date 2026-02-12, updated 2026-09-21). `architect-method` adopts both as shared vocabulary.

Naming: "Microsoft Foundry" replaced "Azure AI Foundry". Official skills to install:
[microsoft/skills](https://github.com/microsoft/skills) (MIT, 205 SKILL.md, mostly per-SDK). Grounding
MCP: [MicrosoftDocs/mcp](https://github.com/MicrosoftDocs/mcp) for Learn docs, Foundry MCP Server
(preview) at `https://mcp.ai.azure.com` with Entra ID OAuth. `Azure/azure-mcp` is archived; use
[microsoft/mcp](https://github.com/microsoft/mcp).

## 1. Climb the complexity ladder first

From the Architecture Center: use the lowest level that reliably meets the requirement.

| Level | Use when | Note from the guide |
|---|---|---|
| Direct model call | Classification, summarisation, translation in one pass | "If prompt engineering can solve the problem, you don't need an agent." |
| Single agent with tools | Varied queries inside one domain needing dynamic tool use | "Often the right default for enterprise use cases." Set iteration limits against tool-call loops |
| Multi-agent orchestration | Cross-domain problems, distinct security boundaries per agent, parallel specialisation | Justified only when one agent fails from prompt complexity, tool overload or security needs |

## 2. Orchestration patterns: when to avoid each

The guide's "avoid when" lists are the useful part; summarised:

| Pattern | Use for | Avoid when |
|---|---|---|
| **Sequential** | Fixed pipelines with clear stage dependencies | Stages are embarrassingly parallel; few stages one agent can do; early-stage errors cannot be stopped from propagating; agents must collaborate; workflow needs backtracking |
| **Concurrent** | Independent perspectives on the same input (fan-out/fan-in) | Agents build on each other; order or reproducibility matters; quota makes parallelism inefficient; shared state cannot be coordinated; no conflict-resolution strategy |
| **Group chat** | Debate, review, maker-checker loops with a chat manager | Simple delegation suffices; real-time latency budget; deterministic hierarchy fits better; the manager cannot tell objectively when the task is done |
| **Handoff** | Triage to the right specialist when the right one emerges during processing | The right agent is knowable from the first input (use a deterministic dispatcher); routing is rule-based; bad routing hurts UX; work should be concurrent; handoff loops are hard to prevent |
| **Magentic** | Open-ended problems needing a planned task ledger | Path is deterministic; no ledger needed; low complexity; time-sensitive; frequent stalls expected |

Cross-cloud mapping: ADK `SequentialAgent`/`ParallelAgent`/`LoopAgent` and graph Workflows cover
sequential, concurrent and loop shapes; Strands Graph/Swarm/Workflow cover the same; Anthropic's
evaluator-optimizer is a two-agent group chat.

## 3. When Azure is the right column

| Workload signal | Fit | Why |
|---|---|---|
| Microsoft 365 / Entra ID estate; agents surface in Teams or Copilot | Strong | Identity, governance and channels already there |
| .NET team | Strong | Agent Framework 1.0 GA for .NET and Python on 2026-04-03 ([VS Magazine](https://visualstudiomagazine.com/articles/2026/04/06/microsoft-ships-production-ready-agent-framework-1-0-for-net-and-python.aspx)); the only GA enterprise agent SDK with first-class .NET in this survey |
| Prompt-and-workflow agents with Microsoft-hosted tools | Strong | Foundry-native agents: "no additional charge" for creating or running them; pay for model tokens and tools ([pricing](https://azure.microsoft.com/en-us/pricing/details/foundry-agent-service/), read 2026-10-05) |
| Open-source framework agent (Agent Framework, LangGraph) needing managed hosting | Good | Hosted agents: customer-dedicated containers, 0.5/1, 1/2, 2/4 vCPU/GiB shapes, billed per vCPU-hour and GiB-hour |
| Regulated enterprise landing | Strong | [Azure/AI-Landing-Zones](https://github.com/Azure/AI-Landing-Zones) (MIT) is the only official landing-zone repo for AI among the providers surveyed |
| Edge-latency per-user agents; small TS startup | Weak | Use Cloudflare or Vercel |

Business-user agents (Copilot Studio) versus pro-code (Foundry + Agent Framework): choose Copilot
Studio when makers own the agent and channels are M365; choose Foundry when engineers own evals,
CI/CD and custom tools.

## 4. Building blocks mapped to the AgentCore capability model

| Capability | Azure choice |
|---|---|
| Harness | Microsoft Agent Framework (graph workflows, HITL state); Semantic Kernel still maintained, AutoGen in maintenance |
| Runtime | Foundry Agent Service (native or hosted agents); Azure Container Apps for self-managed |
| Memory | Foundry threads/state; Cosmos DB or AI Search for long-term [UNVERIFIED: managed long-term memory feature set not re-checked] |
| Tools | Foundry tools (file search, code interpreter, web search), MCP via Azure MCP Server and your own servers |
| Model gateway | Azure API Management AI gateway policies [UNVERIFIED: not re-checked this session] |
| Identity | Entra ID agent identities, managed identities, OBO for user-delegated tools |
| Observability | Foundry tracing to Application Insights |
| Evals | Foundry evaluations; agent optimizer (token-billed) |
| Landing zone | AI Landing Zone reference + implementation |

## 5. Cost envelopes and gotchas

- Foundry-native agents carry no orchestration charge; the bill is model tokens plus tools. Tool prices (file search storage per GB-day with 1 GB free, code interpreter per session, web search per 1,000 transactions) did not render on the pricing page on 2026-10-05, so they are omitted from `prices.json`. Read them in the [pricing calculator](https://azure.microsoft.com/en-us/pricing/calculator/) per region.
- Hosted agents bill container vCPU-hour and GiB-hour; values also did not render. [UNVERIFIED]
- Vector storage billed per GB-day accumulates silently across abandoned threads; set retention.
- The agent optimizer and evaluations consume tokens ([cost overview](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/agent-optimizer-costs)); schedule them.
- Agent Prepurchase Plans exist for committed spend ([docs](https://learn.microsoft.com/en-us/azure/cost-management-billing/reservations/agent-pre-purchase)).

## 6. Security controls

| Risk | Control |
|---|---|
| Agent identity | Entra agent identity or managed identity per agent; no shared keys; disable key auth on Foundry resources where possible |
| Network | Private endpoints, no public network access, per AI Landing Zone |
| Tool overreach | OBO tokens so the agent acts with the user's rights, not a super-identity; approval step in Agent Framework workflows for writes |
| Prompt injection | Content safety / Prompt Shields at model boundary [UNVERIFIED: product names not re-checked]; treat tool output as data |
| Data residency | Pin Foundry resource and model deployment regions; check model availability per region before the ADR |

## 7. Eval checklist

- [ ] The chosen ladder level is justified in an ADR with an eval that shows the simpler level failing.
- [ ] Pattern-specific tests: handoff loop detection, group-chat termination, concurrent conflict resolution, magentic stall handling.
- [ ] Foundry evaluations wired to CI with thresholds from the spec.
- [ ] Landing-zone conformance check (private endpoints, identities) before production.
- [ ] Same scenario run on a second cloud for the portability evidence.

## 8. Anti-patterns

- Starting at magentic or group chat for a problem a single agent with tools solves.
- Using handoff where the first message already identifies the specialist.
- New projects on AutoGen; it is in maintenance mode (secondary source). Migrate to Agent Framework.
- Treating [Azure/AI-in-a-Box](https://github.com/Azure/AI-in-a-Box) (no pushes since 2024-12) as current guidance.

## 9. What the official skills do not say

- Certification churn: AI-102 retired 2026-06-30; **AI-103 Azure AI Apps and Agents Developer Associate** replaces it ([Learn page](https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-apps-and-agents-developer-associate/)); price ~$165 is a third-party figure and varies by country [UNVERIFIED]. AB-100 Agentic AI Business Solutions Architect details are third-party [UNVERIFIED].
- The orchestration pattern names are the most portable vocabulary any provider publishes. Use them in ADRs on every cloud.

## Sources
[Orchestration patterns](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns) · [WAF AI workloads](https://learn.microsoft.com/en-us/azure/well-architected/ai/architecture-pattern) · [Foundry Agent Service pricing](https://azure.microsoft.com/en-us/pricing/details/foundry-agent-service/) · [Hosted agents](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/hosted-agents) · [Agent Framework](https://github.com/microsoft/agent-framework) · [AI Landing Zones](https://github.com/Azure/AI-Landing-Zones) · research: `docs/research/providers/azure.md`
