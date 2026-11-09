# AWS: official AI-architecture assets

Tier: secondary. Researched 2026-10-05. GitHub figures come from the GitHub REST API on 2026-10-05. Anything not checked against a primary source is marked [UNVERIFIED].

## 1. Agent skills, AGENTS.md repos and MCP servers

| Repo | Stars | Last push | Licence | What it is |
|---|---|---|---|---|
| [aws/agent-toolkit-for-aws](https://github.com/aws/agent-toolkit-for-aws) | 2,804 | 2026-10-05 | Apache-2.0 | "Official, AWS-supported MCP servers, skills, and plugins". 186 SKILL.md files across plugins `aws-core` (Bedrock, CDK/CFN, IAM, networking, observability, billing, SDKs), `aws-agents` (build, connect, debug, deploy, harden, optimize, pay on AgentCore), `aws-data-analytics` and `aws-agents-for-devsecops`. Marked GA. Installs via `aws configure agent-toolkit` or from the official Claude plugin marketplace (`/plugin install aws-core@claude-plugins-official`) ([README](https://github.com/aws/agent-toolkit-for-aws); [user guide](https://docs.aws.amazon.com/agent-toolkit/latest/userguide/aws-cli.html)) |
| [awslabs/agent-plugins](https://github.com/awslabs/agent-plugins) | 911 | 2026-10-05 | Apache-2.0 | 34 skills: aws-serverless (Lambda durable functions, Step Functions), deploy-on-aws (including **aws-architecture-diagram**), sagemaker-ai (fine-tuning, HyperPod debuggers), dsql, amplify, location, transform. Ships `AGENTS.md` and `CLAUDE.md` |
| [awslabs/mcp](https://github.com/awslabs/mcp) | 9,753 | 2026-10-04 | Apache-2.0 | "Open source MCP Servers for AWS", 62 entries under `src/` |
| [awslabs/aidlc-workflows](https://github.com/awslabs/aidlc-workflows) | 4,993 | 2026-10-05 | MIT-0 | AI-Driven Life Cycle steering rules for coding agents |
| [strands-agents/agent-sop](https://github.com/strands-agents/agent-sop) | 1,173 | 2026-09-21 | Apache-2.0 | Natural-language SOP workflows for agents |

The AWS-supported surface is now split between `aws/` (agent-toolkit, GA) and `awslabs/` (experimental and labs).

## 2. Agent frameworks and SDKs

| Asset | Source | Notes |
|---|---|---|
| **Amazon Bedrock AgentCore** | [docs](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html) · [product](https://aws.amazon.com/bedrock/agentcore/) · [pricing](https://aws.amazon.com/bedrock/agentcore/pricing/) | Modular services: **Harness** (managed agent loop in an isolated microVM), Runtime, Memory, Gateway (APIs/Lambda → MCP), Identity, Code Interpreter, Browser, Observability (OTEL), **Payments** (x402 + MPP), Evaluations, Optimization (A/B), **Policy** (Dogwood, Cedar-compatible) and **Registry** (agents, MCP servers, skills). Framework-agnostic: CrewAI, LangGraph, LlamaIndex, Google ADK, OpenAI Agents SDK and Strands. Supports MCP and A2A |
| AgentCore SDK / CLI | [aws/bedrock-agentcore-sdk-python](https://github.com/aws/bedrock-agentcore-sdk-python) 776 · [aws/agentcore-cli](https://github.com/aws/agentcore-cli) 301 · [starter-toolkit](https://github.com/aws/bedrock-agentcore-starter-toolkit) 514, labelled "(legacy)" by AWS | Use agentcore-cli for new work |
| AgentCore samples | [awslabs/agentcore-samples](https://github.com/awslabs/agentcore-samples): 3,428 stars | Renamed from amazon-bedrock-agentcore-samples (old URL redirects) |
| **Strands Agents** | [strands-agents/harness-sdk](https://github.com/strands-agents/harness-sdk): 8,671 stars, 2026-10-05, Apache-2.0 · [strandsagents.com](https://strandsagents.com/) | `sdk-python` was **renamed `harness-sdk`** (old URL redirects). It now carries the SDKs, Strands harness and CLI ([docs alias note](https://dev.co/ai/frameworks/harness-sdk)). The separate [sdk-typescript](https://github.com/strands-agents/sdk-typescript) repo is **archived** (2026-06-03). [tools](https://github.com/strands-agents/tools) 1,308 · [samples](https://github.com/strands-agents/samples) 887 · the [docs](https://github.com/strands-agents/docs) repo is archived |
| Agent Squad (formerly Multi-Agent Orchestrator) | [2FastLabs/agent-squad](https://github.com/2FastLabs/agent-squad): 7,779 stars | `awslabs/agent-squad` now redirects to the **2FastLabs** org, so the project has left AWS's GitHub. Do not cite it as official AWS |
| Generative AI CDK Constructs | [awslabs/generative-ai-cdk-constructs](https://github.com/awslabs/generative-ai-cdk-constructs): 544 | IaC patterns |
| Multi-agent guidance | [aws-solutions-library-samples/guidance-for-multi-agent-orchestration-on-aws](https://github.com/aws-solutions-library-samples/guidance-for-multi-agent-orchestration-on-aws): 75 | Solutions Library |
| Amazon Q Developer CLI | [aws/amazon-q-developer-cli](https://github.com/aws/amazon-q-developer-cli): 1,983, last push 2026-08-24 | AWS has shifted its agentic IDE work to Kiro [UNVERIFIED] |

## 3. Architecture centre and Well-Architected guidance

- AWS Architecture Center: https://aws.amazon.com/architecture/ [URL from knowledge; not fetched this session]
- **Well-Architected Agentic AI Lens** (published 2026-06-10): https://docs.aws.amazon.com/wellarchitected/latest/agentic-ai-lens/agentic-ai-lens.html ([PDF](https://docs.aws.amazon.com/pdfs/wellarchitected/latest/agentic-ai-lens/agentic-ai-lens.pdf)). Covers LLM-as-judge evaluation, reasoning-loop cost control, arbiter patterns for multi-agent systems, inter-agent security and human oversight.
- **Well-Architected Generative AI Lens** (April 2025, updated at re:Invent 2025): [announcement](https://aws.amazon.com/about-aws/whats-new/2025/04/well-architected-generative-ai-lens) · [re:Invent 2025 three lenses](https://aws.amazon.com/blogs/architecture/architecting-for-ai-excellence-aws-launches-three-well-architected-lenses-at-reinvent-2025)
- FSI Lens updated for GenAI and agentic AI (Jan 2026): [aws-news](https://aws-news.com/article/2026-01-27-announcing-the-well-architected-fsi-lens-updated-for-generative-ai-and-agentic-ai) [secondary source]
- Architecture Blog, AI category: https://aws.amazon.com/blogs/architecture/category/artificial-intelligence/

AWS is the only provider in this matrix with a **dedicated agentic-AI Well-Architected lens**.

## 4. Certifications and partner programme

| Credential | Code | Cost | Source |
|---|---|---|---|
| **Generative AI Developer – Professional** | AIP-C01 | $300 (180 min, 75 Q, GA) | https://aws.amazon.com/certification/certified-generative-ai-developer-professional/ |
| AI Practitioner (foundational) | AIF-C01 | $100 | https://aws.amazon.com/certification/certified-ai-practitioner/ |
| Machine Learning Engineer – Associate | MLA-C01 | $150 (MLA-C02 beta $75) | https://aws.amazon.com/certification/certified-machine-learning-engineer-associate/ (read 2026-10-05) |
| Solutions Architect – Associate / Professional | SAA-C03 / SAP-C02 [UNVERIFIED] | $150 / $300 [UNVERIFIED] | https://aws.amazon.com/certification/ |
| **Demonstrated** credentials: Agentic AI, Securing Agent Identities, Databases for Agentic AI, MLOps | n/a | not listed | linked from the AIP-C01 page |

Partner programme: **AWS Partner Network (APN)**. Registration is free. The ISV Software Path costs **$2,500/yr** ([labra](https://labra.io/aws-partner-programs-guide/), [skematic](https://www.skematic.ai/blog/aws-partner-network-tiers)) [UNVERIFIED on an AWS page]. The **AI Competency** has Generative AI and Agentic AI categories. AWS says qualifying 2026 Agentic AI partners get +$25K MDF on top of $50K ([APN blog 2026](https://aws.amazon.com/blogs/apn/powering-partner-success-2026-innovations/), [GenAI Competency partners](https://aws.amazon.com/ai/generative-ai/partners/)).

## 5. Five things an AI Architects org should build on or mirror

1. **Turn the Agentic AI Lens into a cross-cloud review.** It is the most complete official agentic well-architected guidance. Use its question set as the org's neutral review skeleton, then map Google WAF AI/ML, Azure WAF AI and OCI equivalents onto each question.
2. **Use AgentCore's service decomposition as the reference capability model**: harness, runtime, memory, gateway, identity, policy, registry, payments, evals, observability. Every other provider's offering can be scored against these 13 boxes, and that matrix becomes the org's signature artifact.
3. **Mirror the agent-toolkit-for-aws plugin structure** (core, agents, devsecops, data). It is the largest official skill set in this survey (186 SKILL.md files) and is distributed through the official Claude marketplace. Reuse the taxonomy rather than the content.
4. **Ship Strands harness-sdk samples deployed on AgentCore Runtime, then the same agent on Agent Engine and Foundry.** AgentCore officially runs ADK and OpenAI Agents SDK, so the portability story is real and demonstrable.
5. **Build an AIP-C01 study path paired with Google PAA.** Two professional-level agentic credentials launched within months of each other. A joint prep track positions the org as cloud-agnostic from the start.

## Sources
https://github.com/aws/agent-toolkit-for-aws · https://github.com/awslabs/agent-plugins · https://github.com/awslabs/mcp · https://github.com/strands-agents/harness-sdk · https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html · https://docs.aws.amazon.com/wellarchitected/latest/agentic-ai-lens/agentic-ai-lens.html · https://aws.amazon.com/certification/certified-generative-ai-developer-professional/ · https://aws.amazon.com/certification/certified-ai-practitioner/ · https://aws.amazon.com/blogs/apn/powering-partner-success-2026-innovations/
