---
name: terraform-iac
description: Reference for Terraform infrastructure as code for AI workloads on AWS, Azure, Google Cloud and OCI - module layout, Bedrock, Azure OpenAI and OCI Generative AI modules, vector stores, multi-cloud environments, remote state and locking, variable validation, sensitive values, tagging, CI plan and apply, and GPU node pools on EKS, AKS and OKE. Use when writing or reviewing Terraform for model endpoints, dedicated AI clusters, knowledge bases, private endpoints or GPU Kubernetes nodes, when structuring a multi-cloud Terraform repository, or when setting up plan-on-PR and apply-on-merge pipelines. Trigger on "terraform", "infrastructure as code", "IaC", "provisioning", "tfstate", "Terraform module", "OCI Resource Manager". Agents in this repository design and review IaC; they do not run apply (provisioning is a human gate).
metadata:
  version: "1.2.0"
  asOf: "2026-10-05"
  contentAsOf: "2026-01-06"
  scope: reference
  resources: resources/modules.tf
---

# Terraform for AI infrastructure

Content as of 2026-01-06. Terraform and provider versions, model names, instance types and GPU
shapes below were not re-checked on 2026-10-05; confirm on the linked primary source before
quoting. The skill was written against Terraform 1.10 or later [UNVERIFIED]; current releases are
at https://developer.hashicorp.com/terraform/install, provider versions on the Terraform Registry
pages listed under Resources.

Terraform and infrastructure as code for deploying AI infrastructure across clouds. Running
`terraform apply` against a real account provisions and spends; treat it as a human gate.

## Project structure

```
infrastructure/
├── modules/
│   ├── aws-bedrock/
│   ├── azure-openai/
│   ├── oci-genai/
│   └── vector-store/
├── environments/
│   ├── dev/
│   ├── staging/
│   └── prod/
├── shared/
│   ├── networking/
│   └── security/
└── scripts/
```

## Module overview

| Module | Provider | Purpose |
|--------|----------|---------|
| `aws-bedrock` | AWS | Bedrock, Knowledge Bases, VPC Endpoints |
| `azure-openai` | Azure | Azure OpenAI, AI Search, Private Endpoints |
| `oci-genai` | OCI | DACs, Endpoints, Agents, Knowledge Bases |
| `vector-store` | Multi | OpenSearch Serverless, Qdrant, Milvus |

**Full module code:** `resources/modules.tf`

## AWS AI infrastructure

### Bedrock module
```hcl
module "aws_ai" {
  source = "./modules/aws-bedrock"

  prefix             = "prod"
  region             = "us-east-1"
  vpc_id             = data.aws_vpc.main.id
  private_subnet_ids = data.aws_subnets.private.ids

  enable_private_endpoint = true
  create_knowledge_base   = true
}
```

### Key resources
- IAM roles for Bedrock access
- VPC endpoints for private connectivity
- Knowledge bases with OpenSearch

## Azure AI infrastructure

### Azure OpenAI module
```hcl
module "azure_ai" {
  source = "./modules/azure-openai"

  openai_name         = "prod-openai"
  location            = "eastus"
  resource_group_name = azurerm_resource_group.ai.name

  gpt4o_capacity      = 100  # capacity units; model name and unit semantics as of 2026-01-06 [UNVERIFIED]
  embedding_capacity  = 50

  enable_private_endpoint = true
}
```

