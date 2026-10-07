---
name: azure-ai-services
description: Reference for building model-backed applications on Azure service by service - Azure OpenAI chat, streaming, function calling, embeddings and vision with the openai Python SDK; provisioned throughput (PTU) sizing; Azure AI Search vector and hybrid queries; Prompt Flow; Azure Machine Learning training and managed endpoints; a RAG reference layout; Bicep for accounts, deployments and private endpoints; managed identity; and content filtering. Use when writing or reviewing code against Azure OpenAI or Azure AI Search, sizing PTUs, deploying Azure OpenAI with Bicep behind a private endpoint, or wiring managed identity instead of API keys. Trigger on "Azure OpenAI", "AzureOpenAI client", "PTU", "Azure AI Search", "Cognitive Services", "Azure ML", "Prompt Flow", "Azure AI". Prefer pack-azure for agent architecture decisions on Azure (Microsoft Foundry, Foundry Agent Service, Agent Framework); this skill holds the lower-level service detail.
metadata:
  version: "1.2.0"
  asOf: "2026-10-05"
  contentAsOf: "2026-01-06"
  scope: reference
  supersededBy: pack-azure
---

# Azure AI services

Content as of 2026-01-06, and the model list and API versions in the code predate that date. Model
names, API versions and prices below were not re-checked on 2026-10-05; confirm on the linked
primary source before quoting or copying. For agent architecture on Azure, load `pack-azure` first.

Service-level reference for Azure OpenAI, Azure AI Search and Azure Machine Learning.

## Azure OpenAI Service

### Overview
Azure OpenAI provides access to OpenAI models (GPT-4, GPT-4o, DALL-E, Whisper) with Azure's enterprise security, compliance, and regional availability.

### Available models

As of 2026-01-06 [UNVERIFIED], and the list shows older generations. Source:
https://learn.microsoft.com/azure/ai-foundry/openai/concepts/models. Read it for current models,
context windows and regional availability.

| Model | Context | Best For |
|-------|---------|----------|
| **GPT-4o** | 128K | Multimodal, fastest GPT-4 |
| **GPT-4 Turbo** | 128K | Complex reasoning |
| **GPT-4** | 8K/32K | High capability |
| **GPT-3.5 Turbo** | 16K | Fast, cost-effective |
| **text-embedding-ada-002** | 8K | Embeddings |
| **text-embedding-3-large** | 8K | Better embeddings |
| **DALL-E 3** | - | Image generation |
| **Whisper** | - | Speech-to-text |

### Basic Usage

```python
from openai import AzureOpenAI

client = AzureOpenAI(
    api_key=os.environ["AZURE_OPENAI_API_KEY"],
    api_version="2024-02-01",
    azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"]
)

# Chat completion
response = client.chat.completions.create(
    model="gpt-4o",  # Deployment name
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Explain machine learning"}
    ],
    temperature=0.7,
    max_tokens=1000
)

print(response.choices[0].message.content)
```

### Streaming

```python
stream = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Write a story"}],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

### Function Calling

```python
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get current weather for a location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string", "description": "City name"},
                    "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]}
                },
                "required": ["location"]
            }
        }
    }
]

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "What's the weather in Paris?"}],
    tools=tools,
    tool_choice="auto"
)

if response.choices[0].message.tool_calls:
    tool_call = response.choices[0].message.tool_calls[0]
    # Execute function and send result back
```

### Embeddings

```python
response = client.embeddings.create(
    model="text-embedding-3-large",  # Deployment name
    input="Your text to embed",
    dimensions=1024  # Optional: reduce dimensions
)

embedding = response.data[0].embedding
```

### Vision (GPT-4o)

```python
import base64

def encode_image(image_path):
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode('utf-8')

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What's in this image?"},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{encode_image('image.jpg')}"
                    }
                }
            ]
        }
    ]
)
```

## Provisioned throughput units (PTU)

### When to use PTU
- Predictable, high-volume workloads
- Guaranteed performance requirements
- Cost optimization at scale

Sizing code and pricing notes are in [references/ptu-and-pricing.md](references/ptu-and-pricing.md).
Throughput per PTU and the PTU price are set per model by Microsoft; read
https://learn.microsoft.com/azure/ai-foundry/openai/concepts/provisioned-throughput before sizing.

## Azure AI Search (Cognitive Search)

### Vector Search Setup

```python
from azure.search.documents import SearchClient
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import (
    SearchIndex,
    SearchField,
    VectorSearch,
    HnswAlgorithmConfiguration,
    VectorSearchProfile,
)

# Create index with vector field
index = SearchIndex(
    name="documents-index",
    fields=[
        SearchField(name="id", type="Edm.String", key=True),
        SearchField(name="content", type="Edm.String", searchable=True),
        SearchField(
            name="embedding",
            type="Collection(Edm.Single)",
            searchable=True,
            vector_search_dimensions=1536,
            vector_search_profile_name="vector-profile"
        ),
    ],
    vector_search=VectorSearch(
        algorithms=[HnswAlgorithmConfiguration(name="hnsw")],
        profiles=[
            VectorSearchProfile(name="vector-profile", algorithm_configuration_name="hnsw")
        ]
    )
)

