# Pricing hypotheses and the waitlist

Draft v0.1, 2026-10-05. **Every price in this file is a hypothesis.** None is public. The products
graph row `ai-architect-academy` is `stage: concept`, `gate: UNGATED`, price band EUR 299–999 with
`evidence: none yet`. Until a `PRODUCT-RELEASE-GATE.md` PASS receipt exists, the only door is the
waitlist. Prices, checkout and refund terms are Frank's decisions (AGENTS.md §5e); this file prepares
them.

## What the market charges (sourced)

From [`../research/leadership-benchmarks.md`](../research/leadership-benchmarks.md) §D,
[`../research/monetization.md`](../research/monetization.md) §3, provider research §4, and two primary
pages read 2026-10-05. USD as published.

| tier | offer | price | tag |
|---|---|---|---|
| platform | DeepLearning.AI Pro | $25/mo annual, $30/mo monthly | [UNVERIFIED] |
| platform | Google Cloud Skills Boost; AWS Skill Builder | $29/mo or $299/yr each | [UNVERIFIED] |
| cert prep | Cantrill SAA-C03; Tutorials Dojo practice exams | $40; $14.99 | secondary |
| exam | Oracle Agentic AI Foundations Associate | free | primary |
| exam | Claude Certified Architect – Foundations | $99 after partner allocation, partner-gated | [UNVERIFIED] |
| exam | Microsoft AI-103 | $165 | [UNVERIFIED] |
| exam | Google Professional Agentic Architect | $200 GA, $120 beta (MCQ plus labs) | primary, read 2026-10-05 |
| exam | ADaSci CAASA | from $249 (MCQ only) | primary, read 2026-10-05 |
| exam | AWS AIP-C01 | $300 | primary |
| cohort | Maven agent/architect cohorts | $999–$3,000 | [UNVERIFIED] search snapshot |
| cohort | Maven typical first cohort | $2,000–3,000 | secondary |
| cohort | Maven "AI Evals for Engineers & PMs" | $4,200 | primary |
| platform split | Maven instructor share | 90% of net receipts | primary |
| rail | Polar (merchant of record, handles EU VAT) | Starter 5% + 50¢; Pro $20/mo, 3.8% + 40¢ | secondary |

Shape: free vendor content, $25–30/mo platforms, $99–300 multiple-choice exams, $1k–4.2k cohorts
that issue attendance certificates. Nobody sells a vendor-neutral credential built on assessed
design work. The price has to sit above exams (two humans review your system) and below the top
cohorts until the credential has holders anyone has heard of.

## Hypotheses

| id | offer | hypothesis (EUR, incl. VAT for consumers) | test band | anchored against |
|---|---|---|---|---|
| H1 | Free path | 0, permanently | n/a | Kaggle intensive, DeepLearning.AI free videos |
| H2 | Assessment only: preflight, two reviews, defence, verdict, one resubmission | 590 | 490–790 | $200–300 exams, plus human review they do not offer |
| H3 | Cohort, ten weeks, assessment included | 1,490 | 990–1,990 | Maven $999–3,000; below the $4,200 evals course |
| H4 | Company-paid seat (3 or more, B2B invoice, reverse-charge VAT where it applies) | H3 price ex VAT, no volume discount | n/a | "My company would pay" band on the waitlist |
| H5 | Renewal delta review after 24 months | 149 | 99–249 | vendor recertification fees |
| H6 | Monthly membership | **not offered** | n/a | would compete with $25–30/mo platforms on their terms; the free path holds that slot |

H3 sits above the graph's current band (299–999) except at the bottom of its test range. That band
predates this design and carries no evidence. The waitlist's price question settles it; the graph
row changes only when Frank rules on the data.

## Unit economics of one assessment [hypothesis]

Human review is the product and the cost. Arithmetic, so it can be re-run when the inputs change:

| item | hours |
|---|---|
| two independent reviews at 2 h | 4.0 |
| defence plus write-up | 1.0 |
| expected adjudication (about 30% of submissions, 2 criteria at 30 min) | 0.3 |
| staff operations (preflight, scheduling, verdict) | 0.5 |
| **total** | **5.8** |

At a reviewer rate of EUR 60/h [hypothesis], cost is EUR 348 per assessment.

| price (incl. 21% NL VAT, illustrative) | net of VAT | Polar Starter fee | contribution after review cost |
|---|---|---|---|
| 490 | 404.96 | 25.00 | **31.96** |
| 590 | 487.60 | 30.00 | **109.60** |
| 790 | 652.89 | 40.00 | **264.89** |

Reading: EUR 490 barely covers the reviewers. Either H2 starts at 590, or the preflight earns its
keep by cutting each review to 1.5 h (total 4.8 h, cost EUR 288, which makes 490 contribute about
EUR 92). Measure review time on cohort 1 before choosing.

## Cohort economics [hypothesis]

