---
name: ai-security-expert
description: Security reference for applications that call language models - the OWASP Top 10 for LLM Applications (2025 list and the older 2023 numbering), prompt injection defence, insecure output handling, PII detection and redaction, guardrail frameworks (NeMo Guardrails, Guardrails AI), defence-in-depth layers, EU AI Act and SOC 2 control mapping, red-team test categories and incident response steps. Use when threat-modelling an LLM or agent system, reviewing a design or pull request for prompt injection, data leakage or excessive agency, choosing or wiring guardrails, writing a security test plan for a model-backed feature, or mapping controls to a compliance framework. Trigger on "AI security", "LLM security", "prompt injection", "jailbreak", "guardrails", "PII protection", "OWASP LLM Top 10", "excessive agency", "system prompt leakage".
metadata:
  version: "1.2.0"
  asOf: "2026-10-05"
  contentAsOf: "2026-01-06"
  scope: reference
  resources: resources/security-patterns.py
---

# AI security

Content as of 2026-01-06, except the OWASP 2025 list, which was read on 2026-10-05. Framework
versions and regulatory details below were not otherwise re-checked; confirm on the linked primary
source before quoting.

Reference for securing LLM applications: defending against prompt injection, implementing
guardrails, and mapping controls to the OWASP Top 10 for LLM Applications.

## OWASP Top 10 for LLM Applications

### 2025 list

Source: https://genai.owasp.org/llm-top-10/ (read 2026-10-05).

| ID | Risk | Key defence |
|---|---|---|
| LLM01:2025 | Prompt Injection | Input sanitization, delimiters, privilege separation |
| LLM02:2025 | Sensitive Information Disclosure | PII detection, redaction, output filtering |
| LLM03:2025 | Supply Chain | Verification, pinning, provenance |
| LLM04:2025 | Data and Model Poisoning | Data provenance, auditing |
| LLM05:2025 | Improper Output Handling | Output validation, sanitization |
| LLM06:2025 | Excessive Agency | Human-in-the-loop, least privilege |
| LLM07:2025 | System Prompt Leakage | Keep secrets out of prompts, enforce controls outside the model |
| LLM08:2025 | Vector and Embedding Weaknesses | Access control on retrieval, tenant isolation in vector stores |
| LLM09:2025 | Misinformation | Grounding, citations, confidence signals |
| LLM10:2025 | Unbounded Consumption | Rate limits, token caps, cost alerts |

### 2023 numbering (v1.1)

The defence notes below were written against the 2023 list, which OWASP still publishes for
reference at the same URL. Use the 2025 IDs above in new work.

| # | Vulnerability | Risk | Key defence |
|---|--------------|------|-------------|
| LLM01 | Prompt Injection | Critical | Input sanitization, delimiters |
| LLM02 | Insecure Output | High | Output validation, sanitization |
| LLM03 | Training Data Poisoning | High | Data provenance, auditing |
| LLM04 | Model DoS | Medium | Rate limiting, timeouts |
| LLM05 | Supply Chain | High | Verification, pinning |
| LLM06 | Sensitive Info Disclosure | High | PII detection, redaction |
| LLM07 | Insecure Plugin Design | High | Permission model, validation |
| LLM08 | Excessive Agency | High | Human-in-the-loop, least privilege |
| LLM09 | Overreliance | Medium | Confidence scores, citations |
| LLM10 | Model Theft | Medium | Rate limiting, watermarking |

### Prompt injection (LLM01)

**Attack types:**
- Direct: "Ignore previous instructions..."
- Indirect: Malicious content in RAG documents
- Encoding tricks: Unicode, special tokens

**Defence pattern:**
```
User Input → Sanitize → Delimit → LLM → Validate Output → Filter
```

### Insecure or improper output handling (2023 LLM02, 2025 LLM05)
- Never execute LLM output as code without validation
- Sanitize HTML (use allowlist)
- Validate SQL (SELECT only, table allowlist)

### Model denial of service (2023 LLM04, 2025 LLM10)
- Rate limiting per user/API key
- Token limits on requests
- Timeout configurations
- Cost capping/alerts

