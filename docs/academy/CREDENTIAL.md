# AI Architect Credential

AI Architect Academy credential, assessed by graded design review of real work.

Status: **draft v0.1, 2026-10-05, unratified.** No credential has been issued. No price, date or
seat count is public while `starlight/graph/products.graph.json` row `ai-architect-academy` reads
`UNGATED`. Rubric: [`RUBRIC.json`](RUBRIC.json). Scorer: [`score.mjs`](score.mjs). Worked example:
[`SAMPLE-SUBMISSION/`](SAMPLE-SUBMISSION/README.md). Cohort: [`COHORT-SYLLABUS.md`](COHORT-SYLLABUS.md).
Free path: [`FREE-PATH.md`](FREE-PATH.md). Commercial: [`PRICING-AND-WAITLIST.md`](PRICING-AND-WAITLIST.md).

## What it certifies

A holder took one agent system they built from a written spec to a deployment on two cloud
providers, and two independent reviewers re-derived the evidence that they:

- framed the problem with a kill criterion and a traceable spec;
- made the four hard-to-reverse decisions (model seam, loop shape, trust boundary, long-run home) and
  rejected credible alternatives in ADRs that name their acceptance evals;
- drew the system in C4 with the agentic profile below;
- bounded tool authority, modelled threats including tool results, and made injection fail closed;
- built an eval harness that fails on regression and proved the model seam on a second provider;
- priced one unit of work from sourced prices and stopped runaway spend with an enforcing guard;
- deployed, rolled back, broke the system on purpose and caught it with their own telemetry;
- defended all of it live, and disclosed how they used AI to do it.

What it does not claim: accreditation, licensure, or anything about employability. It is not yet
issued under ISO/IEC 17024 (the standard for bodies that certify persons); that path is `[OPEN]`
and would need an independent governance board. The credential records that specific artifacts
passed specific evals and reviews on a stated date, under a stated rubric version.

## The bar it is designed to clear

Sources: [`../research/leadership-benchmarks.md`](../research/leadership-benchmarks.md) §D,
[`../research/providers/`](../research/providers/), plus two primary pages read 2026-10-05
(Google PAA, ADaSci CAASA).

