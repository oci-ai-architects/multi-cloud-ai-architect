---
name: rag-expert
description: Design reference for retrieval-augmented generation (RAG) - the index, retrieve and generate pipeline, chunking methods (fixed, sentence, semantic, structure-aware) with starting settings per content type, embedding model choice, hybrid search with reciprocal rank fusion, top-k, reranking, metadata filtering, an OCI Generative AI Agents knowledge base in Terraform, and common pitfalls, with advanced patterns (multi-query, compression, Self-RAG, hierarchical), retrieval and generation metrics, caching and monitoring in references/. Use when designing or debugging a RAG pipeline, choosing a chunking or embedding strategy, adding reranking or hybrid search, building a retrieval eval set, or setting up a managed knowledge base. Trigger on "RAG", "retrieval augmented", "knowledge base", "document retrieval", "semantic search", "vector search", "chunking", "embeddings", "reranker", "hybrid search", "recall@k".
metadata:
  version: "1.2.0"
  asOf: "2026-10-05"
  contentAsOf: "2026-01-06"
  scope: reference
---

# Retrieval-augmented generation

Content as of 2026-01-06. Model names, embedding dimensions, managed-service features and limits
below were not re-checked on 2026-10-05; confirm them on the linked primary sources before quoting.

Scope: designing and implementing RAG pipelines that ground model output in an organisation's own
documents.

## RAG Architecture Fundamentals

### How RAG Works
```
┌─────────────────────────────────────────────────────────────────┐
│                      RAG PIPELINE                                │
│                                                                  │
│   1. INDEXING (Offline)                                         │
│   Documents ──▶ Chunking ──▶ Embedding ──▶ Vector Store         │
│                                                                  │
│   2. RETRIEVAL (Online)                                         │
│   Query ──▶ Embed Query ──▶ Vector Search ──▶ Top-K Chunks      │
│                                                                  │
│   3. GENERATION (Online)                                        │
│   [Query + Retrieved Context] ──▶ LLM ──▶ Grounded Response     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Why RAG?
```
WITHOUT RAG (Pure LLM):
- Knowledge cutoff date
- Hallucinations on specific facts
- No access to private data
- Generic responses

WITH RAG:
+ Real-time knowledge
+ Grounded in actual documents
+ Access to enterprise data
+ Cited, verifiable responses
```

## Chunking Strategies

### The Chunking Problem
```
Too Small: Loses context, fragments meaning
Too Large: Dilutes relevance, wastes tokens
Just Right: Preserves meaning, fits context window
```

### Chunking Methods

#### 1. Fixed-Size Chunking
```python
# Simple but naive
def fixed_chunk(text, size=512, overlap=50):
    chunks = []
    for i in range(0, len(text), size - overlap):
        chunks.append(text[i:i + size])
    return chunks

# Pros: Simple, predictable
# Cons: Breaks mid-sentence, ignores structure
```

#### 2. Sentence-Based Chunking
```python
import nltk

def sentence_chunk(text, max_sentences=5, overlap=1):
    sentences = nltk.sent_tokenize(text)
    chunks = []
    for i in range(0, len(sentences), max_sentences - overlap):
        chunk = ' '.join(sentences[i:i + max_sentences])
        chunks.append(chunk)
    return chunks

# Pros: Respects sentence boundaries
# Cons: Variable sizes, may still break context
```

#### 3. Semantic Chunking
```python
def semantic_chunk(text, similarity_threshold=0.7):
    """Split when semantic similarity drops below threshold."""
    sentences = split_sentences(text)
    embeddings = embed_all(sentences)

    chunks = []
    current_chunk = [sentences[0]]

    for i in range(1, len(sentences)):
        similarity = cosine_similarity(embeddings[i-1], embeddings[i])
        if similarity < similarity_threshold:
            chunks.append(' '.join(current_chunk))
            current_chunk = []
        current_chunk.append(sentences[i])

    return chunks

