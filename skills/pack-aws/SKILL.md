---
name: pack-aws
description: Architecture decisions for AI agents on AWS - Amazon Bedrock models, Bedrock AgentCore (Runtime, Gateway, Memory, Identity, Code Interpreter, Browser, Observability, Policy, Evaluations, Harness, Registry, Payments), Strands Agents harness-sdk, Lambda durable functions and Step Functions, and the Well-Architected Agentic AI Lens. Use when choosing an AWS runtime for an agent, decomposing an agent into AgentCore services, estimating AgentCore cost (v1 vs v2 microVMs), running an Agentic AI Lens review, or porting an ADK, LangGraph or OpenAI Agents SDK agent onto AgentCore. Trigger on "AgentCore", "Bedrock agent", "Strands", "Agentic AI Lens", "AGENTSEC", "AGENTOPS", "deploy agent on AWS". Not for CDK, CLI or SDK syntax; the official aws/agent-toolkit-for-aws plugins cover that.
metadata:
  version: "1.0.0"
  asOf: "2026-10-05"
  scope: decision-layer
  official-skills: https://github.com/aws/agent-toolkit-for-aws
---

# AWS pack: AgentCore decomposition and the Agentic AI Lens

AWS matters to every agent architect for two reasons, even on a non-AWS project: **AgentCore's
service decomposition** is the most complete capability model for agent infrastructure, and the
**Well-Architected Agentic AI Lens** (published 2026-06-10) is the only pillar-structured, reviewable
agentic guidance any provider ships ([lens](https://docs.aws.amazon.com/wellarchitected/latest/agentic-ai-lens/agentic-ai-lens.html)).
`architect-method` uses both as the cross-cloud yardstick.

Official skills, to install rather than copy: [aws/agent-toolkit-for-aws](https://github.com/aws/agent-toolkit-for-aws)
(Apache-2.0, GA, 186 SKILL.md across `aws-core`, `aws-agents`, `aws-data-analytics`,
`aws-agents-for-devsecops`; `/plugin install aws-core@claude-plugins-official`) and
[awslabs/agent-plugins](https://github.com/awslabs/agent-plugins) (labs, includes `aws-architecture-diagram`).

## 1. When AWS is the right column

| Workload signal | Fit | Why |
|---|---|---|
| Enterprise already on AWS: data in S3/RDS/DynamoDB, IAM as the identity spine | Strong | Agent sits next to data; IAM and VPC controls apply unchanged |
| Framework is already chosen (LangGraph, CrewAI, ADK, OpenAI Agents SDK, Strands) | Strong | AgentCore is framework-agnostic and model-agnostic per the lens |
| Need fine-grained authorisation on tool calls | Strong | AgentCore Policy, Cedar-based; $0.000025 per authorization request |
| Long sessions with long model waits | Strong on v2 | v2 microVM CPU scales to zero during I/O wait and memory is reclaimed during the session ([pricing](https://aws.amazon.com/bedrock/agentcore/pricing/), read 2026-10-05) |
| Wrapping many existing REST APIs / Lambdas as MCP tools | Strong | AgentCore Gateway turns APIs and Lambda into MCP tools with semantic tool search |
| Small TS web product, no AWS estate | Weak | Vercel or Cloudflare are shorter paths |
| Per-user stateful agents at edge latency | Medium | Regional runtime; compare Durable Objects |

## 2. Service selection

| Capability | AWS service | Decision note |
|---|---|---|
| Harness | Strands Agents ([harness-sdk](https://github.com/strands-agents/harness-sdk), renamed from sdk-python; Python) or AgentCore Harness (managed loop in a microVM) | Strands TypeScript repo was archived 2026-06-03; pick Python or another framework for TS |
| Runtime | AgentCore Runtime | Choose v2 for I/O-heavy agents; v1 is cheaper per hour but has no documented scale-to-zero during I/O |
| Alt runtime | Lambda durable functions + Step Functions | For deterministic workflows with a few LLM steps; cheaper and easier to audit than a free agent loop |
| Memory | AgentCore Memory (short-term events, long-term records) | Long-term records bill per 1,000 records/month; prune |
| Tools | AgentCore Gateway | Search API costs 5x a normal call; index only the tools agents need |
| Identity | AgentCore Identity | Free when used through Runtime or Gateway |
| Code / browser | AgentCore Code Interpreter, Browser | Per-second; idle during I/O wait is free |
| Policy | AgentCore Policy (Cedar) | Put irreversible tools behind explicit policies |
| Evals | AgentCore Evaluations (built-in, token-priced) | Pair with your own eval set; built-in judges are not your acceptance criteria |
| Observability | AgentCore Observability (OTel) on CloudWatch pricing | Export traces to your eval store |
| Models | Amazon Bedrock (Anthropic, OpenAI, Meta, Amazon, Mistral, NVIDIA and others, per the lens) | Use Bedrock Guardrails at the model boundary |
| Registry / Payments | AgentCore Registry (agents, MCP servers, skills), Payments (x402, MPP) | From the agent-toolkit README; not on the pricing page read 2026-10-05 [UNVERIFIED pricing] |

New work: use [aws/agentcore-cli](https://github.com/aws/agentcore-cli). AWS labels the starter toolkit
"(legacy)". Agent Squad moved to the 2FastLabs org; do not cite it as official AWS.

## 3. The Agentic AI Lens in one table

Six pillars, adapted for agents. The lens's own reading paths (from the lens home page, read 2026-10-05):

| Stage | Questions to answer first |
|---|---|
| First agent | AGENTOPS01 roles and success criteria · AGENTREL02 atomic tasks, least privilege, clear instructions · AGENTSEC03 agent identity and auth · AGENTSEC08 input validation and output filtering |
| Production | AGENTOPS05 tracing and anomaly detection · AGENTOPS06 testing with LLM-as-judge · AGENTPERF02 cognitive pipeline and model selection · AGENTCOST01 reasoning-loop cost · AGENTCOST02 model right-sizing and tokens |
| Multi-agent | AGENTREL04 arbiter patterns and fallbacks · AGENTPERF05 orchestration patterns · AGENTSEC06 inter-agent trust · AGENTCOST05 cost attribution |
| Hardening | AGENTSEC04 guardrails and HITL · AGENTSEC07 protect oversight, detect rogue agents · AGENTREL06 legacy integration with idempotency |

Responsible-AI anchors in the lens: bounded autonomy (AGENTSEC04), transparency (AGENTOPS05), tiered
human oversight (AGENTREL02-BP05), goal alignment (AGENTOPS06), organisational sustainability (AGENTSUS03).
The lens can be imported into the WA Tool as a custom lens from
[aws-samples/sample-well-architected-custom-lens](https://github.com/aws-samples/sample-well-architected-custom-lens).

## 4. Cost envelopes and gotchas

Rows in `prices.json` ([AgentCore pricing](https://aws.amazon.com/bedrock/agentcore/pricing/), read 2026-10-05).

- **Runtime v1** $0.0895/vCPU-h + $0.00945/GB-h. **v2 consumption** $0.1276/vCPU-h + $0.0169/GB-h; v2 committed baseline ($0.0997 / $0.0132) is listed as launching October 2026. Per-second billing, 1-second minimum.
- v2 costs more per hour but bills CPU only when working. For an agent that waits on the model 80 to 90% of the session, v2 is usually cheaper. Model it with your measured utilisation; do not guess.
- **Session lifetime is billed**, including idle periods, until termination. Close sessions explicitly.
- **Memory short-term ingestion: $1.00/GB, marked on the page "As of October 6, 2026"**, a price that takes effect the day after this pack was written. Re-read before quoting.
- Gateway: $0.005 per 1,000 calls, Search $0.025 per 1,000, indexing $0.02 per 100 tools/month.
- Evaluations bill on judge tokens ($0.0024/1K in, $0.012/1K out); a large nightly eval set is a real line item.
- New AWS customers get up to $200 in Free Tier credits.

## 5. Security controls

| Lens question | Control |
|---|---|
| AGENTSEC03 identity | AgentCore Identity per agent; IAM role per agent, never shared; OAuth to third-party tools via Identity token vault |
| AGENTSEC04 guardrails + HITL | Bedrock Guardrails at model boundary; Policy (Cedar) denies irreversible tools without an approval token |
| AGENTSEC06 inter-agent | A2A or MCP between agents only through Gateway with authN; log delegations |
| AGENTSEC07 rogue agents | Behaviour baselines from Observability; kill switch that revokes the agent's role |
| AGENTSEC08 input/output | Validate tool arguments against schemas; filter outputs for PII before they leave the VPC |
| Code execution | Code Interpreter sandbox only; no VPC access unless required |

## 6. Eval checklist

- [ ] Every AGENTOPS06 criterion has a dataset and an acceptance threshold in the spec, not only in the console.
- [ ] Trajectory checks on Gateway tool calls (right tool, right args, no extra writes).
- [ ] Cost per task measured on v1 and v2 with real traces before choosing.
- [ ] Policy test: each irreversible tool is denied without approval, and allowed with it.
- [ ] Portability: the same Strands or ADK agent runs on a second cloud with the same eval set.

## 7. Anti-patterns

- Using AgentCore as a label while running a monolithic agent with an admin IAM role.
- Turning on Gateway semantic search for 12 tools. Search pays off at hundreds.
- Treating built-in Evaluations as acceptance. They are instruments; acceptance lives in the ADR.
- Citing awslabs repos as GA. GA is the `aws/` org; `awslabs/` is labs.

## 8. What the official skills do not say

- The lens is AWS-only in vocabulary. `architect-method/references/provider-scoring-rubric.md` maps each lens area to Azure, GCP, Cloudflare, Vercel and Railway controls.
- Certifications: **Generative AI Developer – Professional (AIP-C01) $300** and **AI Practitioner (AIF-C01) $100** ([AIP-C01](https://aws.amazon.com/certification/certified-generative-ai-developer-professional/), [AIF-C01](https://aws.amazon.com/certification/certified-ai-practitioner/)).
- The AI-DLC steering rules ([awslabs/aidlc-workflows](https://github.com/awslabs/aidlc-workflows), MIT-0) are reusable in any repo's AGENTS.md.

## Sources
[AgentCore docs](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html) · [AgentCore pricing](https://aws.amazon.com/bedrock/agentcore/pricing/) · [Agentic AI Lens](https://docs.aws.amazon.com/wellarchitected/latest/agentic-ai-lens/agentic-ai-lens.html) · [agent-toolkit-for-aws](https://github.com/aws/agent-toolkit-for-aws) · [Strands harness-sdk](https://github.com/strands-agents/harness-sdk) · research: `docs/research/providers/aws.md`