| credential | assessed on | vendor scope | who grades | a stranger can check |
|---|---|---|---|---|
| Google Professional Agentic Architect ([page](https://cloud.google.com/learn/certification/agentic-architect)) | ~80 MCQ in 3 h, then hands-on labs in Google Skills; $200 GA, $120 beta; valid 1 year; GA registration opens 2 Nov | Google | Pearson exam + lab autograder | a badge |
| AWS Generative AI Developer – Professional, AIP-C01 ([page](https://aws.amazon.com/certification/certified-generative-ai-developer-professional/)) | 75 questions, 180 min, $300 | AWS | exam | a badge |
| Microsoft AI-103, Azure AI Apps and Agents Developer ([Learn](https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-apps-and-agents-developer-associate/)) | exam; $165 [UNVERIFIED, third-party price]; AI-102 retired 2026-06-30 with no transition path | Azure | exam | a badge |
| Oracle Agentic AI Foundations Associate ([path](https://learn.oracle.com/ols/learning-path/become-an-oracle-agentic-ai-foundations-associate-2026/146553/163239)) | 40 MCQ, 60 min, free | OCI | exam | a badge |
| Claude Certified Architect – Foundations | 60 questions, 120 min; $99 after partner allocation, partner-gated [UNVERIFIED] | Anthropic | exam | a badge |
| ADaSci CAASA ([page](https://adasci.org/certifications/certified-agentic-ai-system-architect-caasa)) | 60 MCQ in 1 h, 70% pass, from $249; labs in the course but not in the assessment | neutral | exam | a badge |
| Maven cohort certificates ($999–$4,200, [UNVERIFIED] snapshot except the $4,200 evals course) | attendance and course projects | mostly neutral | instructor, varies | a certificate |
| **This credential** | **the candidate's own deployed system: spec, ADRs, C4, evals, two-cloud deploy, incident, live defence** | **neutral; two providers required** | **two independent reviewers + adjudicator + machine preflight** | **a public portfolio page whose evidence links resolve** |

The bar, stated once, as a design goal with no outcome data yet: beat Google PAA on **what is assessed** (the candidate's own design decisions
under questioning, where PAA tests product execution on Google's stack) and beat every MCQ exam on
**what a hiring manager can verify** (resolvable evidence, where they get a badge). "Comparable" to
either fails.

## Competency framework

Eight domains, twenty criteria, weights summing to 100. Every criterion uses the same five-point
scale; per-criterion anchors are in `RUBRIC.json`.

| score | level | meaning |
|---|---|---|
| 0 | absent | missing |
| 1 | asserted | claimed, but cannot be re-derived from the submission alone |
| 2 | partial | real and re-derivable, with a gap a reviewer can name in one sentence |
| 3 | architect | complete, re-derivable, trade-off stated (the credential bar) |
| 4 | principal | tested against its own reversal condition, or convincing to a hostile reviewer |

| domain | weight | observable evidence | where it is taught (linked, not copied) |
|---|---|---|---|
| D1 Framing and spec | 10 | `SPEC.md`: outcome, non-goals, kill criterion with threshold and date; `REQ-nn` ids each tied to an eval or ADR; numeric NFR budget | `ai-architect` stage frame (`gate.frame`); academy graph stage `system-brief` |
| D2 Architecture decisions | 15 | `SYSTEM.md` four-decision table with re-runnable evidence pointers; at least three ADRs with rejected options, reversal conditions and acceptance eval ids; second-provider eval slice | `ai-architect/guide/manuscript/02-four-decisions.md`; `gate.decisions`; graph stage `architecture-decision` |
| D3 Architecture communication | 10 | one C4 model file with context, container and agent-component views, using the agentic profile | profile below; `c4model.com` |
| D4 Authority and security | 15 | `tool-authority.json`; threat model listing tool results as untrusted; injection cases that fail closed through a deterministic guard | graph pattern `bounded-tool-authority`; `gate.trust`; academy lab 03 |
| D5 Evaluation | 15 | at least ten cases across golden, refusal, injection, edge; a seeded regression that exits non-zero; fixtures versioned apart from prompts | graph pattern `eval-before-deploy`; `gate.evals`; academy `07-evaluation/` |
| D6 Economics | 10 | cost per unit of work from price rows with `source_url` and `retrieved_at` within 90 days; sensitivity on three drivers; ceiling with an enforcing, tested guard | `gate.economics`; graph stage `cost-model` |
| D7 Delivery on two clouds | 15 | live URLs on two distinct providers, one plane each, split justified in an ADR; rollback per provider; incident simulation detected by pre-existing telemetry, witnessed | `ai-architect/templates/deploy/`; graph stages `deployment`, `incident-simulation` |
| D8 Defence and integrity | 10 | 45-minute live defence; signed attestation; specific AI-use disclosure; commit history consistent with both | this document |

Hard gates (each must score at least 3 whatever the total): c4.3 injection fails closed, c5.2 the
harness can fail, c7.1 two providers, c8.2 integrity. These are the four places where a confident
but wrong architect does real damage.

## Submission format

A repository (or a tagged directory in one) the reviewers can clone. Layout follows the
`docs/architecture/` contract of [`frankxai/ai-architect`](https://github.com/frankxai/ai-architect),
so a `/architect` run produces roughly half a submission; the academy graph's nine artifacts
(`site/lib/academy-graph/production-agent-systems.ts` in `ai-architect-academy`) map onto the rest.

```
submission.json                     manifest: candidate, system, artifact paths, integrity, (reviews added by staff)
SPEC.md                             PRD turned spec: outcome, non-goals, requirements REQ-nn, NFR budget, flows, traceability, kill criterion
docs/architecture/
  SYSTEM.md                         boundary, seven planes with owners, four decisions with evidence pointers
  adr/ADR-000n-*.md                 >= 3; headings: Context, Options considered, Decision, Consequences, What would reverse this, Acceptance eval
  tool-authority.json               principals[] with revocationPath; tools[] with principal and sideEffecting
  05-trust-boundary.md              Trust boundaries, Untrusted inputs, Abuse cases, Mitigations, Accepted risks
  06-evals/cases.jsonl              { id, kind, input, expect, must_not } per line; kinds golden, refusal, injection, edge
  06-evals/run-report.md            Baseline run, Seeded regression (with "exit code: n"), Second provider slice
  cost-model.json                   unitOfWork, tokensPerUnit, prices[], costPerUnit, sensitivity[], ceiling, runawayGuard
  07-runbook.md                     Owner, Observability, Rollback (per provider), dry-run results
c4/workspace.dsl                    Structurizr DSL with the agentic profile
deploy/deployment.json              deployments[] with provider, plane, url, rollback, observability
incident-report.md                  Injected failure mode, Time to detection, What the telemetry showed, Fix, Guard added, Witness
```

The spec is **spec-anchored and eval-accepted**: Spec Kit or OpenSpec output is welcome as the
starting point, but the submitted `SPEC.md` must carry the architecture layer those tools skip (NFR
budget, ADR links) and must be sized to the decisions it drives. Böckeler's critique of SDD tools
(verbose specs, over-specification) is the reason rubric anchor c1.2 level 4 rewards cutting.

### The two-cloud rule

At least two distinct providers, each running a named plane (edge, experience, long-run home,
state, model gateway), with an ADR that says why the split exists. Primary providers taught in the
cohort: Google Cloud, Cloudflare, Vercel, Railway. AWS, Azure and OCI are accepted; their packs live
in `ai-architect-academy/11-hyperscalers/`. Two regions of one provider do not count. Model
providers do not count toward the two; the seam test (c2.3) covers them separately. A split that
exists only to satisfy this rule is legal but costs points in c2.2: argue it on its merits.

### C4 agentic profile v0.1

C4 has no vocabulary for agents, tools, seams or trust ([leadership benchmarks §A](../research/leadership-benchmarks.md)).
This profile adds tags and nothing else, so any Structurizr-compatible tool renders it.

| element tag | means |
|---|---|
| `Agent` | code or model that chooses or performs steps for the user |
| `Tool` | a capability with a principal |
| `ModelSeam` | the one module that knows a provider's name |
| `HumanGate` | where a person approves, rejects or sends; no service principal holds it |
| `Untrusted` | a source whose content is T3 data, never instruction |
| `EvalHarness` | the thing that can fail a release |

| relationship tag | means |
|---|---|
| `invokes-tool` + `principal=<id>` | a tool call made as that principal (ids match `tool-authority.json`) |
| `side-effect` or `read-only` | declared on every `invokes-tool` edge |
| `untrusted-data` | T3 content crossing this edge |
| `escalates-to-human` | control passes to a person |

Required views: `systemContext`, `container`, and a `component` view of whichever container holds
the `Agent`. A `deployment` view mapping containers to providers earns c3.1 level 4.

## Grading process

| step | who | output | time budget [hypothesis] |
|---|---|---|---|
| 1 Preflight | `node score.mjs <dir> --preflight-only`, run by the candidate (free) and again by staff | per-criterion clean or dirty; a dirty criterion is capped at 1 | seconds |
| 2 Independent review | two reviewers, scoring blind to each other, at least one from outside the candidate's cohort | scorecard per criterion with a one-line note citing a file | 2 h each |
| 3 Live checks | reviewer | unauthenticated GET on every URL; re-run at least two evidence pointers of their choice and record them in `rederived[]` (the scorer refuses a scorecard without them); re-run the eval harness | inside step 2 |
| 4 Defence | one reviewer, recorded with consent | c8.1, c8.2; two changed-constraint questions per ADR | 45 min |
| 5 Adjudication | third reviewer, only on criteria where the two differ by 2 or more | median of three | 30 min per criterion |
| 6 Verdict | staff run `node score.mjs <dir> --reviews <staff scorecards> --register <reviewer register>` | PASS, PASS WITH DISTINCTION, FAIL or REFER | seconds |

Pass rules (`RUBRIC.json` `passRules`): total at least 70 of 100; no criterion below 2; every hard
gate at least 3. Distinction: at least 85 and no criterion below 3. Reviewer scores within 1 of each
other are averaged. A preflight failure caps that criterion at 1 however the reviewers scored it,
because a claim the machine cannot find is a claim the reviewer should not have credited.

Preflight is triage. It proves files, sections, case mixes and authority structure exist; it cannot
prove an eval ran or a URL served. Truth comes from step 3, where reviewers re-derive evidence
themselves.

Who controls what. The candidate controls `submission.json`, so nothing in it can switch a check
off. Scorecards live in a staff-held file passed with `--reviews`; every reviewer must appear in the
register passed with `--register`, calibrated for the current rubric version and with no declared
conflict. Exactly two primary scorecards and at most one adjudicator are accepted, so extra friendly
scorecards cannot dilute a low score. A manifest that carries its own reviews in a real run is
refused. Fixture mode (`--fixture`) is honoured only for this directory's `SAMPLE-SUBMISSION/`,
always ends `FIXTURE-ONLY` with exit 4, and never awards anything; a manifest claiming
`"fixture": true` anywhere else is refused. Real runs always check `fixtureSystemIds`.

The sample reads 79 with one adjudication on c6.2:
`node score.mjs SAMPLE-SUBMISSION --fixture` prints `FIXTURE-ONLY (would read PASS)`.

## Reviewers

- Eligible: holders of the credential, plus founding reviewers appointed by Frank before the first
  holders exist (named in the reviewer register, `[OPEN]`).
- Calibration: before reviewing, score `SAMPLE-SUBMISSION` blind; at least 18 of 20 criteria within
  1 of the reference scorecard. Re-calibrate on a new fixture each rubric minor version.
- Conflicts: no reviewing a colleague, a current client, a cohort-mate from the same breakout pair,
  or anyone you have mentored on this submission.
- Drift: staff publish anonymised inter-rater agreement per criterion each cohort. A criterion whose
  reviewer agreement stays below 70% gets its anchors rewritten.
- Reviewers are paid per review (rate in `PRICING-AND-WAITLIST.md`, hypothesis). Volunteer review
  does not scale and does not hold a bar.

## Integrity

AI use is expected; this is a credential for people who build with agents. Undisclosed use is the
violation.

| allowed, with disclosure | misconduct |
|---|---|
| coding agents writing code, specs, ADR drafts, eval cases | submitting a system you did not design or cannot defend |
| the `/architect` plugin producing `docs/architecture/` | presenting a published fixture or worked example as your system (the scorer refuses `fixtureSystemIds`) |
| templates from this academy and from vendors | evidence that was fabricated: invented eval runs, URLs that never served, a witness who did not watch |
| a colleague's review comments | another person defending, or answering through a hidden channel during the defence |

Checks: commit history spanning the work; defence answers consistent with the ADRs and history;
cross-cohort similarity scan on ADRs and eval cases; random re-run of one evidence pointer per
domain. Outcome of proven misconduct: FAIL, no resubmission for 12 months, and revocation if it is
found after issue. The finding is shared with the candidate in writing first.

Confidentiality: submissions may use an employer's system only with written permission; the
portfolio projection drops threat models and incident reports (they are cohort-visible only, per the
academy graph's `publicSafe` flags) and applies each artifact's redaction list.

## Appeals and resubmission

- **Window:** 14 days from the verdict.
- **Grounds:** procedure not followed; an anchor misapplied (cite the criterion, the anchor text and
  the file that meets it); evidence the reviewers missed that was in the submission at the time.
  New work is a resubmission, never an appeal.
- **Process:** a reviewer who did not score the submission re-scores only the appealed criteria
  blind to the original scores; `score.mjs` recomputes. That result is final for the rubric
  version.
- **Cost:** none [hypothesis]. Tracked publicly as a count per cohort with outcomes.
- **Resubmission:** after FAIL, one resubmission within 90 days, scored only on criteria below the
  bar plus the defence. After REFER, nothing is needed from the candidate.

## Validity, renewal, verification

- Each credential names its evidence date and rubric version. It reads **current** for 24 months
  [hypothesis; vendor certs run 1 to 3 years; revisit after cohort 3 with renewal data].
- Renewal is a **delta review**: one new ADR on a changed system, its acceptance eval run, and a
  20-minute defence. No re-sit of the whole credential.
- Public verification page per holder: credential id, date, rubric version, domain bands
  (architect or principal per domain, never raw scores), and the candidate's public-safe portfolio
  proof, whose links must resolve for a logged-out visitor.

## How it fits with vendor certifications

Vendor certs prove platform fluency; this proves the decisions. They stack.

| our domain | Google PAA domain it overlaps | AWS / Microsoft / Oracle |
|---|---|---|
| D2, D3 | develop custom agents | AIP-C01 and AI-103 cover building on Bedrock / Foundry; neither asks for rejected alternatives |
| D4 | secure and govern agentic workflows | AWS "Demonstrated" Securing Agent Identities [scope UNVERIFIED] |
| D5 | evaluate and deploy agentic workflows | partial in all three; none requires a harness that fails |
| D7 | evaluate and deploy agentic workflows | single-cloud by design in all three |
| D1, D6, D8 | none | none |

Suggested stacks: a career switcher takes Oracle Foundations (free) and the free path first; a
platform engineer pairs Google PAA or AIP-C01 with this credential; a consultant uses this
credential as the vendor-neutral proof that survives exam churn (AI-102 retired with no transition
path; this rubric versions and grandfathers).

## Decisions this needs from Frank

1. **Name.** Working title set to "AI Architect Credential" on 2026-10-05 (default applied by the maintainer's assistant, reversible). "Certified AI Architect" is generic and crowded: Claude Certified Architect, ADaSci
   CAASA, and training vendors selling "AI Architect certification". Run a trademark search before
   any public use; the fallback is the qualified form "AI Architect Academy Certified Architect
   (design-reviewed)". `[OPEN]` Defaults applied the same day: no refund guarantee until a first cohort has run; the waitlist form stays closed until the estate demand-capture store is provisioned.
2. **Graph wording.** `role:production-agent-architect` in the academy graph says "This is not a
   certification". The role stays true as written; the credential needs its own `Credential` node
   kind that requires the competency plus the review and defence. Ruling needed before any surface
   calls it a certification.
3. **Retire the lab-score levels.** `ai-architect-academy/CLAUDE.md` defines Associate,
   Professional and Expert from lab scores alone. Those are self-graded and should become progress
   markers, not credentials.
4. **Calibrate before issuing.** Two founding reviewers score the sample and three volunteer
   submissions; adjust anchors where agreement is under 70%; then ratify rubric 1.0.0.
5. **A real founding submission before launch.** The sample is a fixture with `.example` URLs, so
   it proves the format and nothing about delivery. Before checkout, one founding reviewer builds a
   real two-cloud system, submits it, and is scored by two others. That run is the G2 evidence.
6. **Founding-cohort guarantee.** Whether founding candidates get a full refund if the rubric is not
   ratified (1.0.0) in time to issue their credential. It addresses the strongest objection from the
   adversarial review: paying for an uncalibrated credential.
7. **Hiring-side evidence.** "A hiring manager can verify it" is a design claim until a handful of
   hiring managers have looked at a verification page and said what they would do with it. `[OPEN]`
8. **Governance.** Whether to pursue ISO/IEC 17024 later, which would require separating training
   (cohort) from certification (review) organisationally. Not needed for launch. `[OPEN]`
