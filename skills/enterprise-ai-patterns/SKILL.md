---
name: enterprise-ai-patterns
description: Architecture patterns for running AI systems in production at organisational scale - an AI gateway for auth, rate limiting, routing, caching and fallback across providers; a model registry with lifecycle states and approval workflow; an observability stack with latency, throughput, quality and cost metrics; prompts managed as versioned, tested code; layered AI security including prompt-injection defence; AI cost governance; multi-region resilience; and a phased implementation checklist. Use when designing the shared platform layer around LLM applications, reviewing an architecture for governance or operability gaps, or planning an AI platform rollout in phases. Trigger on "enterprise AI", "production AI", "AI governance", "AI at scale", "AI gateway", "model registry", "prompt management", "AI platform". For a full agent design method prefer architect-method.
metadata:
  version: "1.2.0"
  asOf: "2026-10-05"
  contentAsOf: "2026-01-06"
  scope: reference
---

# Enterprise AI patterns

Content as of 2026-01-06. Provider and model names in the examples below were not re-checked on 2026-10-05; confirm on the provider's model page before quoting.

Patterns for AI systems that are secure, scalable, governable and operable. Deep sections live in references: [prompt management](references/prompt-management.md) and [security layers and prompt-injection defence](references/security-layers.md).

## Architecture principles

### The five pillars
```
┌─────────────────────────────────────────────────────────────────┐
│                  ENTERPRISE AI PILLARS                           │
│                                                                  │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐       │
│  │ SECURITY  │ │ GOVERNANCE│ │ SCALE     │ │ OPERATIONS│       │
│  │           │ │           │ │           │ │           │       │
│  │ - IAM     │ │ - Policies│ │ - Auto    │ │ - Monitor │       │
│  │ - Encrypt │ │ - Audit   │ │ - Distrib │ │ - Alert   │       │
│  │ - Network │ │ - Lineage │ │ - Multi-  │ │ - Incident│       │
│  │ - Data    │ │ - Quality │ │   region  │ │ - SRE     │       │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘       │
│                                                                  │
│                     ┌───────────┐                               │
│                     │   COST    │                               │
│                     │           │                               │
│                     │ - FinOps  │                               │
│                     │ - Optimize│                               │
│                     │ - Budget  │                               │
│                     └───────────┘                               │
└─────────────────────────────────────────────────────────────────┘
```

## Pattern 1: AI gateway architecture

### Purpose
Centralized entry point for all AI services with security, routing, and observability.

### Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                      AI GATEWAY PATTERN                          │
│                                                                  │
│   Applications                                                  │
│   ┌────────┐ ┌────────┐ ┌────────┐                             │
│   │ App A  │ │ App B  │ │ App C  │                             │
│   └───┬────┘ └───┬────┘ └───┬────┘                             │
│       │          │          │                                   │
│       └──────────┼──────────┘                                   │
│                  │                                               │
│          ┌───────▼───────┐                                      │
│          │  AI GATEWAY   │                                      │
│          │               │                                      │
│          │ - AuthN/AuthZ │                                      │
│          │ - Rate Limit  │                                      │
│          │ - Routing     │                                      │
│          │ - Logging     │                                      │
│          │ - Caching     │                                      │
│          │ - Fallback    │                                      │
│          └───────┬───────┘                                      │
│                  │                                               │
│    ┌─────────────┼─────────────┐                                │
│    │             │             │                                │
│    ▼             ▼             ▼                                │
│ ┌──────┐    ┌──────┐    ┌──────┐                               │
│ │ OCI  │    │Azure │    │ AWS  │                               │
│ │GenAI │    │OpenAI│    │Bedrock│                              │
│ └──────┘    └──────┘    └──────┘                               │
└─────────────────────────────────────────────────────────────────┘
```

### Implementation
```python
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import time
import logging

app = FastAPI()

class AIGateway:
    def __init__(self):
        self.providers = {
            "oci": OCIGenAIProvider(),
            "azure": AzureOpenAIProvider(),
            "aws": AWSBedrockProvider()
        }
        self.rate_limiter = RateLimiter()
        self.cache = ResponseCache()
        self.logger = logging.getLogger("ai_gateway")

    async def route_request(self, request: AIRequest) -> AIResponse:
        # 1. Rate limiting
        if not self.rate_limiter.allow(request.user_id):
            raise HTTPException(429, "Rate limit exceeded")

        # 2. Check cache
        cached = self.cache.get(request)
        if cached:
            return cached

        # 3. Route to provider
        provider = self.select_provider(request)

        # 4. Execute with fallback
        try:
            response = await provider.generate(request)
        except ProviderError:
            response = await self.fallback(request)

        # 5. Cache and log
        self.cache.set(request, response)
        self.log_request(request, response)

        return response

    def select_provider(self, request: AIRequest) -> Provider:
        """Route based on model preference or cost."""
        if request.model.startswith("gpt"):
            return self.providers["azure"]
        elif request.model.startswith("claude"):
            return self.providers["aws"]
        else:
            return self.providers["oci"]  # Default to OCI
