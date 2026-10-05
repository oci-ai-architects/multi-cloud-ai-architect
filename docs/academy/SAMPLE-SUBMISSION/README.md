# Sample submission: Ledgerline

A complete worked submission for the Certified AI Architect design review, used to teach the
format, calibrate reviewers and test the scorer. It is a **fixture**: the firm, people, URLs
(reserved `.example` domain) and prices are invented, and the scorer labels it ineligible for a
credential. Copying it as your own submission fails integrity (`fixtureSystemIds` in
`../RUBRIC.json`).

Ledgerline turns emailed supplier invoices into approval-ready payment drafts for a 40-person firm.
It was chosen because it has real money on the line, a real fraud vector (bank-detail-change
invoices), and side-effecting tools, so every rubric domain has something to bite on.

## Reading order

| # | file | rubric | what to notice |
|---|---|---|---|
| 1 | `SPEC.md` | D1 | requirement ids trace to evals and ADRs; the kill criterion has a one-occurrence trigger |
| 2 | `docs/architecture/SYSTEM.md` | c2.1 | four decisions with `rg` evidence a stranger can re-run |
| 3 | `docs/architecture/adr/` | c2.2, c5.3 | each ADR rejects an option a good engineer would pick, and names its acceptance cases |
| 4 | `c4/workspace.dsl` | D3 | the agentic profile: Agent, Tool, ModelSeam, HumanGate, Untrusted; principals on every tool edge |
| 5 | `docs/architecture/tool-authority.json` | c4.1 | one principal per side-effecting tool; dangerous tools absent by design |
| 6 | `docs/architecture/05-trust-boundary.md` | c4.2 | tool results listed as untrusted input; risks accepted with owners |
| 7 | `docs/architecture/06-evals/` | D5, c4.3 | the harness exits 1 on a seeded regression; second-provider slice |
| 8 | `docs/architecture/cost-model.json` | D6 | the model is cheap, the platform is not, and the file says so |
| 9 | `deploy/deployment.json`, `docs/architecture/07-runbook.md` | D7 | three providers, one plane each, timed rollbacks |
| 10 | `incident-report.md` | c7.3 | detection came from a downstream refusal; the report admits it and adds the guard |
| 11 | `submission.json` | D8 | integrity disclosure, two independent scorecards, one adjudication |

## Score it

```bash
node ../score.mjs . --fixture                    # FIXTURE-ONLY (would read PASS), 79 / 100, exit 4
node ../score.mjs . --fixture --preflight-only   # the machine check alone
node ../score.mjs . --fixture --json             # machine-readable
```

Without `--fixture` the scorer refuses this directory, because its manifest says `"fixture": true`
and fixture mode is an operator decision. A copy of this directory anywhere else is refused with
or without the flag. On your own capstone repo, run `node score.mjs <your-repo> --preflight-only`
(no flag, no register needed).

## What the reviewers would ask you to fix

F1, F2 and F3 in `submission.json`. None would block a pass. A real candidate fixes them before
publishing the portfolio page.

The layout matches the `docs/architecture/` contract of
[`frankxai/ai-architect`](https://github.com/frankxai/ai-architect), so a `/architect` run produces
roughly half of a submission. This fixture carries only the files the rubric reads; it would not pass
that plugin's `check-artifacts` gate, which also wants the discovery, flow and SOP files.
