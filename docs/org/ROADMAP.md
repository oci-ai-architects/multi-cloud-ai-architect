# Roadmap: [org name pending], 2026-10-05 to 2027-01-03

Status: draft for Frank's ruling. Day 0 is Monday 2026-10-05. Day 30 is 2026-11-04, day 60 is
2026-12-04, day 90 is 2027-01-03. Companion files: [`CHARTER.md`](CHARTER.md),
[`BUSINESS-PLAN.md`](BUSINESS-PLAN.md), [`repo-map.md`](repo-map.md).

## Sequencing decisions

1. **Hygiene and the pack contract come before any new pack.** A pack built before the contract
   exists gets rebuilt.
2. **Primary packs ship in this order: `pack-gcp`, `pack-vercel`, `pack-railway`, `pack-cloudflare`.**
   This moves `pack-railway` ahead of where `repo-map.md` section 7 placed it, because Railway
   templates are the top-ranked money mechanism and kickback accrues only after deploys start.
3. **`pack-gcp` is timed to the Google Professional Agentic Architect exam,** whose GA registration
   opens 2026-11-02. The prep material is the reason a learner arrives in November.
4. **Secondary packs (`pack-aws`, `pack-azure`) start after day 60.** `pack-oci` is maintained
   from day 0 because it already has users and open issues.
5. **One sample architecture review is published before the review offer opens.** It is the proof
   a buyer reads before paying.

## Owners

| Owner | Does | Never does |
|---|---|---|
| Frank | Rulings, identity and tax steps, publication approvals, client delivery, legal calls | Routine builds, eval runs, link fixes |
| Builder agent | Repos, skills, evals, templates, docs, CI, PRs on `agent/<harness>/<scope>` branches | Publishes, prices, renames, visibility changes, sends |
| Reviewer agent (different provider from the builder) | Claims audit, eval review, adversarial buyer critique, PR sign-off | Reviews its own provider's work |

## Days 0-30: foundation and the first sale path

Goal: every repo is licensed and honest, the pack contract exists, the review offer is ready to
sell, and the first primary pack is close to release.

| Week | Work | Owner | Done when |
|---|---|---|---|
| 1 | Rule on the org name (D5) and the rename-day link policy | Frank | Name recorded in an ADR |
| 1 | Clear the privately tracked pre-rename items listed for Frank | Frank | Frank confirms closed |
| 1 | Confirm the legal entity and BTW number | Frank | Number on file |
| 1-2 | Hygiene sweep on all 14 repos: Apache-2.0, `LICENSING.md`, `NOTICE`, disclaimer, removal of internal planning docs and committed runtime state, secret scanning with push protection | Builder | Shared CI check green on every repo |
| 1-2 | `.github`: org profile, CONTRIBUTING (DCO), SECURITY, CODEOWNERS, shared CI workflow, pack contract as ADR-0001 | Builder, then reviewer | ADR merged; workflow callable from other repos |
| 2 | `pack-oci`: reconcile with the newer frankxai copy, pass `claude plugin validate --strict`, answer the open install issues | Builder | Strict validation green in CI; issues replied |
| 2 | Review offer kit: contract template, review checklist (AWS Agentic AI Lens questions mapped to the four primary providers), report template | Builder drafts, Frank approves contract | Frank signs off the contract text |
| 2-3 | Rename the org and repos; merge `cline-*`, `codex-*` into `pack-oci/adapters`; update inbound links the same day | Frank runs the rename, builder does merges and links | Old URLs redirect; link check green |
| 3 | Railway Stripe Connect KYC; Railway affiliate sign-up | Frank | Payout method active |
| 3-4 | `pack-gcp` v0.1: ADK + A2A reference agent, MCP Toolbox blueprint, `prices.json`, evals, PAA exam-guide mapping | Builder, reviewer | Pack contract complete; evals pass; claims audit clean |
| 4 | Sample architecture review on `example-invoice-extraction`, published in `genai-guides` | Builder drafts, reviewer audits, Frank approves publication | Published with sources |
| 4 | Credit applications (Cloudflare Tier 3, AWS Founders, Google Start) | Builder drafts, Frank submits | Applications sent |
| 4 | Review-offer waitlist page with the three questions | Builder, Frank approves first publication | Page live, writes to the shared schema |

