---
name: finops-ai
description: Cost engineering for AI workloads - the cost stack of inference, infrastructure and development; per-query and monthly token cost calculation; model cascading to the cheapest capable model; GPU right-sizing from model memory; commitment break-even (provisioned throughput, savings plans, committed use, dedicated clusters); tagging, budget alerts and FinOps metrics; prompt, caching, batching and spot-instance tactics; multi-cloud cost arbitrage; and a FinOps maturity model. Use when estimating what an LLM feature will cost, choosing a model or GPU on cost grounds, deciding whether a capacity commitment pays off, or setting up cost visibility and alerts for AI spend. Trigger on "cost optimization", "FinOps", "AI costs", "GPU costs", "token pricing", "cost per query", "PTU break-even", "model cascade". Price figures live in each pack's prices.json with source and date; this skill's own 2026-01 price snapshot is in references/ and is not quotable.
metadata:
  version: "1.2.0"
  asOf: "2026-10-05"
  contentAsOf: "2026-01-06"
  scope: reference
---

# FinOps for AI workloads

Content as of 2026-01-06. Model names, prices, GPU rates and discount levels were not re-checked on 2026-10-05; confirm on the linked primary source before quoting. Current, sourced prices for the providers this repo designs for are in `skills/pack-*/prices.json`. The 2026-01 price snapshot this skill used to carry is kept, dated and sourced, in [references/pricing-snapshot.md](references/pricing-snapshot.md).

Financial operations (FinOps) for AI workloads: cost across model selection, infrastructure sizing, commitment strategies and multi-cloud cost management.

## AI cost components

### Cost breakdown framework

Share of spend per layer varies by workload; the 2026-01-06 text gave typical percentages with no source, so they are removed. Measure your own split from billing data tagged as described below.

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI WORKLOAD COST STACK                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  INFERENCE COSTS                                                │
│  ├── Token costs (input + output)                               │
│  ├── GPU compute time                                           │
│  └── API call overhead                                          │
│                                                                  │
│  INFRASTRUCTURE COSTS                                           │
│  ├── GPU/Compute instances                                      │
│  ├── Storage (models, vectors, data)                           │
│  ├── Networking (egress, load balancers)                       │
│  └── Supporting services (DBs, queues, caches)                 │
│                                                                  │
│  DEVELOPMENT COSTS                                              │
│  ├── Training/Fine-tuning compute                              │
│  ├── Experimentation                                           │
│  └── Development environments                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Token cost calculation

Cost per query is `(input_tokens / 1e6) * input_price + (output_tokens / 1e6) * output_price`, with prices per million tokens read from the provider's pricing page on the day of the estimate. Monthly cost multiplies by queries per day and days per month. A calculator class and the dated 2026-01 price table are in [references/pricing-snapshot.md](references/pricing-snapshot.md).

## Model selection for cost optimization

### Decision matrix

Model names as of 2026-01-06 [UNVERIFIED]. The 2026-01-06 text also gave a cost per 1K queries for each row with no source; that column is removed. Compute it from the token cost formula above with current prices.