### Key resources
- Cognitive Account (OpenAI kind)
- Model deployments (chat and embedding models; current list at https://learn.microsoft.com/en-us/azure/ai-foundry/openai/concepts/models)
- Private endpoints
- Azure AI Search

## OCI AI infrastructure

### GenAI module
```hcl
module "oci_ai" {
  source = "./modules/oci-genai"

  prefix         = "prod"
  compartment_id = var.oci_compartment_id
  cluster_type   = "HOSTING"
  unit_count     = 10
  unit_shape     = "LARGE_COHERE"  # shape name as of 2026-01-06 [UNVERIFIED]; see the oci_generative_ai_dedicated_ai_cluster resource docs

  create_agent          = true
  create_knowledge_base = true
}
```

### Key resources
- Dedicated AI Clusters (DAC)
- Model endpoints
- GenAI Agents
- Knowledge bases

## Vector store infrastructure

### OpenSearch Serverless (AWS)
```hcl
module "vectors" {
  source = "./modules/vector-store/aws-opensearch"

  prefix           = "prod"
  vpc_endpoint_ids = [aws_vpc_endpoint.opensearch.id]
  allowed_principals = [aws_iam_role.bedrock.arn]
}
```

## Multi-cloud environment

```hcl
# environments/prod/main.tf

terraform {
  backend "s3" {
    bucket = "terraform-state-ai-infra"
    key    = "prod/terraform.tfstate"
    encrypt = true
  }
}

provider "aws" { region = var.aws_region }
provider "azurerm" { features {} }
provider "oci" { ... }

# Deploy to all clouds
module "aws_ai" { source = "../../modules/aws-bedrock" ... }
module "azure_ai" { source = "../../modules/azure-openai" ... }
module "oci_ai" { source = "../../modules/oci-genai" ... }
```

## Best practices

### State management
- Remote state (S3, Azure Blob, OCI Object Storage)
- State locking (DynamoDB, Cosmos DB)
- Encrypt state at rest
- Separate state per environment

### Variable validation
```hcl
variable "environment" {
  type = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}
```

### Sensitive data
- Use `sensitive = true` for outputs
- Reference secrets from secret managers
- Never commit `.tfvars` with secrets

### Tagging
```hcl
default_tags {
  tags = {
    Environment = var.environment
    Project     = "ai-platform"
    ManagedBy   = "terraform"
  }
}
```

## CI/CD integration

### GitHub Actions
```yaml
- uses: hashicorp/setup-terraform@v3   # action version as of 2026-01-06; see https://github.com/hashicorp/setup-terraform
- run: terraform init
- run: terraform plan -out=tfplan
- run: terraform apply -auto-approve tfplan
  if: github.ref == 'refs/heads/main'
```

### Key patterns
- Plan on PR, apply on merge
- Use workspaces or directories for environments
- Lock state during apply
- Store plan artifacts

## Managed Kubernetes GPU

Instance types, VM sizes and shapes below are examples as of 2026-01-06 [UNVERIFIED]. Check
availability per region: AWS EC2 accelerated instances (https://aws.amazon.com/ec2/instance-types/),
Azure GPU VM sizes (https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/overview), OCI
GPU shapes (https://docs.oracle.com/en-us/iaas/Content/Compute/References/computeshapes.htm).

### EKS GPU nodes
```hcl
eks_managed_node_groups = {
  gpu = {
    instance_types = ["g5.2xlarge"]
    ami_type = "AL2_x86_64_GPU"
    taints = [{ key = "nvidia.com/gpu" ... }]
  }
}
```

### AKS GPU nodes
```hcl
resource "azurerm_kubernetes_cluster_node_pool" "gpu" {
  vm_size = "Standard_NC24ads_A100_v4"
  node_taints = ["nvidia.com/gpu=true:NoSchedule"]
}
```

### OKE GPU nodes
```hcl
resource "oci_containerengine_node_pool" "gpu" {
  node_shape = "BM.GPU.A100-v2.8"
}
```

**Full examples:** `resources/modules.tf`

## Resources

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest)
- [Terraform Azure Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest)
- [Terraform OCI Provider](https://registry.terraform.io/providers/oracle/oci/latest)
- [Terraform Google Provider](https://registry.terraform.io/providers/hashicorp/google/latest)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)

## Changelog

- 1.2.0: frontmatter to agentskills.io spec, stale figures dated and sourced, nominative non-affiliated wording; versions, model names and GPU shapes dated with source links
- 1.1.0: 2026 refresh against Terraform 1.10 (content as of 2026-01-06)
