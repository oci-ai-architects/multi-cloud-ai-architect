# Hugging Face Jobs and cost estimation

Moved from SKILL.md on 2026-10-05; content as of 2026-01-06.

## Training on Hugging Face Jobs

### Using an HF Jobs MCP tool

Tool and argument names as of 2026-01-06 [UNVERIFIED]. Source: [Hugging Face Jobs docs](https://huggingface.co/docs/huggingface_hub/guides/jobs).

```python
# If using Claude Code with HF Jobs MCP
# This is submitted via hf_jobs() MCP tool

training_script = '''
from trl import SFTTrainer, SFTConfig
from transformers import AutoModelForCausalLM, AutoTokenizer
from datasets import load_dataset

model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-3.1-8B")
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3.1-8B")
dataset = load_dataset("your-org/your-dataset", split="train")

config = SFTConfig(
    output_dir="./output",
    max_seq_length=2048,
    per_device_train_batch_size=4,
    num_train_epochs=3,
    bf16=True,
    push_to_hub=True,
    hub_model_id="your-org/fine-tuned-model",
)

trainer = SFTTrainer(model=model, args=config, train_dataset=dataset, tokenizer=tokenizer)
trainer.train()
'''

# Submit via MCP: hf_jobs("uv", {"script": training_script, "gpu": "a100"})
```

### Cost estimation

The 2026-01-06 text hard-coded hourly rates and throughput per GPU with no source; they are replaced with placeholders. Read hourly rates from the [Hugging Face Jobs pricing](https://huggingface.co/pricing) or your cloud's pricing page on the day, and measure tokens per hour with a short run of your own script.

```python
TRAINING_COSTS = {
    # GPU type: (hourly_rate_usd, measured_tokens_per_hour)
    "a10g": (A10G_HOURLY_RATE, A10G_TOKENS_PER_HOUR),
    "a100_40gb": (A100_40_HOURLY_RATE, A100_40_TOKENS_PER_HOUR),
    "a100_80gb": (A100_80_HOURLY_RATE, A100_80_TOKENS_PER_HOUR),
    "h100": (H100_HOURLY_RATE, H100_TOKENS_PER_HOUR),
}

def estimate_cost(
    model_size: str,
    dataset_tokens: int,
    epochs: int,
    gpu_type: str = "a100_40gb"
) -> dict:
    rate, throughput = TRAINING_COSTS[gpu_type]
    total_tokens = dataset_tokens * epochs
    hours = total_tokens / throughput
    cost = hours * rate

    return {
        "gpu": gpu_type,
        "estimated_hours": round(hours, 1),
        "estimated_cost": f"${cost:.2f}",
        "total_tokens": f"{total_tokens:,}"
    }

# Example call: 10M token dataset, 3 epochs on A100 40GB
estimate_cost("8B", 10_000_000, 3, "a100_40gb")
```
