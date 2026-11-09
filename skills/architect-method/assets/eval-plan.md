# Eval plan: <system name>

| Field | Value |
|---|---|
| Spec | `spec.md` v<x> |
| Owner | <name> |
| Harness | <e.g. promptfoo, adk eval, AgentCore Evaluations, Foundry evaluations, custom> |
| Runs on | every PR preview; nightly on main; both clouds before release |

> Thresholds come from the spec's NFR budget. ADR Acceptance blocks reference the IDs below.
> Cheap deterministic checks first; model-graded checks only where code cannot decide.

## 1. Suites

| ID | Layer | What it checks | Dataset | Grader | Threshold | Gate |
|---|---|---|---|---|---|---|
| E-OUT-01 | Outcome | Task solved end to end | golden set, ≥ 100 cases (M), ≥ 300 (L) | code where possible, else rubric judge | ≥ 85% | merge |
| E-TRAJ-01 | Trajectory | Correct tool, valid args, no unneeded writes | same cases, expected tool sequence | code (trace diff) | ≥ 95% | merge |
| E-TRAJ-02 | Trajectory | Step and tool-call budget respected | all cases | code | 100% ≤ max steps | merge |
| E-SEC-01 | Safety | Prompt injection, data exfiltration, privilege escalation | red-team set, ≥ 50 attacks incl. indirect injection via tools | code + judge | 0 violations | release |
| E-SEC-02 | Policy | Every A3 action blocked without approval, allowed with it | synthetic approval matrix | code | 100% | release |
| E-SKILL-01 | Skill routing | Each runtime SKILL.md triggers when it should and not when it should not | 2 positive + 2 negative per skill | code | ≥ 95% | merge |
| E-PERF-01 | Performance | p95 completion time | golden set replay | code | ≤ budget | release |
| E-COST-01 | Cost | Cost per completed task (models + runtime + tools) | golden set replay with usage export | code | ≤ budget | release |
| E-REG-01 | Regression | No drop vs last accepted run | all suites | code | Δ ≥ -2 pts per suite | merge |

## 2. Datasets

| Dataset | Source | Size | Refresh | Owner | Contains PII? |
|---|---|---|---|---|---|
| Golden set | real anonymised tickets + synthetic edge cases | | monthly, add every production failure | | no (redacted) |
| Red-team set | OWASP LLM Top 10 categories + domain attacks | | per release | | no |

Rules: every production incident becomes a test case within a week. Split a held-out set that
nobody tunes prompts against; report it separately.

## 3. Model-graded checks

| Judge | Model | Rubric | Calibration |
|---|---|---|---|
| Outcome judge | <model, different provider than the agent where possible> | 1–4 scale, pass ≥ 3, rubric in `evals/rubrics/outcome.md` | agreement with 2 human labellers on 50 cases; target ≥ 0.8 |

Run the judge at temperature 0, pin the model version, and re-calibrate when the judge model changes.

## 4. Non-determinism

- Run each case **k = 3** times at production temperature; report pass@1 and pass^3 (all three pass).
- A case that flips between runs is tracked as flaky, not silently averaged.
- Record seeds, model versions and prompt hashes per run.

## 5. Two-cloud comparison (architect-method step 7)

| Metric | Cloud A: <name> | Cloud B: <name> | Δ | Notes |
|---|---|---|---|---|
| E-OUT-01 pass rate | | | | |
| E-TRAJ-01 | | | | |
| p95 completion | | | | |
| Cost per task | | | | price sources + asOf |
| Incidents during run | | | | |

The same dataset, prompts and model must be used on both sides; only the runtime adapter differs.
If a model differs (regional availability), say so and treat the comparison as indicative.

## 6. Online monitoring after release

| Signal | Source | Alert when |
|---|---|---|
| Task success proxy (e.g. no human takeover in 24 h) | app events | 7-day rate drops ≥ 5 pts |
| Cost per task | gateway + runtime usage | > 120% of budget for 1 day |
| Policy denials | policy engine logs | spike > 3× baseline |
| Sampled transcript review | 1% sample to human queue | any severity-1 finding |

## 7. Run log

| Date | Commit | Env | Suites run | Result | Link |
|---|---|---|---|---|---|
| | | | | | |
