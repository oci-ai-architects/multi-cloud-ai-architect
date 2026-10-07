# NIM model catalog snapshot

As of 2026-01-06 [UNVERIFIED]. Moved from SKILL.md on 2026-10-05 and not re-checked. Any of these may since have a newer version or have left the hosted API. Primary sources: the API catalog (https://build.nvidia.com/explore/discover), the NGC container catalog (https://catalog.ngc.nvidia.com/containers?filters=nim) and the NIM for LLMs support matrix (https://docs.nvidia.com/nim/large-language-models/latest/support-matrix.html). Embedding dimensions come from each model card on build.nvidia.com.

### LLM Models
| Model | Size | Best For |
|-------|------|----------|
| meta/llama-3.1-405b-instruct | 405B | Complex reasoning, enterprise |
| meta/llama-3.1-70b-instruct | 70B | General purpose, balanced |
| meta/llama-3.1-8b-instruct | 8B | Fast inference, cost-effective |
| mistralai/mixtral-8x22b-instruct-v0.1 | 141B | Multi-expert reasoning |
| nvidia/nemotron-4-340b-instruct | 340B | Enterprise, high accuracy |
| google/gemma-2-27b-it | 27B | Efficient, open weights |

### Vision Models (VLM)
| Model | Capabilities |
|-------|-------------|
| microsoft/phi-3-vision-128k-instruct | Image understanding |
| nvidia/vila-1.5-40b | Video/image analysis |
| google/paligemma-3b-mix-224 | Multimodal tasks |

### Embedding Models
| Model | Dimensions | Use Case |
|-------|------------|----------|
| nvidia/nv-embedqa-e5-v5 | 1024 | RAG, semantic search |
| nvidia/nv-embed-v2 | 4096 | High-quality embeddings |
| nvidia/llama-3.2-nv-embedqa-1b-v2 | 2048 | Balanced performance |

### Reranking Models
| Model | Use Case |
|-------|----------|
| nvidia/nv-rerankqa-mistral-4b-v3 | Document reranking |
| nvidia/llama-3.2-nv-rerankqa-1b-v2 | Fast reranking |
