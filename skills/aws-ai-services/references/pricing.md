# Bedrock pricing and cost model

As of 2026-01-06 [UNVERIFIED]. Primary source: https://aws.amazon.com/bedrock/pricing/ (read it
before quoting any figure; prices vary by region and change without notice).


## Bedrock on-demand prices per 1K tokens (as of 2026-01-06)

| Model | Input | Output |
|-------|-------|--------|
| Claude 3.5 Sonnet | $0.003 | $0.015 |
| Claude 3 Haiku | $0.00025 | $0.00125 |
| Llama 3.1 70B | $0.00265 | $0.0035 |
| Titan Text Express | $0.0002 | $0.0006 |

## Cost optimization strategies

```python
class BedrockCostOptimizer:
    MODEL_COSTS = {
        "claude-3-5-sonnet": {"input": 0.003, "output": 0.015},
        "claude-3-haiku": {"input": 0.00025, "output": 0.00125},
        "llama-3-70b": {"input": 0.00265, "output": 0.0035},
    }

    def select_model(self, task_complexity: str, max_cost: float = None):
        """Select most cost-effective model for task"""
        if task_complexity == "simple":
            return "claude-3-haiku"  # Cheapest
        elif task_complexity == "moderate":
            return "llama-3-70b"  # Good balance
        else:
            return "claude-3-5-sonnet"  # Best capability

    def estimate_cost(self, model: str, input_tokens: int, output_tokens: int):
        costs = self.MODEL_COSTS[model]
        return (input_tokens * costs["input"] + output_tokens * costs["output"]) / 1000
```