```
┌─────────────────────────────────────────────────────────────────┐
│                MODEL SELECTION BY USE CASE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  TASK COMPLEXITY     │ MODEL TIER (2026-01 examples)                │
│  ────────────────────┼────────────────────────────────────────────  │
│  Simple Q&A          │ small: GPT-4o-mini, Claude Haiku             │
│  Classification      │ small: Claude Haiku, Gemini Flash            │
│  Summarization       │ small or mid: GPT-4o-mini, Claude Sonnet     │
│  RAG (retrieval)     │ mid: Claude Sonnet, GPT-4o-mini              │
│  Code generation     │ mid or large: Claude Sonnet, GPT-4o          │
│  Complex reasoning   │ large: GPT-4o, Claude Opus                   │
│  Agent tasks         │ mid or large: Claude Sonnet, GPT-4o          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Model cascading pattern

```python
class ModelCascade:
    """Route to cheapest model that can handle the task"""

    def __init__(self):
        # cost: input price per 1M tokens, read from each provider's pricing page
        # on the day you configure this (see references/pricing-snapshot.md for sources).
        # capability: a score from your own eval set, not a vendor benchmark.
        self.models = [
            {"name": "small-model", "cost": SMALL_INPUT_PRICE, "capability": SMALL_EVAL_SCORE},
            {"name": "mid-model", "cost": MID_INPUT_PRICE, "capability": MID_EVAL_SCORE},
            {"name": "large-model", "cost": LARGE_INPUT_PRICE, "capability": LARGE_EVAL_SCORE},
        ]

    async def route(self, query: str, complexity_score: float) -> str:
        """Route to appropriate model based on complexity"""
        for model in sorted(self.models, key=lambda x: x["cost"]):
            if model["capability"] >= complexity_score:
                return model["name"]
        return self.models[-1]["name"]  # Fallback to most capable

    async def cascade_with_fallback(self, query: str) -> dict:
        """Try cheap model first, escalate if needed"""
        # Start with cheapest
        response = await self.call_model("small-model", query)

        # Check confidence
        if response.confidence < 0.8:
            # Escalate to better model
            response = await self.call_model("mid-model", query)

        return response
