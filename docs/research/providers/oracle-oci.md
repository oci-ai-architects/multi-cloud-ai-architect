# Oracle OCI: official AI-architecture assets

Tier: secondary. Researched 2026-10-05 from public sources only. No Oracle-internal, confidential or customer material is included. GitHub figures come from the GitHub REST API on 2026-10-05. Anything not checked against a primary source is marked [UNVERIFIED].

Naming: in March 2026 Oracle brought its agent work under **OCI Enterprise AI**, inside OCI Generative AI. "Enterprise AI Agents" reached GA on 2026-03-31 ([release note](https://docs.oracle.com/en-us/iaas/releasenotes/generative-ai/enterprise-ai.htm), [docs](https://docs.oracle.com/en-us/iaas/Content/generative-ai/agents.htm)). The older **OCI Generative AI Agents** service and its ADK still have live docs ([release notes](https://docs.oracle.com/en-us/iaas/releasenotes/services/generative-ai-agents/index.htm)).

## 1. Agent skills, AGENTS.md repos and MCP servers

| Repo | Stars | Last push | Licence | What it is |
|---|---|---|---|---|
| [oracle/skills](https://github.com/oracle/skills) | 869 | 2026-09-29 | UPL-1.0 | 15 SKILL.md files by domain: `oci` (enterprise-ai, functions deploy/troubleshoot, iot-platform, 4 OKE skills), `db` (incl. data-guard), `apex`, `graal`, `fusion`. Installs with `npx skills add oracle/skills/oci` or as a Claude plugin marketplace (`/plugin marketplace add oracle/skills`). Ships a `SKILL_AUTHORING_GUIDE.md` |
| [oracle/mcp](https://github.com/oracle/mcp) | 452 | 2026-10-03 | UPL-1.0 | MCP server suite under `src/`: oci-api, oci-cloud, compute, networking, identity, object-storage, logging, monitoring, usage, **pricing**, limits, resource-search, cloud-guard, database, db-observability, document-understanding, opensearch, registry, recovery, migration, full-stack-DR, support, iot, faaas, dbtools, mysql, oracle-db-doc, data-studio, goldengate and a Java DB toolkit |
| [oracle-samples/fusion-ai-skills](https://github.com/oracle-samples/fusion-ai-skills) | 6 | 2026-09-09 | n/a | A-Team-validated Fusion AI agent skills |
| [oracle-samples/mcp-examples](https://github.com/oracle-samples/mcp-examples) | 7 | 2026-03-26 | n/a | MCP prototypes |

## 2. Agent frameworks and SDKs

| Asset | Source | Notes |
|---|---|---|
| **OCI Enterprise AI** | [overview](https://docs.oracle.com/en-us/iaas/Content/generative-ai/overview.htm) · [agents](https://docs.oracle.com/en-us/iaas/Content/generative-ai/agents.htm) | **OCI Responses API**, which is OpenAI-Responses-compatible and covers orchestration, tools and memory. Also hosted **Applications** (runs OSS-framework agents or MCP servers, public or private endpoints), Vector Stores and Projects (per-project isolation of memory and files). Feature list from [Luigi Saetta summary](https://luigi-saetta.medium.com/oci-enterprise-ai-a-summary-888d65592e60) [secondary; matches the GA note] |
| **OCI ADK** (Agent Development Kit) | [API reference](https://docs.oracle.com/en-us/iaas/Content/generative-ai-agents/adk/api-reference/introduction.htm) · [launch blog](https://blogs.oracle.com/ai-and-datascience/introducing-oci-adk-build-agentic-apps-faster) · [ADK vs SDK](https://docs.public.content.oci.oraclecloud.com/en-us/iaas/Content/generative-ai-agents/adk/api-reference/best-practices/adk-vs-oci-sdk.htm) | `pip install "oci[adk]"`, Python 3.10+. Client-side library for the GenAI Agents service: multi-turn, routing, agent-as-tool and deterministic workflows. It ships inside [oracle/oci-python-sdk](https://github.com/oracle/oci-python-sdk) (473 stars, licence NOASSERTION), not as its own repo |
| **Open Agent Specification (Agent Spec)** | [oracle/agent-spec](https://github.com/oracle/agent-spec): 436 stars, 2026-10-01, Apache-2.0 · [docs](https://oracle.github.io/agent-spec/) · `pip install pyagentspec` | Framework-agnostic declarative language (JSON/YAML) for Agents and Flows. Runtimes implement it. This is Oracle's portability play |
| **WayFlow** | [oracle/wayflow](https://github.com/oracle/wayflow): 189 stars, 2026-10-05, Apache-2.0 | Python reference runtime for Agent Spec |
| LangChain integration | [oracle/langchain-oracle](https://github.com/oracle/langchain-oracle): 64, UPL-1.0 | Official LangChain support for OCI GenAI |
| Oracle AI Database agent tooling | [oracle/ai-optimizer](https://github.com/oracle/ai-optimizer) 101 · [oracle/vecdb-python-sdk](https://github.com/oracle/vecdb-python-sdk) 70 | Vector, RAG and agent experimentation on the AI Database |
| Developer hub | [oracle-devrel/oracle-ai-developer-hub](https://github.com/oracle-devrel/oracle-ai-developer-hub): 4,404 stars | The largest Oracle AI repo by stars |
| Samples | [oracle-samples/oci-data-science-ai-samples](https://github.com/oracle-samples/oci-data-science-ai-samples) 301 · [oracle-devrel/technology-engineering](https://github.com/oracle-devrel/technology-engineering) 180 | |

Third-party writers note that the overlap between Enterprise AI, the GenAI Agents ADK, Agent Spec/WayFlow, LangChain-Oracle and the AI Database confuses builders ([redthunder.blog, 2026-03-06](https://redthunder.blog/2026/03/06/so-many-oracle-ai-agent-frameworks-which-one-actually-fits-your-project/)).

## 3. Architecture centre and well-architected guidance

- Architecture Center (reference architectures): https://docs.oracle.com/solutions/ [hub URL from knowledge; specific pages below were found by search]
- Deploy agentic AI using the OCI AI Agent Platform: https://docs.oracle.com/en/solutions/deploy-agentic-ai-agent-platform/index.html
- Build an enterprise-level GenAI stack on OCI: https://docs.oracle.com/en/solutions/oci-genai-enterprise/index.html
- Multi-agent contract automation on OCI Enterprise AI: [blog](https://blogs.oracle.com/ai-and-datascience/deploying-an-agentic-contract-automation-platform-on-oci-enterprise-ai) · dynamic multi-agent platform: [blog](https://blogs.oracle.com/ai-and-datascience/building-a-dynamic-multi-agent-enterprise-platform)
- Monthly product roundup: [What's New in Oracle AI, Aug 2026](https://blogs.oracle.com/ai-and-datascience/whats-new-in-ai-august-2026)
- Gap: no AI- or agent-specific well-architected lens was found. OCI publishes best-practice frameworks for infrastructure, but there is no AI pillar comparable to AWS's lenses or Azure's WAF AI [UNVERIFIED: absence].

## 4. Certifications and partner programme

| Credential | Code | Cost | Source |
|---|---|---|---|
| **Oracle Agentic AI Foundations Associate (2026)** | 1Z0-1157-26 [code from a third party] | **Free** (40 Q, 60 min, 65% pass) | [learning path](https://learn.oracle.com/ols/learning-path/become-an-oracle-agentic-ai-foundations-associate-2026/146553/163239) · [OU blog](https://blogs.oracle.com/oracleuniversity/oracle-agentic-ai-foundations-training-certification-now-available) |
| OCI Enterprise AI Professional | n/a | paid [price UNVERIFIED] | [OU 2026 updates](https://blogs.oracle.com/oracleuniversity/oci-certification-learning-paths-and-exams-2026-updates-now-available) (page returned 403 to the fetcher; details via search) |
| Agentic AI for Oracle AI Database Professional · Agentic AI for Oracle Data Platform Professional | n/a | paid [UNVERIFIED] | same |
| OCI 2025 Generative AI Professional | 1Z0-1127-25 | price not confirmed (the exam page timed out on 2026-10-05; the $245 third-party figure is withdrawn from the site) | [exam page](https://education.oracle.com/oracle-cloud-infrastructure-2025-generative-ai-professional/pexam_1Z0-1127-25). Its learning path was due to be archived 2026-08-30 ([certificationpractice](https://certificationpractice.com/exam-overviews/oracle-cloud-infrastructure-generative-ai-professional-quick-facts)) [UNVERIFIED] |

Oracle says every Foundations-level course and exam stays free ([OU blog](https://blogs.oracle.com/oracleuniversity/oracle-agentic-ai-foundations-training-certification-now-available)). That makes Oracle the only provider in this survey with a free agentic-AI certification.

Partner programme: **Oracle PartnerNetwork (OPN)**. Annual Principal-member fees are Level 0 $500, Level 1 $5,000, Level 2 $100,000 and Level 3 $500,000 ([OPN policies PDF](https://www.oracle.com/opn/manage/opn-level-policies-12405077.pdf?IS_CONTAINERIZED=Y), [FAQ](https://www.oracle.com/partnernetwork/program/faq/)). Figures come from a search snippet of the PDF [UNVERIFIED by direct read].

## 5. Five things an AI Architects org should build on or mirror

1. **Feature Agent Spec as the portability layer.** It is the only provider-originated, framework-agnostic agent definition format in this survey (Apache-2.0). Test whether one Agent Spec file can target WayFlow plus at least one non-Oracle runtime. That makes a strong neutral demo, provided adapter support is verified first.
2. **Use the free Agentic AI Foundations exam as the org's on-ramp credential.** It costs nothing, which suits members who are just starting. Pair it with Google PAA and AWS AIP-C01 for the professional tier.
3. **Mirror oracle/mcp's pricing and usage servers in a multi-cloud FinOps-for-agents MCP.** Oracle ships `oci-pricing` and `oci-usage` MCP servers. A neutral cost MCP across clouds is a gap the org could own.
4. **Write a decision guide mapping Oracle's agent options.** Public writers flag the overlap between Enterprise AI Responses API, the GenAI Agents ADK, Agent Spec/WayFlow and LangChain-Oracle. A "which Oracle agent path when" guide built from public docs is useful and contains no confidential material.
5. **Copy `SKILL_AUTHORING_GUIDE.md` and the domain-folder install pattern (`npx skills add oracle/skills/oci`)** into the org's skills repo. Per-domain installs keep context small, which matters for a cloud-agnostic library with many providers.

## Sources
https://github.com/oracle/skills · https://github.com/oracle/mcp · https://github.com/oracle/agent-spec · https://github.com/oracle/wayflow · https://docs.oracle.com/en-us/iaas/releasenotes/generative-ai/enterprise-ai.htm · https://docs.oracle.com/en-us/iaas/Content/generative-ai-agents/adk/api-reference/introduction.htm · https://docs.oracle.com/en/solutions/deploy-agentic-ai-agent-platform/index.html · https://learn.oracle.com/ols/learning-path/become-an-oracle-agentic-ai-foundations-associate-2026/146553/163239 · https://www.oracle.com/partnernetwork/program/faq/
