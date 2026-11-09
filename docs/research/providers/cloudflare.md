# Cloudflare: official AI-architecture assets

Tier: primary. Researched 2026-10-05. GitHub figures come from the GitHub REST API on 2026-10-05. Anything not checked against a primary source is marked [UNVERIFIED].

Cloudflare treats agents as an edge runtime problem. Durable Objects hold state, and Workers/V8 isolates provide compute. Agents Week (12–17 April 2026) shipped or previewed 18 agent products ([InfoQ](https://www.infoq.com/news/2026/04/cloudflare-project-think/), [Cloudflare blog recap](https://blog.cloudflare.com/agents-week-in-review/)). A second recap post exists for August 2026 ([blog](https://blog.cloudflare.com/agents-week-review-august-2026/)). Its contents were not reviewed [UNVERIFIED].

## 1. Agent skills, AGENTS.md repos and MCP servers

| Repo | Stars | Last push | Licence | What it is |
|---|---|---|---|---|
| [cloudflare/skills](https://github.com/cloudflare/skills) | 2,988 | 2026-10-01 | Apache-2.0 | 16 skills: agents-sdk, durable-objects, workers-best-practices, wrangler, nextjs-on-cloudflare, sandbox-*, cloudflare-one, email-service, web-perf, turnstile-spin and others. Ships Claude, Codex and Cursor plugin manifests plus `mcp.json` and `rules/` |
| [cloudflare/mcp-server-cloudflare](https://github.com/cloudflare/mcp-server-cloudflare) | 4,353 | 2026-10-01 | Apache-2.0 | Monorepo of remote MCP servers under `apps/`: ai-gateway, autorag, browser-rendering, docs-ai-search, workers-bindings, workers-builds, workers-observability, dns-analytics, radar, logpush, graphql, sandbox-container, auditlogs, casb, dex-analysis |
| [cloudflare/mcp](https://github.com/cloudflare/mcp) | 922 | 2026-10-02 | Apache-2.0 | "MCP server for the Cloudflare API" (whole-API surface) |
| [cloudflare/workers-mcp](https://github.com/cloudflare/workers-mcp) | 647 | 2026-04-23 | Apache-2.0 | Older stdio bridge from Claude Desktop to a Worker. Pushes have slowed |
| [cloudflare/cloudflare-docs](https://github.com/cloudflare/cloudflare-docs) | 5,279 | 2026-10-05 | CC-BY-4.0 | Docs source, which is the citable origin of the reference architectures |

Cloudflare also hosts MCP for others. The Agents SDK includes McpAgent and MCP client tooling ([Agents docs, MCP tool](https://developers.cloudflare.com/agents/tools/mcp/)). The Enterprise AI agent workspace reference architecture names **MCP server portals** as the enterprise tool layer ([ref-arch](https://developers.cloudflare.com/reference-architecture/diagrams/ai/enterprise-ai-agent-workspace/)).

## 2. Agent frameworks and SDKs

| Asset | Source | Notes |
|---|---|---|
| Agents SDK | [cloudflare/agents](https://github.com/cloudflare/agents): 5,775 stars, 2026-10-05, MIT · [docs](https://developers.cloudflare.com/agents/) | Agent class, state, sessions, routing and scheduling on top of Durable Objects ([runtime API](https://developers.cloudflare.com/agents/runtime/agents-api/)) |
| Project Think (preview) | [docs](https://developers.cloudflare.com/agents/harnesses/think/) · [InfoQ](https://www.infoq.com/news/2026/04/cloudflare-project-think/) | Opinionated agent harness. Fibers handle checkpointing and a Session API holds conversations. Runs in Dynamic Workers |
| Dynamic Workers | [InfoQ](https://www.infoq.com/news/2026/04/cloudflare-project-think/) | V8 isolates created on demand for agent-generated code. A third party reports "~100× faster cold start than containers" ([aiautomationglobal](https://aiautomationglobal.com/blog/cloudflare-agents-week-2026-dynamic-workers-sandboxes)) [UNVERIFIED: vendor-adjacent claim] |
| Code Mode | [docs](https://developers.cloudflare.com/agents/tools/codemode/) | The model writes code that calls tools instead of making one tool call per step |
| Sandbox SDK (Sandboxes GA at Agents Week) | [cloudflare/sandbox-sdk](https://github.com/cloudflare/sandbox-sdk): 1,145 stars, 2026-09-30, licence NOASSERTION · [docs](https://developers.cloudflare.com/agents/tools/sandbox/) | Persistent shell, filesystem and background processes. Check licence terms before vendoring |
| Workers AI | https://developers.cloudflare.com/workers-ai/ | Serverless inference and the default model provider for Agents |
| AI Gateway | https://developers.cloudflare.com/ai-gateway/ · [architectures](https://developers.cloudflare.com/ai-gateway/demos/) | Provider-agnostic proxy with caching, rate limits, logging and fallback. Also exposed as an MCP server |
| AI Search (formerly AutoRAG) | https://developers.cloudflare.com/agents/tools/ai-search/ | Managed hybrid retrieval with per-instance indexes. The MCP app folder is still named `autorag` |
| Browser, Payments, Email Service (beta), Artifacts | [Agents docs](https://developers.cloudflare.com/agents/) · [Agents Week recap](https://blog.cloudflare.com/agents-week-in-review/) | Agent tools. Artifacts is Git-compatible versioned storage for agents |
| Durable Objects | https://developers.cloudflare.com/durable-objects/ | The stateful actor primitive underneath all of the above |
| Starters | [cloudflare/agents-starter](https://github.com/cloudflare/agents-starter): 1,342 · [cloudflare/templates](https://github.com/cloudflare/templates): 2,140 · [cloudflare/vibesdk](https://github.com/cloudflare/vibesdk): 5,395 (MIT) | vibesdk is a full open-source vibe-coding platform reference |
| Runtime | [cloudflare/workerd](https://github.com/cloudflare/workerd): 8,809 stars, Apache-2.0 | Self-hostable Workers runtime, the portability escape hatch |

## 3. Architecture centre and well-architected guidance

- Reference Architecture hub: https://developers.cloudflare.com/reference-architecture/ (architectures, diagrams, design guides, implementation guides)
- **Enterprise AI agent workspace**: https://developers.cloudflare.com/reference-architecture/diagrams/ai/enterprise-ai-agent-workspace/ (Workers + Agents SDK for orchestration, Durable Objects for state, AI Gateway for model governance, MCP server portals, Dynamic Workers/Sandbox/Browser)
- **Enterprise AI vibe-coding platform**: https://developers.cloudflare.com/reference-architecture/diagrams/ai/enterprise-ai-vibe-coding-platform/
- Agent patterns (sequential, routing, parallel, orchestrator, evaluator, human-in-the-loop) are in the [Agents docs](https://developers.cloudflare.com/agents/)
- Internal case study of Cloudflare's own AI engineering stack: https://blog.cloudflare.com/internal-ai-engineering-stack/
- Gap: Cloudflare has **no formal "Well-Architected" framework**. Its reference architectures are diagrams and design guides without pillar-based review questions.

## 4. Certifications and partner programme

| Credential | Cost | Notes | Source |
|---|---|---|---|
| ~~Cloudflare Certified Core~~ | withdrawn | The name and the $200 figure came only from a third-party page (itcareerroadmap). Cloudflare's certification pages checked on 2026-10-05 do not list it, so it is removed from the site | n/a |
| Application Security Associate · Zero Trust Associate (beta) | not found | Taken on site at Cloudflare University (Connect, 19–21 Oct 2026, +$495 add-on to the Connect pass) | https://www.cloudflare.com/connect/cloudflare-university/ · [Credly badge](https://www.credly.com/org/cloudflare/badge/cloudflare-application-security-associate) |
| Zaraz Certified Developer | free | Foundational, narrow scope | https://www.credly.com/org/cloudflare/badge/cloudflare-zaraz-certified-developer |

Gap: **there is no developer-platform, Workers or AI/agents certification.** All current Cloudflare credentials cover security and networking.

Partner programme: the Cloudflare Partner Network has reseller/solution, technology and service-delivery tracks. PowerUP tiers are Registered, Select and Elite ([cloudflare-partner.org](https://cloudflare-partner.org/), [Tech Partner whitepaper PDF](https://cf-assets.www.cloudflare.com/slt3lc6tev37/3QRlYQgNL3mpxdI5Vy49YR/29355573d1848f93a2460df83390c39b/Tech_Partner_Program_Whitepaper.pdf)). A Self-Serve Partner Program for SMB agencies is in closed beta ([blog](https://blog.cloudflare.com/self-serve-partners-beta/)). A Design Partner designation was added in 2026 ([press release](https://www.cloudflare.com/press/press-releases/2026/cloudflare-launches-design-partner-designation-to-accelerate-secure-ai-and-seamless-sase-adoption/)). Tier names come from a third-party aggregator [UNVERIFIED]. No fee was found.

## 5. Five things an AI Architects org should build on or mirror

1. **Run a "Cloudflare Agents Architect" study track.** Cloudflare has no developer or AI certification, so this is an unclaimed credential space. A community-run curriculum on Agents SDK, Durable Objects, AI Gateway and Sandbox, with graded labs, has no official competitor.
2. **Write a Well-Architected-style review for edge agents.** Cloudflare offers reference diagrams but no pillar questions. A neutral review covering state durability (DO), isolate limits, gateway governance, MCP portal auth and cost would fill the gap, and could be published as a skill next to `cloudflare/skills`.
3. **Use AI Gateway as the vendor-neutral model control plane** in multi-cloud blueprints. It fronts Bedrock, Azure, Vertex, OCI-compatible OpenAI APIs and Workers AI, and it is also an MCP server. That makes it a natural "front door" layer in the org's reference stack.
4. **Mirror the Enterprise AI agent workspace reference architecture** as an implementable repo with IaC and code, alongside the AWS AgentCore and Azure Foundry versions. The diagram exists, but no official one-click implementation was found [UNVERIFIED].
5. **Adopt the Durable Objects actor model as the reference "stateful agent" pattern.** Compare it to Vercel Workflow, AgentCore Runtime and Agent Engine. A comparison matrix of durable agent runtimes is high-value content that no vendor will write neutrally.

## Sources
https://github.com/cloudflare/agents · https://github.com/cloudflare/skills · https://github.com/cloudflare/mcp-server-cloudflare · https://github.com/cloudflare/mcp · https://developers.cloudflare.com/agents/ · https://developers.cloudflare.com/reference-architecture/diagrams/ai/enterprise-ai-agent-workspace/ · https://blog.cloudflare.com/agents-week-in-review/ · https://www.infoq.com/news/2026/04/cloudflare-project-think/ · https://www.cloudflare.com/connect/cloudflare-university/
