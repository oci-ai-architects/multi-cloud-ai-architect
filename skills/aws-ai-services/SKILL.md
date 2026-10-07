---
name: aws-ai-services
description: Reference for building model-backed applications on AWS service by service - Amazon Bedrock model invocation, streaming, Titan embeddings, Knowledge Bases (RAG) and Bedrock Agents in boto3; SageMaker training, endpoints and JumpStart; Kendra, Comprehend and Textract; a serverless pipeline and an enterprise RAG layout; IAM least-privilege policies and VPC endpoints; and a token-cost model kept in a dated reference. Use when writing or reviewing boto3 code against Bedrock or SageMaker, wiring a Bedrock Knowledge Base, locking Bedrock access down with IAM and PrivateLink, or estimating Bedrock token cost. Trigger on "AWS Bedrock", "Bedrock invoke_model", "SageMaker", "JumpStart", "Kendra", "Textract", "AWS AI", "Amazon AI". Prefer pack-aws for agent architecture decisions on AWS (AgentCore, Strands, Agentic AI Lens); this skill holds the lower-level service detail.
metadata:
  version: "1.2.0"
  asOf: "2026-10-05"
  contentAsOf: "2026-01-06"
  scope: reference
  supersededBy: pack-aws
---

# AWS AI services

Content as of 2026-01-06, and several model ids in the code predate that date. Model names, model
ids, SDK versions and prices below were not re-checked on 2026-10-05; confirm on the linked primary
source before quoting or copying. For agent architecture on AWS, load `pack-aws` first.

Service-level reference for Amazon Bedrock (foundation models), SageMaker (custom ML) and the
adjacent AWS AI services.

## AWS Bedrock

### Overview
Amazon Bedrock is a fully managed service providing foundation models from leading AI companies through a single API.

### Available models

As of 2026-01-06 [UNVERIFIED], and the Anthropic and Meta rows list older generations. Source:
https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html. Read it for the current
catalogue and per-region availability before choosing a model id.

| Provider | Models | Best For |
|----------|--------|----------|
| **Anthropic** | Claude 3.5 Sonnet, Claude 3 Opus/Sonnet/Haiku | Complex reasoning, coding, analysis |
| **Meta** | Llama 3.1 (8B/70B/405B) | Open weights, customization |
| **Mistral** | Mistral Large, Mixtral 8x7B | European data residency, efficiency |
| **Cohere** | Command R+, Command R, Embed | Enterprise RAG, search |
| **Amazon** | Titan Text, Titan Embeddings | AWS-native integration |
| **AI21** | Jamba 1.5 | Long context, efficiency |
| **Stability** | Stable Diffusion | Image generation |

### Basic Usage

```python
import boto3
import json

# Initialize Bedrock client
bedrock = boto3.client(
    service_name='bedrock-runtime',
    region_name='us-east-1'
)

# Claude 3.5 Sonnet
def invoke_claude(prompt: str) -> str:
    response = bedrock.invoke_model(
        modelId='anthropic.claude-3-5-sonnet-20241022-v2:0',
        body=json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1024,
            "messages": [
                {"role": "user", "content": prompt}
            ]
        })
    )
    result = json.loads(response['body'].read())
    return result['content'][0]['text']

# Llama 3.1
def invoke_llama(prompt: str) -> str:
    response = bedrock.invoke_model(
        modelId='meta.llama3-1-70b-instruct-v1:0',
        body=json.dumps({
            "prompt": f"<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>",
            "max_gen_len": 1024,
            "temperature": 0.7
        })
    )
    result = json.loads(response['body'].read())
    return result['generation']
```

### Streaming Responses

```python
def stream_claude(prompt: str):
    response = bedrock.invoke_model_with_response_stream(
        modelId='anthropic.claude-3-5-sonnet-20241022-v2:0',
        body=json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1024,
            "messages": [{"role": "user", "content": prompt}]
        })
    )

    for event in response['body']:
        chunk = json.loads(event['chunk']['bytes'])
        if chunk['type'] == 'content_block_delta':
            yield chunk['delta']['text']
```

