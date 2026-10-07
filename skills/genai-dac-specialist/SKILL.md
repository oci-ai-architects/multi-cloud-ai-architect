---
name: genai-dac-specialist
description: Reference for Oracle Cloud Infrastructure (OCI) Generative AI dedicated AI clusters - hosting versus fine-tuning cluster types, choosing between dedicated and on-demand serving, cluster and endpoint configuration in Terraform, fine-tuning data preparation, monitoring alarms, IAM policies, troubleshooting and SDK or LangChain calls against a dedicated endpoint. Use when deciding whether an OCI workload needs a dedicated AI cluster, writing Terraform for a cluster or endpoint, preparing a fine-tuning dataset for OCI Generative AI, or debugging a dedicated endpoint. Trigger on "dedicated AI cluster", "DAC", "GenAI cluster", "OCI fine-tuning", "OCI model hosting", "generative-ai endpoint". Built on public OCI documentation; sizing and prices must be read from the current OCI pages.
metadata:
  version: "1.2.0"
  asOf: "2026-10-05"
  contentAsOf: "2026-01-06"
  scope: reference
---

# OCI Generative AI dedicated AI clusters

Content as of 2026-01-06. Model names, unit shapes, limits and prices below were not re-checked on 2026-10-05; confirm on the linked primary source before quoting. Primary docs: [Managing dedicated AI clusters](https://docs.oracle.com/en-us/iaas/Content/generative-ai/ai-cluster.htm) and [pretrained models](https://docs.oracle.com/en-us/iaas/Content/generative-ai/pretrained-models.htm). Built on public OCI documentation; no affiliation with Oracle is implied.

Dedicated AI clusters (DACs) in OCI Generative AI are private GPU clusters for hosting and fine-tuning large language models. This skill covers how to deploy, configure, size, operate and troubleshoot them.

## Scope

### Topics covered
- DAC architecture and cluster types (Hosting vs Fine-Tuning)
- Model selection (Cohere Command family, Meta Llama family)
- Cluster sizing and capacity planning
- Fine-tuning workflows and best practices
- Endpoint management (per-cluster endpoint limit: see the [cluster docs](https://docs.oracle.com/en-us/iaas/Content/generative-ai/ai-cluster.htm); the 2026-01-06 text said up to 50, [UNVERIFIED])
- Cost optimization strategies
- Production operations and monitoring
- Security and compliance configuration

### Tasks this skill supports
- Design DAC deployment architectures
- Size clusters based on workload requirements
- Plan fine-tuning strategies
- Configure endpoints for production
- Optimize costs across model selection
- Set up monitoring and alerting
- Troubleshoot common issues

## Decision Framework

### When to Use DACs vs On-Demand

**Use Dedicated AI Clusters when:**
```
- Data isolation required (private GPUs)
- Predictable, high-volume workloads
- Fine-tuning with proprietary data
- SLA requirements (guaranteed performance)
- Multi-model deployment (several endpoints on one cluster)
- Regulatory compliance needs
```

**Use On-Demand when:**
```
- Development and experimentation
- Low-volume, unpredictable usage
- Testing before production commitment
- Quick prototyping
```

### Model selection guide

As of 2026-01-06 [UNVERIFIED]. The model families on offer change; read the current list at https://docs.oracle.com/en-us/iaas/Content/generative-ai/pretrained-models.htm before recommending one.

```
┌─────────────────────────────────────────────────────────────────┐
│                     MODEL SELECTION MATRIX                       │
├──────────────────┬─────────────┬─────────────┬─────────────────┤
│ Use Case         │ Recommended │ Alternative │ Why             │
├──────────────────┼─────────────┼─────────────┼─────────────────┤
│ Complex reasoning│ Command R+  │ Llama 405B  │ Best reasoning  │
│ General chat     │ Command R   │ Llama 70B   │ Good balance    │
│ Simple tasks     │ Command     │ Llama 8B    │ Cost efficient  │
│ High volume      │ Command Light│ Llama 8B   │ Fast, cheap     │
│ Embeddings/RAG   │ Cohere Embed│ -           │ Purpose-built   │
│ Multi-modal      │ Llama 3.2   │ -           │ Vision support  │
└──────────────────┴─────────────┴─────────────┴─────────────────┘
```

## Cluster sizing

The 2026-01-06 version of this skill carried a traffic-to-units table and fine-tuning duration estimates with no source. They are removed.

### Hosting cluster sizing
```
Units needed per traffic level: [OPEN]
Settle with: the unit sizes and per-model throughput in
https://docs.oracle.com/en-us/iaas/Content/generative-ai/ai-cluster.htm
plus a load test against the workload's own prompt and completion lengths.
```

### Fine-tuning cluster sizing
```
Units and duration per dataset size: [OPEN]
Settle with: the fine-tuning unit requirements per base model in
https://docs.oracle.com/en-us/iaas/Content/generative-ai/fine-tuning.htm
and a timed run on a sample of the dataset.

Fine-tuning is a batch job; it is billed for the time the cluster runs.
```

## Terraform templates

Resource and argument names as of 2026-01-06 [UNVERIFIED]. Source: [OCI Terraform provider, generative_ai resources](https://registry.terraform.io/providers/oracle/oci/latest/docs/resources/generative_ai_dedicated_ai_cluster).

### Basic hosting cluster
```hcl
resource "oci_generative_ai_dedicated_ai_cluster" "hosting" {
  compartment_id = var.compartment_id
  type           = "HOSTING"

  unit_count     = var.hosting_units
  unit_shape     = var.model_family  # "LARGE_COHERE" or "LARGE_GENERIC"

  display_name   = "${var.project}-hosting-cluster"

  freeform_tags = {
    Environment = var.environment
    Project     = var.project
  }
}

resource "oci_generative_ai_endpoint" "primary" {
  compartment_id          = var.compartment_id
  dedicated_ai_cluster_id = oci_generative_ai_dedicated_ai_cluster.hosting.id
  model_id                = var.model_id

  display_name = "${var.project}-endpoint"

  content_moderation_config {
    is_enabled = var.enable_moderation
  }
}
```

### Fine-tuning workflow
```hcl
# Fine-tuning cluster
resource "oci_generative_ai_dedicated_ai_cluster" "finetuning" {
  compartment_id = var.compartment_id
  type           = "FINE_TUNING"

  unit_count     = 4
  unit_shape     = "LARGE_COHERE"

  display_name   = "${var.project}-finetuning-cluster"
}

# Training dataset in Object Storage
resource "oci_objectstorage_bucket" "training_data" {
  compartment_id = var.compartment_id
  namespace      = data.oci_objectstorage_namespace.ns.namespace
  name           = "${var.project}-training-data"

  access_type    = "NoPublicAccess"
}
```

## Fine-tuning practices

### Data preparation

Format as of 2026-01-06 [UNVERIFIED]; the accepted format depends on the base model. Source: https://docs.oracle.com/en-us/iaas/Content/generative-ai/fine-tuning.htm
```json
// training_data.jsonl format
{"prompt": "Your custom prompt here", "completion": "Expected response"}
{"prompt": "Another example", "completion": "Another response"}
```

### Quality guidelines
```
1. QUANTITY
   - Minimum and recommended example counts: [OPEN]; read the
     per-model requirements in the fine-tuning docs linked above
   - Quality of examples matters more than count

2. DIVERSITY
   - Cover all expected use cases
   - Include edge cases
   - Vary prompt styles

3. CONSISTENCY
   - Same format throughout
   - Consistent tone and style
   - Clear completion boundaries

4. VALIDATION
   - Hold out 10-20% for testing
   - Review samples manually
   - Test before full training
```

### Hyperparameter starting points

Illustrative starting values, not OCI defaults [UNVERIFIED]. The hyperparameters each base model accepts, and their defaults, are in https://docs.oracle.com/en-us/iaas/Content/generative-ai/fine-tuning.htm
```yaml
# Conservative (start here)
learning_rate: 0.0001
epochs: 3
batch_size: 8

# Aggressive (if underfitting)
learning_rate: 0.0003
epochs: 5
batch_size: 16

# Careful (if overfitting)
learning_rate: 0.00005
epochs: 2
batch_size: 4
```

## Monitoring and operations

### Key metrics
```
Latency Metrics:
- p50_latency_ms: Typical response time
- p95_latency_ms: Worst case (95th percentile)
- p99_latency_ms: Edge cases

Throughput Metrics:
- requests_per_second: Current load
- tokens_per_second: Processing rate
- queue_depth: Pending requests

Health Metrics:
- error_rate: Failed requests %
- cluster_utilization: GPU usage %
- endpoint_status: UP/DOWN
```

### OCI Monitoring alarms

Metric namespace and names as of 2026-01-06 [UNVERIFIED]. Source: [Generative AI metrics](https://docs.oracle.com/en-us/iaas/Content/generative-ai/metrics.htm).
```hcl
resource "oci_monitoring_alarm" "high_latency" {
  compartment_id = var.compartment_id
  display_name   = "GenAI-High-Latency"

  namespace      = "oci_generativeai"
  query          = "Latency[1m].p95() > 5000"

  severity       = "CRITICAL"
  message_format = "ONS_OPTIMIZED"

  destinations = [var.notification_topic_id]
}

resource "oci_monitoring_alarm" "high_error_rate" {
  compartment_id = var.compartment_id
  display_name   = "GenAI-High-Errors"

  namespace      = "oci_generativeai"
  query          = "ErrorRate[5m].mean() > 0.05"

  severity       = "WARNING"

  destinations = [var.notification_topic_id]
}
```

## Cost optimization

### Strategies
```
1. MODEL SELECTION
   - Use lighter models for simple tasks
   - Relative unit cost between models: [OPEN]; read
     https://www.oracle.com/artificial-intelligence/generative-ai/generative-ai-service/pricing/
   - Match model capability to task complexity

2. CLUSTER RIGHT-SIZING
   - Start small, scale based on actual usage
   - Monitor utilization before adding units
   - Consider time-of-day patterns

3. FINE-TUNING ROI
   - Fine-tuned smaller model often beats larger base
   - Train once, use many times
   - Calculate break-even point

4. ENDPOINT CONSOLIDATION
   - Share endpoints across similar workloads
   - Use the per-cluster endpoint allowance (limit in the cluster docs)
   - Avoid single-purpose clusters
```

### Cost estimation formula
```
Monthly hosting cost ≈ cluster units × unit price × hours
Monthly fine-tuning ≈ training units × unit price × training hours

Unit price: [OPEN]. Read it with a date from
https://www.oracle.com/artificial-intelligence/generative-ai/generative-ai-service/pricing/
```

## Troubleshooting

### Common issues

**Issue: high latency**
```
Causes:
- Cluster undersized for traffic
- Long prompts/completions
- Network issues

Solutions:
- Add cluster units
- Optimize prompt length
- Check VCN configuration
```

**Issue: fine-tuning fails**
```
Causes:
- Invalid training data format
- Insufficient examples
- Resource quota exceeded

Solutions:
- Validate JSONL format
- Add more training examples
- Request quota increase
```

**Issue: endpoint not responding**
```
Causes:
- Endpoint being created (takes time)
- Cluster maintenance
- IAM permission issues

Solutions:
- Wait for ACTIVE state
- Check cluster status
- Verify IAM policies
```

## IAM policies

Resource-type names as of 2026-01-06 [UNVERIFIED]. Source: [Generative AI IAM policies](https://docs.oracle.com/en-us/iaas/Content/generative-ai/iam-policies.htm).

### Required policies
```hcl
# GenAI Administrators
Allow group GenAI-Admins to manage generative-ai-family in compartment AI

# GenAI Users (inference only)
Allow group GenAI-Users to use generative-ai-endpoints in compartment AI

# Fine-Tuning Team
Allow group ML-Engineers to manage generative-ai-dedicated-ai-clusters in compartment AI
Allow group ML-Engineers to read objectstorage-objects in compartment Training-Data
```

## Integration examples

SDK classes and model IDs as of 2026-01-06 [UNVERIFIED]. Sources: [OCI Python SDK](https://docs.oracle.com/en-us/iaas/tools/python/latest/), [LangChain OCI integration](https://python.langchain.com/docs/integrations/llms/oci_generative_ai/).

### Python SDK
```python
import oci

config = oci.config.from_file()
client = oci.generative_ai_inference.GenerativeAiInferenceClient(config)

response = client.generate_text(
    generate_text_details=oci.generative_ai_inference.models.GenerateTextDetails(
        compartment_id=compartment_id,
        serving_mode=oci.generative_ai_inference.models.DedicatedServingMode(
            endpoint_id=endpoint_id
        ),
        inference_request=oci.generative_ai_inference.models.CohereLlmInferenceRequest(
            prompt="Explain quantum computing",
            max_tokens=500,
            temperature=0.7
        )
    )
)

print(response.data.inference_response.generated_texts[0].text)
```

### LangChain integration
```python
from langchain_community.llms import OCIGenAI

llm = OCIGenAI(
    model_id="cohere.command-r-plus",
    service_endpoint="https://inference.generativeai.us-chicago-1.oci.oraclecloud.com",
    compartment_id=compartment_id,
    provider="cohere",
    auth_type="API_KEY"
)

response = llm.invoke("What are best practices for cloud architecture?")
```

## Resources

- [OCI GenAI Overview](https://docs.oracle.com/en-us/iaas/Content/generative-ai/overview.htm)
- [Managing Dedicated AI Clusters](https://docs.oracle.com/en-us/iaas/Content/generative-ai/ai-cluster.htm)
- [Fine-Tuning Guide](https://docs.oracle.com/en-us/iaas/Content/generative-ai/fine-tuning.htm)
- [Model Limitations](https://docs.oracle.com/en-us/iaas/Content/generative-ai/limitations.htm)
- [Pricing](https://www.oracle.com/artificial-intelligence/generative-ai/generative-ai-service/pricing/)

## Changelog

- 1.2.0: frontmatter to agentskills.io spec, stale figures dated and sourced, unsourced sizing tables and cost ratios replaced with [OPEN], nominative non-affiliated framing.
- 1.1.0: earlier content, dated 2026-01-06.
