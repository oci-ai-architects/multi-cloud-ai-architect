# Microsoft Azure: official AI-architecture assets

Tier: secondary. Researched 2026-10-05. GitHub figures come from the GitHub REST API on 2026-10-05. Anything not checked against a primary source is marked [UNVERIFIED].

Naming: Microsoft now uses "Microsoft Foundry", formerly Azure AI Foundry. The certification page names "Microsoft Foundry" as a product ([Learn](https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-apps-and-agents-developer-associate/)).

## 1. Agent skills, AGENTS.md repos and MCP servers

| Repo | Stars | Last push | Licence | What it is |
|---|---|---|---|---|
| [microsoft/skills](https://github.com/microsoft/skills) | 3,081 | 2026-10-05 | MIT | "Skills, MCP servers, Custom Agents, Agents.md for SDKs to ground Coding Agents". 205 SKILL.md files, mostly per-SDK (azure-ai-projects, azure-ai-agents-persistent, m365-agents across .NET, Java, Python and TS) plus azure-cost and others. Ships `Agents.md`, `.claude-plugin` and `context7.json` |
| [microsoft/mcp](https://github.com/microsoft/mcp) | 3,730 | 2026-10-05 | MIT | Catalogue of official Microsoft MCP servers. Source for `servers/Azure.Mcp.Server` and `Fabric.Mcp.Server` |
| [Azure/azure-mcp](https://github.com/Azure/azure-mcp) | 1,223 | 2026-02-06 | MIT | **Archived.** Superseded by microsoft/mcp |
| [MicrosoftDocs/mcp](https://github.com/MicrosoftDocs/mcp) | 1,930 | 2026-09-29 | CC-BY-4.0 | Microsoft Learn MCP server and CLI (live docs grounding) |
| **Foundry MCP Server (preview, cloud-hosted)** | n/a | n/a | n/a | `https://mcp.ai.azure.com`, Entra ID OAuth/OBO ([devblog](https://devblogs.microsoft.com/foundry/announcing-foundry-mcp-server-preview-speeding-up-ai-dev-with-microsoft-foundry/), [get started](https://learn.microsoft.com/en-us/azure/foundry/mcp/get-started)). The old [microsoft-foundry/mcp-foundry](https://github.com/microsoft-foundry/mcp-foundry) (261 stars) points to it |
| [microsoft/GitHub-Copilot-for-Azure](https://github.com/microsoft/GitHub-Copilot-for-Azure) | 253 | 2026-10-05 | NOASSERTION | Copilot-for-Azure extension source |
| [github/awesome-copilot](https://github.com/github/awesome-copilot) | 39,716 | 2026-10-04 | MIT | Community instructions, agents and skills (GitHub-owned, not Azure) |

## 2. Agent frameworks and SDKs

| Asset | Source | Notes |
|---|---|---|
| **Microsoft Agent Framework** | [microsoft/agent-framework](https://github.com/microsoft/agent-framework): 13,947 stars, 2026-10-05, MIT · [docs](https://learn.microsoft.com/en-us/agent-framework/overview/) | 1.0 GA for .NET and Python on 2026-04-03 ([Visual Studio Magazine](https://visualstudiomagazine.com/articles/2026/04/06/microsoft-ships-production-ready-agent-framework-1-0-for-net-and-python.aspx)). Successor to Semantic Kernel and AutoGen ([migration devblog](https://devblogs.microsoft.com/agent-framework/migrate-your-semantic-kernel-and-autogen-projects-to-microsoft-agent-framework-release-candidate/)). Adds graph workflows and HITL state |
| Semantic Kernel | [microsoft/semantic-kernel](https://github.com/microsoft/semantic-kernel): 28,628, MIT | Still active, but new agent work goes to Agent Framework |
| AutoGen | [microsoft/autogen](https://github.com/microsoft/autogen): 61,259, licence CC-BY-4.0 (as detected), last push 2026-04-15 | Maintenance mode since 2025-10-02 ([atlan](https://atlan.com/know/ai-agent/microsoft/agent-framework/)) [secondary source] |
| Foundry Agent Service + samples | [microsoft-foundry/foundry-samples](https://github.com/microsoft-foundry/foundry-samples): 454 · [Azure-Samples/get-started-with-ai-agents](https://github.com/Azure-Samples/get-started-with-ai-agents): 374 | Hosted agent runtime |
| Azure Developer CLI (azd) | [Azure/azure-dev](https://github.com/Azure/azure-dev): 570, MIT | Its description now targets "build and deploy AI applications" |
| Foundry Local | [microsoft/foundry-local](https://github.com/microsoft/foundry-local): 2,574, licence NOASSERTION | On-device inference |
| Agent Lightning | [microsoft/agent-lightning](https://github.com/microsoft/agent-lightning): 18,560, MIT | Agent training/RL (Microsoft Research) |
| Agent 365 DevTools | [microsoft/Agent365-devTools](https://github.com/microsoft/Agent365-devTools): 61 | CLI for Microsoft Agent 365 |
| Reference apps | [Azure-Samples/azure-ai-travel-agents](https://github.com/Azure-Samples/azure-ai-travel-agents): 483 (MCP + multi-agent on ACA) · [microsoft/Agent-Framework-Samples](https://github.com/microsoft/Agent-Framework-Samples): 384 | |
| Curricula | [microsoft/ai-agents-for-beginners](https://github.com/microsoft/ai-agents-for-beginners): 76,476 · [microsoft/mcp-for-beginners](https://github.com/microsoft/mcp-for-beginners): 17,397 | The most-starred agent curricula of any provider in this survey |

## 3. Architecture centre and Well-Architected guidance

- Azure Architecture Center, getting started with AI architecture: https://learn.microsoft.com/en-us/azure/architecture/ai-ml/ai-get-started
- **AI agent orchestration patterns** (sequential, concurrent, group chat, handoff, magentic): https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns
- Multiple-agent workflow automation with Agent Framework: https://learn.microsoft.com/en-us/azure/architecture/ai-ml/idea/multiple-agent-workflow-automation
- Dynamic AI agents at scale: https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/articles/ai-agents-at-scale
- **Well-Architected Framework, AI workloads**: https://learn.microsoft.com/en-us/azure/well-architected/ai/architecture-pattern · [what's new](https://learn.microsoft.com/en-us/azure/well-architected/whats-new)
- **AI Landing Zone** (reference architecture + implementation): [Azure/AI-Landing-Zones](https://github.com/Azure/AI-Landing-Zones), 340 stars, MIT, 2026-09-23
- WAF reliability source data: [Azure/Azure-Proactive-Resiliency-Library-v2](https://github.com/Azure/Azure-Proactive-Resiliency-Library-v2)
- [Azure/AI-in-a-Box](https://github.com/Azure/AI-in-a-Box) (598) has had no pushes since 2024-12, so treat it as stale.

## 4. Certifications and partner programme

| Credential | Code | Cost | Source |
|---|---|---|---|
| **Azure AI Apps and Agents Developer Associate** | AI-103 | $165 typical US price, set by country | https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-apps-and-agents-developer-associate/ (updated 2026-08-11). Price from the [Microsoft exam FAQ](https://learn.microsoft.com/en-us/credentials/certifications/frequently-asked-questions): "Associate and Expert exams typically cost US$165" (read 2026-10-05) |
| Azure AI Engineer Associate | AI-102 | n/a | **Retired 2026-06-30** ([Microsoft retirement list](https://learn.microsoft.com/en-us/credentials/support/retired-certification-exams), read 2026-10-05). Earned certifications stay on the transcript; renewal is not possible after retirement |
| **Agentic AI Business Solutions Architect** | AB-100 | $165 typical US price for Expert exams ([Microsoft exam FAQ](https://learn.microsoft.com/en-us/credentials/certifications/frequently-asked-questions)); [certification page](https://learn.microsoft.com/en-us/credentials/certifications/agentic-ai-business-solutions-architect/) | Copilot Studio, M365 Copilot, Foundry and Power Platform. Third parties describe it as beta with an AB-730/AB-731 prerequisite ([certificationpractice](https://certificationpractice.com/exam-overviews/microsoft-agentic-ai-business-solutions-architect-quick-facts)) [UNVERIFIED on Learn] |
| Azure Solutions Architect Expert | AZ-305 | [UNVERIFIED] | https://learn.microsoft.com/en-us/credentials/ |

Partner programme: **Microsoft AI Cloud Partner Program**. Solutions Partner designations are scored 70/100 on performance, skilling, customer success and growth. Data & AI, Digital & App Innovation and Infrastructure roll up to "Solutions Partner for Cloud & AI Platforms" ([intro](https://learn.microsoft.com/en-us/partner-center/membership/introduction-to-pcs)). Paid benefit packages are **Partner Launch Benefits at $350/yr** and **Partner Success Core at $895/yr** ([Launch Benefits](https://learn.microsoft.com/en-us/partner-center/membership/partner-launch-benefits), [packages](https://partner.microsoft.com/en-us/partnership/partner-benefits-packages)). Prices come from search snippets [UNVERIFIED by direct fetch].

## 5. Five things an AI Architects org should build on or mirror

1. **Adopt Azure's five orchestration-pattern names as shared vocabulary**: sequential, concurrent, group chat, handoff, magentic. They are the clearest official pattern taxonomy. Map Google ADK workflow agents, Strands graphs and Cloudflare patterns onto them.
2. **Mirror the AI Landing Zone as an "agent landing zone" spec** that every cloud column must satisfy (network isolation, identity, gateway, observability). Azure is the only provider in this survey shipping a landing-zone repo for AI.
3. **Use Agent Framework 1.0 as the .NET reference implementation.** It is the only GA enterprise agent SDK with first-class .NET. Without it, the org's samples would be Python- and TS-only.
4. **Run a cohort-based curriculum on top of the beginners repos.** ai-agents-for-beginners (76k stars) shows demand. An architect-level follow-on (patterns, WAF, cost, security) is the org's natural next rung, and the MIT licence permits adaptation.
5. **Ground agents in docs via MicrosoftDocs/mcp + Foundry MCP.** This is the official "docs MCP + platform MCP" pairing. Replicate the pairing per provider (Google Developer Knowledge MCP, Cloudflare docs-ai-search MCP, Vercel MCP docs search).

## Sources
https://github.com/microsoft/agent-framework · https://github.com/microsoft/skills · https://github.com/microsoft/mcp · https://github.com/MicrosoftDocs/mcp · https://devblogs.microsoft.com/foundry/announcing-foundry-mcp-server-preview-speeding-up-ai-dev-with-microsoft-foundry/ · https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns · https://learn.microsoft.com/en-us/azure/well-architected/ai/architecture-pattern · https://github.com/Azure/AI-Landing-Zones · https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-apps-and-agents-developer-associate/ · https://learn.microsoft.com/en-us/partner-center/membership/partner-launch-benefits
