---
name: oci-services-expert
description: Reference for designing on Oracle Cloud Infrastructure (OCI) - compute (VMs, bare metal, OKE, Container Instances, Functions), storage tiers, Autonomous Database and MySQL HeatWave, VCN networking and FastConnect, OCI Generative AI and Data Science, IAM policies and compartments, NSGs, Vault, observability, disaster recovery and cost levers. Use when an architecture must run on OCI or connect to it, when mapping a design from AWS, Azure or Google Cloud to OCI service names, when writing OCI IAM policy statements or NSG rules, when choosing between OKE, Container Instances and Functions, or when checking an OCI deployment for security and DR gaps. Trigger on "OCI", "Oracle Cloud", "compartment", "tenancy", "OCID", "OKE", "Autonomous Database", "FastConnect", "VCN". pack-oci does not exist yet; see docs/research/providers/oracle-oci.md for sourced provider research. Built on public OCI documentation; not affiliated with Oracle.
metadata:
  version: "1.2.0"
  asOf: "2026-10-05"
  contentAsOf: "2026-01-06"
  scope: reference
---

# OCI services reference

Content as of 2026-01-06. Service names, model lists and prices below were not re-checked on
2026-10-05; confirm on the linked primary source before quoting. Prices and discount percentages
were removed in 1.2.0 because they carried no source; read them from the OCI price list
(https://www.oracle.com/cloud/price-list/) or the cost estimator
(https://www.oracle.com/cloud/costestimator.html) on the day you quote them.

This skill covers OCI services, cloud-native architecture on OCI, multi-cloud placement, cost levers
and deployment patterns. It is written from public OCI documentation
(https://docs.oracle.com/en-us/iaas/Content/home.htm).

## Core OCI service categories

### Compute services

**OCI Compute Instances**
- Flexible VMs with custom shapes
- Bare Metal for high performance
- Dedicated VM Hosts for licensing compliance
- Use cases: General workloads, legacy apps, custom configurations

**Container Engine for Kubernetes (OKE)**
- Managed Kubernetes service
- Auto-scaling, self-healing clusters
- Integration with OCI Registry, Load Balancer, Block Storage
- Use cases: Microservices, cloud-native apps, CI/CD

**Container Instances**
- Serverless containers without K8s overhead
- Pay-per-second billing
- Fast startup times
- Use cases: Batch jobs, event-driven workloads, quick prototypes

**Functions (Serverless)**
- Event-driven, pay-per-execution
- Auto-scaling, zero server management
- Integration with OCI Events, API Gateway
- Use cases: APIs, data processing, automation

### Storage services

**Object Storage**
- Scales without capacity planning; the durability figure is published in the Object Storage
  overview (https://docs.oracle.com/en-us/iaas/Content/Object/Concepts/objectstorageoverview.htm) [UNVERIFIED as of 2026-01-06]
- Standard, Infrequent Access, Archive tiers
- Use cases: Data lakes, backups, static website hosting

**Block Volume**
- High-performance SSD storage for compute
- Snapshots, cloning, encryption
- Use cases: Databases, boot volumes, high-IOPS workloads

**File Storage**
- NFS-based shared file systems
- Concurrent access from multiple instances
- Use cases: Shared application data, content management

### Database services

**Autonomous Database**
- Automated provisioning, patching, tuning and backups
- ATP (Transaction Processing), ADW (Data Warehouse)
- Automatic scaling, patching, backups
- Use cases: OLTP, analytics, mixed workloads

**Base Database Service**
- Managed Oracle Database (Enterprise, Standard)
- VM or Bare Metal deployment
- Use cases: Lift-and-shift, specific version requirements

**MySQL HeatWave**
- Integrated analytics engine in MySQL
- Performance multipliers are vendor benchmarks; quote them only as the vendor's, with the link
  (https://www.oracle.com/mysql/) [UNVERIFIED]
- Use cases: Real-time analytics on operational data

### Networking services

**Virtual Cloud Network (VCN)**
- Private network in OCI
- Subnets, route tables, security lists, gateways
- Best practice: Use multiple VCNs for isolation

**Load Balancer**
- Layer 4/7 load balancing
- SSL termination, health checks, session persistence
- Use cases: Distribute traffic, high availability

**FastConnect**
- Dedicated private connection to OCI
- Higher bandwidth and lower latency than internet
- Use cases: Hybrid cloud, data migration, security requirements

### AI and data science

**OCI Data Science**
- Managed platform for building ML models
- Jupyter notebooks, AutoML, model deployment
- Use cases: ML model development, training, deployment

**OCI AI Services**
- Pre-trained AI models: Vision, Language, Speech
- No ML expertise required
- Use cases: Document processing, chatbots, image analysis

**OCI Generative AI**
- Hosted LLMs; as of 2026-01-06 the catalogue listed Cohere and Meta Llama families [UNVERIFIED].
  Current list: https://docs.oracle.com/en-us/iaas/Content/generative-ai/pretrained-models.htm
- Fine-tuning and dedicated AI clusters (see `genai-dac-specialist`)
- Use cases: Content generation, summarization, Q&A

### Integration and application services

**API Gateway**
- Managed API deployment and management
- Rate limiting, authentication, caching
- Use cases: Microservices API exposure, third-party integration

**Streaming**
- Real-time data streaming (Kafka-compatible)
- Use cases: Event-driven architectures, real-time analytics

**Integration Cloud**
- Pre-built adapters for SaaS and on-prem apps
- Use cases: Enterprise integration, workflow automation

## Cloud architecture patterns

### 1. Three-tier web application
```
ARCHITECTURE:
- Web Tier: OCI Compute/Containers behind Load Balancer (public subnet)
- App Tier: OKE or Functions (private subnet)
- Data Tier: Autonomous Database (private subnet)
- External access via Internet Gateway
- Internal communication via Service Gateway

BEST PRACTICES:
- Use separate VCNs for dev/test/prod
- Implement Network Security Groups (NSGs) for fine-grained security
- Enable WAF (Web Application Firewall) on Load Balancer
- Use OCI Vault for secrets management
```

### 2. Microservices on OKE
```
ARCHITECTURE:
- OKE cluster (multi-node, auto-scaling)
- OCI Container Registry for images
- API Gateway for external API exposure
- Service Mesh (Istio) for inter-service communication
- Autonomous Database for each service (or shared)
- Streaming for event-driven communication

BEST PRACTICES:
- One Kubernetes namespace per environment
- Use OCI Load Balancer Ingress Controller
- Implement circuit breakers and retries
- Centralized logging with OCI Logging Analytics
- Distributed tracing with APM
```

### 3. Data lake and analytics
```
ARCHITECTURE:
- Object Storage as data lake (raw, processed, curated zones)
- OCI Data Integration for ETL pipelines
- Autonomous Data Warehouse for analytics
- OCI Data Science for ML model training
- OCI Data Catalog for metadata management

BEST PRACTICES:
- Use storage tiers (Standard -> Infrequent Access -> Archive)
- Implement data lifecycle policies
- Partition data for query optimization
- Use Data Flow for big data processing (Spark)
```

### 4. Hybrid cloud architecture
```
ARCHITECTURE:
- On-premises data center connected via FastConnect or VPN
- OCI as extension of on-prem (disaster recovery, burst capacity)
- OCI Database Migration Service for migration
- Shared identity through IAM identity domains federated with the on-prem IdP

BEST PRACTICES:
- Use redundant FastConnect connections
- Implement DNS resolution for hybrid naming
- Centralized monitoring across on-prem and cloud
- Disaster recovery plan with defined RPO/RTO
```

## Cost levers

Discount percentages that earlier versions listed here had no source and were removed. The levers
stand; the size of each one is `[OPEN]` until read from the OCI price list
(https://www.oracle.com/cloud/price-list/) for the target region and date.

### 1. Right-sizing compute
- Use OCI Compute Autoscaling for variable workloads
- Rightsize VMs based on CPU/memory metrics
- Consider preemptible instances for fault-tolerant workloads
  (https://docs.oracle.com/en-us/iaas/Content/Compute/Concepts/preemptible.htm)
- Use reserved or committed capacity for predictable workloads

### 2. Storage optimization
- Use the Infrequent Access tier for rarely accessed data
- Use the Archive tier for compliance and backup data
- Implement Object Storage lifecycle policies (auto-tiering)
- Delete unused snapshots and backups

### 3. Database cost management
- Use Autonomous Database auto-scaling (scales down during low usage)
- Consider ATP vs ADW based on workload type
- Consider MySQL HeatWave instead of a separate analytics database
- Use database cloning for dev/test (thin clones use minimal storage)

### 4. Network cost reduction
- Use the OCI Service Gateway for private access to OCI services
- Measure data transfer out of OCI; egress pricing and any free allowance are on the price list
- Put a CDN in front of Object Storage for static content served globally
- Consolidate VCNs where security allows

## Security practices

### Identity and access management (IAM)
```
BEST PRACTICES:
- Use groups and dynamic groups, not individual user policies
- Principle of least privilege
- Enable MFA for all users
- Use OCI Vault for secrets, not hardcoded credentials
- Implement compartment hierarchy for resource isolation

EXAMPLE POLICY:
Allow group DataScientists to manage data-science-family in compartment ML-Workloads
Allow dynamic-group FunctionsGroup to use object-storage in compartment AppData
```

### Network security
```
BEST PRACTICES:
- Use Network Security Groups (NSGs) over Security Lists (more granular)
- Implement defense-in-depth (multiple security layers)
- Enable OCI WAF for web applications
- Use Bastion Service instead of jump hosts
- Implement VCN Flow Logs for traffic analysis

EXAMPLE NSG RULES:
Allow HTTPS (443) from 0.0.0.0/0 to Web-Tier NSG
Allow TCP (8080) from Web-Tier NSG to App-Tier NSG
Allow TCP (1521) from App-Tier NSG to DB-Tier NSG
```

### Data protection
```
BEST PRACTICES:
- Enable encryption at rest (default for most services)
- Use Customer-Managed Keys (CMK) via OCI Vault for sensitive data
- Encrypt data in transit (TLS 1.2+)
- Implement Cross-Region backups for disaster recovery
- Use OCI Data Safe for database security assessment
```

## Deployment and operations

### Infrastructure as code (IaC)
```
TOOLS:
- OCI Resource Manager (Terraform-based, managed service)
- Terraform (open-source, direct OCI provider)
- OCI CLI and SDKs (scripting automation)

BEST PRACTICES:
- Version control all IaC (Git)
- Use separate state files per environment
- Implement CI/CD pipelines for infrastructure changes
- Use modules for reusable components
- Tag all resources for cost tracking and organization
```

### Monitoring and observability
```
OCI MONITORING:
- Metrics: CPU, memory, network, custom metrics
- Alarms: Threshold-based alerts with notifications
- OCI Logging: Centralized log aggregation
- OCI Logging Analytics: Log search and analysis

APM (Application Performance Monitoring):
- Distributed tracing across microservices
- Synthetic monitoring for uptime checks
- Real user monitoring (RUM)

BEST PRACTICES:
- Create dashboards for key metrics
- Set up alarms for critical thresholds (CPU > 80%, DB storage > 85%)
- Centralize logs from all services
- Implement distributed tracing for troubleshooting
```

### Disaster recovery
```
STRATEGIES:
- Backup and Restore (cheapest, highest RTO)
- Pilot Light (minimal resources running, moderate RTO)
- Warm Standby (scaled-down version running, low RTO)
- Active-Active (full deployment in both regions, lowest RTO)

OCI DR FEATURES:
- Cross-Region Replication (Object Storage, Block Volume)
- Data Guard (Base Database) and Autonomous Data Guard (Autonomous Database)
- OCI Full Stack DR (automated failover orchestration)

RPO/RTO TARGETS:
RPO (Recovery Point Objective): How much data loss acceptable
RTO (Recovery Time Objective): How fast recovery needed
Example: RPO 1 hour, RTO 4 hours = moderate DR requirements
```

## When OCI fits a design

Place a workload on OCI when one or more of these hold, and record the reason in the ADR:

- The workload depends on Oracle Database features or licensing (BYOL, Exadata, Data Guard)
- The design needs bare metal instances, RDMA cluster networking or local NVMe
- The organisation already runs Oracle applications or databases on OCI
- Egress volume is large and the current OCI price list makes it material to the decision
  (compare egress lines on each provider's price page on the day of the decision)
- A hybrid design needs FastConnect into an existing Oracle footprint

Relative cost against AWS, Azure or Google Cloud is `[OPEN]` for each design; compute it from each
provider's price list for the same shapes, region and date, and cite all of them.

## Response style

When giving OCI guidance:
- Reference specific OCI services by their documented names
- Provide architecture diagrams or ASCII representations when helpful
- Include cost considerations, with figures only from a dated price-list read
- Emphasize security and compliance practices
- Offer a multi-cloud perspective with the trade-off stated for each provider
- Provide Terraform or CLI examples for automation (see `terraform-iac`)
- Consider constraints such as licensing and existing infrastructure

## Example interaction

**User**: "How should I architect a scalable web application on OCI that needs to handle variable traffic?"

**Example response**:

"For a scalable web app with variable traffic, this architecture fits:

**ARCHITECTURE:**
```
Internet -> Load Balancer -> Auto-scaling compute instance pool -> Autonomous Database
               |                        |
           WAF (DDoS)            OCI Functions (async tasks)
                                        |
                                 Object Storage (media)
```

**COMPONENTS:**

1. **Load Balancer** (public subnet)
   - Distributes traffic across web tier
   - SSL termination, health checks
   - Enable WAF for DDoS protection

2. **Instance pool with auto-scaling** (private subnet)
   - Start: 2 instances (high availability)
   - Scale: 2-10 instances based on CPU utilization
   - Use preemptible instances only for interruptible background work

3. **Autonomous Database** (private subnet)
   - Auto-scaling enabled (1-3 OCPUs based on load)
   - Automatic backups, patching
   - Alternative: MySQL HeatWave if an open-source database is preferred

4. **OCI Functions** (serverless)
   - For background jobs (email, processing)
   - Pay only when executing

5. **Object Storage**
   - Static assets, user uploads

**COST ESTIMATE:** `[OPEN]`. Price each component in the OCI cost estimator
(https://www.oracle.com/cloud/costestimator.html) for the target region and traffic profile, and
record the read date beside each figure.

**OPTIMIZATION:**
- Use reserved capacity for the always-on base instances
- Enable Autonomous Database auto-scaling so peak capacity is paid only at peak
- Put a CDN in front of Object Storage for static content served globally

Would Terraform for this architecture, or a closer look at the database requirements, help next?"

## Related skills in this repository

- `oracle-adk`: agents built with the OCI Generative AI Agents ADK on this infrastructure
- `oracle-agent-spec`: portable agent definitions that can target OCI runtimes
- `genai-dac-specialist`: OCI Generative AI dedicated AI clusters
- `terraform-iac`: Terraform modules for OCI and other clouds
- `multi-cloud-ai-architect`: cross-cloud placement and routing

## Changelog

- 1.2.0: frontmatter to agentskills.io spec, stale figures dated and sourced, nominative non-affiliated wording; unsourced discounts, cost estimates and relative-cost claims removed
- 1.1.0: 2026 refresh (content as of 2026-01-06)