## Days 31-60: primary packs and demand data

Goal: three primary packs released, two Railway templates live, waitlists collecting price bands.

| Work | Owner | Done when |
|---|---|---|
| `pack-gcp` v1.0 release with PAA prep track (study notes, labs) | Builder, reviewer | Release tag; deploy test on Google Cloud |
| `pack-vercel` v1.0: AI SDK + Workflow reference agent, Vercel agent architecture checklist (durable steps, sandbox isolation, gateway failover, MCP hosting limits, approvals) | Builder, reviewer | Release tag; deploys on Vercel |
| `pack-railway` v1.0 with 2 templates: agent + Postgres/pgvector + observability | Builder | Templates published, deploy clean, Template Queue watched |
| Answer users in the Railway Template Queue (the +10% kickback condition) | Builder drafts, Frank posts if the account requires him | Response time under 2 working days |
| `architect-skills`: neutral skills moved out of the old repo, model references updated, unsafe autonomy instructions removed | Builder, reviewer | Evals pass; no stale model table |
| `patterns`: first 8 of 24 patterns, each with two or more provider mappings | Builder, reviewer | Claims audit clean |
| Cross-cloud review checklist published as a skill in `architect-skills` | Builder, reviewer | Installable with `npx skills add` |
| Academy waitlist (cohort and credential) and skill-pack waitlist | Builder, Frank approves publication | Both write to the shared schema |
| Academy: link `11-hyperscalers/*` to the packs; draft the design-review rubric | Builder, Frank approves rubric | Rubric published |
| Polar KYC and fee-plan check | Frank | Plan recorded |
| First demand read: price bands, roles, reasons | Builder runs the report, Frank decides | Decision noted on what to build next |

## Days 61-90: secondary packs, first revenue checks

Goal: Cloudflare pack out, secondary packs started, first review delivered or the price adjusted.

| Work | Owner | Done when |
|---|---|---|
| `pack-cloudflare` v1.0: Agents SDK, Durable Objects actor pattern, AI Gateway as the model front door, edge-agent review checklist | Builder, reviewer | Release tag; deploys on Workers |
| x402 paid MCP tool demo in `pack-cloudflare` | Builder | Demo runs on a test wallet; no live revenue taken before Frank's tax advice |
| Durable-agent runtime comparison (Durable Objects, Vercel Workflow, AgentCore Runtime, Agent Engine) in `genai-guides` | Builder, reviewer | Every row sourced |
| `pack-aws` v0.1 seeded from the existing `aws-ai-services` skill; Strands sample on AgentCore | Builder | Pack contract complete |
| `pack-azure` v0.1 seeded from `azure-ai-services`; Agent Framework .NET sample | Builder | Pack contract complete |
| `stacks-oci`: absorb the openclaw stack, keep the old release ZIP URL resolving | Builder | Deploy button still works |
| `example-invoice-extraction`: second provider adapter on a primary provider | Builder, reviewer | Runs on two providers |
| `ai-coe-starter-kit`: generalise names; add `references/` and `scripts/` to every pack it promises | Builder | README promises match the tree |
| `patterns`: 16 of 24 published | Builder, reviewer | Claims audit clean |
| Day-90 KPI review against `BUSINESS-PLAN.md` | Builder compiles, Frank rules | Next 90 days set; prices kept or changed |
| Cohort decision: launch, hold or drop, on would-pay data | Frank | Decision recorded |

## Per-repo milestones

