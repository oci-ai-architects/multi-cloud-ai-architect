# Cost tooling examples

Moved from SKILL.md on 2026-10-05; content as of 2026-01-06. Resource arguments were not re-checked; see the [AWS Budgets Terraform resource](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/budgets_budget).

## Budget alerts

```hcl
# Terraform for AWS Budget Alert
resource "aws_budgets_budget" "ai_monthly" {
  name         = "ai-platform-monthly"
  budget_type  = "COST"
  limit_amount = "10000"
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  cost_filter {
    name   = "TagKeyValue"
    values = ["user:project$ai-platform"]
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = ["finops@company.com"]
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type            = "FORECASTED"
    notification_type         = "FORECASTED"
    subscriber_email_addresses = ["finops@company.com", "engineering@company.com"]
  }
}
```


## Multi-cloud cost arbitrage

### Provider selection by cost

```python
class MultiCloudCostRouter:
    """Route workloads to cheapest provider"""

    # Price per 1K tokens, loaded from a dated price file (for example a pack's
    # prices.json) rather than typed in. Keys are illustrative.
    PROVIDER_COSTS = {
        "embedding": {
            "provider_a_embed": PRICE_A_EMBED,
            "provider_b_embed": PRICE_B_EMBED,
        },
        "chat": {
            "provider_a_small": PRICE_A_SMALL,
            "provider_b_small": PRICE_B_SMALL,
        }
    }

    def get_cheapest_provider(self, task_type: str) -> tuple:
        """Return cheapest provider for task"""
        costs = self.PROVIDER_COSTS.get(task_type, {})
        if not costs:
            return None, None

        cheapest = min(costs.items(), key=lambda x: x[1])
        return cheapest

    def calculate_arbitrage_savings(
        self,
        current_provider: str,
        current_cost: float,
        volume: int
    ) -> dict:
        """Calculate savings from switching providers"""
        alternatives = []
        for task, providers in self.PROVIDER_COSTS.items():
            for provider, cost in providers.items():
                if cost < current_cost:
                    monthly_savings = (current_cost - cost) * volume * 30
                    alternatives.append({
                        "provider": provider,
                        "cost": cost,
                        "monthly_savings": f"${monthly_savings:.2f}"
                    })

        return sorted(alternatives, key=lambda x: float(x["monthly_savings"].replace("$", "")), reverse=True)
```
