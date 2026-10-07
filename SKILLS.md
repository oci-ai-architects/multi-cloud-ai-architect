# Skills

Index of the skills in `skills/`, what triggers each one, and which agent in `team/` loads it.
Skills follow the Agent Skills format (https://agentskills.io/specification, read 2026-10-05):
a directory with a `SKILL.md` whose frontmatter `name` matches the directory, is lowercase with
hyphens, and whose `description` (at most 1024 characters) says what the skill does **and when to
use it**. Agents load only `name` and `description` at startup and the body on activation, so the
description is the trigger.

Load the smallest set that covers the task. The provider packs and `architect-method` are the
current layer; the older domain skills are dated reference material with the limits listed below.

## Current layer: method and provider packs

| Skill | Trigger (from its description) | Loaded by |
|---|---|---|
| [architect-method](skills/architect-method/SKILL.md) | Designing or reviewing an agent system end to end: size the change, spec with an NFR and autonomy budget, eval-gated ADRs, C4 agentic profile, AGENTS.md and SKILL.md contracts, eval plan, Agentic AI Lens scoring, the same agent on two clouds. "design an agent system", "which cloud for this agent", "write the ADR", "C4 for agents", "eval plan" | lead-architect, spec-driven-dev-lead, adlc-evals-lead, academy-curriculum-lead |
| [pack-google-cloud](skills/pack-google-cloud/SKILL.md) | Agent architecture on Google Cloud under the Gemini Enterprise Agent Platform naming: ADK, A2A, Agent Runtime (Agent Engine), Memory Bank, Cloud Run, GKE, managed MCP, MCP Toolbox. "Vertex AI agent", "Agent Engine", "ADK", "A2A on GCP" | google-cloud-architect |
| [pack-cloudflare](skills/pack-cloudflare/SKILL.md) | Agents on Workers, Durable Objects, Agents SDK, Project Think, Workers AI, AI Gateway, AI Search, Sandbox, MCP server portals. "edge agent", "Durable Objects agent", "AI Gateway", "McpAgent" | cloudflare-architect |
| [pack-vercel](skills/pack-vercel/SKILL.md) | Agents on Vercel: AI SDK, eve, Workflow SDK, Sandbox, AI Gateway, Chat SDK, Connect, Fluid Compute, mcp-handler. "Vercel agent", "Vercel Workflow", "maxDuration" | vercel-architect, solution-designer |
| [pack-railway](skills/pack-railway/SKILL.md) | Agent backends on Railway: container services, Postgres, Redis, volumes, private networking, sleep, templates, remote MCP, `railway agent`. "long-running agent worker", "Railway MCP" | railway-architect |
| [pack-aws](skills/pack-aws/SKILL.md) | Agents on AWS: Bedrock, AgentCore services, Strands, Lambda durable functions, Step Functions, Agentic AI Lens reviews. "AgentCore", "Strands", "AGENTSEC", "AGENTOPS" | aws-architect |
| [pack-azure](skills/pack-azure/SKILL.md) | Agents on Azure: Microsoft Foundry, Foundry Agent Service, Agent Framework 1.0, Foundry and Azure MCP servers, AI Landing Zone, the five orchestration patterns. "Foundry agent", "magentic", "handoff pattern" | azure-architect |

Each pack is scoped to architecture decisions and says which official vendor skill set covers SDK
and CLI syntax (google/skills, cloudflare/skills, vercel-labs/agent-skills, railwayapp/railway-skills,
aws/agent-toolkit-for-aws, microsoft/skills). Install those for syntax; do not duplicate them here.
Each pack carries a `prices.json`; prices are quoted only with the source and date recorded there.

Missing: **pack-oci**. `oci-architect` falls back to `oci-services-expert`, `oracle-adk` and
`oracle-agent-spec` below, and to `docs/research/providers/oracle-oci.md`.

## Reference layer: domain skills

These predate the current method and are kept as reference material. On 2026-10-05 all 23 were
brought to the Agent Skills format: `name` equals the directory, each description says what the
skill does and when to use it, `SKILL.md` stays under 500 lines with depth moved to `references/`,
and the old `version`, `triggers` and `external_version` keys moved into `metadata` or the
description. Their content is dated `contentAsOf: 2026-01-06`; model names, SDK versions and prices
inside them carry that date, a primary source URL and `[UNVERIFIED]`, or were replaced with `[OPEN]`.
Re-check any such figure on the linked page before quoting it. Status and line counts are
`[MEASURED node skills/check-skills.mjs, 2026-10-05]`.

| Skill | Use when | Loaded by | Spec check | Lines |
|---|---|---|---|---|
| [agentic-orchestration](skills/agentic-orchestration/SKILL.md) | Multi-agent coordination, task decomposition, handoffs | lead-architect | pass | 395 |
| [ai-security-expert](skills/ai-security-expert/SKILL.md) | OWASP LLM Top 10, prompt injection defence, guardrails, PII | claims-auditor, adlc-evals-lead | pass | 224 |
| [architecture-diagramming](skills/architecture-diagramming/SKILL.md) | D2, draw.io and Mermaid diagrams | visual-director | pass | 415 |
| [aws-ai-services](skills/aws-ai-services/SKILL.md) | Bedrock and SageMaker detail (prefer pack-aws) | aws-architect | pass | 422 |
| [azure-ai-services](skills/azure-ai-services/SKILL.md) | Azure OpenAI and AI services detail (prefer pack-azure) | azure-architect | pass | 423 |
| [claude-sdk](skills/claude-sdk/SKILL.md) | Claude Agent SDK, tool calling, MCP integration | lead-architect | pass | 217 |
| [enterprise-ai-patterns](skills/enterprise-ai-patterns/SKILL.md) | Enterprise governance, scalability and operations patterns | lead-architect | pass | 440 |
| [finops-ai](skills/finops-ai/SKILL.md) | Model selection cost, GPU sizing, commitments | inherited economics-analyst | pass | 433 |
| [genai-dac-specialist](skills/genai-dac-specialist/SKILL.md) | OCI Generative AI dedicated AI clusters | oci-architect | pass | 411 |
| [huggingface-trainer](skills/huggingface-trainer/SKILL.md) | Fine-tuning with TRL and Transformers | none in this team | pass | 426 |
| [knowledge-updater](skills/knowledge-updater/SKILL.md) | Refreshing knowledge bases (superseded by `loops/provider-refresh.loop.yaml`) | none | pass | 172 |
| [kubernetes-ai](skills/kubernetes-ai/SKILL.md) | GPU scheduling and model serving on Kubernetes | google-cloud-architect, aws-architect, azure-architect | pass | 185 |
| [langgraph-patterns](skills/langgraph-patterns/SKILL.md) | LangGraph state machines and human-in-the-loop | lead-architect | pass | 319 |
| [mcp-2025-patterns](skills/mcp-2025-patterns/SKILL.md) | MCP server design and multi-server orchestration | graph-ontology-engineer, lead-architect | pass | 378 |
| [mcp-architecture](skills/mcp-architecture/SKILL.md) | MCP resources, tools, prompts and security | lead-architect | pass | 399 |
| [multi-cloud-ai-architect](skills/multi-cloud-ai-architect/SKILL.md) | Cross-cloud routing and cost (prefer architect-method) | lead-architect | pass | 362 |
| [nvidia-nim](skills/nvidia-nim/SKILL.md) | NIM inference microservices | none in this team | pass | 458 |
| [oci-services-expert](skills/oci-services-expert/SKILL.md) | OCI services and patterns | oci-architect | pass | 421 |
| [openai-agentkit](skills/openai-agentkit/SKILL.md) | OpenAI Agents SDK and handoffs | lead-architect | pass | 457 |
| [oracle-adk](skills/oracle-adk/SKILL.md) | OCI ADK multi-agent apps | oci-architect | pass | 415 |
| [oracle-agent-spec](skills/oracle-agent-spec/SKILL.md) | Portable Agent Spec definitions | oci-architect | pass | 486 |
| [rag-expert](skills/rag-expert/SKILL.md) | Chunking, embeddings, production RAG | lead-architect | pass | 370 |
| [terraform-iac](skills/terraform-iac/SKILL.md) | Terraform across clouds | none in this team (agents here do not provision) | pass | 257 |

## Remaining limits of the reference layer

1. **Figures not refreshed.** The 2026-10-05 pass dated and sourced stale figures; it did not
   re-read most of them on the live page. Only the OWASP LLM Top 10 2025 list and the
   `oracle/agent-spec` README were read live that day.
2. **Code not run.** Samples still use SDK calls and model ids from 2024 to early 2026 (for
   example the OCI ADK import path and Agent Spec node names, which are labelled illustrative).
3. **Overlap with the packs.** `aws-ai-services`, `azure-ai-services` and `multi-cloud-ai-architect`
   overlap `pack-aws`, `pack-azure` and `architect-method`; prefer the packs.

These are fixes for the skill owner, not for agents in this team, who only read skills.

## Measurement

```
node skills/check-skills.mjs          # human-readable; exits 1 on any failure
node skills/check-skills.mjs --json   # per-skill name, lines, description length, trigger, problems
```

It checks every `skills/*/SKILL.md` for: frontmatter keys limited to the spec's six, `name`
pattern and length and equality with the directory, description present, at most 1024 characters
and containing "Use when", `metadata` as a flat string map, fewer than 500 lines, relative links
that resolve, and every `references/*.md` linked from `SKILL.md`. Re-run it before quoting any count
in this file.
