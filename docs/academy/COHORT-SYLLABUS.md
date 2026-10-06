# Cohort syllabus: from PRD to a deployed, defended agent system

Ten teaching weeks plus a two-week assessment window (twelve weeks end to end), one system per
candidate, one artifact per week, assessed by
[`CREDENTIAL.md`](CREDENTIAL.md). Draft v0.1, 2026-10-05. No dates, seats or price are set; the
cohort is scheduled only after the waitlist milestone in
[`PRICING-AND-WAITLIST.md`](PRICING-AND-WAITLIST.md) and a release-gate PASS.

Reference bar: Maven's AI Evals course ($4,200) for depth in one skill, Google's 5-Day AI Agents
Intensive for free reach and a capstone, Google PAA for an employer-recognised exam. This cohort
must leave each candidate with something none of them produce: their own system, live on two
providers, with a rubric-scored evidence pack and a defence on record.

## Who it is for

Engineers and architects asked to lead AI work they have not shipped before (the buyer in
`products.graph.json`). Prerequisite: the free path ([`FREE-PATH.md`](FREE-PATH.md)) and the ability
to deploy a web service. Time: 8 to 10 hours a week [hypothesis, to be measured on cohort 1].

## The method: spec-anchored, eval-accepted

The ADLC this cohort teaches has seven stages. Each ends in an artifact and a check that can fail.

```
Frame ──> Spec ──> Decide ──> Prove ──> Ship ──> Break ──> Defend
  │         │        │         │         │        │         │
kill      REQ-nn   ADR with   harness   two      injected   live,
criterion  + NFR    rejected   exits 1   clouds,  failure    changed
          budget   option +   on a      rollback caught by  constraints
                   acceptance seeded    timed    telemetry
                   eval ids   regression
```

Two rules hold the method together:

1. **No decision is accepted until its eval passes.** An ADR moves from proposed to accepted only
   when the case ids in its "Acceptance eval" section pass in the harness. This links the evals
   practice (Anthropic's eval guide, Maven's course) to architecture decisions, which none of the
   benchmarks do ([leadership benchmarks](../research/leadership-benchmarks.md), positioning wedge 2).
2. **The spec is sized to the decisions it drives.** Spec Kit or OpenSpec output is the starting
   point; requirements that change no decision and no eval are cut. Candidates record review time,
   answering Böckeler's critique of SDD tools with a measurement.

