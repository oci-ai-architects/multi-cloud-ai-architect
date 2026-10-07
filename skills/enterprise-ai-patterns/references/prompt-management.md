# Prompt management system

Moved from SKILL.md on 2026-10-05; content as of 2026-01-06.

## Pattern 4: Prompt management system

### Purpose
Version-controlled, tested, and deployed prompts as code.

### Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                  PROMPT MANAGEMENT SYSTEM                        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                  PROMPT REPOSITORY                           ││
│  │                                                              ││
│  │  prompts/                                                    ││
│  │  ├── customer_support/                                       ││
│  │  │   ├── v1.0.0/                                            ││
│  │  │   │   ├── system.txt                                     ││
│  │  │   │   ├── examples.json                                  ││
│  │  │   │   └── tests.json                                     ││
│  │  │   └── v1.1.0/                                            ││
│  │  │       └── ...                                            ││
│  │  └── data_analysis/                                          ││
│  │      └── ...                                                 ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  CI/CD Pipeline:                                                │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  │
│  │ Commit │─▶│  Test  │─▶│ Review │─▶│  Stage │─▶│ Deploy │  │
│  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘  │
│                                                                  │
│  Testing:                                                       │
│  - Unit tests (expected outputs)                                │
│  - Regression tests (no quality drop)                           │
│  - A/B tests (compare versions)                                 │
│  - Safety tests (no harmful outputs)                            │
└─────────────────────────────────────────────────────────────────┘
```

### Prompt template
```yaml
# prompts/customer_support/v1.1.0/config.yaml
name: customer_support
version: 1.1.0
description: "Handle customer support inquiries"

system_prompt: |
  You are a helpful customer support agent for {company_name}.

  Guidelines:
  - Be professional and empathetic
  - Cite knowledge base sources
  - Escalate complex issues
  - Never share internal policies

  Knowledge cutoff: {kb_update_date}

variables:
  - company_name: required
  - kb_update_date: required

examples:
  - input: "I want to return my order"
    expected_topics: ["return_policy", "refund_timeline"]
  - input: "My product is broken"
    expected_topics: ["warranty", "replacement"]

tests:
  - name: "handles_refund_question"
    input: "How do I get a refund?"
    assertions:
      - contains: "refund"
      - does_not_contain: "internal"
      - sentiment: "helpful"
```