20 seats at EUR 1,490: gross 29,800; net of VAT 24,628; Polar fees about 1,500; 20 assessments
6,960; contribution about **16,170** before Frank's time. Frank's time: 10 live sessions at 1.5 h
plus 3 h preparation each, 45 h. Against the EUR 1,200–1,600/day consulting band in
`monetization.md` §4, 45 h is about 5.6 days, or EUR 6,700–9,000 of consulting. Cohort 1 roughly
matches consulting; cohort 2 onward reuses the material and is where the margin lives. Selling
through Maven (90% of net receipts) trades margin for discovery; whether Maven collects EU VAT for
the instructor is [UNVERIFIED].

## The waitlist

Reuse what exists. The academy site already ships the estate's standard capture
(`ai-architect-academy/site/lib/demand-capture/`, `DemandSignal` schema, product id
`ai-architect-academy`). No bespoke form.

Email first. Then the three questions, each skippable, asked after the person is already in:

| question | field | options (from `questions.ts`) |
|---|---|---|
| What would you expect something like this to cost? | `priceBand` | Only if free · Under 25 · 25–99 · 100–299 · 300–999 · 1000+ · My company would pay |
| Who are you? | `role` | Engineer · Architect / staff+ · Eng manager · Consultant · Founder · Career switcher |
| What are you trying to do that this would help with? | `pain` | free text |

Two proposals for whoever owns the site (not changed here):

1. **Split the top band.** H2 and H3 straddle EUR 1,000; "1000+" lumps a EUR 1,490 cohort with a
   EUR 4,200 one. Add `1000-1999` and `2000+` for this product.
2. **Keep the order.** `questions.ts` also asks urgency and current alternative. The standard asks
   three; keep the three above first and the other two after them, so a person who stops early
   still gave the price answer.

### Gift

Existing: the ADR template plus one worked ADR (`site/app/adr`), free with no form. Proposed second
gift: the sample submission with its two scorecards and the "score it blind, then compare" exercise
from [`FREE-PATH.md`](FREE-PATH.md) step 5. It is a carved-out slice of the real product (the review
itself) and costs nothing to deliver.

### Honest scarcity

The scarce thing here is real: reviewer hours. Seats per cohort are

```
seats = min(room size for a useful live review, committed reviewer hours / 5.8)
```

Room size 25 [hypothesis]. With three founding reviewers committing 20 h each to the assessment
window, that is 60 / 5.8 = 10 assessments, so ten seats unless more reviewers commit. The number is
published only once reviewers have committed their hours, and it never resets.

Rules, from `DEMAND-CAPTURE-STANDARD.md` and the graph row:

- No public count below 100 signups (`publicCountThreshold: 100`). Silence until then.
- At 100, the milestone fires: cohort 1 gets scheduled, as a decision for Frank. The milestone's
  `publishedAt` stays null until Frank publishes the commitment.
- Founding cohort size in the graph is 50; with reviewer capacity at ten assessments per window,
  founding status spans the first cohorts until 50 people have taken a seat. Both numbers are real
  or not shown.
- Founding benefits are status and permanence, never a discount: price lock, named in course
  materials, input on curriculum order, lifetime access to revisions (graph `founding[]`). Proposed
  addition: first claim on assessment slots, which is capacity-backed.
- No dates until Frank sets one. No countdown. No "spots left" that is not the formula above.

### Reading the data at 100

| what the price answers show | do this |
|---|---|
| under 30% chose 300–999, 1000+ or company pays | no paid cohort; offer H2 assessment only and keep investing in the free path |
| 1000+ plus company pays at 40% or more | test H3 at EUR 1,490 |
| otherwise | cohort at EUR 990 (top of the graph band) with assessment at H2 bought separately |
| Eng manager plus Architect / staff+ over half of roles | bring H4 forward; teams are the buyer |

Percentages are of people who answered the price question, and the report states that count beside
every percentage (`node packages/demand-capture/report.mjs`, which today exits 1 until KV
credentials exist, per AGENTS.md §5c).

## Gate to checkout

Checkout opens only on a fresh PASS receipt at `queen/reports/product-gates/ai-architect-academy-<date>.md`.

| gate | for this product |
|---|---|
| G0 claim truth | every "you will be able to" maps to a `Competency` node with artifacts, evals and reviews (CONTENT-CONTRACT rule 3); "Certified" used only after Frank's naming and graph rulings (`CREDENTIAL.md`, decisions 1 and 2) |
| G1 deterministic | `node score.mjs SAMPLE-SUBMISSION --fixture` exits 4 (FIXTURE-ONLY, would read PASS); the negative and security tests exit 1, 2 or 3 as documented in `score.mjs`; lab suites pass; every site link resolves |
| G2 buyer simulation | a fresh agent with no estate context follows `FREE-PATH.md` and reaches a clean preflight on a new capstone skeleton, on three providers |
| G3 independent check | a different provider reviews G0–G2 cold |
| G4 post-purchase | receipt email, access after 24 h, refund path stated (proposal: cohort refundable in full before week 2; assessment refundable until a reviewer opens it) |
| G5 price integrity | one paragraph, Frank-signed, citing the waitlist price distribution; EU VAT through Polar as merchant of record |
