# Railway: official AI-architecture assets

Tier: primary. Researched 2026-10-05. GitHub figures come from the GitHub REST API on 2026-10-05. Anything not checked against a primary source is marked [UNVERIFIED].

Railway is a PaaS, not an AI platform. It has no model hosting API, agent framework or gateway. Its AI-architecture value lies in agent-operable infrastructure (MCP, CLI agent, skills, llms.txt) and a large template marketplace.

## 1. Agent skills, AGENTS.md repos and MCP servers

| Asset | Stars | Last push | Licence | Status |
|---|---|---|---|---|
| [railwayapp/railway-skills](https://github.com/railwayapp/railway-skills) | 325 | 2026-10-01 | MIT | Live. One plugin skill, `plugins/railway/skills/use-railway`. Ships `AGENTS.md`, `CLAUDE.md` and `.claude-plugin`/`.cursor-plugin` manifests. Third-party indexes list an extra `railway-docs` skill ([agentskills.to](https://www.agentskills.to/railwayapp/railway-skills/railway-docs)) [UNVERIFIED: not present in the current tree] |
| [railwayapp/railway-mcp-server](https://github.com/railwayapp/railway-mcp-server) | 190 | 2026-05-23 | MIT | **Archived 2026-05-23.** MCP moved into the CLI |
| [railwayapp/cli](https://github.com/railwayapp/cli) | 622 | 2026-10-01 | MIT | Hosts the MCP server (`railway mcp install`, `railway mcp install --remote`), `railway agent` and `railway skills install` |
| **Remote MCP** `mcp.railway.com` | n/a | launched 2026-04-17 | n/a | OAuth. Launched with 7 tools, including `railway-agent` for multi-step operations ([changelog](https://railway.com/changelog/2026-04-17-remote-mcp), [blog](https://blog.railway.com/p/agent-rails-remote-mcp-cli)) |

Agent-facing docs: spec-compliant `llms.txt` and `llms-full.txt` on docs.railway.com ([changelog](https://railway.com/changelog/2026-04-17-remote-mcp)), plus https://railway.com/llms.txt and https://railway.com/llms-templates.md. Railway says its web properties return markdown tuned for agent harnesses ([State of Rails](https://blog.railway.com/p/state-of-railway-agents)).

## 2. Agent frameworks and SDKs

| Asset | Source | Notes |
|---|---|---|
| Railway Agent (`railway agent`) | [changelog 2026-04-17](https://railway.com/changelog/2026-04-17-remote-mcp) | Natural-language ops from the terminal or CI. Supports interactive mode, `-p` one-shot, JSON output and thread resume |
| `railway skills install` | same | Writes curated skills to `~/.agents/skills` and to auto-detected Claude Code, Cursor, Codex and OpenCode directories |
| Railpack builder | [railwayapp/railpack](https://github.com/railwayapp/railpack): 1,218 stars, 2026-10-05, MIT | Zero-config image builder, relevant to agent-deployed code |
| AI templates | https://railway.com/deploy/category/ai | Railway claims "500+" open-source AI templates (Ollama, Open WebUI, vector DBs, agent stacks) [UNVERIFIED count] |
| Templates repo | [railwayapp/templates](https://github.com/railwayapp/templates): 381 stars, **last push 2024-05-22** | Stale. The live marketplace is the source of truth |
| Docs | [railwayapp/docs](https://github.com/railwayapp/docs): 317 stars, MIT | |

No Railway-native agent SDK or model API exists. Agents on Railway run on any framework (ADK, Strands, AI SDK, LangGraph) as ordinary services.

## 3. Architecture centre and well-architected guidance

- Docs: https://docs.railway.com (templates: https://docs.railway.com/templates)
- Gap: **there is no architecture centre, reference architectures or well-architected framework.** The nearest material is the agent-infra strategy post ([State of Rails](https://blog.railway.com/p/state-of-railway-agents)) and template docs.

## 4. Certifications and partner programme

- Certifications: **none exist** (no official certification found).
- Partner programme: **Open Source & Technology Partners** ([docs](https://docs.railway.com/templates/partners), apply at https://railway.com/partners). Open-source or open-core projects only.
  - Template kickback: **15%** of usage from your verified templates, **+10% (25% total)** if you answer user questions ([docs](https://docs.railway.com/templates/partners)).
  - Technology partners earn commission on all templates using their technology, including community-built ones ([blog](https://blog.railway.com/p/annoucing-railway-technology-partners)).
  - Older posts mention cash withdrawal in $100–$10,000 increments via Stripe Connect ([kickback blog](https://blog.railway.com/p/incentivized-templates)) [UNVERIFIED: current].

## 5. Five things an AI Architects org should build on or mirror

1. **Publish verified Railway templates for the org's reference agents** (ADK, Strands, AI SDK, LangGraph with Postgres/pgvector). This gives one-click deploys, and the kickback rewards upkeep. Railway is the only provider here that pays template authors directly.
2. **Use `mcp.railway.com` + `railway agent` as the "agent deploys its own infra" demo.** It is the lowest-friction public example of an agent driving PaaS over OAuth MCP, and it suits workshops.
3. **Contribute a deeper skill set upstream.** railway-skills has a single skill. Architecture skills (service topology, private networking, volumes, cost limits for agent workloads) are an obvious contribution with a real chance of being accepted.
4. **Write a Railway well-architected checklist for AI services** covering GPU absence, egress, private networking, replicas, sleep/cold start and secrets. Railway has no official version.
5. **Copy Railway's llms.txt plus agent-tuned markdown in the org's own docs site** so the org's guidance is agent-readable by default.

## Sources
https://railway.com/changelog/2026-04-17-remote-mcp · https://blog.railway.com/p/agent-rails-remote-mcp-cli · https://github.com/railwayapp/railway-skills · https://github.com/railwayapp/railway-mcp-server · https://github.com/railwayapp/cli · https://docs.railway.com/templates/partners · https://blog.railway.com/p/state-of-railway-agents · https://railway.com/deploy/category/ai
