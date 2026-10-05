# Price snapshot, January 2026

Moved from SKILL.md on 2026-10-05. Every figure here is as of 2026-01-06 or earlier and [UNVERIFIED]; do not quote it. Read the linked primary source and record the read date instead.

## LLM API prices

### API prices per 1M tokens

Recorded in this skill on or before 2026-01-06 [UNVERIFIED]; several models listed were already superseded by that date. Primary sources: [OpenAI](https://openai.com/api/pricing/), [Anthropic](https://www.anthropic.com/pricing), [Google Gemini API](https://ai.google.dev/gemini-api/docs/pricing), [Amazon Bedrock](https://aws.amazon.com/bedrock/pricing/), [Azure OpenAI](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/openai-service/), [OCI Generative AI](https://www.oracle.com/artificial-intelligence/generative-ai/generative-ai-service/pricing/).

| Provider | Model | Input | Output | Context |
|----------|-------|-------|--------|---------|
| **OpenAI** | GPT-4o | $2.50 | $10.00 | 128K |
| **OpenAI** | GPT-4o-mini | $0.15 | $0.60 | 128K |
| **OpenAI** | GPT-4 Turbo | $10.00 | $30.00 | 128K |
| **Anthropic** | Claude 3.5 Sonnet | $3.00 | $15.00 | 200K |
| **Anthropic** | Claude 3 Haiku | $0.25 | $1.25 | 200K |
| **Google** | Gemini 1.5 Pro | $1.25 | $5.00 | 1M |
| **Google** | Gemini 1.5 Flash | $0.075 | $0.30 | 1M |
| **AWS Bedrock** | Claude 3.5 Sonnet | $3.00 | $15.00 | 200K |
| **AWS Bedrock** | Llama 3.1 70B | $2.65 | $3.50 | 128K |
| **Azure OpenAI** | GPT-4o | $5.00 | $15.00 | 128K |
| **OCI GenAI** | Command R+ (DAC) | Included | Included | - |

### Cost per query estimation

The PRICING literals are the snapshot values from the table above (USD per 1M tokens, as of 2026-01-06, [UNVERIFIED]). Replace them with current prices before use.

```python
class LLMCostCalculator:
    PRICING = {
        "gpt-4o": {"input": 2.50, "output": 10.00},
        "gpt-4o-mini": {"input": 0.15, "output": 0.60},
        "claude-3-5-sonnet": {"input": 3.00, "output": 15.00},
        "claude-3-haiku": {"input": 0.25, "output": 1.25},
        "llama-3-70b": {"input": 2.65, "output": 3.50},
    }

    def calculate_query_cost(
        self,
        model: str,
        input_tokens: int,
        output_tokens: int
    ) -> float:
        """Calculate cost for a single query in dollars"""
        pricing = self.PRICING[model]
        input_cost = (input_tokens / 1_000_000) * pricing["input"]
        output_cost = (output_tokens / 1_000_000) * pricing["output"]
        return input_cost + output_cost

    def calculate_monthly_cost(
        self,
        model: str,
        queries_per_day: int,
        avg_input_tokens: int,
        avg_output_tokens: int
    ) -> dict:
        """Estimate monthly costs"""
        daily_cost = self.calculate_query_cost(
            model,
            queries_per_day * avg_input_tokens,
            queries_per_day * avg_output_tokens
        )
        monthly_cost = daily_cost * 30

        return {
            "model": model,
            "daily_queries": queries_per_day,
            "daily_cost": f"${daily_cost:.2f}",
            "monthly_cost": f"${monthly_cost:.2f}",
            "annual_cost": f"${monthly_cost * 12:.2f}"
        }

# Example
calc = LLMCostCalculator()

# RAG chatbot: 10K queries/day, 2000 input tokens, 500 output tokens.
# Run it rather than quoting a remembered result; the 2026-01-06 text carried
# outputs for this example that did not match the formula, so they are removed.
calc.calculate_monthly_cost("gpt-4o", 10000, 2000, 500)
calc.calculate_monthly_cost("claude-3-haiku", 10000, 2000, 500)
```


## GPU hourly rates

Recorded in this skill on or before 2026-01-06 [UNVERIFIED]. Monthly is hourly times 720. Rows mix per-GPU and per-instance figures (for example the AWS H100 row lists one GPU's rate against a full instance's vCPU and memory), so compare only after re-reading the source. Primary sources: [AWS EC2 on-demand](https://aws.amazon.com/ec2/pricing/on-demand/), [Azure virtual machines](https://azure.microsoft.com/en-us/pricing/details/virtual-machines/linux/), [Google Cloud GPU pricing](https://cloud.google.com/compute/gpus-pricing), [OCI compute pricing](https://www.oracle.com/cloud/compute/pricing/), [Lambda](https://lambda.ai/pricing), [RunPod](https://www.runpod.io/pricing).

| Provider | GPU | vCPU | Memory | Hourly | Monthly |
|----------|-----|------|--------|--------|---------|
| **AWS** | A10G | 4 | 24GB | $1.21 | $870 |
| **AWS** | A100 40GB | 12 | 192GB | $3.67 | $2,640 |
| **AWS** | H100 | 192 | 2TB | $12.36 | $8,900 |
| **Azure** | A10 | 6 | 112GB | $1.14 | $820 |
| **Azure** | A100 80GB | 24 | 220GB | $3.40 | $2,450 |
| **GCP** | A100 40GB | 12 | 85GB | $3.67 | $2,640 |
| **OCI** | A10 | 15 | 240GB | $1.00 | $720 |
| **Lambda** | A100 | 30 | 200GB | $1.29 | $930 |
| **RunPod** | A100 | - | 80GB | $1.89 | $1,360 |


## Commitment discounts

Recorded in this skill on or before 2026-01-06 [UNVERIFIED]. Primary sources: [Azure provisioned throughput](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/provisioned-throughput), [OCI dedicated AI clusters](https://docs.oracle.com/en-us/iaas/Content/generative-ai/ai-cluster.htm), [AWS Savings Plans](https://aws.amazon.com/savingsplans/compute-pricing/), [Google Cloud committed use discounts](https://cloud.google.com/compute/docs/instances/committed-use-discounts-overview).

| Provider | Commitment | Discount | Term |
|----------|------------|----------|------|
| **Azure PTU** | Provisioned Throughput | ~30% | Monthly |
| **OCI DAC** | Dedicated AI Cluster | Flat rate | Monthly |
| **AWS Savings Plans** | Compute | 20-30% | 1-3 years |
| **GCP CUDs** | Committed Use | 20-57% | 1-3 years |