```

## Pattern 2: Model registry and governance

### Purpose
Central catalog of approved AI models with versioning, lineage, and access control.

### Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                    MODEL REGISTRY PATTERN                        │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   MODEL REGISTRY                            │ │
│  │                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │  │  Model A    │  │  Model B    │  │  Model C    │        │ │
│  │  │  v1.0, v1.1 │  │  v2.0       │  │  v1.0       │        │ │
│  │  │             │  │             │  │             │        │ │
│  │  │ Status:     │  │ Status:     │  │ Status:     │        │ │
│  │  │ PRODUCTION  │  │ STAGING     │  │ DEPRECATED  │        │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  │                                                             │ │
│  │  Metadata:                                                  │ │
│  │  - Owner, Team                                             │ │
│  │  - Training data lineage                                   │ │
│  │  - Performance metrics                                     │ │
│  │  - Approval status                                         │ │
│  │  - Access permissions                                      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Governance:                                                    │
│  ├── Approval workflow (ML → Security → Legal → Deploy)        │
│  ├── Version control (immutable versions)                      │
│  ├── Access control (who can use which models)                 │
│  └── Audit trail (all model operations logged)                 │
└─────────────────────────────────────────────────────────────────┘
```

### Model lifecycle
```yaml
Model States:
  DEVELOPMENT:
    - In active development
    - Not for production use
    - Access: ML team only

  STAGING:
    - Ready for testing
    - Pending approval
    - Access: QA, stakeholders

  APPROVED:
    - Passed all reviews
    - Ready for production
    - Access: Applications

  PRODUCTION:
    - Actively serving traffic
    - Monitored
    - Access: Production systems

  DEPRECATED:
    - Scheduled for removal
    - New uses blocked
    - Existing uses grandfathered

  ARCHIVED:
    - Removed from service
    - Retained for audit
    - No access
```

## Pattern 3: AI observability stack

### Purpose
Full visibility into AI system health, performance, and behavior.

### Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                   AI OBSERVABILITY STACK                         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                      DASHBOARDS                              ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   ││
│  │  │ Latency  │  │Throughput│  │  Errors  │  │  Cost    │   ││
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                       ALERTING                               ││
│  │  - Latency > threshold                                       ││
│  │  - Error rate spike                                          ││
│  │  - Cost anomaly                                              ││
│  │  - Model drift detected                                      ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                      DATA LAYER                              ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                  ││
│  │  │ Metrics  │  │  Logs    │  │ Traces   │                  ││
│  │  │ (Prom)   │  │ (Loki)   │  │ (Jaeger) │                  ││
│  │  └──────────┘  └──────────┘  └──────────┘                  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Instrumentation:                                               │
│  - Request/response logging                                     │
│  - Token usage tracking                                         │
│  - Latency breakdown                                            │
│  - Error classification                                         │
│  - User feedback signals                                        │
└─────────────────────────────────────────────────────────────────┘
```

### Key metrics
```yaml
Latency Metrics:
  - p50_latency_ms: Typical response time
  - p95_latency_ms: Worst case common
  - p99_latency_ms: Edge cases
  - time_to_first_token: Streaming starts

Throughput Metrics:
  - requests_per_second: Current load
  - tokens_per_second: Processing rate
  - concurrent_requests: Active requests
  - queue_depth: Waiting requests

Quality Metrics:
  - error_rate: Failed requests %
  - hallucination_rate: Detected hallucinations
  - user_feedback_score: Thumbs up/down ratio
  - retrieval_relevance: RAG quality score

Cost Metrics:
  - tokens_consumed: Input + output
  - cost_per_request: Avg cost
  - daily_spend: Total cost
  - cost_by_application: Breakdown