### Embeddings with Titan

```python
def get_embeddings(text: str) -> list:
    response = bedrock.invoke_model(
        modelId='amazon.titan-embed-text-v2:0',
        body=json.dumps({
            "inputText": text,
            "dimensions": 1024,
            "normalize": True
        })
    )
    result = json.loads(response['body'].read())
    return result['embedding']
```

### Bedrock Knowledge Bases (RAG)

```python
import boto3

bedrock_agent = boto3.client('bedrock-agent-runtime')

def query_knowledge_base(query: str, kb_id: str) -> str:
    response = bedrock_agent.retrieve_and_generate(
        input={'text': query},
        retrieveAndGenerateConfiguration={
            'type': 'KNOWLEDGE_BASE',
            'knowledgeBaseConfiguration': {
                'knowledgeBaseId': kb_id,
                'modelArn': 'arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0',
                'retrievalConfiguration': {
                    'vectorSearchConfiguration': {
                        'numberOfResults': 5
                    }
                }
            }
        }
    )
    return response['output']['text']
```

### Bedrock Agents

```python
# Creating an agent programmatically
import boto3

bedrock_agent_client = boto3.client('bedrock-agent')

# Create agent
response = bedrock_agent_client.create_agent(
    agentName='customer-support-agent',
    foundationModel='anthropic.claude-3-5-sonnet-20241022-v2:0',
    instruction='''You are a customer support agent.
    Use the available tools to help customers with their orders.''',
    idleSessionTTLInSeconds=600
)

agent_id = response['agent']['agentId']

# Add action group (tools)
bedrock_agent_client.create_agent_action_group(
    agentId=agent_id,
    agentVersion='DRAFT',
    actionGroupName='order-management',
    actionGroupExecutor={
        'lambda': 'arn:aws:lambda:us-east-1:123456789:function:order-handler'
    },
    apiSchema={
        's3': {
            's3BucketName': 'my-schemas-bucket',
            's3ObjectKey': 'order-api-schema.json'
        }
    }
)
```

## Amazon SageMaker

### SageMaker for Custom Models

```python
import sagemaker
from sagemaker.huggingface import HuggingFace

# Training job
huggingface_estimator = HuggingFace(
    entry_point='train.py',
    source_dir='./scripts',
    instance_type='ml.p4d.24xlarge',
    instance_count=1,
    role=sagemaker.get_execution_role(),
    transformers_version='4.36',
    pytorch_version='2.1',
    py_version='py310',
    hyperparameters={
        'model_name': 'meta-llama/Llama-3.1-8B',
        'epochs': 3,
        'learning_rate': 2e-5,
    }
)

huggingface_estimator.fit({'train': 's3://bucket/train-data/'})
```

### SageMaker Endpoints

```python
from sagemaker.huggingface import HuggingFaceModel

# Deploy model
hub_model = HuggingFaceModel(
    model_data='s3://bucket/model.tar.gz',
    role=sagemaker.get_execution_role(),
    transformers_version='4.36',
    pytorch_version='2.1',
    py_version='py310',
)

predictor = hub_model.deploy(
    initial_instance_count=1,
    instance_type='ml.g5.2xlarge',
    endpoint_name='my-llm-endpoint'
)

# Invoke
response = predictor.predict({
    "inputs": "What is machine learning?"
})
```

### SageMaker JumpStart

```python
from sagemaker.jumpstart.model import JumpStartModel

# Deploy foundation model from JumpStart
model = JumpStartModel(model_id="meta-textgeneration-llama-3-1-70b-instruct")
predictor = model.deploy()

# Use the model
response = predictor.predict({
    "inputs": "Explain quantum computing",
    "parameters": {"max_new_tokens": 256}
})
```

## AWS AI Service Integration

### Amazon Kendra (Enterprise Search)

