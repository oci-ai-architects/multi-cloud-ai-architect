# D2 templates

As of 2026-01-06. Service names follow the provider docs at that date [UNVERIFIED]; check
https://d2lang.com/ for syntax changes before compiling.

## OCI generative AI layered template
```d2
# OCI GenAI Architecture
direction: right

title: OCI GenAI with Dedicated AI Clusters {
  near: top-center
  style.font-size: 24
  style.bold: true
}

# Layers using grid
layers: {
  grid-rows: 4
  grid-columns: 1

  presentation: Presentation Layer {
    style.fill: "#E8F4FD"
  }
  application: Application Layer {
    style.fill: "#FFF3E0"
  }
  ai: AI Services Layer {
    style.fill: "#E8F5E9"
  }
  data: Data Layer {
    style.fill: "#F3E5F5"
  }
}

# Presentation Layer
users: Users {
  shape: person
}
lb: Load Balancer {
  shape: hexagon
  style.fill: "#4A90D9"
}

# Application Layer
api: API Gateway {
  shape: rectangle
  style.fill: "#FF9800"
}
app: Application Server {
  shape: rectangle
}
functions: OCI Functions {
  shape: step
}

# AI Layer
dac: Dedicated AI Cluster {
  shape: rectangle
  style.fill: "#4CAF50"
  style.stroke-width: 3

  gpu1: GPU Node 1
  gpu2: GPU Node 2
  gpu3: GPU Node N
}
endpoint: GenAI Endpoint {
  shape: rectangle
  style.fill: "#81C784"
}
agent: GenAI Agent {
  shape: rectangle
  style.fill: "#A5D6A7"
}

# Data Layer
kb: Knowledge Base {
  shape: cylinder
  style.fill: "#9C27B0"
}
objstore: Object Storage {
  shape: cylinder
  style.fill: "#7B1FA2"
}
adb: Autonomous DB {
  shape: cylinder
  style.fill: "#6A1B9A"
}

# Connections
users -> lb: HTTPS
lb -> api
api -> app
app -> endpoint: Inference
app -> agent: Chat
agent -> kb: RAG Query
endpoint -> dac
kb -> objstore: Documents
kb -> adb: Vector Search
```

## Multi-cloud gateway template
```d2
# Multi-Cloud AI Architecture
direction: down

title: Multi-Cloud AI Platform {
  near: top-center
  style.font-size: 24
}

# Cloud Providers
clouds: {
  grid-rows: 1
  grid-columns: 3

  oci: OCI {
    style.fill: "#C74634"
    style.stroke: "#A03428"

    genai: GenAI DAC
    adb: Autonomous DB
    objstore: Object Storage
  }

  azure: Azure {
    style.fill: "#0078D4"
    style.stroke: "#005A9E"

    openai: Azure OpenAI
    cosmos: Cosmos DB
    blob: Blob Storage
  }

  aws: AWS {
    style.fill: "#FF9900"
    style.stroke: "#CC7A00"

    bedrock: Bedrock
    rds: RDS
    s3: S3
  }
}

# Central Gateway
gateway: AI Gateway {
  shape: hexagon
  style.fill: "#333"
  style.font-color: "#FFF"
}

# Connections
gateway -> clouds.oci.genai: Primary
gateway -> clouds.azure.openai: Fallback
gateway -> clouds.aws.bedrock: Fallback

# Interconnect
clouds.oci <-> clouds.azure: OCI-Azure Interconnect {
  style.stroke: "#28a745"
  style.stroke-width: 3
}
```
