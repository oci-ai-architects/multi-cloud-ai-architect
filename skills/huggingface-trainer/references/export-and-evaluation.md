# Export and evaluation

Moved from SKILL.md on 2026-10-05; content as of 2026-01-06.

## GGUF conversion for local deployment

```python
# Convert to GGUF for llama.cpp / Ollama

from transformers import AutoModelForCausalLM, AutoTokenizer

# Load your fine-tuned model
model = AutoModelForCausalLM.from_pretrained("./fine-tuned-model")
tokenizer = AutoTokenizer.from_pretrained("./fine-tuned-model")

# Save in format for conversion
model.save_pretrained("./model-for-gguf", safe_serialization=True)
tokenizer.save_pretrained("./model-for-gguf")

# Then use llama.cpp for conversion:
# python convert_hf_to_gguf.py ./model-for-gguf --outtype q4_k_m
```

### Quantization options

Approximate size reductions relative to FP32 weights, as of 2026-01-06 [UNVERIFIED]. Quality loss is qualitative; measure it on your eval set. Source: [llama.cpp quantization](https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md).

| Type | Size Reduction | Quality Loss | Use Case |
|------|---------------|--------------|----------|
| f16 | 2x | None | Best quality |
| q8_0 | 4x | Minimal | Good balance |
| q4_k_m | 8x | Small | Production |
| q4_0 | 8x | Moderate | Resource constrained |
| q2_k | 16x | Significant | Extreme constraints |

## Evaluation

### Using lm-evaluation-harness

```python
# Install: pip install lm-eval

# Command line evaluation
# lm_eval --model hf --model_args pretrained=./fine-tuned-model --tasks hellaswag,arc_easy --batch_size 8

# Programmatic
from lm_eval import evaluator, tasks

results = evaluator.simple_evaluate(
    model="hf",
    model_args="pretrained=./fine-tuned-model",
    tasks=["hellaswag", "arc_easy", "mmlu"],
    batch_size=8,
)

print(results["results"])
```

### Custom evaluation

```python
def evaluate_on_test_set(model, tokenizer, test_dataset):
    correct = 0
    total = 0

    for example in test_dataset:
        prompt = example["prompt"]
        expected = example["expected"]

        inputs = tokenizer(prompt, return_tensors="pt")
        outputs = model.generate(**inputs, max_new_tokens=100)
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)

        if expected.lower() in response.lower():
            correct += 1
        total += 1

    return {"accuracy": correct / total, "total": total}
```
