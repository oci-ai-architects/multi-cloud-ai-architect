---
name: multi-cloud-ai-architect
description: Cross-cloud patterns for model inference workloads spanning AWS Bedrock, Azure OpenAI, Google Cloud Vertex AI and Oracle Cloud Infrastructure (OCI) Generative AI - model-specific routing, failover between providers, the OCI-Azure interconnect, cost-tiered routing, a workload placement matrix, federated data and data residency, with a dated pricing snapshot, Terraform, observability and identity sketches in references/. Use when placing a model workload on one of several clouds, designing provider failover or routing behind one gateway, planning cross-cloud data residency, or estimating egress between clouds. Trigger on "multi-cloud", "cross-cloud", "hybrid cloud", "cloud agnostic", "OCI Azure interconnect", "model routing across providers", "LLM failover". Prefer architect-method for end-to-end agent system design and the pack-* skills for per-provider decisions; this skill holds the older cross-cloud patterns.
metadata:
  version: "1.2.0"
  asOf: "2026-10-05"
  contentAsOf: "2026-01-06"
  scope: reference
---

# Multi-cloud AI architecture patterns

Content as of 2026-01-06. Model names, model availability per cloud, SDK versions and prices below
were not re-checked on 2026-10-05; confirm them on the linked primary sources before quoting. This
skill uses provider documentation only and implies no affiliation with any provider.

Scope: AI systems that span AWS, Azure, Google Cloud and OCI, covering workload placement, use of
cloud-specific AI services, and cross-cloud patterns for resilience and cost.

## Cloud AI Services Comparison

### LLM/Foundation Model Services

