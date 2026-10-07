---
name: huggingface-trainer
description: Training and fine-tuning recipes for open-weight LLMs with Hugging Face TRL, Transformers and PEFT - choosing between SFT, DPO, GRPO and continued pretraining, LoRA and QLoRA configuration, GPU memory planning, chat and instruction dataset preparation and filtering, training on Hugging Face Jobs, GGUF conversion for llama.cpp or Ollama, evaluation with lm-evaluation-harness, and hyperparameter starting points. Use when fine-tuning or aligning an open model, picking a training method for the data you have, estimating the GPU a training run needs, preparing a training dataset, or exporting a fine-tuned model for local inference. Trigger on "fine-tuning", "model training", "huggingface", "TRL", "SFT", "DPO", "GRPO", "LoRA", "QLoRA", "PEFT", "GGUF". For managed fine-tuning on OCI see genai-dac-specialist.
metadata:
  version: "1.2.0"
  asOf: "2026-10-05"
  contentAsOf: "2026-01-06"
  scope: reference
---

# Hugging Face model training

Content as of 2026-01-06, written against TRL 0.12 or later and Transformers 4.47 or later ([TRL releases](https://github.com/huggingface/trl/releases), [Transformers releases](https://github.com/huggingface/transformers/releases), [UNVERIFIED] since). Model IDs, library versions and GPU figures below were not re-checked on 2026-10-05; confirm on the linked primary source before quoting.

Trainer argument names drift between TRL releases. Known renames [UNVERIFIED, check the [TRL docs](https://huggingface.co/docs/trl)]: `tokenizer=` became `processing_class=`, `max_seq_length` became `max_length` in `SFTConfig`, and `GRPOTrainer` takes `reward_funcs=`. The scripts below keep the 2026-01 argument names.

Training and fine-tuning LLMs with Hugging Face TRL (Transformer Reinforcement Learning), Transformers and PEFT: dataset preparation, training configuration, GPU selection and export. Deployment and evaluation depth: [references/export-and-evaluation.md](references/export-and-evaluation.md). Managed runs and cost estimation: [references/hf-jobs.md](references/hf-jobs.md).

## Training methods overview

### Method selection guide

```
┌─────────────────────────────────────────────────────────────────┐
│                    TRAINING METHOD SELECTION                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  HAVE LABELED DATA?                                             │
│  ├── Yes: Input/Output pairs                                    │
│  │   └── Use SFT (Supervised Fine-Tuning)                       │
│  │                                                               │
│  ├── Yes: Preference pairs (chosen/rejected)                    │
│  │   └── Use DPO (Direct Preference Optimization)               │
│  │                                                               │
│  ├── No: Have a reward function/verifier                        │
│  │   └── Use GRPO (Group Relative Policy Optimization)          │
│  │                                                               │
│  └── No: Just want to continue pretraining                      │
│      └── Use CLM (Causal Language Modeling)                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 1. Supervised fine-tuning (SFT)

### When to Use
- You have instruction/response pairs
- Adapting a model to your domain
- Teaching specific output formats

### Basic SFT script

```python
from trl import SFTTrainer, SFTConfig
from transformers import AutoModelForCausalLM, AutoTokenizer
from datasets import load_dataset

# Load model and tokenizer
model_id = "meta-llama/Llama-3.1-8B"
model = AutoModelForCausalLM.from_pretrained(model_id)
tokenizer = AutoTokenizer.from_pretrained(model_id)
tokenizer.pad_token = tokenizer.eos_token

# Load dataset
dataset = load_dataset("your-org/your-dataset", split="train")

# Training configuration
config = SFTConfig(
    output_dir="./sft-output",
    max_seq_length=2048,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=2e-5,
    num_train_epochs=3,
    logging_steps=10,
    save_strategy="epoch",
    bf16=True,  # Use bfloat16 on supported GPUs
)

# Create trainer
trainer = SFTTrainer(
    model=model,
    args=config,
    train_dataset=dataset,
    tokenizer=tokenizer,
)

# Train
trainer.train()
trainer.save_model("./final-model")
```

### SFT with chat template

```python
from trl import SFTTrainer, SFTConfig

# Dataset should have 'messages' column in chat format
# [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]

config = SFTConfig(
    output_dir="./chat-sft",
    max_seq_length=4096,
    per_device_train_batch_size=2,
    gradient_accumulation_steps=8,
    learning_rate=2e-5,
    num_train_epochs=3,
)

trainer = SFTTrainer(
    model=model,
    args=config,
    train_dataset=dataset,
    tokenizer=tokenizer,
    # Automatically applies chat template
)
```

## 2. Direct preference optimization (DPO)

### When to Use
- You have preference data (chosen vs rejected responses)
- Aligning model with human preferences
- Improving response quality

### DPO script

```python
from trl import DPOTrainer, DPOConfig
from transformers import AutoModelForCausalLM, AutoTokenizer
from datasets import load_dataset

# Load model
model_id = "meta-llama/Llama-3.1-8B-Instruct"
model = AutoModelForCausalLM.from_pretrained(model_id)
tokenizer = AutoTokenizer.from_pretrained(model_id)

# Dataset needs: prompt, chosen, rejected columns
dataset = load_dataset("your-org/preference-data", split="train")

config = DPOConfig(
    output_dir="./dpo-output",
    per_device_train_batch_size=2,
    gradient_accumulation_steps=4,
    learning_rate=5e-7,  # Lower LR for DPO
    beta=0.1,  # KL penalty coefficient
    num_train_epochs=1,
    bf16=True,
    logging_steps=10,
)

trainer = DPOTrainer(
    model=model,
    args=config,
    train_dataset=dataset,
    tokenizer=tokenizer,
)

trainer.train()
```

### Preference data format

```python
# Required columns: prompt, chosen, rejected
preference_example = {
    "prompt": "Explain quantum computing",
    "chosen": "Quantum computing uses quantum bits...",  # Better response
    "rejected": "Computers are fast machines..."  # Worse response
}
```

## 3. Group relative policy optimization (GRPO)

### When to Use
- You have a reward function or verifier
- Math/code tasks with checkable answers
- RL-based training without paired preferences

### GRPO script

```python
from trl import GRPOTrainer, GRPOConfig
from transformers import AutoModelForCausalLM, AutoTokenizer

model_id = "meta-llama/Llama-3.1-8B-Instruct"
model = AutoModelForCausalLM.from_pretrained(model_id)
tokenizer = AutoTokenizer.from_pretrained(model_id)

# Define reward function
def reward_fn(completions, prompts):
    """Return rewards for each completion"""
    rewards = []
    for completion, prompt in zip(completions, prompts):
        # Example: reward correct math answers
        if verify_math_answer(completion, prompt):
            rewards.append(1.0)
        else:
            rewards.append(-0.5)
    return rewards

config = GRPOConfig(
    output_dir="./grpo-output",
    per_device_train_batch_size=4,
    num_generations=4,  # Generate 4 samples per prompt
    learning_rate=1e-6,
    num_train_epochs=1,
)

trainer = GRPOTrainer(
    model=model,
    args=config,
    train_dataset=dataset,
    tokenizer=tokenizer,
    reward_fn=reward_fn,
)

trainer.train()
```

## 4. Parameter-efficient fine-tuning (PEFT and LoRA)

### Why use LoRA
- Train large models on limited GPU memory
- Trainable parameters are a small fraction of the model (print them with `print_trainable_parameters()`)
- Fast training, easy to merge or swap adapters

### LoRA configuration

```python
from peft import LoraConfig, get_peft_model, TaskType

# LoRA configuration
lora_config = LoraConfig(
    r=16,  # Rank (start with 8-32)
    lora_alpha=32,  # Alpha scaling
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type=TaskType.CAUSAL_LM,
)

# Apply to model
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()
# Illustrative output for an 8B model; run it to get your own figure.
# Output: trainable params: 6,553,600 || all params: 8,030,261,248 || trainable%: 0.082
```

### SFT with LoRA

```python
from trl import SFTTrainer, SFTConfig
from peft import LoraConfig

# LoRA config
peft_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
)

config = SFTConfig(
    output_dir="./lora-sft",
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,  # Higher LR for LoRA
    num_train_epochs=3,
    bf16=True,
)

trainer = SFTTrainer(
    model=model,
    args=config,
    train_dataset=dataset,
    tokenizer=tokenizer,
    peft_config=peft_config,  # Pass LoRA config
)

trainer.train()
```

### QLoRA (Quantized LoRA)

```python
from transformers import BitsAndBytesConfig
import torch

# 4-bit quantization config
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_use_double_quant=True,
)

# Load quantized model
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    quantization_config=bnb_config,
    device_map="auto",
)

# Then apply LoRA as normal
```

## GPU selection guide

### Memory requirements

Rough planning figures as of 2026-01-06 [UNVERIFIED]; actual use depends on sequence length, batch size, optimizer and gradient checkpointing. Estimate a specific model with the [Accelerate model memory estimator](https://huggingface.co/docs/accelerate/usage_guides/model_size_estimator) and confirm with a short run.

| Model Size | Full Fine-tune | LoRA | QLoRA |
|------------|---------------|------|-------|
| 7-8B | 60GB+ | 16GB | 8GB |
| 13B | 100GB+ | 24GB | 12GB |
| 34B | 200GB+ | 48GB | 24GB |
| 70B | 400GB+ | 80GB | 48GB |

### GPU recommendations

GPU fits as of 2026-01-06 [UNVERIFIED]. Instance families: [AWS accelerated computing](https://aws.amazon.com/ec2/instance-types/#Accelerated_Computing), [Google Cloud GPUs](https://cloud.google.com/compute/docs/gpus), [Azure GPU sizes](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/overview). Compare prices on the day from each provider's pricing page.

```
┌─────────────────────────────────────────────────────────────────┐
│                    GPU SELECTION GUIDE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  TASK                    │ RECOMMENDED GPU                       │
│  ────────────────────────┼────────────────────────────────────  │
│  QLoRA 8B               │ RTX 4090 (24GB), A10G                 │
│  QLoRA 70B              │ A100 40GB x2, H100                    │
│  LoRA 8B                │ A100 40GB, A10G x2                    │
│  LoRA 70B               │ A100 80GB x2, H100 x2                 │
│  Full FT 8B             │ A100 80GB x2, H100                    │
│  Full FT 70B            │ H100 x8, A100 80GB x8                 │
│                                                                  │
│  CLOUD PROVIDERS:                                                │
│  - AWS: p4d (A100), p5 (H100)                                   │
│  - GCP: a2-highgpu (A100), a3-highgpu (H100)                   │
│  - Azure: NC A100, ND H100                                      │
│  - Lambda: GPU cloud (https://lambda.ai/pricing)                │
│  - RunPod: GPU cloud with spot capacity (runpod.io/pricing)     │
│  - HuggingFace Jobs: Managed training infrastructure            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Dataset preparation

Use a `messages` column in chat format for chat SFT, `prompt`/`completion` or instruction/input/output columns for instruction SFT, and `prompt`/`chosen`/`rejected` for DPO. Filter very short and repetitive completions and deduplicate on the prompt before training. Examples and filter code: [references/dataset-preparation.md](references/dataset-preparation.md).

## Managed training runs

Hugging Face Jobs runs a training script on managed GPUs, submitted from the CLI or an MCP tool. Submission example and a cost estimator with placeholder rates: [references/hf-jobs.md](references/hf-jobs.md).

## Export and evaluation

Convert a fine-tuned model to GGUF for llama.cpp or Ollama, choose a quantization level, and evaluate with lm-evaluation-harness or a custom test set: [references/export-and-evaluation.md](references/export-and-evaluation.md).

## Practices

### Training checklist

```yaml
before_training:
  - [ ] Validate dataset format and quality
  - [ ] Check GPU memory requirements
  - [ ] Set up monitoring (W&B, TensorBoard)
  - [ ] Configure checkpointing strategy
  - [ ] Test with small subset first

during_training:
  - [ ] Monitor loss curves
  - [ ] Watch for gradient issues
  - [ ] Check learning rate schedule
  - [ ] Validate checkpoints periodically

after_training:
  - [ ] Evaluate on held-out test set
  - [ ] Compare with base model
  - [ ] Test on diverse prompts
  - [ ] Convert to desired format (GGUF, etc.)
  - [ ] Push to Hub with model card
```

### Hyperparameter guidelines

Common starting points as of 2026-01-06 [UNVERIFIED], not tuned values; see the [TRL docs](https://huggingface.co/docs/trl) for current defaults.

```python
# SFT defaults
SFT_DEFAULTS = {
    "learning_rate": 2e-5,  # Full fine-tune
    "learning_rate_lora": 2e-4,  # LoRA (higher)
    "batch_size": 4,
    "gradient_accumulation": 4,  # Effective batch = 16
    "epochs": 1-3,
    "warmup_ratio": 0.03,
    "weight_decay": 0.01,
}

# DPO defaults
DPO_DEFAULTS = {
    "learning_rate": 5e-7,  # Much lower
    "beta": 0.1,  # KL penalty
    "epochs": 1,  # Usually 1 is enough
}
```

## Resources

- [TRL Documentation](https://huggingface.co/docs/trl)
- [PEFT Documentation](https://huggingface.co/docs/peft)
- [HuggingFace Hub](https://huggingface.co/models)
- [HuggingFace Jobs](https://huggingface.co/jobs)
- [lm-eval-harness](https://github.com/EleutherAI/lm-evaluation-harness)
- [Axolotl](https://github.com/OpenAccess-AI-Collective/axolotl) - High-level training framework

## Changelog

- 1.2.0: frontmatter to agentskills.io spec, stale versions and GPU figures dated and sourced, unsourced rates and cost outputs replaced with placeholders, Jobs, export and evaluation moved to references/.
- 1.1.0: earlier content, dated 2026-01-06.
