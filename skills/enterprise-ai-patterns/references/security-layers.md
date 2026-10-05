# AI security layers

Moved from SKILL.md on 2026-10-05; content as of 2026-01-06.

## Pattern 5: AI security layers

### Defence in depth
```
┌─────────────────────────────────────────────────────────────────┐
│                   AI SECURITY LAYERS                             │
│                                                                  │
│  Layer 1: PERIMETER                                             │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ - API Gateway authentication                                 ││
│  │ - Rate limiting                                              ││
│  │ - IP allowlisting                                            ││
│  │ - WAF rules                                                  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Layer 2: INPUT VALIDATION                                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ - Prompt injection detection                                 ││
│  │ - Input sanitization                                         ││
│  │ - Length limits                                              ││
│  │ - Content filtering                                          ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Layer 3: MODEL SECURITY                                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ - Dedicated clusters (isolation)                             ││
│  │ - Content moderation                                         ││
│  │ - Output filtering                                           ││
│  │ - Guardrails                                                 ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Layer 4: DATA PROTECTION                                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ - Encryption at rest                                         ││
│  │ - Encryption in transit                                      ││
│  │ - PII detection/masking                                      ││
│  │ - Data residency controls                                    ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Layer 5: AUDIT & COMPLIANCE                                    │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ - Request/response logging                                   ││
│  │ - Access audit trail                                         ││
│  │ - Compliance reporting                                       ││
│  │ - Incident response                                          ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Prompt injection defence
```python
class PromptSanitizer:
    """Detect and mitigate prompt injection attacks."""

    INJECTION_PATTERNS = [
        r"ignore previous instructions",
        r"disregard .*instructions",
        r"you are now",
        r"new persona",
        r"system prompt",
        r"<\|.*\|>",  # Special tokens
    ]

    def sanitize(self, user_input: str) -> str:
        # 1. Check for known patterns
        for pattern in self.INJECTION_PATTERNS:
            if re.search(pattern, user_input, re.IGNORECASE):
                raise SecurityError("Potential prompt injection detected")

        # 2. Escape special characters
        sanitized = self.escape_special(user_input)

        # 3. Wrap in delimiters
        wrapped = f"<user_input>{sanitized}</user_input>"

        return wrapped

    def escape_special(self, text: str) -> str:
        """Escape characters that could be interpreted as instructions."""
        replacements = {
            "```": "'''",  # Code blocks
            "###": "---",  # Markdown headers
            "<|": "< |",   # Special tokens
            "|>": "| >",
        }
        for old, new in replacements.items():
            text = text.replace(old, new)
        return text
```
