# Business plan: [org name pending] and the AI Architects offers

Status: draft for Frank's ruling, 2026-10-05. Every figure below comes from
[`monetization.md`](../research/monetization.md) or
[`leadership-benchmarks.md`](../research/leadership-benchmarks.md), with their `[UNVERIFIED]` and
`[2nd]` tags carried over. Every price we would charge is a **hypothesis** and is labelled as one.

## Decisions

1. **The org earns nothing directly.** It is Apache-2.0 open material and the top of the funnel.
   Money arrives through five offers run by Frank and the AI Architect Academy.
2. **The first euro comes from a fixed-fee architecture review**, and the first recurring euro
   from Railway template kickbacks. Both are ranked first by euros per hour of Frank's effort
   (`monetization.md` section 6).
3. **No checkout before a gate PASS.** Every offer page is a waitlist until its release gate passes.
4. **Marketplaces and partner tiers wait.** They cost money and certification headcount before a
   first sale (`monetization.md` section 6, "deliberately not on the list").

## Positioning wedge

From `leadership-benchmarks.md`, "Positioning wedge". Each comparison names the source and what it
was checked for on 2026-10-05; nothing here claims a competitor lacks something we did not check.

| Wedge | Specific comparison (source, scope checked) | What we ship |
|---|---|---|
| Architecture as a runnable kit, across clouds | The AWS Agentic AI Lens (June 2026) says it is "built around the AWS services and open source frameworks" for agentic AI ([lens](https://docs.aws.amazon.com/wellarchitected/latest/agentic-ai-lens/agentic-ai-lens.html)). Google Cloud and Azure guides were not re-read for this claim | Reference architecture as a repo: spec, ADRs, C4 profile, skills, evals, deploys on two or more clouds |
| Spec-anchored, eval-accepted lifecycle | Böckeler's review of Kiro, Spec Kit and Tessl (2025-10-15) records one tool turning a small bug into 4 user stories and 16 acceptance criteria, and does not cover ADRs or evals ([review](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)). Anthropic's agent-evals guide (2026-01-09) recommends evals in CI on every change and does not tie them to design decisions ([guide](https://anthropic.com/engineering/demystifying-evals-for-ai-agents)) | A short "Method" page, an open eval harness, every ADR accepted by an eval |
| Vendor-neutral credential assessed on design work | Vendor credentials each cover one platform: AWS AIP-C01 $300, Google Professional Agentic Architect $200, Claude Certified Architect Foundations $125, each a proctored exam on the vendor's page. Microsoft lists AI-102 as retired on 2026-06-30 ([retirement list](https://learn.microsoft.com/en-us/credentials/support/retired-certification-exams)). The Maven cohorts checked issue completion certificates | Graded design review against a published rubric, through the Academy |

Tested scope: none of this has been tested with buyers. The method has not yet been run end to end on
a reviewed design, and the rubric is unpublished.

One-line position: **the AI architecture you can run, check and take to any cloud.**

What we do not try to own: protocols (MCP and A2A belong to AAIF), model-provider guidance, or a
generic agent-framework course. Maven already lists several agent cohorts at $999 to $3,000
(`leadership-benchmarks.md` section D).

## Offers

| # | Offer | Buyer | Delivery | Gate before sale |
|---|---|---|---|---|
| O1 | **Architecture review**, fixed fee | Tech lead or CTO with an agent system heading to production | 5 working days; written decision record, target diagram, review against the cross-cloud checklist | Review template, sample report on a public example, contract template |
| O2 | **Solution design**, fixed scope | Team starting an agent build | 2 weeks; spec, ADR set, C4 context, cost envelope, eval plan on the chosen platform | O1 delivered at least once |
| O3 | **Skill packs** (premium tier over the free org packs) | Architects and teams on Claude Code, Codex, Cursor | Polar download; packs with evals and measured lift | Eval gate passed; waitlist would-pay data |
| O4 | **Cohort and credential** via AI Architect Academy | Practitioners moving into architecture | Live cohort plus graded design review | Waitlist with price-band answers; rubric published |
| O5 | **Templates** | Builders deploying a reference agent | Railway templates (paid through kickback), Vercel templates (free, funnel) | Template deploys clean and is maintained |

Supporting variants from `monetization.md` section 4, offered once O1 has sold: cloud-choice
teardown (1 week, one workload, primary providers compared), agent production-readiness audit
(evals, observability, cost, security), architect-on-retainer (monthly, capped hours, async review).

## Pricing hypotheses

None of these prices has demand evidence yet. The waitlist price-band question exists to test them.

| Offer | Hypothesis | Anchored to (sourced) |
|---|---|---|
| O1 architecture review | €4,500 to €6,000 fixed | NL AI audit/strategy projects €2,000 to €10,000 [2nd] (cruxdigits.nl). Day-rate assumption €1,200 to €1,600 is itself a hypothesis in `monetization.md` section 4, not a sourced figure |
| Cloud-choice teardown | €2,500 fixed | Low end of the same €2,000 to €10,000 audit band [2nd] |
| Production-readiness audit | €3,500 to €6,000 fixed | Same audit band [2nd] |
| O2 solution design | €9,000 to €15,000 fixed | Top of the audit band (€10,000) and the bottom of the NL PoC band €15,000 to €40,000 [2nd] |
| Retainer | €2,400/month for 16 hours | Freelancermap NL architects €85 to €150/h [2nd]; 16 h at the top of that band |
| O3 premium skill pack | €29 to €79 one-time | Cert-prep anchors: Cantrill SAA $40, Tutorials Dojo $14.99 [2nd]; DeepLearning.AI Pro $25 to $30/month [2nd]. Weak anchor: no sourced price for evaluated skill packs exists |
| O4 cohort | €1,490 founding cohort, €1,900 after | Benchmarks place it between $25 to $30/month platforms and $2.4k to $4.2k cohorts. Maven first cohorts $2,000 to $3,000 [2nd]; Maven pays instructors 90% |
| O4 credential (assessment only) | €390 | Vendor exams on the vendors' own pages: AWS AIP-C01 $300, Google Professional Agentic Architect $200, Claude Certified Architect Foundations $125 (read 2026-10-05); a graded human review costs more to deliver than a proctored exam |
| O5 templates | €0 to the user | Railway pays 15% of template usage, plus 10% for answering users (25% total) per current docs |

Payment rail for O3 and O4 self-serve: Polar as merchant of record. New accounts since May 2026
pay 5% + 50¢ (Starter) or 3.8% + 40¢ (Pro, $20/month); older accounts 4% + 40¢ [2nd]. Check which
plan the account is on before setting prices.

## Demand capture: waitlist first

- No offer page has a checkout until it holds a fresh release-gate PASS. Until then it is a
  per-offer waitlist.
- Each offer gets a row in the estate product registry before its page exists.
- The waitlist uses the shared demand-capture package and schema, never a bespoke form.
- After signup, three skippable questions: expected price band, who they are (role), what they are
  trying to do (reason).
- Build order sorts by would-pay answers, never by signup count.
- Scarcity is honest: a founding cohort window that closes at launch, real seat counts, no counts
  shown below a threshold, no resetting timers, no discounts against an anchor that does not exist.
- Each waitlist gives a real slice of the product in the first email: a free pack, a sample review
  report or one pattern with its eval.
- Waitlist data is personal data. It never enters git or a public report.

## 90-day plan: the ranked effortless-money shortlist

Ranked by euros per hour of Frank's effort in the first six months (`monetization.md` section 6).
Day 0 is 2026-10-05.

| Rank | Mechanism | What the agents build | By day | Honest expectation |
|---|---|---|---|---|
| 1 | Railway template kickback | 2 or 3 AI reference-stack templates (agent + Postgres/pgvector + observability) in `pack-railway` | 45 | Small euros in months 1-3. Cash-out at $100. Some authors accrued over $10k by July 2024 |
| 2 | Fixed-fee architecture review (O1) | Review template, public sample report, checklist built on the AWS Agentic AI Lens questions mapped to primary providers | 30 | Fastest first invoice. One sale inside the €2k to €10k band [2nd] outweighs a year of kickbacks |
| 3 | Railway and Vercel affiliate links in tutorials | Links in every pack README and guide that deploys | 30 | Railway 15% for 12 months is verified; Vercel 20% recurring is `[UNVERIFIED]`. Low until traffic exists |
| 4 | Academy cohort (O4) | Waitlist, rubric, syllabus mapped to org packs and the Google PAA exam | 60 (waitlist) | A cohort launches only after would-pay data. Not in 90 days unless the waitlist says so |
| 5 | Skill packs via Polar (O3) | Packs that already exist, behind a waitlist, with eval results | 60 | Demand unproven |
| 6 | Newsletter sponsorship | Nothing new; reuse the AI architect newsletter | after 1,000 subscribers | beehiiv network from 1,000 subscribers at ~$10 CPM [2nd]. Pocket money |
| 7 | Startup credits | Application text and eligibility check | 30 | Cost removal. Cloudflare Tier 3 $10k, AWS Founders $1k to $5k, Google Start up to $2k [2nd], Azure ISV Success $5k |
| 8 | x402 paid MCP tool on Cloudflare Agents SDK | One demo tool in `pack-cloudflare` | 90 | A showcase. Revenue in cents; the hosted Monetization Gateway looks US-only `[UNVERIFIED]` |

Deliberately excluded for now: hyperscaler SaaS marketplaces (need a transactable product),
partner tiers (AWS Select $2,500/yr, OCI Level 1 ~$5k/yr [2nd]), Vercel Marketplace integration
(revenue share undisclosed), Udemy organic (37% split [2nd]), Cloudflare pay-per-crawl.

## What Frank must do personally

These steps need Frank's identity, signature or tax position. Agents prepare the paperwork.

| # | Action | Unlocks | When |
|---|---|---|---|
| 1 | Confirm the legal entity (eenmanszaak or BV) and the BTW (VAT) number | Every invoice, credit program and marketplace | Week 1 |
| 2 | Approve the review contract template and invoicing setup | O1, O2 | Week 2 |
| 3 | Railway: enable Stripe Connect payouts (KYC) | Kickback cash | Week 2 |
| 4 | Affiliate sign-ups: Railway (dashboard); Vercel only after checking current terms | Rank 3 | Week 2 |
| 5 | Polar: verify payout KYC and the fee plan | O3, O4 self-serve | Week 4 |
| 6 | Credit applications: Cloudflare for Startups Tier 3, AWS Activate Founders, Google for Startups Start | Demo infrastructure | Week 4 |
| 7 | Rule on the org name and the rename day | Every repo rename | Week 1 |
| 8 | Approve first-time publication of each offer page and each new public repo | Waitlists go live | Per item |
| 9 | Maven instructor application, only after the waitlist shows would-pay demand | O4 on Maven | Day 60+ |
| 10 | Crypto wallet and tax advice before taking any x402 revenue | Rank 8 revenue | Before any receipt |
| 11 | Deliver the reviews | O1, O2 | Per sale |

## KPIs and honest targets

There is no baseline for any of these. Targets are set low enough to be falsifiable at day 90.

| KPI | Day-90 target | Source of truth |
|---|---|---|
| Architecture reviews sold (O1) | 1 | Invoices |
| Railway templates published and deploying clean | 2 | Railway template page, deploy test |
| Railway kickback accrued | Any non-zero amount; the $100 cash-out may not be reached | Railway dashboard |
| Waitlist signups that answered the price-band question | 30 across all offers | Demand-capture report |
| Packs released that meet the pack contract with evals passing | 3 (`pack-gcp`, `pack-vercel`, `pack-railway`) | Release tags and CI |
| Org repos with licence, NOTICE and disclaimer | 14 of 14 | Shared CI check |
| Published claims carrying a source | 100% of figures in released repos | Claims audit log |
| Cohort launched | 0 is acceptable; launch only on would-pay data | Waitlist report |

Vanity counts (stars, followers, page views) are tracked but never set as targets.

## Risks

| Risk | Effect | Mitigation |
|---|---|---|
| Non-affiliation or trademark breach | Takedown, loss of trust, legal cost | Verbatim disclaimer, nominative names only, no logos bundled, no "official/certified/partner" words (`CHARTER.md`) |
| Unverified figures reach marketing copy | One wrong number undoes a brand built on sourced claims | Claims audit before release; `[UNVERIFIED]` figures barred from copy |
| Vendor churn | Content ages fast (Vertex AI renamed Gemini Enterprise Agent Platform in 2026-04 [2nd]; Microsoft lists AI-102 retired 2026-06-30) | `retrieved_at` on every price row; 90-day staleness check; the credential is vendor-neutral by design |
| Program terms change | Railway docs say 15% + 10%, its marketing page says a flat 25%; payout path may move | Re-read terms before each template release; never forecast kickback income publicly |
| Demand is unproven | Every price here has "no evidence yet" | Waitlist first; build order by would-pay |
| Services consume build time | Frank delivers O1 and O2 himself, which stalls packs | Fixed scope, capped count per month; agents build packs in parallel |
| Credential carries no external weight at first | Low conversion on O4 | Assess real design work, publish the rubric, pair with vendor exam prep |
| Rename breaks inbound links | Old org name becomes claimable and redirects stop if someone claims it | Update every inbound link on rename day (`CHARTER.md` open question 2) |
| Regional limits | Cloudflare Monetization Gateway looks US-only `[UNVERIFIED]` | Treat x402 as a demo only |
| Day-rate assumption is unsourced | O1 and O2 could be mispriced | The price-band question tests it; adjust after three answers or one lost deal |
