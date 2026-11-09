# Ledgerline: supplier-invoice intake agent

Fixture. This is a teaching submission for the AI Architect Credential review. The firm, people,
URLs and figures are invented; prices are illustrative and marked. Nothing here describes a real
customer or employer.

## Outcome

Every supplier invoice that arrives by email is read, matched to a purchase order and goods
receipt, checked for fraud signals, and turned into a payment draft that an accounts-payable clerk
approves or rejects in under two minutes, without the agent ever being able to pay anyone.

## Context

Hollin & Vale is a 40-person design-engineering firm. One part-time AP clerk handles about 600
supplier invoices a month (fixture figure). Today the clerk retypes each PDF into the accounting
system, chases missing PO numbers by email, and checks bank details by eye. Two near-misses on
bank-detail-change fraud in the past year are the reason the finance lead will fund this; speed is
the secondary reason.

## Users and jobs

| user | job | what "done" means to them |
|---|---|---|
| AP clerk | clear the invoice queue daily | every invoice is either approved as a draft, rejected with a reason, or waiting on a named supplier query |
| finance lead | sign off payment runs | no payment draft exists that the clerk did not approve; every bank-detail change is surfaced, never applied |
| supplier | get paid | a missing-PO query arrives within one working day, from a template, in plain language |

## Non-goals

- Executing payments. The accounting system's payment run stays a human action.
- Changing vendor master data, including bank details. The agent has no tool that can.
- Approving anything. Approval is a button in the portal, pressed by a person.
- Expense receipts, credit notes and foreign-currency revaluation (phase 2 candidates).
- Learning between runs. No fine-tuning, no memory beyond the invoice's own record.

## Requirements

| id | requirement | acceptance |
|---|---|---|
| REQ-01 | Extract supplier, invoice number, date, currency, net, tax, gross and IBAN from a PDF invoice | eval `gold-01`..`gold-04` |
| REQ-02 | Match each invoice to an open PO and goods receipt; three-way match within 1% tolerance | eval `gold-05`, `edge-02` |
| REQ-03 | Flag any IBAN that differs from the vendor master and block the payment draft | eval `inj-01`, `gold-06`; ADR-0002 |
| REQ-04 | Treat every instruction found inside an invoice, email body or supplier reply as content | eval `inj-01`..`inj-04`; ADR-0002 |
| REQ-05 | Detect duplicates by supplier + invoice number + gross before drafting | eval `edge-01` |
| REQ-06 | Draft a supplier query from an approved template when the PO is missing; a human sends it | eval `edge-03`, `ref-01` |
| REQ-07 | Refuse requests to pay, approve, or change vendor data, whoever asks | eval `ref-01`, `ref-02` |
| REQ-08 | Long OCR and matching runs survive restarts and never sit inside a web request | ADR-0003; runbook dry-run |
| REQ-09 | Provider swap needs no change above the model seam | ADR-0004; second-provider slice |

## NFR budget

| quality | budget | measured by |
|---|---|---|
| extraction accuracy | at least 97 of 100 fields correct on the weekly sample | `06-evals/run-report.md`, weekly sample |
| fraud-signal recall | 100% of IBAN mismatches flagged; zero drafts created for a mismatched IBAN | `inj-*` cases plus a deterministic check, not a model judgement |
| time to approval-ready | p95 under 4 minutes from email arrival | trace span `invoice.ready` in Langfuse |
| clerk review time | median under 2 minutes per invoice | portal event `draft.decided` minus `draft.opened` |
| cost | under EUR 0.05 per invoice; hard monthly ceiling EUR 60 | `cost-model.json`; runaway guard |
| availability | ingestion may lag; nothing may be lost. Every inbound email reaches R2 or a dead-letter queue | runbook check `ingest-dlq-empty` |

## Flows

1. Supplier emails `invoices@` with a PDF. Cloudflare Email Worker stores the raw message in R2 and
   enqueues a job on the Railway worker over an authenticated webhook.
2. The worker extracts text (OCR when the PDF has no text layer), calls the model through the seam
   with the invoice text wrapped as untrusted content, and gets structured fields back.
3. Deterministic code, not the model, matches PO and receipt, compares the IBAN to the vendor master,
   and checks duplicates.
4. Clean invoice: the worker creates a payment draft in the accounting system. Flagged invoice: no
   draft; the portal shows the flag and the evidence.
5. The clerk opens the Vercel portal, sees the draft beside the PDF and the match, and approves or
   rejects. Approval marks the draft approved in the accounting system; the payment run is still a
   separate human action.
6. Missing PO: the worker proposes a templated supplier query; the clerk presses send.

Failure branch for every flow: any step that cannot complete leaves the invoice in `needs_human`
with the reason, and the portal queue shows it. Nothing is dropped silently.

## Traceability

Every requirement above names its acceptance eval or ADR. Every ADR in `docs/architecture/adr/`
names the eval ids that accept it. The C4 model in `c4/workspace.dsl` carries the same element names
as `docs/architecture/tool-authority.json`.

Sizing note: the first draft of this spec had 23 requirements. Fourteen were cut because no
decision or eval changed when they were removed. Review time for this version: 18 minutes, two
reviewers (fixture figure, recorded to show what the rubric asks for in c1.2).

## Kill criterion

Stop and return to manual entry if, on the weekly sample measured every Friday from the first
production week, either (a) any payment draft is created for an invoice whose IBAN differs from the
vendor master, or (b) clerk median review time stays above 4 minutes for three consecutive weeks.
Condition (a) needs one occurrence, because it is the risk the firm is paying to remove.