As of 2026-01-06 [UNVERIFIED]. Model availability changes often; rebuild this matrix from the
catalogs before relying on it: AWS Bedrock (https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html),
Azure (https://learn.microsoft.com/azure/ai-foundry/concepts/foundry-models-overview),
Vertex AI Model Garden (https://cloud.google.com/vertex-ai/generative-ai/docs/model-garden/explore-models)
and OCI Generative AI (https://docs.oracle.com/en-us/iaas/Content/generative-ai/pretrained-models.htm).

| Feature | AWS Bedrock | Azure OpenAI | GCP Vertex AI | OCI GenAI |
|---------|-------------|--------------|---------------|-----------|
| **GPT-4/o models** | ❌ | ✅ | ❌ | ❌ |
| **Claude models** | ✅ | ❌ | ✅ | ❌ |
| **Llama models** | ✅ | ✅ | ✅ | ✅ |
| **Cohere models** | ✅ | ✅ | ❌ | ✅ |
| **Mistral models** | ✅ | ✅ | ✅ | ❌ |
| **Gemini** | ❌ | ❌ | ✅ | ❌ |
| **Private deployment** | Limited | ❌ | ❌ | ✅ DAC |
| **Fine-tuning** | Limited | ✅ | ✅ | ✅ |
| **Dedicated capacity** | ❌ | ✅ PTU | ❌ | ✅ DAC |

### Embedding & Vector Services

| Service | AWS | Azure | GCP | OCI |
|---------|-----|-------|-----|-----|
| **Vector DB** | OpenSearch | Cognitive Search | Vertex Vector | OCI Search |
| **Embeddings** | Titan, Cohere | Ada, Cohere | Gecko | Cohere |
| **Max dimensions** | [OPEN] | [OPEN] | [OPEN] | [OPEN] |

As of 2026-01-06 [UNVERIFIED]. The original dimension figures had no source and are removed; each
embedding model's page in the catalogs above states its output dimensions.

### Pricing

Per-token prices are not kept in this file. A dated snapshot with the primary pricing pages is in [pricing snapshot](references/pricing-snapshot.md); re-read those pages before quoting any figure.

## Multi-Cloud Architecture Patterns

### Pattern 1: Model-Specific Routing

Route requests to the best provider for each model type.

```
┌─────────────────────────────────────────────────────────────────┐
│                     AI GATEWAY (Multi-Cloud)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   User Request ──▶ [Model Router]                               │
│                         │                                        │
│         ┌───────────────┼───────────────┐                       │
│         ▼               ▼               ▼                       │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐                   │
│   │  Azure   │   │   AWS    │   │   OCI    │                   │
│   │ OpenAI   │   │ Bedrock  │   │  GenAI   │                   │
│   ├──────────┤   ├──────────┤   ├──────────┤                   │
│   │ GPT-4o   │   │ Claude   │   │ DAC      │                   │
│   │ GPT-4    │   │ Llama    │   │ Cohere   │                   │
│   │ Ada emb  │   │ Titan    │   │ Private  │                   │
│   └──────────┘   └──────────┘   └──────────┘                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Implementation** (model IDs as of 2026-01-06 [UNVERIFIED]; several are retired, check the catalogs above):
```python
class MultiCloudRouter:
    MODEL_ROUTING = {
        # OpenAI models → Azure
        "gpt-4o": "azure",
        "gpt-4-turbo": "azure",
        "gpt-3.5-turbo": "azure",

        # Claude models → AWS
        "claude-3-5-sonnet": "aws",
        "claude-3-opus": "aws",

        # Cohere private → OCI
        "command-r-plus-private": "oci",

        # Llama → lowest cost provider
        "llama-3-70b": "cost_optimize",
    }

    def route(self, model: str, request: dict) -> str:
        target = self.MODEL_ROUTING.get(model, "default")

        if target == "cost_optimize":
            return self.find_cheapest_provider(model, request)

        return target
```

### Pattern 2: Failover and Redundancy

```
┌─────────────────────────────────────────────────────────────────┐
│                     FAILOVER ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Request ──▶ [Primary: Azure OpenAI]                           │
│                    │                                             │
│                    ▼                                             │
│              ┌──────────┐                                        │
│              │  Health  │                                        │
│              │  Check   │                                        │
│              └──────────┘                                        │
│                    │                                             │
│         ┌─────────┴─────────┐                                   │
│         ▼                   ▼                                    │
│   [Healthy]            [Unhealthy/Throttled]                    │
│       │                      │                                   │
│       ▼                      ▼                                   │
│   Azure OpenAI         [Fallback: AWS Bedrock]                  │
│                              │                                   │
│                              ▼                                   │
│                        Claude 3.5 Sonnet                        │
│                        (Equivalent capability)                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Implementation**:
```python
class FailoverClient:
    def __init__(self):
        self.providers = {
            "azure": AzureOpenAIClient(),
            "aws": BedrockClient(),
            "oci": OCIGenAIClient(),
        }
        self.fallback_map = {
            "azure": ["aws", "oci"],
            "aws": ["azure", "oci"],
            "oci": ["aws", "azure"],
        }

    async def call_with_failover(self, primary: str, request: dict):
        providers_to_try = [primary] + self.fallback_map[primary]

        for provider in providers_to_try:
            try:
                return await self.providers[provider].call(request)
            except (RateLimitError, ServiceUnavailable) as e:
                logger.warning(f"{provider} failed: {e}, trying next")
                continue

        raise AllProvidersFailedError()
```

### Pattern 3: OCI-Azure Interconnect

Use FastConnect and ExpressRoute to link OCI and Azure in paired regions. Oracle's documentation
describes low-latency private connectivity between the two; the figure of under 2 ms carried here
since 2026-01-06 is [UNVERIFIED] and region-dependent. Source:
https://docs.oracle.com/en-us/iaas/Content/Network/Concepts/azure.htm.

```
┌─────────────────────────────────────────────────────────────────┐
│                    OCI-AZURE INTERCONNECT                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┐        ┌─────────────────────┐         │
│  │      AZURE          │        │        OCI          │         │
│  │                     │        │                     │         │
│  │  ┌───────────────┐  │        │  ┌───────────────┐  │         │
│  │  │ Azure OpenAI  │  │        │  │  GenAI DAC    │  │         │
│  │  │ (GPT-4)       │  │        │  │  (Cohere/     │  │         │
│  │  └───────────────┘  │        │  │   Llama)      │  │         │
│  │         │           │        │  └───────────────┘  │         │
│  │         │           │        │         │           │         │
│  │  ┌───────────────┐  │        │  ┌───────────────┐  │         │
│  │  │ ExpressRoute  │◀─┼──────▶─┼─▶│ FastConnect   │  │         │
│  │  │ Gateway       │  │ link   │  │ Gateway       │  │         │
│  │  └───────────────┘  │        │  └───────────────┘  │         │
│  │                     │        │                     │         │
│  │  ┌───────────────┐  │        │  ┌───────────────┐  │         │
│  │  │ Azure DB      │◀─┼──────▶─┼─▶│ Autonomous DB │  │         │
│  │  └───────────────┘  │ Data   │  └───────────────┘  │         │
│  │                     │ Sync   │                     │         │
│  └─────────────────────┘        └─────────────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Use Cases**:
- Azure enterprise apps + OCI AI (compliance)
- Burst to Azure OpenAI, baseline on OCI DAC
- Data residency in one cloud, AI in another

### Pattern 4: Cost-Optimized Hybrid

```python
class CostOptimizedRouter:
    """Route based on cost with quality constraints"""

    # Budget ceilings are example configuration values chosen by the operator, not provider prices.
    COST_TIERS = {
        # Tier 1: High capability, high cost
        "premium": {
            "models": ["gpt-4o", "claude-3-opus"],
            "max_cost_per_1k": 0.05,
        },
        # Tier 2: Good capability, moderate cost
        "standard": {
            "models": ["gpt-4-turbo", "claude-3-5-sonnet", "command-r-plus"],
            "max_cost_per_1k": 0.02,
        },
        # Tier 3: Basic capability, low cost
        "economy": {
            "models": ["llama-3-70b", "command-r", "mixtral-8x22b"],
            "max_cost_per_1k": 0.005,
        },
    }

    def route(self, request: dict, budget_tier: str = "standard") -> dict:
        tier = self.COST_TIERS[budget_tier]
        available_models = tier["models"]

        # Find cheapest provider for each model
        best_option = None
        best_cost = float('inf')

        for model in available_models:
            for provider in ["aws", "azure", "gcp", "oci"]:
                cost = self.get_cost(provider, model)
                if cost and cost < best_cost:
                    best_cost = cost
                    best_option = {"provider": provider, "model": model}

        return best_option
```

## Workload Placement Decision Matrix

```
┌─────────────────────────────────────────────────────────────────┐
│                 WORKLOAD PLACEMENT GUIDE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  REQUIREMENT          │ RECOMMENDED CLOUD                        │
│  ─────────────────────┼─────────────────────────────────────    │
│  Need GPT-4/GPT-4o    │ Azure OpenAI                            │
│  Need Claude          │ AWS Bedrock or GCP Vertex               │
│  Need Gemini          │ GCP Vertex AI                           │
│  Data sovereignty     │ OCI GenAI DAC (private GPUs)            │
│  Predictable costs    │ OCI DAC or Azure PTU                    │
│  Lowest latency       │ Regional deployment + edge              │
│  Fine-tuning needed   │ Azure OpenAI or OCI DAC                 │
│  Multi-model RAG      │ AWS Bedrock (most models)               │
│  Microsoft ecosystem  │ Azure                                   │
│  Oracle ecosystem     │ OCI                                     │
│  Google Workspace     │ GCP                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Cross-Cloud Data Architecture

### Federated Data Layer

```python
class FederatedDataLayer:
    """Access data across clouds for RAG/AI workloads"""

    def __init__(self):
        self.sources = {
            "aws_s3": S3Client(),
            "azure_blob": AzureBlobClient(),
            "gcp_gcs": GCSClient(),
            "oci_object": OCIObjectStorageClient(),
        }

    async def search_across_clouds(
        self,
        query: str,
        clouds: list = None
    ) -> list:
        """Federated search across cloud storage"""
        clouds = clouds or list(self.sources.keys())

        tasks = [
            self.search_cloud(cloud, query)
            for cloud in clouds
        ]

        results = await asyncio.gather(*tasks)
        return self.merge_and_rank(results)

    async def search_cloud(self, cloud: str, query: str) -> list:
        # Each cloud has its own vector index
        return await self.sources[cloud].vector_search(query)
```

### Data Residency Patterns

```yaml
# Configuration for data residency compliance
data_residency:
  eu_region:
    storage: azure_west_europe
    ai_inference: oci_frankfurt
    reason: "GDPR - data stays in EU"

  us_region:
    storage: aws_us_east_1
    ai_inference: aws_bedrock_us_east
    reason: "Low latency colocation"

  apac_region:
    storage: oci_tokyo
    ai_inference: oci_genai_osaka
    reason: "Japanese data residency laws"

cross_region_allowed:
  - Aggregated analytics (no PII)
  - Model training (anonymized)
```

## Terraform multi-cloud module

A sketch of one Terraform root that enables Bedrock, Azure OpenAI, OCI Generative AI and Vertex AI behind one gateway is in [infrastructure, observability and security](references/infra-observability-security.md#terraform-multi-cloud-module).

## Cost optimization strategies

Commitment types (Azure PTU, OCI DAC units, AWS Savings Plans, GCP committed use discounts) and an egress-aware routing sketch are in [pricing snapshot](references/pricing-snapshot.md#cost-optimization-strategies). Discount percentages and egress rates are left [OPEN] there until read from the providers' pages.

## Monitoring and security across clouds

An OpenTelemetry collector fanning out to each cloud's native monitoring, the key multi-cloud metrics, federated identity, and a cross-cloud secrets wrapper are in [infrastructure, observability and security](references/infra-observability-security.md#monitoring-multi-cloud-ai).

## Resources

- [OCI-Azure Interconnect](https://docs.oracle.com/en-us/iaas/Content/Network/Concepts/azure.htm)
- [AWS Bedrock Docs](https://docs.aws.amazon.com/bedrock/)
- [Azure OpenAI Docs](https://learn.microsoft.com/azure/ai-services/openai/)
- [GCP Vertex AI Docs](https://cloud.google.com/vertex-ai/docs)
- [Multi-Cloud Architecture Patterns](https://cloud.google.com/architecture/hybrid-and-multi-cloud-patterns-and-practices)

## Changelog

- 1.2.0: frontmatter to agentskills.io spec, stale figures dated and sourced or removed, pricing, Terraform, observability and security moved to references/.
- 1.1.0: updated for OCI-Azure Interconnect GA.