### Sensitive information disclosure (2023 LLM06, 2025 LLM02)
- PII detection (regex + NER)
- System prompt protection
- Training data sanitization
- Output filtering

**Code patterns:** `resources/security-patterns.py`

## PII protection

### Detection patterns
| Type | Example Pattern |
|------|-----------------|
| Email | `*@*.com` |
| Phone | `XXX-XXX-XXXX` |
| SSN | `XXX-XX-XXXX` |
| Credit Card | 16 digits |
| IP Address | `X.X.X.X` |

### Redaction strategy
1. Detect PII in input before LLM call
2. Redact PII in LLM output
3. Log without PII
4. Encrypt at rest

## Guardrails implementation

### NeMo Guardrails (NVIDIA)
```
define user express harmful intent
    "How do I hack"

define bot refuse harmful request
    "I can't help with that."

define flow harmful intent
    user express harmful intent
    bot refuse harmful request
```

### Guardrails AI
```python
guard = Guard().use_many(
    ToxicLanguage(on_fail="fix"),
    PIIFilter(on_fail="fix"),
    ValidJSON(on_fail="reask")
)
```

Validator names and the `use_many` API are as of 2026-01-06 [UNVERIFIED]; check
https://www.guardrailsai.com/docs before copying.

### Custom pipeline
```
Input Guards → LLM Call → Output Guards → Response
```

**Implementation:** `resources/security-patterns.py`

## Security architecture

### Defence in depth layers

| Layer | Controls |
|-------|----------|
| Network | WAF, DDoS protection, API gateway |
| Auth | OAuth 2.0, API keys, mTLS |
| Input | Schema validation, injection detection |
| Guardrails | Topic restrictions, PII filtering |
| Model | Versioning, anomaly detection |
| Output | Response filtering, fact verification |
| Audit | Logging, retention, compliance |

### Zero trust principles
- Never trust, always verify
- Least privilege for agents
- Assume breach (log everything)

## Compliance frameworks

### EU AI Act (high-risk systems)
Obligations as summarised on 2026-01-06 [UNVERIFIED]; primary source:
https://eur-lex.europa.eu/eli/reg/2024/1689/oj
- Risk management system
- Data governance
- Technical documentation
- Human oversight
- Accuracy/robustness testing

### SOC 2 for AI
Trust services criteria source: https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services
- Security: Access controls, encryption
- Availability: SLA monitoring, DR
- Processing Integrity: Input/output validation
- Confidentiality: Data classification
- Privacy: Data minimization, consent

## Security testing

### Red team categories
1. Direct injection attempts
2. Jailbreak prompts
3. Indirect injection via context
4. Encoding/unicode tricks

**Test suite:** `resources/security-patterns.py`

### Testing checklist
- [ ] Injection patterns blocked
- [ ] System prompt protected
- [ ] PII detected and redacted
- [ ] Rate limits enforced
- [ ] Outputs validated
- [ ] Audit logs complete

## Incident response

### Severity levels

| Incident | Severity | Response |
|----------|----------|----------|
| Prompt injection detected | Medium | Block, log, analyze |
| Data exfiltration attempt | High | Block, forensics, notify |
| Model extraction detected | High | Rate limit, investigate |

### Response steps
1. Contain (block source)
2. Preserve (logs, evidence)
3. Analyze (attack pattern)
4. Remediate (update defences)
5. Document (security log)

## Resources

- [OWASP Top 10 for LLM Applications](https://genai.owasp.org/llm-top-10/)
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
- [NeMo Guardrails](https://github.com/NVIDIA/NeMo-Guardrails)
- [Guardrails AI](https://github.com/guardrails-ai/guardrails)
- [LLM Security Best Practices](https://llmsecurity.net/)

## Changelog

- 1.2.0: frontmatter to agentskills.io spec, stale figures dated and sourced, OWASP 2025 list added beside the 2023 numbering the section previously mislabelled as 2025.
- 1.1.0: content as of 2026-01-06.
