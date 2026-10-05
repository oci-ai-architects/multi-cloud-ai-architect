# Multi-cloud infrastructure, observability and security

Moved from SKILL.md on 2026-10-05. Content as of 2026-01-06. Model IDs, API versions and exporter names below were not re-checked; confirm on the provider docs listed in SKILL.md before copying.

## Terraform multi-cloud module

```hcl
# main.tf - Multi-Cloud AI Infrastructure

# AWS Bedrock
module "aws_ai" {
  source = "./modules/aws-bedrock"

  enabled_models = ["anthropic.claude-3-5-sonnet", "meta.llama3-70b-instruct"]
  vpc_id         = var.aws_vpc_id
}

# Azure OpenAI
module "azure_ai" {
  source = "./modules/azure-openai"

  resource_group = var.azure_rg
  deployments = {
    "gpt-4o" = {
      model   = "gpt-4o"
      version = "2024-05-13"
      sku     = "Standard"
    }
  }
}

# OCI GenAI
module "oci_ai" {
  source = "./modules/oci-genai"

  compartment_id   = var.oci_compartment
  dedicated_cluster = true
  cluster_units    = 10
}

# GCP Vertex AI
module "gcp_ai" {
  source = "./modules/gcp-vertex"

  project_id = var.gcp_project
  region     = "us-central1"
  endpoints  = ["gemini-pro", "claude-3-sonnet"]
}

# Unified API Gateway
module "ai_gateway" {
  source = "./modules/ai-gateway"

  providers = {
    aws   = module.aws_ai.endpoint
    azure = module.azure_ai.endpoint
    oci   = module.oci_ai.endpoint
    gcp   = module.gcp_ai.endpoint
  }

  routing_rules = {
    "gpt-*"     = "azure"
    "claude-*"  = "aws"
    "gemini-*"  = "gcp"
    "command-*" = "oci"
  }
}
```

## Monitoring multi-cloud AI

### Unified Observability

```yaml
# OpenTelemetry configuration for multi-cloud
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

processors:
  batch:
    timeout: 10s

exporters:
  # Send to each cloud's native monitoring
  awsxray:
    region: us-east-1
  azuremonitor:
    connection_string: ${AZURE_CONNECTION_STRING}
  googlecloud:
    project: ${GCP_PROJECT}
  oci_apm:
    data_key: ${OCI_APM_KEY}

  # Also send to central observability platform
  prometheus:
    endpoint: 0.0.0.0:8889

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [awsxray, azuremonitor, googlecloud, oci_apm]
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [prometheus]
```

### Key Multi-Cloud Metrics

```python
MULTI_CLOUD_METRICS = {
    # Availability
    "provider_availability": "Uptime per cloud provider",
    "failover_count": "Times failover was triggered",

    # Latency
    "cross_cloud_latency_p99": "99th percentile cross-cloud latency",
    "model_response_time_by_provider": "Response time per provider",

    # Cost
    "cost_per_request_by_provider": "Cost breakdown by cloud",
    "egress_cost_total": "Data transfer costs",

    # Quality
    "model_quality_score_by_provider": "Output quality metrics",
    "error_rate_by_provider": "Error rates per cloud",
}
```

## Security Across Clouds

### Unified Identity

```yaml
# Federated identity configuration
identity_federation:
  primary_idp: azure_ad
  federations:
    - aws:
        type: SAML
        role_mapping:
          AI_Engineer: arn:aws:iam::123:role/BedrockAccess
    - gcp:
        type: OIDC
        workload_identity_pool: ai-workloads
    - oci:
        type: SAML
        group_mapping:
          AI_Engineer: ocid1.group.oc1..xxx
```

### Cross-Cloud Secrets Management

```python
class MultiCloudSecrets:
    """Unified secrets access across clouds"""

    def __init__(self):
        self.backends = {
            "aws": AWSSecretsManager(),
            "azure": AzureKeyVault(),
            "gcp": GCPSecretManager(),
            "oci": OCIVault(),
        }

    def get_secret(self, name: str, cloud: str = None) -> str:
        """Get secret from appropriate cloud"""
        if cloud:
            return self.backends[cloud].get(name)

        # Try each cloud (for migration scenarios)
        for backend in self.backends.values():
            try:
                return backend.get(name)
            except SecretNotFound:
                continue
        raise SecretNotFound(name)
```