```

## GPU cost optimization

GPU hourly rates per provider, as of 2026-01-06 with sources: [references/pricing-snapshot.md](references/pricing-snapshot.md). Read current rates before comparing.

### Right-sizing GPU workloads

GPU memory sizes are hardware specifications; model sizes are parameter count times bytes per parameter (2 for FP16), plus quantized estimates. The KV-cache and overhead allowances are rough planning values, not measurements.

```python
class GPUSizer:
    """Recommend GPU size based on model and workload"""

    GPU_MEMORY = {
        "A10G": 24,
        "L4": 24,
        "A100-40GB": 40,
        "A100-80GB": 80,
        "H100": 80,
    }

    MODEL_MEMORY = {
        # Model: (FP16 size GB, Quantized GB)
        "llama-3.1-8B": (16, 6),
        "llama-3.1-70B": (140, 42),
        "llama-3.1-405B": (810, 250),
        "mistral-7B": (14, 5),
        "mixtral-8x7B": (96, 32),
    }

    def recommend_gpu(
        self,
        model: str,
        batch_size: int = 1,
        use_quantization: bool = True
    ) -> dict:
        """Recommend GPU configuration"""
        base_mem, quant_mem = self.MODEL_MEMORY.get(model, (10, 4))
        model_mem = quant_mem if use_quantization else base_mem

        # Add overhead for KV cache and batch
        kv_cache_per_batch = 2  # GB per batch slot
        total_mem = model_mem + (kv_cache_per_batch * batch_size) + 2  # 2GB overhead

        # Find suitable GPU
        suitable_gpus = []
        for gpu, mem in self.GPU_MEMORY.items():
            if mem >= total_mem:
                suitable_gpus.append(gpu)

        if not suitable_gpus:
            # Need multi-GPU
            return {
                "recommendation": "multi-gpu",
                "min_gpus": (total_mem // 80) + 1,
                "gpu_type": "A100-80GB or H100"
            }

        return {
            "recommendation": suitable_gpus[0],
            "memory_required": f"{total_mem:.1f}GB",
            "batch_size": batch_size,
            "quantization": use_quantization
        }
```

## Commitment strategies

Commitment types: Azure provisioned throughput units (PTU), OCI dedicated AI clusters, AWS Savings Plans and Google Cloud committed use discounts. The discount levels the 2026-01-06 text quoted are dated and sourced in [references/pricing-snapshot.md](references/pricing-snapshot.md); read the current terms before modelling.

### Break-even analysis

```python
def commitment_breakeven(
    on_demand_monthly: float,
    committed_monthly: float,
    commitment_term_months: int,
    upfront_cost: float = 0
) -> dict:
    """Calculate break-even point for commitments"""

    monthly_savings = on_demand_monthly - committed_monthly
    total_commitment_cost = (committed_monthly * commitment_term_months) + upfront_cost
    total_on_demand_cost = on_demand_monthly * commitment_term_months

    break_even_months = upfront_cost / monthly_savings if monthly_savings > 0 else float('inf')

    return {
        "monthly_savings": f"${monthly_savings:.2f}",
        "total_savings": f"${total_on_demand_cost - total_commitment_cost:.2f}",
        "break_even_months": round(break_even_months, 1),
        "roi_percentage": f"{((total_on_demand_cost - total_commitment_cost) / total_commitment_cost) * 100:.1f}%"
    }

# Illustrative inputs only, not real PTU prices: substitute your measured
# pay-as-you-go spend and the provider's quoted commitment price.
commitment_breakeven(
    on_demand_monthly=5000,
    committed_monthly=3500,
    commitment_term_months=12,
    upfront_cost=0
)
# {'monthly_savings': '$1500.00', 'total_savings': '$18000.00', 'roi_percentage': '42.9%'}
```

## Cost monitoring and alerts

### Tagging strategy

```yaml
# Required tags for AI workloads
ai_cost_tags:
  mandatory:
    - project: "ai-platform"
    - environment: "prod/staging/dev"
    - cost_center: "engineering"
    - workload_type: "inference/training/embedding"
    - model: "gpt-4o/claude-3/llama-3"

  recommended:
    - team: "ml-platform"
    - owner: "email@company.com"
    - budget_code: "AI-2024-Q1"
```

### Budget alerts

Alert at a share of a monthly budget on actual spend and again on forecast spend, filtered by the AI project tag. A Terraform example for an AWS budget is in [references/cost-tooling.md](references/cost-tooling.md).

### Cost dashboard metrics

```python
FINOPS_METRICS = {
    # Cost metrics
    "cost_per_query": "Total cost / number of queries",
    "cost_per_token": "Total cost / tokens processed",
    "cost_per_user": "Total cost / active users",
    "cost_efficiency": "Output value / total cost",

    # Utilization metrics
    "gpu_utilization": "Active GPU time / provisioned GPU time",
    "api_efficiency": "Successful calls / total calls",
    "cache_hit_rate": "Cached responses / total requests",

    # Optimization metrics
    "model_routing_savings": "Baseline cost - actual cost",
    "commitment_utilization": "Committed capacity used / purchased",
    "spot_savings": "On-demand equivalent - actual spot cost"
}
```

## Cost optimization techniques

### 1. Prompt engineering for cost

```python
class CostAwarePrompting:
    """Optimize prompts for cost efficiency"""

    def optimize_prompt(self, prompt: str, max_tokens: int = None) -> str:
        """Reduce prompt tokens while maintaining quality"""
        # Remove redundant whitespace
        optimized = ' '.join(prompt.split())

        # Use abbreviations for common patterns
        optimized = optimized.replace("Please provide", "Provide")
        optimized = optimized.replace("I would like you to", "")
        optimized = optimized.replace("Can you please", "")

        return optimized

    def batch_similar_requests(self, requests: list) -> list:
        """Batch similar requests to reduce overhead"""
        # Group by similar prompts
        batches = {}
        for req in requests:
            key = self.get_prompt_signature(req)
            if key not in batches:
                batches[key] = []
            batches[key].append(req)

        return list(batches.values())
```

### 2. Caching strategy

```python
import hashlib
from functools import lru_cache

class SemanticCache:
    """Cache LLM responses by semantic similarity"""

    def __init__(self, similarity_threshold: float = 0.95):
        self.cache = {}
        self.threshold = similarity_threshold

    def get_cache_key(self, prompt: str) -> str:
        """Generate cache key from prompt"""
        return hashlib.sha256(prompt.encode()).hexdigest()

    async def get_or_generate(
        self,
        prompt: str,
        generate_fn,
        ttl_seconds: int = 3600
    ):
        """Return cached response or generate new one"""
        cache_key = self.get_cache_key(prompt)

        # Check exact match
        if cache_key in self.cache:
            return self.cache[cache_key]

        # Check semantic similarity
        similar = await self.find_similar(prompt)
        if similar:
            return similar

        # Generate new response
        response = await generate_fn(prompt)
        self.cache[cache_key] = response
        return response

    # Hit rate and savings depend on the workload: measure cache_hit_rate
    # (see FINOPS_METRICS) before claiming a saving.
```

### 3. Spot and preemptible instances

```python
class SpotInstanceStrategy:
    """Manage spot instances for AI workloads"""

    # Discount versus on-demand varies by region, instance and hour. Read it from
    # https://aws.amazon.com/ec2/spot/pricing/,
    # https://azure.microsoft.com/en-us/pricing/spot-advisor/ and
    # https://cloud.google.com/spot-vms/pricing on the day of the estimate.
    SPOT_SAVINGS = {
        "aws": AWS_SPOT_DISCOUNT,
        "azure": AZURE_SPOT_DISCOUNT,
        "gcp": GCP_SPOT_DISCOUNT,
    }

    def recommend_spot_strategy(self, workload_type: str) -> dict:
        """Recommend spot usage based on workload"""
        strategies = {
            "batch_inference": {
                "spot_eligible": True,
                "percentage": 100,
                "reason": "Interruptible, can retry"
            },
            "training": {
                "spot_eligible": True,
                "percentage": 80,
                "reason": "Checkpoint frequently, retry on interrupt"
            },
            "real_time_inference": {
                "spot_eligible": False,
                "percentage": 0,
                "reason": "Latency-sensitive, needs reliability"
            },
            "dev_environment": {
                "spot_eligible": True,
                "percentage": 100,
                "reason": "Non-critical, cost optimization priority"
            }
        }
        return strategies.get(workload_type, {"spot_eligible": False})
```

## Multi-cloud cost arbitrage

Route each task type to the cheapest provider that passes your eval for it, using prices loaded from a dated price file. Compare like for like: same model capability, same region, and egress included. A router sketch is in [references/cost-tooling.md](references/cost-tooling.md).

## FinOps maturity model

```
┌─────────────────────────────────────────────────────────────────┐
│                  AI FINOPS MATURITY LEVELS                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  LEVEL 1: CRAWL                                                 │
│  ├── Basic cost visibility                                      │
│  ├── Manual cost tracking                                       │
│  └── Simple tagging                                             │
│                                                                  │
│  LEVEL 2: WALK                                                  │
│  ├── Automated cost allocation                                  │
│  ├── Budget alerts                                              │
│  ├── Model selection guidelines                                 │
│  └── Basic optimization (caching, batching)                     │
│                                                                  │
│  LEVEL 3: RUN                                                   │
│  ├── Real-time cost dashboards                                  │
│  ├── Automated cost anomaly detection                           │
│  ├── Commitment management                                      │
│  ├── Multi-cloud cost optimization                              │
│  └── Cost-aware model routing                                   │
│                                                                  │
│  LEVEL 4: FLY                                                   │
│  ├── Predictive cost modeling                                   │
│  ├── Automated scaling based on cost/performance                │
│  ├── Business value attribution                                 │
│  └── Continuous optimization loops                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Resources

- [FinOps Foundation](https://www.finops.org/)
- [AWS Cost Management](https://aws.amazon.com/aws-cost-management/)
- [Azure Cost Management](https://azure.microsoft.com/en-us/products/cost-management)
- [GCP Cost Management](https://cloud.google.com/cost-management)
- [Anthropic Pricing](https://www.anthropic.com/pricing)
- [OpenAI Pricing](https://openai.com/pricing)
- [Google Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [Amazon Bedrock pricing](https://aws.amazon.com/bedrock/pricing/)

## Changelog

- 1.2.0: frontmatter to agentskills.io spec, price tables moved to references/pricing-snapshot.md with as-of date and primary sources, unsourced percentages, cost-per-query ranges and savings claims removed, hard-coded prices in code replaced with named placeholders.
- 1.1.0: earlier content, dated 2026-01-06.