# Pros: Respects semantic boundaries
# Cons: Slower, requires embedding calls
```

#### 4. Document Structure Chunking
```python
def structure_chunk(document):
    """Chunk by document structure (headers, sections)."""
    chunks = []
    for section in document.sections:
        if section.is_header:
            # Keep headers with their content
            chunk = f"{section.header}\n\n{section.content}"
            chunks.append(chunk)
        elif len(section.content) > MAX_CHUNK_SIZE:
            # Sub-chunk large sections
            chunks.extend(sentence_chunk(section.content))
        else:
            chunks.append(section.content)
    return chunks

# Pros: Preserves document hierarchy
# Cons: Requires parsing logic per format
```

### Recommended Settings

Starting points to tune against a retrieval eval (see references/), not measured optima.
```yaml
# General Purpose
chunk_size: 512 tokens
chunk_overlap: 50 tokens
method: semantic or sentence-based

# Technical Documentation
chunk_size: 1024 tokens
chunk_overlap: 100 tokens
method: structure-based (preserve code blocks)

# Legal/Compliance
chunk_size: 768 tokens
chunk_overlap: 150 tokens
method: paragraph-based (preserve clauses)

# Q&A/FAQ
chunk_size: 256 tokens
chunk_overlap: 25 tokens
method: question-answer pairs
```

## Embedding Strategies

### Model Selection

As of 2026-01-06 [UNVERIFIED]. Dimensions from the model owners' pages: OpenAI
(https://platform.openai.com/docs/guides/embeddings), Cohere Embed on OCI
(https://docs.oracle.com/en-us/iaas/Content/generative-ai/pretrained-models.htm), BGE-large
(https://huggingface.co/BAAI/bge-large-en-v1.5) and all-MiniLM-L6-v2
(https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2). The quality column is a relative
judgement, not a benchmark result; compare models on your own retrieval eval.
```
┌─────────────────────────────────────────────────────────────────┐
│                    EMBEDDING MODELS                              │
├──────────────────┬────────────┬──────────┬─────────────────────┤
│ Model            │ Dimensions │ Quality  │ Use Case            │
├──────────────────┼────────────┼──────────┼─────────────────────┤
│ Cohere Embed     │ 1024       │ High     │ OCI native, multi-  │
│ (OCI)            │            │          │ lingual             │
├──────────────────┼────────────┼──────────┼─────────────────────┤
│ OpenAI ada-002   │ 1536       │ High     │ General purpose     │
├──────────────────┼────────────┼──────────┼─────────────────────┤
│ OpenAI text-3    │ 3072       │ Highest  │ Maximum quality     │
│ large            │            │          │                     │
├──────────────────┼────────────┼──────────┼─────────────────────┤
│ BGE-large        │ 1024       │ High     │ Open source, free   │
├──────────────────┼────────────┼──────────┼─────────────────────┤
│ all-MiniLM-L6-v2 │ 384        │ Medium   │ Fast, low resource  │
└──────────────────┴────────────┴──────────┴─────────────────────┘
```

### Embedding Best Practices
```python
# 1. CONSISTENT MODEL
# Use same model for indexing and querying
index_embedding = embed_model.encode(document)
query_embedding = embed_model.encode(query)  # Same model!

# 2. QUERY TRANSFORMATION
# Rephrase queries to match document style
def transform_query(query):
    # Add context hints
    return f"Relevant information about: {query}"

# 3. HYBRID APPROACH
# Combine semantic + keyword search
def hybrid_search(query, k=10):
    semantic_results = vector_search(query, k=k*2)
    keyword_results = bm25_search(query, k=k*2)
    return reciprocal_rank_fusion(semantic_results, keyword_results)[:k]
```

## Retrieval Optimization

### Top-K Selection
```
K=3:  Fast, focused, may miss relevant info
K=5:  Balanced (recommended starting point)
K=10: Comprehensive, may include noise
K>10: Diminishing returns, context bloat
```

### Reranking
```python
def retrieve_with_rerank(query, k=5, initial_k=20):
    """Two-stage retrieval with reranking."""
    # Stage 1: Fast vector search
    candidates = vector_search(query, k=initial_k)

    # Stage 2: Rerank with cross-encoder
    reranked = cross_encoder.rerank(query, candidates)

    return reranked[:k]