index_client = SearchIndexClient(endpoint, credential)
index_client.create_index(index)
```

### Hybrid Search (Vector + Keyword)

```python
from azure.search.documents.models import VectorizedQuery

search_client = SearchClient(endpoint, "documents-index", credential)

# Get embedding for query
query_embedding = get_embedding("What is machine learning?")

# Hybrid search
results = search_client.search(
    search_text="machine learning",  # Keyword search
    vector_queries=[
        VectorizedQuery(
            vector=query_embedding,
            k_nearest_neighbors=5,
            fields="embedding"
        )
    ],
    select=["id", "content"],
    top=10
)

for result in results:
    print(f"Score: {result['@search.score']}, Content: {result['content'][:100]}")
```

## Azure AI Studio

### Prompt Flow

```yaml
# flow.dag.yaml
inputs:
  question:
    type: string

outputs:
  answer:
    type: string
    reference: ${generate_answer.output}

nodes:
  - name: embed_question
    type: python
    source:
      type: code
      path: embed.py
    inputs:
      text: ${inputs.question}

  - name: search_documents
    type: python
    source:
      type: code
      path: search.py
    inputs:
      embedding: ${embed_question.output}

  - name: generate_answer
    type: llm
    source:
      type: code
      path: prompt.jinja2
    inputs:
      deployment_name: gpt-4o
      context: ${search_documents.output}
      question: ${inputs.question}
```

## Azure Machine Learning

Training jobs and managed online endpoints with the `azure-ai-ml` SDK are in
[references/azure-ml.md](references/azure-ml.md).

## Architecture Patterns

### Enterprise RAG on Azure

```
┌─────────────────────────────────────────────────────────────────┐
│                    AZURE RAG ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User ──▶ Azure Front Door ──▶ API Management                   │
│                                      │                           │
│                                      ▼                           │
│                              Azure Functions                     │
│                                      │                           │
│                    ┌─────────────────┼─────────────────┐        │
│                    ▼                 ▼                 ▼        │
│           ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│           │ Azure OpenAI │  │  AI Search   │  │  Blob Store  │ │
│           │   (GPT-4o)   │  │  (Vectors)   │  │ (Documents)  │ │
│           └──────────────┘  └──────────────┘  └──────────────┘ │
│                                      │                           │
│                                      ▼                           │
│                              Cosmos DB                           │
│                         (Conversation History)                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Bicep/ARM Deployment

```bicep
// main.bicep
param location string = resourceGroup().location
param openaiName string

resource openai 'Microsoft.CognitiveServices/accounts@2023-10-01-preview' = {
  name: openaiName
  location: location
  kind: 'OpenAI'
  sku: {
    name: 'S0'
  }
  properties: {
    customSubDomainName: openaiName
    publicNetworkAccess: 'Disabled'
  }
}

resource gpt4oDeployment 'Microsoft.CognitiveServices/accounts/deployments@2023-10-01-preview' = {
  parent: openai
  name: 'gpt-4o'
  properties: {
    model: {
      format: 'OpenAI'
      name: 'gpt-4o'
      version: '2024-05-13'
    }
  }
  sku: {
    name: 'Standard'
    capacity: 100  // TPM in thousands
  }
}
```

## Pricing

Moved to [references/ptu-and-pricing.md](references/ptu-and-pricing.md), dated 2026-01-06 and
marked [UNVERIFIED]. Primary source: https://azure.microsoft.com/pricing/details/cognitive-services/openai-service/.

## Security

### Private Endpoints

```bicep
resource privateEndpoint 'Microsoft.Network/privateEndpoints@2023-04-01' = {
  name: '${openaiName}-pe'
  location: location
  properties: {
    subnet: {
      id: subnetId
    }
    privateLinkServiceConnections: [
      {
        name: '${openaiName}-plsc'
        properties: {
          privateLinkServiceId: openai.id
          groupIds: ['account']
        }
      }
    ]
  }
}
```

### Managed Identity

```python
from azure.identity import DefaultAzureCredential
from openai import AzureOpenAI

# Use managed identity (no API keys!)
credential = DefaultAzureCredential()
token = credential.get_token("https://cognitiveservices.azure.com/.default")

client = AzureOpenAI(
    azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
    api_version="2024-02-01",
    azure_ad_token=token.token
)
```

## Content Filtering

```python
# Azure OpenAI has built-in content filtering
# Configure via Azure Portal or API

# Check for filtered content in response
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "..."}]
)

# Content filter results
if hasattr(response.choices[0], 'content_filter_results'):
    filters = response.choices[0].content_filter_results
    if filters.get('hate', {}).get('filtered'):
        print("Content was filtered for hate speech")
```

## Resources

- [Azure OpenAI Docs](https://learn.microsoft.com/azure/ai-services/openai/)
- [Azure AI Search Docs](https://learn.microsoft.com/azure/search/)
- [Azure ML Docs](https://learn.microsoft.com/azure/machine-learning/)
- [Azure OpenAI Pricing](https://azure.microsoft.com/pricing/details/cognitive-services/openai-service/)

## Changelog

- 1.2.0: frontmatter to agentskills.io spec, stale figures dated and sourced, depth moved to references/.
- 1.1.0: content as of 2026-01-06.
