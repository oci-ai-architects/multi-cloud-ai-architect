---
name: kubernetes-ai
description: Reference for running AI inference and training workloads on Kubernetes - NVIDIA GPU Operator, GPU and MIG resource requests, model serving with vLLM, Triton and TGI, Helm chart layout, HPA and KEDA autoscaling on GPU and queue metrics, ingress and network policy for inference, DCGM monitoring, and GPU node pools on EKS, AKS and OKE. Use when deploying a model server on Kubernetes, sizing or scheduling GPU nodes, autoscaling inference pods, or reviewing a Helm chart for an AI service. Trigger on "kubernetes", "k8s", "helm", "GPU node pool", "model serving", "vLLM on Kubernetes", "KEDA", "MIG". For provider-level agent runtime choices prefer the pack-* skills.
metadata:
  version: "1.2.0"
  asOf: "2026-10-05"
  contentAsOf: "2026-01-06"
  scope: reference
  resources: resources/manifests.yaml
---

# Kubernetes for AI workloads

Content as of 2026-01-06, written against Kubernetes 1.31 ([release notes](https://kubernetes.io/releases/), [UNVERIFIED] since). Instance types, GPU shapes, chart names and flags below were not re-checked on 2026-10-05; confirm on the linked primary source before quoting.

Deploying AI and ML workloads on Kubernetes with GPU scheduling, model serving frameworks and MLOps patterns.

## GPU Workload Scheduling

### NVIDIA GPU Operator
```bash
helm repo add nvidia https://helm.ngc.nvidia.com/nvidia
helm install gpu-operator nvidia/gpu-operator
```

### GPU Resource Requests

| Resource | Description |
|----------|-------------|
| `nvidia.com/gpu: N` | Request N GPUs |
| `nvidia.com/mig-3g.40gb: 1` | MIG slice |
| Node selector | `nvidia.com/gpu.product` |
| Toleration | `nvidia.com/gpu` |

**Full manifests:** `resources/manifests.yaml`

## Model Serving Frameworks

### Framework Comparison

| Framework | Best For | GPU Support | Scaling |
|-----------|----------|-------------|---------|
| **vLLM** | High-throughput LLMs | Excellent | HPA/KEDA |
| **Triton** | Multi-model serving | Excellent | HPA |
| **TGI** | HuggingFace models | Good | HPA |

### vLLM Deployment
Key configurations:
- `--tensor-parallel-size` - Multi-GPU inference
- `--max-model-len` - Context window
- `--gpu-memory-utilization` - Memory efficiency

### Triton Inference Server
- Multi-model serving from S3/GCS
- HTTP (8000), gRPC (8001), Metrics (8002)
- Model polling for dynamic updates

### Text Generation Inference (TGI)
- HuggingFace native
- Quantization support (`bitsandbytes-nf4`)
- Simple deployment

**Deployment manifests:** `resources/manifests.yaml`

## Helm Chart Pattern

```yaml
# values.yaml structure
inference:
  enabled: true
  replicas: 2
  framework: "vllm"  # vllm, tgi, triton
  resources:
    limits:
      nvidia.com/gpu: 1
  autoscaling:
    enabled: true
    minReplicas: 1
    maxReplicas: 10

vectorDB:
  enabled: true
  type: "qdrant"

monitoring:
  enabled: true
```

## Auto-Scaling

### Horizontal Pod Autoscaler (HPA)
Scale on:
- GPU utilization (`DCGM_FI_DEV_GPU_UTIL`)
- Inference queue length
- Custom metrics

### KEDA Event-Driven Scaling
Scale on:
- Prometheus metrics
- Message queue depth (RabbitMQ, SQS)
- Custom external metrics

**HPA/KEDA configs:** `resources/manifests.yaml`

## Networking

### Ingress Configuration
- Rate limiting (nginx annotations)
- TLS with cert-manager
- Large body size for AI payloads
- Extended timeouts (300s+)

### Network Policies
- Restrict pod-to-pod communication
- Allow only gateway → inference
- Permit DNS egress

## Monitoring

### Key Metrics
| Metric | Source | Purpose |
|--------|--------|---------|
| GPU Utilization | DCGM Exporter | Scaling |
| Inference Latency | Prometheus | SLO |
| Tokens/Second | Custom | Throughput |
| Queue Length | App metrics | Scaling |

### Setup
```bash
# Install DCGM Exporter
helm install dcgm-exporter nvidia/dcgm-exporter

# ServiceMonitor for Prometheus
# See resources/manifests.yaml
```

## Managed Kubernetes

Shapes and instance types as of 2026-01-06 [UNVERIFIED]. Sources: [EC2 accelerated computing](https://aws.amazon.com/ec2/instance-types/#Accelerated_Computing), [Azure GPU VM sizes](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/overview), [OCI GPU shapes](https://docs.oracle.com/en-us/iaas/Content/Compute/References/computeshapes.htm).

### AWS EKS
- Instance types: `g5.2xlarge`, `p4d.24xlarge`
- AMI: `AL2_x86_64_GPU`
- GPU taints for isolation

### Azure AKS
- VM sizes: `Standard_NC*`, `Standard_ND*`
- A100 support via `NC24ads_A100_v4`

### OCI OKE
- Shapes: `BM.GPU.A100-v2.8`, `VM.GPU.A10`
- GPU node pools with taints

**Terraform examples:** `../terraform-iac/resources/modules.tf`

## Best Practices

### Resource Management
- Always set GPU limits = requests
- Use node selectors for GPU types
- Implement tolerations for GPU taints
- PVC for model caching

### High Availability
- Multiple replicas across zones
- Pod disruption budgets
- Readiness/liveness probes

### Cost Optimization
- Spot instances for dev/test
- Auto-scaling to zero when idle
- Right-size GPU instances

## Resources

- [NVIDIA GPU Operator](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/)
- [vLLM Documentation](https://docs.vllm.ai/)
- [Triton Inference Server](https://github.com/triton-inference-server/server)
- [KEDA](https://keda.sh/)
- [Kubernetes GPU Scheduling](https://kubernetes.io/docs/tasks/manage-gpus/scheduling-gpus/)

## Changelog

- 1.2.0: frontmatter to agentskills.io spec, stale figures dated and sourced, closing tagline removed.
- 1.1.0: earlier content, dated 2026-01-06.
