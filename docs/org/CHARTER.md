# Charter: [org name pending]

Status: draft for Frank's ruling, 2026-10-05. Owner: Frank. Companion files:
[`BUSINESS-PLAN.md`](BUSINESS-PLAN.md), [`ROADMAP.md`](ROADMAP.md), [`repo-map.md`](repo-map.md).

## Decisions this charter records

| # | Decision | State |
|---|---|---|
| D1 | The org is cloud-agnostic. Primary providers: Google Cloud, Cloudflare, Vercel, Railway. Secondary: Azure, AWS, OCI. | Proposed |
| D2 | The org holds 14 repos, named by the scheme below. Harness is not a naming axis. | Proposed (from repo-map section 5) |
| D3 | Apache-2.0 everywhere, with `LICENSING.md` and `NOTICE`. | Proposed (matches the frankxai relicensing of 2026-08-27) |
| D4 | Nothing ships without an eval, a source for every figure and a review by a different provider than the maker. | Proposed |
| D5 | Org name: `ai-architect-guild` or `ai-architects-community`. Written as **[org name pending]** until Frank rules. | Open |

## Mission

Publish the agentic reference architecture as runnable kits: a spec, ADRs, diagrams, skills, an eval
suite and a deployable stack per provider, each one checked against public well-architected criteria.

The research behind this ([`leadership-benchmarks.md`](../research/leadership-benchmarks.md)) found
three things nobody owns yet:

1. Architecture shipped as a runnable kit across clouds. Each hyperscaler architecture centre covers
   its own cloud only, and the spec-driven tools (Spec Kit, OpenSpec, BMAD, Kiro) start at the
   feature and skip architecture.
2. An eval-gated lifecycle in which every spec and ADR has an acceptance eval.
3. A vendor-neutral AI architect credential assessed on design work. That one belongs to the
   AI Architect Academy, which this org feeds.

## Who the org serves

| Reader | What they come for | What they leave with |
|---|---|---|
| Practising architects and platform engineers | A defensible design for an agent system on a cloud they did not choose | A pack, a pattern and a review checklist they can run in their own harness |
| Tech leads choosing a platform | Google Cloud vs Cloudflare vs Vercel vs Railway for one workload | A comparison with sources and a cost envelope |
| AI CoE leads | A starting operating kit for several teams | `ai-coe-starter-kit`, team-by-team packs |
| Learners | A route from practitioner to architect | Packs and patterns as course material in the AI Architect Academy |
| Agents | Machine-readable guidance | `SKILL.md`, `AGENTS.md`, `prices.json` and `llms.txt` per repo |

The org does not serve buyers of a hosted product. It publishes open material. Paid work runs
through Frank's services and the Academy (see `BUSINESS-PLAN.md`).

## Cloud-agnostic stance

Every pattern is written provider-neutral first, then mapped to providers. A provider pack never
redefines a pattern. It supplies the mapping, the services, the prices and the deploy path.

**Primary providers get packs, reference stacks and examples first.** The reason for each comes from
a documented gap in the provider research:

| Provider | Gap the org fills | Source |
|---|---|---|
| Google Cloud | Prep and labs for the Professional Agentic Architect exam (GA registration opens 2026-11-02, $200); a cross-cloud eval harness around agents-cli eval skills | `providers/google-cloud.md` section 4-5 |
| Cloudflare | No well-architected framework and no developer or AI certification; durable-agent runtime comparison | `providers/cloudflare.md` section 3-5 |
| Vercel | No well-architected guidance for agents and no individual certification | `providers/vercel.md` section 3-5 |
| Railway | No architecture centre; verified templates for reference agents, which the kickback program pays for | `providers/railway.md` section 3-5 |

**Secondary providers get maintained packs, released after the primary set.** AWS keeps one special
role: its Agentic AI Lens is the most complete official agentic review, so the org uses its question
set as the neutral review skeleton and maps the other providers onto it (`providers/aws.md` section
5). Azure supplies the shared orchestration vocabulary (sequential, concurrent, group chat, handoff,
magentic). OCI stays one pack among seven, with Agent Spec as a portability test case.