```python
import boto3

kendra = boto3.client('kendra')

# Query
response = kendra.query(
    IndexId='your-index-id',
    QueryText='What is our refund policy?',
    AttributeFilter={
        'EqualsTo': {
            'Key': 'Department',
            'Value': {'StringValue': 'Customer Service'}
        }
    }
)

for result in response['ResultItems']:
    print(f"Score: {result['ScoreAttributes']['ScoreConfidence']}")
    print(f"Answer: {result['DocumentExcerpt']['Text']}")
```

### Amazon Comprehend (NLP)

```python
comprehend = boto3.client('comprehend')

# Sentiment analysis
response = comprehend.detect_sentiment(
    Text="I love this product! It's amazing.",
    LanguageCode='en'
)
# {'Sentiment': 'POSITIVE', 'SentimentScore': {...}}

# Entity extraction
entities = comprehend.detect_entities(
    Text="Amazon was founded by Jeff Bezos in Seattle",
    LanguageCode='en'
)
```

### Amazon Textract (Document AI)

```python
textract = boto3.client('textract')

# Analyze document
response = textract.analyze_document(
    Document={'S3Object': {'Bucket': 'bucket', 'Name': 'invoice.pdf'}},
    FeatureTypes=['FORMS', 'TABLES']
)

# Extract key-value pairs
for block in response['Blocks']:
    if block['BlockType'] == 'KEY_VALUE_SET':
        # Process form fields
        pass
```

## Architecture Patterns

### Serverless AI Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                  SERVERLESS AI ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  API Gateway ──▶ Lambda ──▶ Bedrock                             │
│       │              │                                           │
│       │              ▼                                           │
│       │         DynamoDB (conversation history)                  │
│       │              │                                           │
│       │              ▼                                           │
│       │         S3 (documents)                                   │
│       │              │                                           │
│       │              ▼                                           │
│       │         OpenSearch (vector store)                        │
│       │                                                          │
│       └────────▶ CloudWatch (monitoring)                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Enterprise RAG on AWS

```python
# terraform/main.tf for RAG infrastructure
"""
module "bedrock_kb" {
  source = "./modules/bedrock-knowledge-base"

  name = "enterprise-kb"
  embedding_model = "amazon.titan-embed-text-v2:0"

  data_sources = [
    {
      type = "S3"
      bucket = aws_s3_bucket.documents.id
      prefix = "knowledge/"
    }
  ]

  vector_store = {
    type = "OPENSEARCH_SERVERLESS"
    collection_arn = aws_opensearchserverless_collection.vectors.arn
  }
}
"""
```

## Pricing optimization

The Bedrock price table and the `BedrockCostOptimizer` example moved to
[references/pricing.md](references/pricing.md). Figures there are as of 2026-01-06 [UNVERIFIED];
the primary source is https://aws.amazon.com/bedrock/pricing/.

## Security Best Practices

### IAM Policies

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": [
        "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-5-sonnet*",
        "arn:aws:bedrock:*::foundation-model/meta.llama3*"
      ],
      "Condition": {
        "StringEquals": {
          "aws:RequestedRegion": ["us-east-1", "us-west-2"]
        }
      }
    }
  ]
}
```

### VPC Endpoints

```hcl
resource "aws_vpc_endpoint" "bedrock" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.us-east-1.bedrock-runtime"
  vpc_endpoint_type = "Interface"
  subnet_ids        = aws_subnet.private[*].id
  security_group_ids = [aws_security_group.bedrock.id]
  private_dns_enabled = true
}
```

## Resources

- [Amazon Bedrock Docs](https://docs.aws.amazon.com/bedrock/)
- [SageMaker Docs](https://docs.aws.amazon.com/sagemaker/)
- [AWS AI/ML Blog](https://aws.amazon.com/blogs/machine-learning/)
- [Bedrock Pricing](https://aws.amazon.com/bedrock/pricing/)

## Changelog

- 1.2.0: frontmatter to agentskills.io spec, stale figures dated and sourced, depth moved to references/.
- 1.1.0: content as of 2026-01-06.
