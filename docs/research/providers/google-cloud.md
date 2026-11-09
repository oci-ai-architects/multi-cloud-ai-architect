# Google Cloud: official AI-architecture assets

Tier: primary. Researched 2026-10-05. GitHub figures come from the GitHub REST API on 2026-10-05 (stars, last push, SPDX licence). Anything not checked against a primary source is marked [UNVERIFIED].

Naming changed in 2026. Google rebranded Vertex AI as **Gemini Enterprise Agent Platform** at Cloud Next on 2026-04-22. ADK, Agent Engine and Agent Studio now sit under that name ([HPCwire/AIwire](https://www.hpcwire.com/aiwire/2026/04/23/google-unveils-gemini-enterprise-agent-platform/), and [google/agents-cli README](https://github.com/google/agents-cli) uses the new name). Docs and code samples still mix the two names.

## 1. Agent skills, AGENTS.md repos and MCP servers

### Skills / plugin repos

| Repo | Stars | Last push | Licence | What it is |
|---|---|---|---|---|
| [google/skills](https://github.com/google/skills) | 20,939 | 2026-10-02 | Apache-2.0 | 155 SKILL.md files spanning Ads, Analytics and Cloud (agent-platform-deploy, eval-flywheel, rag-engine, bigquery, alloydb, Well-Architected skills). Ships `.claude-plugin`, `index.json` and a `plugins/cloud/google-cloud-developer` bundle |
| [google/agents-cli](https://github.com/google/agents-cli) | 6,050 | 2026-09-30 | Apache-2.0 | CLI plus 7 skills for scaffold, adk-code, deploy, eval, observability, publish and workflow. Targets Antigravity CLI, Claude Code and Codex. Published on PyPI as `google-agents-cli` |
| [google-gemini/gemini-skills](https://github.com/google-gemini/gemini-skills) | 4,247 | 2026-09-23 | Apache-2.0 | 3 skills (gemini-api-dev, gemini-live-api-dev, gemini-omni-flash-api). Ships Claude, Codex and Cursor plugin manifests |
| [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli) | 107,230 | 2026-10-05 | Apache-2.0 | Google's terminal agent and the reference host for Gemini CLI extensions |

The skills-count method was a `git/trees?recursive=1` call filtered to files named `SKILL.md`.

### MCP servers

The catalogue at [google/mcp](https://github.com/google/mcp) (4,622 stars, last push 2026-08-17, Apache-2.0) lists two kinds:

- **Google-managed remote MCP servers** ([overview](https://docs.cloud.google.com/mcp/overview), [supported products](https://docs.cloud.google.com/mcp/supported-products)): AlloyDB, BigQuery, Bigtable, Cloud Resource Manager, Cloud SQL (MySQL, Postgres, SQL Server), Compute Engine, Developer Knowledge API, Firestore, Maps Grounding Lite, SecOps, GKE, Spanner, Cloud Run (GA) and Cloud Storage.
- **Open-source servers**, listed below.

| Repo | Stars | Last push | Licence |
|---|---|---|---|
| [googleapis/mcp-toolbox](https://github.com/googleapis/mcp-toolbox), formerly genai-toolbox (old URL redirects) | 16,586 | 2026-10-05 | Apache-2.0 |
| [googleapis/gcloud-mcp](https://github.com/googleapis/gcloud-mcp) (gcloud, observability and storage packages) | 921 | 2026-10-05 | Apache-2.0 |
| [GoogleCloudPlatform/cloud-run-mcp](https://github.com/GoogleCloudPlatform/cloud-run-mcp) | 631 | 2026-10-05 | Apache-2.0 |
| [GoogleCloudPlatform/gke-mcp](https://github.com/GoogleCloudPlatform/gke-mcp) | 168 | 2026-09-28 | Apache-2.0 |

google/mcp's own README says it is "not an officially supported Google product". Treat it as a directory and the linked servers as the real assets.

## 2. Agent frameworks and SDKs

| Asset | Source | Notes |
|---|---|---|
| Agent Development Kit (ADK), Python | [google/adk-python](https://github.com/google/adk-python): 21,709 stars, 2026-10-05, Apache-2.0 | The flagship. Docs live at [adk.dev](https://adk.dev/) and in [google/adk-docs](https://github.com/google/adk-docs) (1,512 stars) |
| ADK Go / Java / TypeScript | [adk-go](https://github.com/google/adk-go) 8,846 · [adk-java](https://github.com/google/adk-java) 1,746 · [adk-js](https://github.com/google/adk-js) 1,430 | All Apache-2.0 and all pushed 2026-10-05 |
| ADK recipes (formerly adk-samples; old URL redirects) | [google/adk-recipes](https://github.com/google/adk-recipes): 10,414 stars | Reference patterns and vertical plugins |
| ADK Web dev UI | [google/adk-web](https://github.com/google/adk-web): 1,049 stars | Built-in local developer UI |
| Agent2Agent (A2A) protocol | [a2aproject/A2A](https://github.com/a2aproject/A2A): 26,012 stars, Apache-2.0 · [a2a-python](https://github.com/a2aproject/a2a-python): 2,179 | Lives in the `a2aproject` org, outside Google's. Google's Architecture Center uses A2A between coordinator agents and subagents ([multi-agent system](https://docs.cloud.google.com/architecture/multiagent-ai-system)) |
| Agent Starter Pack | [GoogleCloudPlatform/agent-starter-pack](https://github.com/GoogleCloudPlatform/agent-starter-pack): 6,568 stars, last push 2026-07-21 | Production templates with CI/CD. Pushes stopped in July while agents-cli kept moving, so it may have been superseded. [UNVERIFIED: no deprecation notice was checked] |
| Generative AI samples | [GoogleCloudPlatform/generative-ai](https://github.com/GoogleCloudPlatform/generative-ai): 17,785 stars | Notebooks and samples |
| GenAI Processors | [google-gemini/genai-processors](https://github.com/google-gemini/genai-processors): 2,119 stars | Parallel content-processing library |
| Managed runtime | Agent Engine, Agent Studio and memory, all inside Gemini Enterprise Agent Platform ([AIwire](https://www.hpcwire.com/aiwire/2026/04/23/google-unveils-gemini-enterprise-agent-platform/)) | Third-party sources say "200+ models incl. Claude". [UNVERIFIED against the Google model garden] |

## 3. Architecture centre and Well-Architected guidance

- Architecture Center: https://docs.cloud.google.com/architecture
- Choosing agentic AI architecture components: https://docs.cloud.google.com/architecture/choose-agentic-ai-architecture-components
- Multi-agent AI system (A2A coordinator pattern): https://docs.cloud.google.com/architecture/multiagent-ai-system
- Multi-tenant agentic AI system: https://docs.cloud.google.com/architecture/multi-tenant-agentic-ai-system
- Agentic AI use cases: [data science](https://docs.cloud.google.com/architecture/agentic-ai-data-science) and [orchestrating access to disparate systems](https://docs.cloud.google.com/architecture/agenticai-orchestrate-access-disparate-systems)
- Well-Architected Framework, AI and ML perspective: [operational excellence](https://docs.cloud.google.com/architecture/framework/perspectives/ai-ml/operational-excellence) and [reliability](https://docs.cloud.google.com/architecture/framework/perspectives/ai-ml/reliability). Change log: [what's new](https://docs.cloud.google.com/architecture/framework/whats-new)
- google/skills packages Well-Architected Framework skills directly (see the repo tree). That is the only provider found in this research that turns its WAF into agent skills.

## 4. Certifications and partner programme

| Credential | Cost | Status | Source |
|---|---|---|---|
| **Professional Agentic Architect (PAA)** | $200 at GA ($120 during the closed beta) | GA registration opens 2 Nov 2026. Two parts: an ~80-question, 3-hour proctored exam, then hands-on labs in Google Skills. Valid 1 year | https://cloud.google.com/learn/certification/agentic-architect |
| Professional Cloud Architect | $200 | GA | https://cloud.google.com/learn/certification/cloud-architect: "$200 (plus tax where applicable)", 2 hours, 50-60 questions (read 2026-10-05) |
| Generative AI Leader (foundational) | $99 | GA | https://cloud.google.com/blog/topics/training-certifications/new-google-cloud-certification-in-generative-ai ; price confirmed on https://cloud.google.com/learn/certification/generative-ai-leader: "$99 (plus tax where applicable)" (read 2026-10-05) |
| Professional Machine Learning Engineer | $200 [UNVERIFIED] | GA | https://cloud.google.com/learn/certification |

Partner programme: **Google Cloud Partner Network (GCPN)**. It replaced Partner Advantage in 2026, with three tiers (Select, Premier, Diamond) and competencies instead of specialisations ([Google blog](https://cloud.google.com/blog/topics/partners/introducing-google-cloud-partner-network), [ChannelE2E](https://www.channele2e.com/news/google-cloud-revamps-partner-network-to-reward-real-customer-outcomes)). No fee was found [UNVERIFIED]. Google Cloud also runs an individual programme, Google Cloud Ambassadors: https://partners.cloud.google.com/google-cloud-ambassadors

## 5. Five things an AI Architects org should build on or mirror

1. **Mirror the google/skills layout.** It combines per-product skills, a Well-Architected skill pack, `index.json` and a Claude plugin manifest. Copy that taxonomy for a cloud-agnostic `ai-architect-skills` repo, and cite Google's WAF skills as prior art.
2. **Use ADK + A2A as the reference multi-agent stack** for the GCP column. ADK has 4 language SDKs and A2A has 26k stars and vendor-neutral governance. Pair it with the Architecture Center multi-agent pattern so samples line up with official diagrams.
3. **Ship a blueprint built on mcp-toolbox and the remote MCP servers.** Databases-as-tools with Google-managed endpoints is the cleanest "agent ↔ enterprise data" pattern among the providers in this matrix. Mirror it with the AWS AgentCore Gateway and Azure Foundry MCP equivalents.
4. **Build a prep track for the Professional Agentic Architect exam.** It is the first hyperscaler professional certification titled for agentic architecture, and GA opens 2026-11-02. Study notes, labs and an exam-guide mapping are a timely magnet for members.
5. **Wrap agents-cli eval and observability skills into a cross-cloud eval harness.** Google ships "eval-flywheel" and agents-cli eval skills. A neutral harness that runs the same eval set against ADK, Strands and Agent Framework agents fills a gap that no single vendor will fill.

## Sources
https://github.com/google/skills · https://github.com/google/agents-cli · https://github.com/google/mcp · https://github.com/google/adk-python · https://github.com/a2aproject/A2A · https://adk.dev/ · https://docs.cloud.google.com/mcp/overview · https://cloud.google.com/learn/certification/agentic-architect · https://cloud.google.com/blog/topics/partners/introducing-google-cloud-partner-network · https://www.hpcwire.com/aiwire/2026/04/23/google-unveils-gemini-enterprise-agent-platform/ · https://docs.cloud.google.com/architecture/multiagent-ai-system
