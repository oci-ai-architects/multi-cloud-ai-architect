/*
 * Ledgerline, C4 model with the AI Architect Academy agentic profile (v0.1).
 * Fixture. Open in Structurizr (structurizr.com/dsl or Structurizr Lite).
 *
 * Profile, element tags:
 *   Agent        code or model that chooses or performs steps on the user's behalf
 *   Tool         a capability with a principal; side effects declared on the relationship
 *   ModelSeam    the one place that knows a provider's name
 *   HumanGate    where a person approves, rejects or sends; no service principal holds it
 *   Untrusted    a source whose content is T3 data and never instruction
 *   EvalHarness  the thing that can fail a release
 * Profile, relationship tags:
 *   invokes-tool, principal=<id>, side-effect | read-only, untrusted-data, escalates-to-human
 * Names match docs/architecture/tool-authority.json so the two can be diffed.
 */
workspace "Ledgerline" "Supplier-invoice intake agent (fixture)" {

    model {
        clerk = person "AP clerk" "Approves or rejects payment drafts" {
            tags "HumanGate"
        }
        supplier = person "Supplier" "Sends invoices and replies by email" {
            tags "Untrusted"
        }

        ledgerline = softwareSystem "Ledgerline" "Turns emailed invoices into approval-ready payment drafts" {
            ingress = container "Email ingress" "Receives mail, stores raw message, enqueues a job" "Cloudflare Email Worker + R2" {
                tags "Edge"
            }
            worker = container "Pipeline worker" "Fixed-step pipeline: OCR, extract, match, check, draft" "Node container on Railway" {
                pipeline = component "Pipeline" "Fixed step list; code chooses every next step (ADR-0001)" "TypeScript" {
                    tags "Agent"
                }
                seam = component "Model seam" "Task contract extract_invoice / explain_flag; adapters A and B (ADR-0004)" "TypeScript" {
                    tags "ModelSeam"
                }
                checks = component "Deterministic checks" "PO match, IBAN compare, duplicate check; sole writer of status fields (ADR-0002)" "TypeScript"
                draftTool = component "create_payment_draft" "Refuses unless ibanStatus, matchStatus and duplicate are clean" "TypeScript" {
                    tags "Tool"
                }
                lookupTool = component "lookup_po_and_receipt / read_vendor_iban" "Read-only accounting access" "TypeScript" {
                    tags "Tool"
                }
                replyTool = component "read_supplier_reply" "Reads replies; output wrapped as untrusted_reply" "TypeScript" {
                    tags "Tool"
                }
                evals = component "Eval harness" "15 cases; exits non-zero on regression; gates deploy in CI" "Node" {
                    tags "EvalHarness"
                }
            }
            db = container "Postgres" "Queue, invoices, status, audit, gateway spend" "Railway Postgres" {
                tags "Database"
            }
            portal = container "Approval portal" "Shows PDF beside draft; approve, reject, send query" "Next.js on Vercel" {
                tags "HumanGate"
            }
        }

        accounting = softwareSystem "Accounting system" "POs, receipts, vendor master, payment drafts" {
            tags "External"
        }
        mailbox = softwareSystem "AP mailbox" "Supplier replies and outbound queries" {
            tags "External"
        }
        gateway = softwareSystem "AI Gateway" "Logging, caching, rate limit, fallback" "Cloudflare AI Gateway" {
            tags "External"
        }
        providerA = softwareSystem "Model provider A" "Primary (Google Gemini API)" {
            tags "External"
        }
        providerB = softwareSystem "Model provider B" "Fallback (Anthropic Claude API)" {
            tags "External"
        }
        langfuse = softwareSystem "Langfuse" "One trace per invoice" {
            tags "External"
        }

        supplier -> ingress "Emails invoice PDF" "SMTP" {
            tags "untrusted-data"
        }
        ingress -> worker "Enqueues job (HMAC)" "HTTPS" {
            tags "invokes-tool" "principal=svc-ingest" "side-effect"
        }
        pipeline -> seam "extract_invoice(text), explain_flag(evidence)" "function call" {
            tags "untrusted-data"
        }
        seam -> gateway "Model calls" "HTTPS"
        gateway -> providerA "Primary route" "HTTPS"
        gateway -> providerB "Fallback route" "HTTPS"
        pipeline -> checks "Runs match, IBAN, duplicate checks" "function call"
        checks -> lookupTool "Reads PO, receipt, vendor IBAN" "function call"
        lookupTool -> accounting "Reads" "REST" {
            tags "invokes-tool" "principal=svc-acct-read" "read-only"
        }
        pipeline -> draftTool "Requests draft when checks are clean" "function call"
        draftTool -> accounting "Creates payment draft" "REST" {
            tags "invokes-tool" "principal=svc-acct-draft" "side-effect"
        }
        pipeline -> replyTool "Reads supplier replies" "function call"
        replyTool -> mailbox "Reads folder supplier-replies" "Graph/IMAP" {
            tags "invokes-tool" "principal=svc-mail-read" "read-only" "untrusted-data"
        }
        pipeline -> db "Reads and writes job state" "SQL"
        portal -> db "Reads queue via worker API" "HTTPS"
        clerk -> portal "Approves, rejects, presses send" "HTTPS" {
            tags "escalates-to-human"
        }
        portal -> accounting "Marks draft approved (clerk session)" "REST" {
            tags "invokes-tool" "principal=clerk-session" "side-effect"
        }
        portal -> mailbox "Sends templated query (clerk action)" "Graph" {
            tags "invokes-tool" "principal=svc-mail-send" "side-effect"
        }
        pipeline -> langfuse "Traces" "OTLP"
        evals -> worker "Runs cases against deployed worker" "HTTPS"

        deploymentEnvironment "Production" {
            deploymentNode "Cloudflare" "Edge and ingress plane" {
                containerInstance ingress
            }
            deploymentNode "Railway" "Long-run home and state" {
                containerInstance worker
                containerInstance db
            }
            deploymentNode "Vercel" "Experience plane" {
                containerInstance portal
            }
        }
    }

    views {
        systemContext ledgerline "context" {
            include *
            autolayout lr
        }
        container ledgerline "containers" {
            include *
            autolayout lr
        }
        component worker "agent-components" {
            include *
            autolayout lr
        }
        deployment ledgerline "Production" "deployment" {
            include *
            autolayout lr
        }

        styles {
            element "Agent" {
                shape Hexagon
            }
            element "Tool" {
                shape Component
            }
            element "ModelSeam" {
                shape Pipe
            }
            element "HumanGate" {
                border dashed
            }
            element "Untrusted" {
                background #b91c1c
                color #ffffff
            }
            element "Database" {
                shape Cylinder
            }
            relationship "side-effect" {
                thickness 4
            }
            relationship "untrusted-data" {
                style dashed
                color #b91c1c
            }
        }
    }
}
