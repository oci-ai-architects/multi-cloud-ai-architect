# Trust boundary and threat model: Ledgerline

Fixture. Cohort-visible in a real submission (threat models are never on the public portfolio).

## Trust boundaries

| boundary | crosses from | crosses to | control |
|---|---|---|---|
| B1 internet to ingress | any sender | Cloudflare Email Worker | allow-list of supplier domains is advisory only (spoofable); everything is T3 regardless |
| B2 ingress to worker | Cloudflare | Railway worker | HMAC-signed `/enqueue`, key rotated with `svc-ingest` |
| B3 text to model | worker | model via AI Gateway | T3 wrapped in tagged data position; model returns JSON validated against schema |
| B4 model output to state | worker | Postgres status fields | model output may fill extracted fields only; status fields are written by code |
| B5 worker to accounting | worker | accounting API | `svc-acct-draft` can create drafts only |
| B6 human to money | clerk | approval | the only approval path is a clerk session in the portal |

## Untrusted inputs

- Invoice PDF text, including hidden text layers and metadata.
- Email bodies and headers (sender display name and address are attacker-controlled).
- Supplier replies read by `read_supplier_reply`: tool results are untrusted input, the same as the
  original email.
- Model output itself, until it passes schema validation and the code checks in B4.

## Abuse cases

| id | abuse | path | eval |
|---|---|---|---|
| A1 | bank-detail change smuggled in an invoice | B1 > B3 | `inj-01` |
| A2 | hidden text rewrites amount or status | B3 > B4 | `inj-02` |
| A3 | executive impersonation asks for release | B1 | `inj-03`, `ref-01` |
| A4 | supplier reply instructs draft creation | tool result > B4 | `inj-04` |
| A5 | duplicate submission to get paid twice | B1 | `edge-01` |
| A6 | overbilling against a valid PO | B1 | `edge-02` |
| A7 | request to edit vendor record | B1 | `ref-02` |

## Mitigations

- Status fields (`ibanStatus`, `matchStatus`, `duplicate`) are written only by code; the draft tool
  re-checks all three at call time, not from a cached value.
- No tool for payment, vendor edits or deletion exists (`tool-authority.json`, `absentByDesign`).
- One principal per side-effecting tool; drafts and sends use different credentials.
- Every T3 span is logged with its trace id, so a successful injection leaves evidence.
- Budget guard and gateway rate limit cap the cost of a loop bug (`cost-model.json`).

## Accepted risks

- **Compromised vendor master.** If an attacker changes the IBAN in the accounting system through
  its own UI, this system will match and draft. Owner: finance lead, mitigated by the accounting
  system's change approval, outside scope.
- **Clerk approves a bad draft.** The portal shows the PDF beside the draft; the system cannot stop a
  person who approves without reading. Owner: finance lead, mitigated by sampling 5% of approvals.
- **Data residency.** Invoice text goes to provider A or B via the gateway. Accepted by the finance
  lead on 2026-09-26 after reading both providers' data-use terms; recorded as open question Q2 for
  the annual review.