Rules that keep the stance honest:
- A pattern page names at least two provider mappings or it stays in draft.
- A "best provider" claim needs a stated workload, a cost envelope and a source.
- No provider pays for placement. Partner-program membership, when it exists, is disclosed in the
  repo README.

## Target repo set (14)

| # | Repo | Role | Tier |
|---|---|---|---|
| 1 | `.github` | Org profile, shared CI, CONTRIBUTING, SECURITY, CODEOWNERS, disclaimer text, pack contract | Core |
| 2 | `architect-skills` | Vendor-neutral skills: RAG, MCP, orchestration, security, FinOps, diagramming, IaC, Kubernetes | Core |
| 3 | `patterns` | 24 vendor-neutral solution patterns with provider mappings | Core |
| 4 | `genai-guides` | Provider comparisons and migration guides | Core |
| 5 | `ai-coe-starter-kit` | Team-by-team CoE skill packs | Core |
| 6 | `pack-gcp` | Gemini Enterprise Agent Platform (formerly Vertex AI), ADK, A2A, MCP Toolbox | Primary |
| 7 | `pack-cloudflare` | Workers AI, AI Gateway, Agents SDK, Durable Objects, D1/R2, Vectorize | Primary |
| 8 | `pack-vercel` | AI SDK, AI Gateway, Fluid compute, Sandbox, Workflow | Primary |
| 9 | `pack-railway` | Templates, services, volumes, private networking for agent runtimes | Primary |
| 10 | `pack-aws` | Bedrock, AgentCore, Strands | Secondary |
| 11 | `pack-azure` | AI Foundry, Agent Framework, AI Search | Secondary |
| 12 | `pack-oci` | OCI pack with adapters for every harness (keeps the existing stars, forks and issues) | Secondary |
| 13 | `stacks-oci` | One-click Resource Manager stacks | Secondary |
| 14 | `example-invoice-extraction` | End-to-end worked example with provider adapters | Core |

Source and merge plan for each repo: `repo-map.md` sections 5-6.

### Naming scheme

| Kind | Pattern | Rule |
|---|---|---|
| Vendor-neutral core | `<topic>` | No provider mark in the name |
| Provider pack | `pack-<provider>` | The mark appears only as a descriptive suffix (nominative use) |
| Deploy stacks | `stacks-<provider>` | One repo per provider, one folder per stack, a release ZIP per stack |
| Worked example | `example-<use-case>` | Provider adapters live inside the repo |
| Org meta | `.github` | Profile, workflows, policies |

Skill and plugin identifiers follow the same rule: a provider mark is a suffix or a pack name, never
a prefix that reads as the vendor's own product.

### Pack contract

Every `pack-*` repo ships the same tree, defined once in `.github`:
`skills/` (SKILL.md), `adapters/{claude,codex,cline,cursor,roo,windsurf}`, `references/`,
`prices.json` (one row per service with `source_url` and `retrieved_at`), `evals/` (trigger and
answer cases), `DISCLAIMER.md`, `LICENSE`, `NOTICE`. A pack missing any of these does not get a
release tag.

## Licence

- Apache-2.0 in every repo, with `LICENSING.md` (what is covered, how to attribute) and `NOTICE`.
- Derived material keeps its upstream licence, recorded in `NOTICE`. The invoice example adapts an
  MIT upstream, so the MIT notice goes into its `NOTICE`.
- Contributions are accepted under a DCO sign-off. An open PR from an outside contributor that
  predates the relicence gets an explicit Apache-2.0 consent before merge.
- The AI Architect Academy is a separate brand with its own licence. Org content it reuses stays
  Apache-2.0 and is attributed.

## Trademark and non-affiliation

Every README and every pack carries this text, verbatim, with the provider filled in:

> Unofficial community project. Not affiliated with, endorsed by, or sponsored by
> &lt;Provider&gt;. &lt;Marks&gt; are trademarks of their respective owners.

Rules:
1. Provider names are used only to say what a pack is about (nominative use). No provider logo,
   icon set or trade dress is bundled. Diagram icons are fetched by the user from the provider's
   official source under its terms.
2. The words "official", "certified", "partner", "endorsed" and "approved" never describe org work
   unless a provider has granted that status in writing, and the grant is linked.
3. No content implies authorship by a provider team or by any employer. Personal and community
   work is labelled as such.
4. The Academy credential is named so it cannot be mistaken for a vendor certification. Exam-prep
   material says which vendor exam it prepares for and that it is unofficial.
5. Content about any company uses public sources only. No customer names, deal data or internal
   material from any employer, current or past.
6. A takedown or trademark request from a provider is answered within five working days by Frank.

## Quality bar: what "top notch" means here

A repo meets the bar when a stranger can install it, run it and check its claims without asking us.

| Dimension | Bar | Check |
|---|---|---|
| Evals | Every skill ships `evals/` with trigger and answer cases and a measured lift against a no-skill baseline | Eval run in CI; result in the release notes |
| Sourced claims | Every figure carries a URL and a retrieved date; secondary or conflicting figures carry `[UNVERIFIED]` or `[2nd]` | Claims audit before release (below) |
| Runnable kits | A reference stack deploys clean from the README on at least two providers, one of them primary | Deploy log or CI job per provider |
| Installable | Plugins pass `claude plugin validate --strict`; skills install with `npx skills add` | CI |
| Current | `prices.json` rows are under 90 days old at release; model and service names checked against live docs | `retrieved_at` scan |
| Agent-readable | `AGENTS.md`, `llms.txt` and plain Markdown in every repo | File check |
| Hygiene | Licence, NOTICE, disclaimer, secret scanning with push protection, link check, no internal planning docs | Shared CI workflow |

What the bar is measured against: the AWS Agentic AI Lens for review depth, Google's `google/skills`
for skill layout and Cloudflare's developer docs for agent-readable publishing
(`leadership-benchmarks.md` sections A and E).

## Governance

- **Maker is never checker.** A change is reviewed by a different model provider or a human before
  merge. A same-provider review is recorded as missing.
- **Claims audit.** Before any release, a reviewer checks every number, date, price and named
  capability against its cited source. A claim without a source is cut or tagged `[UNVERIFIED]`.
  An `[UNVERIFIED]` figure never appears in marketing copy.
- **No invented numbers.** Counts, stars, prices and benchmark results come from a command or a
  page that someone can re-run or re-open. A plausible guess is written as an open question.
- **Provenance tags carried forward.** When this org quotes its own research files, it keeps the
  `[UNVERIFIED]` and `[2nd]` tags exactly.
- **Decisions in ADRs.** Org-wide choices (licence, naming, pack contract, primary providers) live
  as ADRs in `.github/adr/`. Frank rules on them; agents propose.
- **Frank's calls.** Org name, repo visibility, first-time publication of any repo or offer page,
  prices, money paths, secrets, branch protection and anything sent outside GitHub.
- **Agents' remit.** Drafting, building, evals, reviews, PRs and merges that meet the above,
  within the branch-per-agent and draft-first rules.
- **Security.** Secret scanning with push protection on every repo. Security reports go to the
  address in `.github/SECURITY.md`, never to a public issue.

## Open questions for Frank

1. Org name: `ai-architect-guild` or `ai-architects-community`. Both are recorded as free in
   `repo-map.md` section 2 as of 2026-10-05; re-check on the day.
2. On rename, accept GitHub's redirect risk (the old org name becomes claimable) or update every
   inbound link the same day.
3. Confirm Railway's primary status. It has no architecture centre, and it is the only provider here
   that pays template authors directly; the plan relies on that.
