# Multi-cloud pricing snapshot and cost strategies

Moved from SKILL.md on 2026-10-05. Every figure here is as of 2026-01-06 or earlier, marked
[UNVERIFIED], and was not re-read on a pricing page in this review. Several rows name models that
providers have since repriced or retired. Re-read the primary pages before quoting anything:

- AWS Bedrock: https://aws.amazon.com/bedrock/pricing/
- Azure OpenAI: https://azure.microsoft.com/pricing/details/cognitive-services/openai-service/
- Google Cloud Vertex AI: https://cloud.google.com/vertex-ai/generative-ai/pricing
- OCI Generative AI: https://www.oracle.com/artificial-intelligence/generative-ai/generative-ai-service/pricing/

## Pricing comparison (per 1M tokens, input / output)

As of 2026-01-06 [UNVERIFIED]. The OCI cells had no recorded source and are [OPEN].

| Model | AWS Bedrock | Azure OpenAI | GCP Vertex | OCI GenAI |
|-------|-------------|--------------|------------|-----------|
| GPT-4o | N/A | $5.00 in / $15 out | N/A | N/A |
| Claude 3.5 Sonnet | $3 / $15 | N/A | $3 / $15 | N/A |
| Llama 3.1 70B | $2.65 / $3.50 | $2.68 / $3.54 | $2.65 / $3.50 | [OPEN] |
| Command R+ | $3.00 / $15 | N/A | N/A | [OPEN]: on-demand or dedicated cluster pricing, see the OCI page above |

## Cost optimization strategies

### Reserved capacity planning

The discount percentages in the original table had no source and are removed. Each provider's
commitment page states the current terms.

| Cloud | Commitment type | Discount | Best for | Source |
|-------|-----------------|----------|----------|--------|
| Azure | PTU (provisioned throughput) | [OPEN] | Predictable GPT workloads | https://learn.microsoft.com/azure/ai-services/openai/concepts/provisioned-throughput |
| OCI | Dedicated AI cluster units | [OPEN] | High-volume private inference | https://docs.oracle.com/en-us/iaas/Content/generative-ai/ai-cluster.htm |
| AWS | Savings Plans, Bedrock provisioned throughput | [OPEN] | General compute, steady Bedrock load | https://aws.amazon.com/savingsplans/ |
| GCP | Committed use discounts, provisioned throughput | [OPEN] | Vertex AI workloads | https://cloud.google.com/vertex-ai/generative-ai/docs/provisioned-throughput |

### Egress cost reduction

The original snippet hard-coded per-GB egress rates with no source. The rates are now loaded from a
table you fill from the providers' data transfer pages (for example
https://aws.amazon.com/ec2/pricing/on-demand/ under "Data Transfer",
https://azure.microsoft.com/pricing/details/bandwidth/,
https://cloud.google.com/vpc/network-pricing and
https://www.oracle.com/cloud/networking/pricing/). Interconnect links such as OCI to Azure carry
their own terms: https://docs.oracle.com/en-us/iaas/Content/Network/Concepts/azure.htm.

```python
class EgressOptimizer:
    """Minimize cross-cloud data transfer costs"""

    def __init__(self, egress_costs_per_gb: dict):
        # Keys like "aws_to_azure"; values read from the pricing pages above, with the read date.
        self.egress_costs_per_gb = egress_costs_per_gb

    def rate(self, source: str, dest: str) -> float:
        key = f"{source}_to_{dest}"
        if key not in self.egress_costs_per_gb:
            raise KeyError(f"No sourced egress rate for {key}")
        return self.egress_costs_per_gb[key]

    def optimize_data_flow(self, source: str, dest: str, data_gb: float):
        direct_cost = self.rate(source, dest) * data_gb

        # Check if routing through another cloud is cheaper
        for intermediate in ["azure", "oci"]:
            if intermediate not in [source, dest]:
                try:
                    indirect_cost = (self.rate(source, intermediate) + self.rate(intermediate, dest)) * data_gb
                except KeyError:
                    continue
                if indirect_cost < direct_cost:
                    return {
                        "route": [source, intermediate, dest],
                        "cost": indirect_cost,
                        "savings": direct_cost - indirect_cost
                    }

        return {"route": [source, dest], "cost": direct_cost}
```
