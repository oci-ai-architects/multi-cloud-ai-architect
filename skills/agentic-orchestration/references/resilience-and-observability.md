# Error handling, recovery and observability for agent workflows

As of 2026-01-06. Framework-neutral TypeScript sketches; no versioned APIs.

## Error handling and recovery

### Pattern 1: Retry with Backoff
```typescript
async function executeWithRetry(agent, task, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await agent.execute(task);
    } catch (error) {
      if (attempt === maxRetries) throw error;

      const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms`);
      await sleep(delay);
    }
  }
}
```

### Pattern 2: Fallback Agents
```typescript
const agentFallbacks = {
  "SpecialistCodeReviewer": ["GeneralCodeReviewer", "SeniorDeveloper"],
  "SecurityAnalyst": ["GeneralAnalyst", "SeniorDeveloper"],
  "PerformanceExpert": ["GeneralAnalyst", "SeniorDeveloper"]
};

async function executeWithFallback(primaryAgent, task) {
  try {
    return await primaryAgent.execute(task);
  } catch (error) {
    const fallbacks = agentFallbacks[primaryAgent.name] || [];

    for (const fallbackName of fallbacks) {
      try {
        console.log(`Primary failed, trying ${fallbackName}`);
        return await getAgent(fallbackName).execute(task);
      } catch (fallbackError) {
        continue;
      }
    }

    throw new Error(`All agents failed for task: ${task.id}`);
  }
}
```

### Pattern 3: Checkpoint and resume
```typescript
interface Checkpoint {
  task_id: string;
  completed_steps: string[];
  current_step: string;
  state: any;
  timestamp: Date;
}

async function executeWithCheckpoints(task, steps) {
  const checkpoint = await loadCheckpoint(task.id);
  const startIndex = checkpoint
    ? steps.indexOf(checkpoint.current_step)
    : 0;

  for (let i = startIndex; i < steps.length; i++) {
    const step = steps[i];

    try {
      await executeStep(step, task);
      await saveCheckpoint({
        task_id: task.id,
        completed_steps: steps.slice(0, i + 1),
        current_step: steps[i + 1] || "complete",
        state: task.state,
        timestamp: new Date()
      });
    } catch (error) {
      // Checkpoint is saved, can resume from here
      throw error;
    }
  }
}
```

---

## Observability patterns

### Pattern 1: Structured Logging
```typescript
function agentLog(agent, event, details) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    agent: agent.name,
    task_id: agent.currentTask?.id,
    event: event,
    details: details,
    duration_ms: details.duration,
    tokens_used: details.tokens
  }));
}

// Usage
agentLog(agent, "TASK_START", { task: task.description });
agentLog(agent, "TOOL_CALL", { tool: "read_file", path: "/src/index.ts" });
agentLog(agent, "TASK_COMPLETE", { result: "success", duration: 5230 });
```

### Pattern 2: Progress Tracking
```typescript
interface TaskProgress {
  task_id: string;
  total_steps: number;
  completed_steps: number;
  current_step: string;
  estimated_remaining: number; // seconds
  agents_involved: string[];
}

// Expose progress for UI/monitoring
function getProgress(task): TaskProgress {
  return {
    task_id: task.id,
    total_steps: task.steps.length,
    completed_steps: task.completedSteps.length,
    current_step: task.currentStep?.description || "idle",
    estimated_remaining: estimateRemaining(task),
    agents_involved: task.agentHistory
  };
}
```

### Pattern 3: Decision Audit Trail
```typescript
interface Decision {
  timestamp: Date;
  agent: string;
  decision: string;
  options_considered: string[];
  rationale: string;
  confidence: number; // 0-1
  reversible: boolean;
}

// Track all significant decisions
const decisionLog: Decision[] = [];

function recordDecision(agent, decision, options, rationale, confidence) {
  decisionLog.push({
    timestamp: new Date(),
    agent: agent.name,
    decision,
    options_considered: options,
    rationale,
    confidence,
    reversible: true
  });
}
```
