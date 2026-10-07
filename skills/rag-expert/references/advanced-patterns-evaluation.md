# Advanced RAG patterns, evaluation and production

Moved from SKILL.md on 2026-10-05. Content as of 2026-01-06. The snippets are framework-neutral sketches; helper functions (`rerank`, `deduplicate`, `retriever.search`) stand for your own implementations.

## Advanced RAG Patterns

### Pattern 1: Multi-Query RAG
```python
def multi_query_rag(original_query, llm, retriever, k=5):
    """Generate multiple query variations for better recall."""
    # Generate query variations
    prompt = f"""Generate 3 alternative phrasings of this question:
    Original: {original_query}
    Variations:"""
    variations = llm.generate(prompt).split('\n')

    # Retrieve for each variation
    all_results = []
    for query in [original_query] + variations:
        results = retriever.search(query, k=k)
        all_results.extend(results)

    # Deduplicate and rerank
    unique_results = deduplicate(all_results)
    return rerank(original_query, unique_results)[:k]
```

### Pattern 2: Contextual Compression
```python
def compressed_rag(query, retriever, compressor, k=5):
    """Extract only relevant parts of retrieved documents."""
    # Retrieve full chunks
    chunks = retriever.search(query, k=k)

    # Compress each chunk to relevant portions
    compressed = []
    for chunk in chunks:
        relevant_portion = compressor.compress(query, chunk)
        if relevant_portion:
            compressed.append(relevant_portion)

    return compressed
```

### Pattern 3: Self-RAG (Reflective)
```python
def self_rag(query, retriever, generator):
    """Decide whether retrieval is needed, then verify."""
    # Step 1: Decide if retrieval needed
    decision = generator.generate(
        f"Do you need external information to answer: {query}? Yes/No"
    )

    if "Yes" in decision:
        # Step 2: Retrieve
        context = retriever.search(query)

        # Step 3: Generate with context
        response = generator.generate(
            f"Context: {context}\n\nQuestion: {query}"
        )

        # Step 4: Verify grounding
        verification = generator.generate(
            f"Is this response supported by the context? {response}"
        )

        if "No" in verification:
            return self_rag(query, retriever, generator)  # Retry

    else:
        response = generator.generate(query)

    return response
```

### Pattern 4: Hierarchical RAG
```python
def hierarchical_rag(query, summary_index, detail_index, k=5):
    """Two-level retrieval: summaries first, then details."""
    # Level 1: Find relevant document summaries
    relevant_docs = summary_index.search(query, k=3)

    # Level 2: Search within relevant documents
    detailed_chunks = []
    for doc in relevant_docs:
        chunks = detail_index.search(
            query,
            k=k,
            filter={"document_id": doc.id}
        )
        detailed_chunks.extend(chunks)

    return detailed_chunks
```

## Evaluation Metrics

### Retrieval Metrics
```python
def calculate_retrieval_metrics(queries, ground_truth, retriever, k=5):
    """Calculate retrieval quality metrics."""
    recall_scores = []
    precision_scores = []
    mrr_scores = []

    for query, relevant_docs in zip(queries, ground_truth):
        retrieved = retriever.search(query, k=k)
        retrieved_ids = [r.id for r in retrieved]

        # Recall: relevant found / total relevant
        found = len(set(retrieved_ids) & set(relevant_docs))
        recall = found / len(relevant_docs)
        recall_scores.append(recall)

        # Precision: relevant found / total retrieved
        precision = found / k
        precision_scores.append(precision)

        # MRR: 1 / position of first relevant
        mrr = 0
        for i, doc_id in enumerate(retrieved_ids):
            if doc_id in relevant_docs:
                mrr = 1 / (i + 1)
                break
        mrr_scores.append(mrr)

    return {
        "recall@k": sum(recall_scores) / len(recall_scores),
        "precision@k": sum(precision_scores) / len(precision_scores),
        "mrr": sum(mrr_scores) / len(mrr_scores)
    }
```

### Generation Metrics
```python
# Faithfulness: Is the answer grounded in context?
# Relevance: Does the answer address the question?
# Completeness: Does it cover all aspects?

def assess_generation(query, context, response, judge_llm):
    """Assess generation quality with LLM-as-judge."""
    faithfulness_prompt = f"""
    Context: {context}
    Response: {response}
    Is the response entirely supported by the context? (1-5 scale)
    """

    relevance_prompt = f"""
    Question: {query}
    Response: {response}
    Does the response answer the question? (1-5 scale)
    """

    return {
        "faithfulness": judge_llm.generate(faithfulness_prompt),
        "relevance": judge_llm.generate(relevance_prompt)
    }
```

## Production Considerations

### Caching
```python
from functools import lru_cache
import hashlib
import json

# Cache embeddings
@lru_cache(maxsize=10000)
def cached_embed(text):
    return embed_model.encode(text)

# Cache retrieval results with Redis
from redis import Redis
cache = Redis()

def cached_search(query, k=5, ttl=3600):
    cache_key = f"rag:{hashlib.md5(query.encode()).hexdigest()}:{k}"
    cached = cache.get(cache_key)
    if cached:
        return json.loads(cached)

    results = retriever.search(query, k=k)
    cache.setex(cache_key, ttl, json.dumps(results))
    return results
```

### Monitoring
```python
import time

# Track RAG pipeline metrics
def monitored_rag(query, metrics_client):
    start = time.time()

    # Embedding time
    embed_start = time.time()
    query_embedding = embed(query)
    metrics_client.timing("rag.embed_ms", (time.time() - embed_start) * 1000)

    # Retrieval time
    retrieve_start = time.time()
    contexts = retrieve(query_embedding)
    metrics_client.timing("rag.retrieve_ms", (time.time() - retrieve_start) * 1000)
    metrics_client.gauge("rag.num_chunks", len(contexts))

    # Generation time
    gen_start = time.time()
    response = generate(query, contexts)
    metrics_client.timing("rag.generate_ms", (time.time() - gen_start) * 1000)

    # Total time
    metrics_client.timing("rag.total_ms", (time.time() - start) * 1000)

    return response
```
