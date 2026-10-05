# PTU sizing and Azure OpenAI pricing

As of 2026-01-06 [UNVERIFIED]. Primary sources:
https://azure.microsoft.com/pricing/details/cognitive-services/openai-service/ and
https://learn.microsoft.com/azure/ai-foundry/openai/concepts/provisioned-throughput.
Read both before quoting a price or sizing a deployment.

## When to use PTU
- Predictable, high-volume workloads
- Guaranteed performance requirements
- Cost optimization at scale

## PTU sizing

```python
# PTU capacity estimation
def estimate_ptus(
    requests_per_minute: int,
    avg_input_tokens: int,
    avg_output_tokens: int,
    model: str = "gpt-4o"
) -> int:
    """Estimate PTUs needed for workload"""

    # Tokens per minute per PTU differ by model and by input/output mix.
    # [OPEN] Fill from the provisioned throughput page or the Azure capacity calculator;
    # the earlier hard-coded per-model figures had no source and were removed.
    TPM_PER_PTU: dict[str, int] = {}

    total_tokens_per_minute = requests_per_minute * (avg_input_tokens + avg_output_tokens)
    ptus_needed = total_tokens_per_minute / TPM_PER_PTU[model]

    return max(1, int(ptus_needed * 1.2))  # 20% buffer

# Example: 100 RPM, 500 input tokens, 200 output tokens
estimate_ptus(100, 500, 200, "gpt-4o")  # Result depends on TPM_PER_PTU; [OPEN] until filled
```

## Azure OpenAI pay-as-you-go prices per 1K tokens (as of 2026-01-06)

| Model | Input | Output |
|-------|-------|--------|
| GPT-4o | $0.005 | $0.015 |
| GPT-4 Turbo | $0.01 | $0.03 |
| GPT-3.5 Turbo | $0.0005 | $0.0015 |
| text-embedding-3-large | $0.00013 | - |

## PTU pricing

- Hourly and reserved PTU prices: [OPEN]. The earlier hourly price and savings figures had no source
  and were removed; read the pricing page above.
- Commitment terms: [OPEN], see https://learn.microsoft.com/azure/ai-foundry/openai/concepts/provisioned-throughput
