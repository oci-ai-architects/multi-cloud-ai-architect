# Dataset preparation

Moved from SKILL.md on 2026-10-05; content as of 2026-01-06.

## Dataset preparation

### Chat format dataset

```python
from datasets import Dataset

# Conversation format
conversations = [
    {
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "What is Python?"},
            {"role": "assistant", "content": "Python is a programming language..."}
        ]
    },
    # More examples...
]

dataset = Dataset.from_list(conversations)
dataset.push_to_hub("your-org/chat-dataset")
```

### Instruction format

```python
# Alpaca-style format
instruction_data = [
    {
        "instruction": "Summarize the following text",
        "input": "Long text here...",
        "output": "Summary here..."
    }
]

# Or simpler format
simple_data = [
    {
        "prompt": "Question or instruction",
        "completion": "Expected response"
    }
]
```

### Data quality tips

```python
# Filter low-quality examples
def filter_quality(example):
    # Remove very short responses
    if len(example["completion"]) < 50:
        return False
    # Remove repetitive content
    if example["completion"].count(example["completion"][:20]) > 3:
        return False
    return True

dataset = dataset.filter(filter_quality)

# Deduplicate
from datasets import concatenate_datasets

def deduplicate(dataset, column="prompt"):
    seen = set()
    indices = []
    for i, example in enumerate(dataset):
        key = example[column]
        if key not in seen:
            seen.add(key)
            indices.append(i)
    return dataset.select(indices)
```
