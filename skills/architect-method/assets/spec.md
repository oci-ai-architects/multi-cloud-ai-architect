# Spec: <system name>

| Field | Value |
|---|---|
| Size | S / M / L (see architect-method step 0) |
| Owner | <name, role> |
| Status | Draft / Review / Approved |
| Version | 0.1 (<YYYY-MM-DD>) |
| Related | ADRs: `adr/`, C4: `c4-agentic.md`, evals: `eval-plan.md` |

> Write outcomes and budgets. Leave the *how* to ADRs and the code. Delete any section that has
> nothing true to say at this size; do not fill it with filler.

## 1. Problem and outcome

**Who** has the problem, **what** they do today, **what it costs them** (time, money, errors).

**Outcome we commit to**, measurable:
- e.g. "Tier-1 support tickets about order status are resolved without a human in ≥ 70% of cases, with a customer satisfaction score no lower than the human baseline."

**Non-goals** (things a reader might assume are in scope and are not):
- e.g. "Refunds above 50 EUR. The agent drafts, a human sends."

## 2. Users and actors

| Actor | Type | Goal | Channel |
|---|---|---|---|
| <customer> | human | <goal> | web chat |
| <support lead> | human approver | approve refunds over threshold | Slack |
| <order system> | system | source of truth for orders | REST / MCP |

## 3. Complexity level (decide here, justify in ADR-001)

- [ ] Direct model call: one prompt does the job.
- [ ] Single agent with tools: one domain, dynamic tool use. *Default for most enterprise work.*
- [ ] Multi-agent: only if one agent fails on prompt complexity, tool overload, or separate security boundaries. Name the reason: <reason>.

## 4. Autonomy budget

Autonomy scale used across all artifacts:

| Level | Meaning |
|---|---|
| A0 | Suggest only. Human performs the action. |
| A1 | Act on read-only tools. No side effects. |
| A2 | Act with reversible side effects; every action logged and undoable. |
| A3 | Act with irreversible or external side effects **after** human approval. |
| A4 | Act with irreversible side effects without approval, inside a hard policy limit. Needs an explicit ADR. |

| Action class | Example | Level | Approver | Timeout behaviour |
|---|---|---|---|---|
| Read customer order | `get_order` | A1 | none | n/a |
| Update shipping address | `update_address` | A2 | none (undo within 30 min) | n/a |
| Refund ≤ 50 EUR | `refund` | A3 | support lead | auto-cancel after 4 h, notify customer |
| Refund > 50 EUR | `refund` | A0 | support lead performs | n/a |

## 5. Data

| Data class | Examples | Sensitivity | Residency | Retention in agent memory | May leave the trust zone? |
|---|---|---|---|---|---|
| Customer PII | name, address | high | EU | session only | no; redact before model if provider is outside EU |
| Order data | items, status | medium | EU | 30 days | to model provider under DPA |

## 6. NFR budget

Numbers, not adjectives. Each line becomes an eval threshold in `eval-plan.md`.

| NFR | Budget | Measured by |
|---|---|---|
| p95 time to first token | ≤ 1.5 s | online monitor `latency.ttft` |
| p95 task completion time | ≤ 20 s | eval `E-PERF-01` |
| Cost per completed task | ≤ 0.04 EUR (models + runtime + tools) | eval `E-COST-01` from usage data |
| Task success rate | ≥ 85% on golden set | eval `E-OUT-01` |
| Policy violations | 0 on red-team set | eval `E-SEC-01` |
| Availability | 99.5% monthly for the chat path | uptime monitor |
| Max tool calls per task | 12, hard stop | runtime guard + eval `E-TRAJ-02` |

## 7. Acceptance evals

The spec is approved when these suites exist with the thresholds above and the baseline is recorded.

| Eval ID | Suite | Threshold | Gate |
|---|---|---|---|
| E-OUT-01 | Golden tasks (≥ 100 cases at size M) | ≥ 85% pass | merge to main |
| E-TRAJ-01 | Tool trajectory: right tool, valid args, no extra writes | ≥ 95% | merge to main |
| E-SEC-01 | Prompt-injection and data-exfiltration red team | 0 violations | release |
| E-COST-01 | Cost per task over the golden set | ≤ budget | release |

## 8. Dependencies and constraints

- Existing systems, contracts, licences, regulatory constraints (e.g. EU AI Act risk class if applicable, sector rules).
- Cloud constraints known up front (e.g. "customer data must stay in an existing Azure tenant").

## 9. Open questions

| # | Question | Owner | Needed by |
|---|---|---|---|
| 1 | | | |

## 10. Change log

| Version | Date | Change |
|---|---|---|
| 0.1 | <YYYY-MM-DD> | First draft |
