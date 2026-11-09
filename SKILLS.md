# Skills

Index of the skills in `skills/`, what triggers each one, and which agent in `team/` loads it.
Skills follow the Agent Skills format (https://agentskills.io/specification, read 2026-10-05):
a directory with a `SKILL.md` whose frontmatter `name` matches the directory, is lowercase with
hyphens, and whose `description` (at most 1024 characters) says what the skill does **and when to
use it**. Agents load only `name` and `description` at startup and the body on activation, so the
description is the trigger.

Load the smallest set that covers the task. The provider packs and `architect-method` are the
current layer; the older domain skills are reference material with known defects listed below.

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

These predate the current method. They still hold useful material, but each needs the fixes in the
next section before it is trusted. Status columns are `[MEASURED]` by the command at the end of this
file on 2026-10-05.

| Skill | Use when | Loaded by | Name valid | Lines |
|---|---|---|---|---|
| [agentic-orchestration](skills/agentic-orchestration/SKILL.md) | Multi-agent coordination, task decomposition, handoffs | lead-architect | yes | 540 |
| [ai-security-expert](skills/ai-security-expert/SKILL.md) | OWASP LLM Top 10, prompt injection defence, guardrails, PII | claims-auditor, adlc-evals-lead | no | 197 |
| [architecture-diagramming](skills/architecture-diagramming/SKILL.md) | D2, draw.io and Mermaid diagrams | visual-director | no | 561 |
| [aws-ai-services](skills/aws-ai-services/SKILL.md) | Bedrock and SageMaker detail (prefer pack-aws) | aws-architect | no | 440 |
| [azure-ai-services](skills/azure-ai-services/SKILL.md) | Azure OpenAI and AI services detail (prefer pack-azure) | azure-architect | no | 502 |
| [claude-sdk](skills/claude-sdk/SKILL.md) | Claude Agent SDK, tool calling, MCP integration | lead-architect | no | 206 |
| [enterprise-ai-patterns](skills/enterprise-ai-patterns/SKILL.md) | Enterprise governance, scalability and operations patterns | lead-architect | no | 593 |
| [finops-ai](skills/finops-ai/SKILL.md) | Model selection cost, GPU sizing, commitments | inherited economics-analyst | no | 585 |
| [genai-dac-specialist](skills/genai-dac-specialist/SKILL.md) | OCI Generative AI dedicated AI clusters | oci-architect | no | 399 |
| [huggingface-trainer](skills/huggingface-trainer/SKILL.md) | Fine-tuning with TRL and Transformers | none in this team | no | 620 |
| [knowledge-updater](skills/knowledge-updater/SKILL.md) | Refreshing knowledge bases (superseded by `loops/provider-refresh.loop.yaml`) | none | no | 178 |
| [kubernetes-ai](skills/kubernetes-ai/SKILL.md) | GPU scheduling and model serving on Kubernetes | google-cloud-architect, aws-architect, azure-architect | no | 185 |
| [langgraph-patterns](skills/langgraph-patterns/SKILL.md) | LangGraph state machines and human-in-the-loop | lead-architect | no | 304 |
| [mcp-2025-patterns](skills/mcp-2025-patterns/SKILL.md) | MCP server design and multi-server orchestration | graph-ontology-engineer, lead-architect | yes | 545 |
| [mcp-architecture](skills/mcp-architecture/SKILL.md) | MCP resources, tools, prompts and security | lead-architect | no | 475 |
| [multi-cloud-ai-architect](skills/multi-cloud-ai-architect/SKILL.md) | Cross-cloud routing and cost (prefer architect-method) | lead-architect | no | 564 |
| [nvidia-nim](skills/nvidia-nim/SKILL.md) | NIM inference microservices | none in this team | yes | 467 |
| [oci-services-expert](skills/oci-services-expert/SKILL.md) | OCI services and patterns | oci-architect | no | 410 |
| [openai-agentkit](skills/openai-agentkit/SKILL.md) | OpenAI Agents SDK and handoffs | lead-architect | no | 446 |
| [oracle-adk](skills/oracle-adk/SKILL.md) | OCI ADK multi-agent apps | oci-architect | no | 393 |
| [oracle-agent-spec](skills/oracle-agent-spec/SKILL.md) | Portable Agent Spec definitions | oci-architect | no | 461 |
| [rag-expert](skills/rag-expert/SKILL.md) | Chunking, embeddings, production RAG | lead-architect | no | 564 |
| [terraform-iac](skills/terraform-iac/SKILL.md) | Terraform across clouds | none in this team (agents here do not provision) | no | 247 |

## Known defects in the reference layer

1. **Names.** 20 of the 23 reference skills use a display name ("AI Security Expert") where the spec
   requires the directory name ("ai-security-expert"). Strict loaders will reject or mis-key them.
2. **No trigger clause.** None of the 23 descriptions says when to use the skill. The provider packs
   do. Rewrite each description as "what it does. Use when ...".
3. **Length.** 9 reference skills exceed the spec's recommended 500 lines for `SKILL.md`. Move detail
   into `references/` so activation stays cheap.
4. **Staleness.** All 23 carry `last_updated: 2026-01-06` and model names from January 2026. Any model,
   price or version in them is `[UNVERIFIED]` until re-checked against a live source.

These are fixes for the skill owner, not for agents in this team, who only read skills.

## Measurement

```
node -e "const fs=require('fs'),p=require('path');const re=/^(?!-)(?!.*--)[a-z0-9-]{1,64}(?<!-)$/;for(const d of fs.readdirSync('skills').sort()){const f=p.join('skills',d,'SKILL.md');if(!fs.existsSync(f))continue;const s=fs.readFileSync(f,'utf8');const name=(s.match(/^name:\s*(.+)$/m)||[])[1]?.trim();const desc=(s.match(/^description:\s*(.+)$/m)||[])[1]?.trim()||'';console.log([d,name===d&&re.test(name)?'ok':'FAIL',s.split('\n').length,/use when/i.test(desc)?'has-when':'no-when'].join(' | '))}"
```

Re-run it before quoting any count in this file.