```

## Pattern 4: Prompt management system

Version-controlled, tested and deployed prompts as code: a prompt repository with versioned system prompts, examples and tests, promoted through commit, test, review, stage and deploy. Repository layout, pipeline and a prompt template with test assertions: [references/prompt-management.md](references/prompt-management.md).

## Pattern 5: AI security layers

Defence in depth across five layers: perimeter, input validation, model security, data protection, and audit and compliance. Layer diagram and a prompt-injection sanitizer example: [references/security-layers.md](references/security-layers.md). Pattern matching alone does not stop prompt injection; pair it with privilege separation and output filtering (see the ai-security-expert skill).

## Pattern 6: Cost management

### FinOps for AI
```
┌─────────────────────────────────────────────────────────────────┐
│                    AI FINOPS FRAMEWORK                           │
│                                                                  │
│  VISIBILITY                                                     │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ - Cost by application/team                                   ││
│  │ - Cost by model                                              ││
│  │ - Token usage trends                                         ││
│  │ - Unit economics (cost per conversation)                     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  OPTIMIZATION                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ - Model right-sizing (use smaller when sufficient)           ││
│  │ - Caching (avoid redundant calls)                            ││
│  │ - Batching (combine requests)                                ││
│  │ - Reserved capacity (commit for discounts)                   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  GOVERNANCE                                                     │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ - Budget alerts by team                                      ││
│  │ - Spend caps per application                                 ││
│  │ - Chargeback/showback                                        ││
│  │ - Approval for expensive models                              ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Cost optimization strategies
```yaml
Strategy 1: MODEL TIERING
  - Route simple queries to cheaper models
  - Reserve expensive models for complex tasks
  - Example: a small model for FAQ, a larger model for analysis
    (the 2026-01-06 text named Cohere Command Light and Command R+;
    current OCI models: https://docs.oracle.com/en-us/iaas/Content/generative-ai/pretrained-models.htm)

Strategy 2: CACHING
  - Cache identical queries
  - Semantic caching (similar queries)
  - Cache embeddings
  - TTL based on content freshness

Strategy 3: PROMPT OPTIMIZATION
  - Shorter prompts = fewer input tokens
  - Efficient few-shot examples
  - Remove unnecessary context

Strategy 4: BATCHING
  - Combine multiple small requests
  - Process in bulk during off-peak
  - Reduced per-request overhead

Strategy 5: COMMITMENT
  - Reserved capacity for steady workloads
  - Volume discounts with providers
  - Multi-year agreements where appropriate
```

## Pattern 7: Multi-region resilience

### Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                  MULTI-REGION AI DEPLOYMENT                      │
│                                                                  │
│   Region A (Primary)              Region B (Secondary)          │
│   ┌─────────────────────┐        ┌─────────────────────┐       │
│   │  AI Services        │        │  AI Services        │       │
│   │  ┌──────────────┐   │        │  ┌──────────────┐   │       │
│   │  │ GenAI DAC    │   │        │  │ GenAI DAC    │   │       │
│   │  └──────────────┘   │        │  └──────────────┘   │       │
│   │  ┌──────────────┐   │        │  ┌──────────────┐   │       │
│   │  │ Knowledge Base│   │        │  │ Knowledge Base│   │       │
│   │  └──────────────┘   │        │  └──────────────┘   │       │
│   └─────────────────────┘        └─────────────────────┘       │
│             │                              │                    │
│             └──────────────┬───────────────┘                    │
│                            │                                    │
│                    ┌───────▼───────┐                           │
│                    │ Global Load   │                           │
│                    │ Balancer      │                           │
│                    │               │                           │
│                    │ - Health      │                           │
│                    │ - Failover    │                           │
│                    │ - Geo-routing │                           │
│                    └───────────────┘                           │
│                                                                  │
│   Sync:                                                        │
│   - Knowledge bases replicated                                 │
│   - Models deployed to both regions                            │
│   - Config synchronized                                        │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation checklist

### Phase 1: Foundation
```markdown
- [ ] Deploy AI Gateway
- [ ] Implement authentication/authorization
- [ ] Set up basic monitoring
- [ ] Configure rate limiting
- [ ] Enable audit logging
```

### Phase 2: Governance
```markdown
- [ ] Establish model registry
- [ ] Define approval workflows
- [ ] Implement prompt management
- [ ] Create cost tracking
- [ ] Document policies
```

### Phase 3: Security
```markdown
- [ ] Input validation layer
- [ ] Output filtering
- [ ] PII detection
- [ ] Prompt injection defense
- [ ] Security review process
```

### Phase 4: Operations
```markdown
- [ ] Full observability stack
- [ ] Alerting rules
- [ ] Runbooks
- [ ] Incident response plan
- [ ] Capacity planning
```

### Phase 5: Optimization
```markdown
- [ ] Caching strategy
- [ ] Model tiering
- [ ] Cost optimization
- [ ] Performance tuning
- [ ] Multi-region deployment
```

## Resources

- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
- [MLOps Principles](https://ml-ops.org/)
- [Responsible AI Practices](https://ai.google/responsibility/principles/)

## Changelog

- 1.2.0: frontmatter to agentskills.io spec, stale model names dated and sourced, prompt management and security layers moved to references/.
- 1.1.0: earlier content, dated 2026-01-06.