# Reranking models:
# - Cohere Rerank
# - BGE Reranker
# - ms-marco-MiniLM
```

### Metadata Filtering
```python
# Pre-filter by metadata before vector search
def filtered_search(query, filters, k=5):
    """Search with metadata filters."""
    return vector_store.search(
        query=query,
        k=k,
        filter={
            "department": filters.get("department"),
            "doc_type": filters.get("type"),
            "date": {"$gte": filters.get("min_date")}
        }
    )

# Example filters:
# - Department: engineering, sales, support
# - Document type: policy, runbook, faq
# - Date range: last 90 days
# - Access level: public, internal, confidential
```

## OCI GenAI Agents RAG

### Knowledge Base Setup
```hcl
# Terraform for OCI RAG
resource "oci_generative_ai_agent_knowledge_base" "main" {
  compartment_id = var.compartment_id
  display_name   = "enterprise-knowledge-base"

  index_config {
    index_config_type = "DEFAULT_INDEX_CONFIG"

    databases {
      connection_type = "OBJECT_STORAGE"
      connection_id   = oci_objectstorage_bucket.docs.id
    }
  }
}

resource "oci_generative_ai_agent" "rag_agent" {
  compartment_id = var.compartment_id
  display_name   = "enterprise-assistant"

  knowledge_base_ids = [
    oci_generative_ai_agent_knowledge_base.main.id
  ]

  system_message = <<-EOT
    You are a helpful enterprise assistant.
    Answer questions based on the knowledge base.
    Always cite your sources.
    If you don't know, say so.
  EOT
}
```

### OCI RAG features (March 2025)

As of 2026-01-06 [UNVERIFIED], describing the March 2025 release. Features, language count and
limits change; check https://docs.oracle.com/en-us/iaas/Content/generative-ai-agents/overview.htm
and the service limits page linked from it before quoting.
```yaml
Enhanced Features:
  - Hybrid search (keyword + vector)
  - Multi-modal parsing (images, charts in PDFs)
  - Custom instructions
  - Multi-lingual support (7 languages)
  - Multiple knowledge bases per agent
  - Metadata filtering

Limits:
  - 1,000 files per Object Storage bucket
  - 100 MB max per file
  - 8 MB max for embedded images
```

## Advanced patterns, evaluation and production

Multi-query RAG, contextual compression, Self-RAG, hierarchical RAG, retrieval metrics (recall@k, precision@k, MRR), LLM-as-judge generation metrics, caching and pipeline monitoring are in [advanced patterns, evaluation and production](references/advanced-patterns-evaluation.md). Load it when tuning recall, building an eval set, or hardening a pipeline.

## Common Pitfalls

### Pitfall 1: Poor Chunking
```
Problem: Chunks break mid-sentence or concept
Impact: Retrieval returns incomplete information
Solution: Use semantic or structure-aware chunking
```

### Pitfall 2: Embedding Mismatch
```
Problem: Different models for index vs. query
Impact: Poor semantic matching
Solution: Always use same embedding model
```

### Pitfall 3: Context Overload
```
Problem: Too many chunks -> exceeds context window
Impact: Truncation, lost information
Solution: Limit chunks, compress, or summarize
```

### Pitfall 4: Missing Metadata
```
Problem: No filtering capability
Impact: Irrelevant results from wrong domains
Solution: Add rich metadata during indexing
```

### Pitfall 5: Stale Index
```
Problem: Documents updated but not re-indexed
Impact: Outdated responses
Solution: Implement continuous ingestion pipeline
```

## Resources

- [OCI GenAI Agents Documentation](https://docs.oracle.com/en-us/iaas/Content/generative-ai-agents/overview.htm)
- [LangChain RAG Guide](https://python.langchain.com/docs/use_cases/question_answering/)
- [LlamaIndex Documentation](https://docs.llamaindex.ai/)
- [RAG Survey Paper](https://arxiv.org/abs/2312.10997)

## Changelog

- 1.2.0: frontmatter to agentskills.io spec, stale figures dated and sourced, advanced patterns, evaluation and production moved to references/.
- 1.1.0: updated for text-embedding-3-large and pgvector 0.8.