| Repo | Day 30 | Day 60 | Day 90 |
|---|---|---|---|
| `.github` | Profile, policies, shared CI, pack contract ADR | Claims-audit checklist in CI | Org metrics page from commands |
| `architect-skills` | Renamed, licensed | Neutral skills moved, evals, review-checklist skill | All skills carry evals with lift |
| `patterns` | Created from the clean export | 8 patterns | 16 patterns |
| `genai-guides` | Renamed; strategy docs removed; sample review published | Comparison guides re-sourced | Durable-runtime comparison |
| `ai-coe-starter-kit` | Renamed, licensed | Provider-neutral names | Promised folders exist |
| `pack-gcp` | v0.1 | v1.0 + PAA prep track | Agent Engine deploy sample |
| `pack-vercel` | Contract skeleton | v1.0 | AI Gateway failover sample |
| `pack-railway` | Contract skeleton | v1.0, 2 templates live | Third template if deploys justify it |
| `pack-cloudflare` | Contract skeleton | Draft | v1.0 + x402 demo |
| `pack-aws` | Created, licensed | Contract skeleton | v0.1 |
| `pack-azure` | Created, licensed | Contract skeleton | v0.1 |
| `pack-oci` | Renamed, adapters merged, strict validation green | Install issues closed | Agent Spec portability test |
| `stacks-oci` | Renamed, licensed, disclaimer | Stack docs cleaned | openclaw absorbed, old ZIP URL live |
| `example-invoice-extraction` | Renamed, disclaimer corrected | Sample review uses it | Second provider adapter |

## Dependencies

| Blocked item | Waits on | Why |
|---|---|---|
| Every rename | Org name ruling (Frank) and the privately tracked pre-rename items | A rename before both creates a second round of link fixes |
| Any new pack | Pack contract ADR in `.github` | Packs must share one tree and one CI |
| `pack-oci` adapter merge | Org rename | Merged repos are archived under the new org |
| Kickback cash | Railway Stripe Connect KYC | No payout path otherwise |
| Review offer page | Entity + BTW, contract template, sample review | An invoice needs both; a buyer needs the sample |
| Any checkout | Release-gate PASS for that offer | Waitlist-first rule |
| Academy cohort | Waitlist would-pay data, published rubric | No cohort without price evidence |
| Polar packs on sale | Polar KYC, eval results, gate PASS | Same rule |
| x402 revenue | Frank's tax advice and wallet | Crypto receipts need a tax position |
| `stacks-oci` merge | Old release ZIP URL kept alive | The deploy button points at it |
| Any public figure | Claims audit by the reviewer agent | No invented or untagged numbers |

## Review rhythm

- Weekly: builder posts a short status in the `.github` discussions board (what shipped, what is
  blocked on Frank). Frank answers the blockers.
- Every release: reviewer agent from a different provider runs the claims audit and a buyer
  critique; findings are fixed before the tag.
- Day 30, 60, 90: KPI check against `BUSINESS-PLAN.md`; Frank rules on what changes.

## Schedule risks and the trigger for each

| Risk | Trigger to act | Response |
|---|---|---|
| Org name ruling slips | No ruling by day 10 | Builder does hygiene and packs under the current names; renames move to the day-60 window |
| Strict plugin validation stays red on `pack-oci` | Still red at day 21 | Ship the skills through `npx skills add` first; plugin packaging follows |
| A primary pack fails its deploy test | Any release candidate | No tag; the gap is written into the pack README until fixed |
| No price-band answers by day 60 | Fewer than 10 answers | Put the waitlist on the highest-traffic existing surface before building more offer pages |
| First review does not sell by day 75 | No signed contract | Frank tests the teardown variant at €2,500; the sample review gets a buyer critique |
| Railway terms change | Docs differ from the plan's 15% + 10% | Re-read terms; keep templates if the payout path stands, drop the forecast if it does not |
| Vendor renames or retires a service mid-build | Name or service check fails | Update `prices.json` and skill names before the next release; record the change in the pack changelog |
| Frank's delivery load blocks reviews of agent PRs | More than 5 PRs waiting on Frank | Agents stop opening new PRs on the affected repos and fold work into open ones |
