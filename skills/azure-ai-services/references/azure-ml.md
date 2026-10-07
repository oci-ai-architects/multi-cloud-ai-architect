# Azure Machine Learning training and endpoints

As of 2026-01-06 [UNVERIFIED]. Environment names, VM sizes and SDK calls change; check
https://learn.microsoft.com/azure/machine-learning/ before copying.

## Training with Azure ML

```python
from azure.ai.ml import MLClient, command, Input
from azure.identity import DefaultAzureCredential

ml_client = MLClient(
    DefaultAzureCredential(),
    subscription_id="...",
    resource_group_name="...",
    workspace_name="..."
)

# Define training job
job = command(
    code="./src",
    command="python train.py --data ${{inputs.data}} --lr ${{inputs.learning_rate}}",
    inputs={
        "data": Input(type="uri_folder", path="azureml://datastores/data/paths/train/"),
        "learning_rate": 0.001,
    },
    environment="AzureML-pytorch-2.0-cuda11.8@latest",
    compute="gpu-cluster",
    experiment_name="llm-finetune"
)

# Submit job
returned_job = ml_client.jobs.create_or_update(job)
```

## Deploy to a managed endpoint

```python
from azure.ai.ml.entities import (
    ManagedOnlineEndpoint,
    ManagedOnlineDeployment,
    Model,
)

# Create endpoint
endpoint = ManagedOnlineEndpoint(
    name="llm-endpoint",
    auth_mode="key"
)
ml_client.online_endpoints.begin_create_or_update(endpoint).result()

# Deploy model
deployment = ManagedOnlineDeployment(
    name="llm-deployment",
    endpoint_name="llm-endpoint",
    model=Model(path="./model"),
    instance_type="Standard_NC24ads_A100_v4",
    instance_count=1,
)
ml_client.online_deployments.begin_create_or_update(deployment).result()
```