The stage gates reuse the AI Architect plugin's nine gates
([`gates/`](https://github.com/frankxai/ai-architect/tree/main/gates)), so a candidate can run
`/architect` against their own repository every week and see what is still red.

## Weekly rhythm

| when | what | produces |
|---|---|---|
| Monday | lab and reading released | |
| self-paced | build the week's artifact in the capstone repo | one commit range per week |
| Wednesday, 90 min live | design review: three candidates present the week's artifact; the room scores it against the week's rubric anchors | scored notes |
| Friday | peer review: score one assigned peer's artifact blind, then compare with staff | reviewer calibration data |
| any time | `node score.mjs <repo> --preflight-only` | the week's criteria go clean |

Peer review is deliberate: every graduate leaves calibrated to review the next cohort, which is how
the reviewer pool grows without lowering the bar.

## Capstone: PRD to deployed portal

Every candidate brings a PRD, or picks one of three briefs written to stress different domains.
Each ends in a **portal**: a human-facing web app where the agent's work is reviewed, approved or
corrected. The human gate is the point.

| brief | stresses | example shape |
|---|---|---|
| A. Contract-clause review for a 20-person law firm | retrieval quality, citation evals, confidentiality redaction | RAG over a clause library; portal shows clause, citation, risk flag; lawyer accepts or edits |
| B. Field-service triage for a regional utility | multimodal intake, scheduling tool with side effects, cost at volume | photo plus text intake; agent proposes a job and slot; dispatcher confirms |
| C. Grant-application pre-screen for a foundation | fairness evals, refusal design, audit trail | agent summarises against criteria; portal shows evidence per criterion; reviewer decides |
| Own PRD | whatever it needs | written permission required if it is an employer's system |

The worked example in [`SAMPLE-SUBMISSION/`](SAMPLE-SUBMISSION/README.md) (supplier-invoice intake)
is off the list on purpose: it is the teaching reference and cannot be submitted. The plugin's
worked examples (`support-triage`, `contract-rag`, `personal-ai-coe` in AR `examples/`) are fixtures
too; brief A shares a domain with `contract-rag`, so its artifacts are readable for ideas and
refused by the scorer if submitted (`fixtureSystemIds` in `RUBRIC.json`).

## Week by week

AA = [`frankxai/ai-architect-academy`](https://github.com/frankxai/ai-architect-academy),
AR = [`frankxai/ai-architect`](https://github.com/frankxai/ai-architect). Material is linked, never
copied into this syllabus.

| wk | decision | by the end you can | lab (clouds) | artifact → rubric | reading |
|---|---|---|---|---|---|
| 0 | which system | run the free path end to end and name your capstone | free-path exit check; accounts on Google Cloud, Cloudflare, Vercel, Railway | empty repo with `submission.json` skeleton; preflight runs | [`FREE-PATH.md`](FREE-PATH.md) |
| 1 | what would make you stop | turn a PRD into a spec with ids, a numeric NFR budget and a dated kill criterion, then cut it | "Cut the spec": take a 30-requirement Spec Kit output, cut to what drives a decision, time the review | `SPEC.md` → c1.1, c1.2 | AR `templates/00-frame.md`; Fowler/Böckeler on SDD tools |
| 2 | loop shape | justify the least autonomous shape that works, with evidence | same task built twice: fixed workflow and single agent loop (Vercel AI SDK, and Cloudflare Agents SDK on Durable Objects); ten cases each | ADR loop → c2.2 | AR `guide/manuscript/02-four-decisions.md` §2; AA `labs/02-multi-agent-system`; Azure orchestration patterns; Anthropic "Building effective agents" |
| 3 | model seam | put a task contract above a seam and prove it on a second provider | adapters for Google Gemini API and one other provider behind Cloudflare AI Gateway or Vercel AI Gateway; run a case slice through both | ADR seam; run report "Second provider slice" → c2.3 | AR manuscript `04-model-plane.md`, `05-context-plane.md`; AA `01-design-patterns/ai-gateway-pattern.md` |
| 4 | how you explain it | state the four decisions with re-runnable evidence and draw the system in C4 with the agentic profile | Structurizr DSL: context, container, agent component; seven-plane ownership table | `SYSTEM.md`, `c4/workspace.dsl` → c2.1, c3.1, c3.2 | AR manuscript `03-seven-planes.md`; AR `guide/labs/plane-ownership-matrix.md`; profile in [`CREDENTIAL.md`](CREDENTIAL.md) |
| 5 | what the agent may do | give every tool one principal, flag side effects, document revocation | build an MCP server (AA `labs/03-mcp-server`), host it on Cloudflare (`McpAgent`) or Vercel (`mcp-handler`); AR delegated-authority lab | `tool-authority.json` → c4.1 | AR `guide/labs/delegated-authority/`; academy graph pattern `bounded-tool-authority` |
| 6 | what you do not trust | list tool results as untrusted, make injection fail closed in code | red-team swap: your peer writes injection payloads against your system, you write theirs | `05-trust-boundary.md`, `inj-*` cases → c4.2, c4.3 | AA `08-governance/model-risk.md`; AR `templates/05-trust-boundary.md` |
| 7 | what a regression looks like | ship a harness that exits non-zero on a seeded regression and gates CI | AA `labs/01-rag-pipeline` with a harness; your own cases.jsonl; fixtures under separate ownership | `06-evals/` → c5.1, c5.2, c5.3 | AA `07-evaluation/eval-harness.md`; AR `guide/labs/eval-scorecard.md`; Anthropic "Demystifying evals" |
| 8 | where a long run lives | deploy on two providers with one plane each, rollback timed per provider | AR `templates/deploy/durable-worker` (Railway worker + Postgres) and `request-scoped-agent` (Vercel portal); ADR compares Cloudflare Workflows and Google Cloud Run | ADR long-run home, `deploy/deployment.json`, runbook → c7.1, c7.2 | AR manuscript `07-orchestration-plane.md`; [provider research](../research/providers/) |
| 9 | what one unit costs | price a unit of work from sourced rows and stop runaway spend | cost model with sensitivity; fire the budget guard on staging and record it | `cost-model.json` → c6.1, c6.2 | AR manuscript `11-economics.md`; AR `gates/gate.economics.json` |
| 10 | does your telemetry notice | break the system with a payload you did not write, catch it, add a guard, defend under changed constraints | incident simulation from the academy graph's injectable failure modes; peer is witness; mock defence | `incident-report.md`, portfolio proof → c7.3, c8.1 rehearsal | AA `08-governance/incident-response-checklist.md` |
| 11–12 | assessment | submit; reviews, defence slot, verdict | none | full submission | [`CREDENTIAL.md`](CREDENTIAL.md) grading process |

## Cloud coverage

Primary providers are chosen because a solo architect can run a real system on them inside free
tiers or startup credits, and because three of the four have no individual AI credential of their
own (Cloudflare, Vercel and Railway; see the provider research §4 in each file). The cohort fills
that gap without pretending to be their certification.

| provider | weeks | what candidates use (official assets) | plane it usually owns |
|---|---|---|---|
| Google Cloud | 3, 8 | Gemini API; ADK and `google/agents-cli` eval skills as reference; Cloud Run or Agent Engine (Gemini Enterprise Agent Platform) as the long-run alternative | model provider A; long-run home option |
| Cloudflare | 2, 3, 5, 8 | Agents SDK on Durable Objects, AI Gateway, `McpAgent`, Email Workers, R2, Workflows | edge, ingress, model gateway, stateful agent |
| Vercel | 2, 3, 5, 8 | AI SDK, AI Gateway, Workflow SDK, Sandbox, `mcp-handler`, Next.js portal | experience plane (the portal) |
| Railway | 8, 9 | durable worker + Postgres/pgvector from the AR deploy kit; `railway` CLI and remote MCP for agent-driven ops | long-run home and state |
| AWS, Azure, OCI | optional | packs in AA `11-hyperscalers/`; any of them counts toward the two-cloud rule | candidate's choice |

Spend: every candidate installs the budget guard in week 3, before any traffic. Target cohort cloud
spend under EUR 25 per candidate [hypothesis; measure on cohort 1].

## Crosswalk to vendor exams

Candidates who also want a vendor badge get the mapping below; there is no separate prep course yet. Google PAA's five
domains (low-code agents, coding agents, custom agents, evaluate and deploy, secure and govern) map
to weeks 2, 3, 5, 6, 7 and 8. A PAA-prep appendix (exam guide mapping plus Google-only labs) is a
candidate add-on for after cohort 1, timed to PAA general availability (registration opens
2 November 2026).

## What staff measure on cohort 1

Review time per artifact, inter-rater agreement per criterion, weekly hours reported, cloud spend,
pass rate on first submission, and which criteria fail most. Those numbers replace every
`[hypothesis]` in this file before cohort 2 is announced.
