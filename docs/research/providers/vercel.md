# Vercel: official AI-architecture assets

Tier: primary. Researched 2026-10-05. GitHub figures come from the GitHub REST API on 2026-10-05. Anything not checked against a primary source is marked [UNVERIFIED].

At Ship 2026 (recap published 2026-06-30) Vercel presented an "Agent Stack" as GA: AI SDK 7, AI Gateway, Workflow SDK, Vercel Sandbox and Chat SDK. It also introduced the open-source agent framework **eve**, Vercel Connect (GA) and Vercel Agent (public beta) ([Ship 2026 recap](https://vercel.com/blog/vercel-ship-2026-recap)).

## 1. Agent skills, AGENTS.md repos and MCP servers

| Repo | Stars | Last push | Licence | What it is |
|---|---|---|---|---|
| [vercel-labs/skills](https://github.com/vercel-labs/skills) | 33,159 | 2026-10-02 | MIT | `npx skills`, the open agent-skills installer. Oracle, Cloudflare and others document `npx skills add <org>/<repo>` as their install path |
| [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | 31,950 | 2026-08-28 | **none detected** | 9 skills: react-best-practices, composition-patterns, deploy-to-vercel, vercel-cli-with-tokens, vercel-optimize, web-design-guidelines, writing-guidelines, react-native-skills, react-view-transitions. Ships `AGENTS.md` and `CLAUDE.md`. No licence file was detected, so reuse rights are unclear. Ask Vercel before redistributing |
| [vercel/vercel-plugin](https://github.com/vercel/vercel-plugin) | 297 | 2026-10-05 | NOASSERTION | "Comprehensive Vercel ecosystem plugin": relational knowledge graph and skills for every major product |
| [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser) | 43,529 | 2026-10-03 | Apache-2.0 | Browser-automation CLI for agents |

MCP:
- **Vercel MCP (remote, OAuth)** at `https://mcp.vercel.com`. Tools cover docs search, teams, projects, deployments, logs and analytics. Project-scoped URLs take the form `https://mcp.vercel.com/<org>/<project>` ([docs](https://vercel.com/docs/agent-resources/vercel-mcp), [launch blog](https://vercel.com/blog/introducing-vercel-mcp-connect-vercel-to-your-ai-tools), [CLI `vercel mcp`](https://vercel.com/docs/cli/mcp), [overview repo](https://github.com/vercel/vercel-mcp-overview)).
- **mcp-handler** lets you host your own MCP server on Next.js, Nuxt or Svelte: [vercel-labs/mcp-handler](https://github.com/vercel-labs/mcp-handler) (682 stars, 2026-09-18, licence none detected). `vercel/mcp-adapter` and `vercel/mcp-handler` both redirect there.

## 2. Agent frameworks and SDKs

| Asset | Source | Notes |
|---|---|---|
| AI SDK 7 | [vercel/ai](https://github.com/vercel/ai): 27,123 stars, 2026-10-05, licence NOASSERTION · [ai-sdk.dev](https://ai-sdk.dev/) · [AI SDK 7 blog](https://vercel.com/blog/ai-sdk-7) | Vercel reports "over 16 million [downloads] a week" ([recap](https://vercel.com/blog/vercel-ship-2026-recap)). v7 adds a harness layer, typed tool context and a WorkflowAgent for durable steps ([developersdigest](https://www.developersdigest.tech/blog/vercel-ai-sdk-7-production-agents)) [UNVERIFIED: detail from a secondary source] |
| eve (agent framework) | [vercel/eve](https://github.com/vercel/eve): 5,457 stars, 2026-10-05, Apache-2.0 · [blog](https://vercel.com/blog/introducing-eve) | "The Open Framework for Building Agents", described as how Vercel builds its own production agents. Templates include [eve-software-factory-template](https://github.com/vercel-labs/eve-software-factory-template) (1,151 stars) |
| Workflow SDK | [vercel/workflow](https://github.com/vercel/workflow): 2,443 stars, Apache-2.0 · [workflow-sdk.dev](https://workflow-sdk.dev/) | Durable execution with retries, persisted state and observability. GA |
| Vercel Sandbox | [vercel/sandbox](https://github.com/vercel/sandbox): 208 stars, Apache-2.0 | Ephemeral microVMs for untrusted or agent code. GA |
| AI Gateway | https://vercel.com/ai-gateway | One endpoint for hundreds of models with failover. Vercel reports ~2T → 20T tokens/month ([recap](https://vercel.com/blog/vercel-ship-2026-recap)). GA |
| Chat SDK | [vercel/chat](https://github.com/vercel/chat): 2,393 stars, MIT · [chat-sdk.dev](https://chat-sdk.dev/) | One agent deployed to Slack, Discord, GitHub and more |
| Vercel Connect | [blog](https://vercel.com/blog/introducing-vercel-connect) | Credential and tool access broker for agents. GA |
| Vercel Agent | [changelog](https://vercel.com/changelog/vercel-agent-now-in-limited-beta) | Monitors production, investigates alerts and opens PRs. Public beta |
| Templates | [vercel-labs/open-agents](https://github.com/vercel-labs/open-agents) 5,837 (MIT) · [vercel-labs/coding-agent-template](https://github.com/vercel-labs/coding-agent-template) 1,791 · [vercel/chatbot](https://github.com/vercel/chatbot) 20,988 · [vercel/examples](https://github.com/vercel/examples) 5,156 | Reference apps |

## 3. Architecture centre and well-architected guidance

- No formal Well-Architected framework or architecture centre was found. The nearest official guidance:
  - "How to build production-ready AI agents": https://vercel.com/i/how-to-build-production-ready-ai-agents
  - Knowledge base and docs: https://vercel.com/docs (agent resources: https://vercel.com/docs/agent-resources/vercel-mcp)
  - Ship 2026 Agent Stack overview: https://vercel.com/blog/vercel-ship-2026-recap
- Gap: production-architecture checklists for Vercel agents (maxDuration, Fluid Compute, MCP cold starts, approvals) exist mainly in community and third-party posts ([community thread](https://community.vercel.com/t/guidance-on-production-ai-agent-architecture-and-follow-up-systems/45963)). None of those posts is authoritative.

## 4. Certifications and partner programme

| Credential | Cost | Notes | Source |
|---|---|---|---|
| Vercel Academy course certificates (for example, "Builders Guide to the AI SDK") | free | Completion certificates, not proctored certifications | https://vercel.com/academy · https://vercel.com/academy/ai-sdk |
| Vercel Partner Certification | not published | Firm-level, covering platform, Next.js and AI Cloud. Only existing Solution Partners can take it. The inaugural cohort had 11 firms | https://vercel.com/blog/vercel-launches-partner-certification · https://vercel.com/go/solution-partner-certification-request |

Gap: **there is no individual proctored Vercel certification.**

Partner programme: **Solution Partners** (agencies and SIs) and **Technology Partners** (integrations). Benefits include an Enterprise sandbox, enablement, co-marketing and a directory listing ([partners](https://vercel.com/partners), [solution partners](https://vercel.com/partners/solution-partners)). No fee was found.

## 5. Five things an AI Architects org should build on or mirror

1. **Distribute through `npx skills` (vercel-labs/skills).** It has become a de facto cross-vendor install path for skills: Oracle documents it, and other vendors' repos follow the layout. Make the org's skills repo installable this way on day one.
2. **Use AI SDK 7 + Workflow SDK as the TypeScript reference agent stack.** Map it explicitly against ADK (Python), Strands (Python/TS) and Agent Framework (.NET/Python), with one task implemented four ways. The comparison is the asset.
3. **Write a Vercel AI architecture guide.** Vercel has no well-architected guidance. A neutral review covering durable steps, sandbox isolation, gateway failover, MCP hosting limits and approvals fills the gap, and Vercel partners would cite it.
4. **Study eve as the reference "agent framework from a platform"** alongside Cloudflare Project Think and Google agents-cli. Each platform now ships an opinionated harness, and a comparison exposes the lock-in each one carries.
5. **Run a community-graded AI Cloud credential.** Individual developers cannot get a Vercel certification; firm-level partner certification is the only option. A community-graded practical exam on AI SDK + Gateway + Workflow + Sandbox fills a gap.

## Sources
https://vercel.com/blog/vercel-ship-2026-recap · https://github.com/vercel/ai · https://github.com/vercel/eve · https://github.com/vercel/workflow · https://github.com/vercel/sandbox · https://github.com/vercel-labs/skills · https://github.com/vercel-labs/agent-skills · https://vercel.com/docs/agent-resources/vercel-mcp · https://vercel.com/partners · https://vercel.com/blog/vercel-launches-partner-certification · https://vercel.com/academy
