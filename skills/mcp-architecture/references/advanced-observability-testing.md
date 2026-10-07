# MCP server advanced patterns, observability and testing

Moved from SKILL.md on 2026-10-05. Content as of 2026-01-06; the Python decorators and the `mcp.testing` helpers are illustrative and were not re-checked against the official SDK (https://github.com/modelcontextprotocol/python-sdk).

## Advanced Patterns

### Multi-Source Aggregation
```python
@server.resource("aggregated://customer")
async def aggregate_customer_data(customer_id: str):
    """Combine data from multiple sources"""
    crm_data = await crm_server.get_resource(f"crm://{customer_id}")
    support_data = await support_server.get_resource(f"support://{customer_id}")
    analytics_data = await analytics_server.get_resource(f"analytics://{customer_id}")

    return {
        "uri": f"aggregated://customer/{customer_id}",
        "data": {
            **crm_data,
            **support_data,
            **analytics_data
        }
    }
```

### Caching Layer
```python
from functools import lru_cache

@server.resource("cached://")
@lru_cache(maxsize=1000)
async def cached_resource(uri: str):
    """Cache frequently accessed resources"""
    return await expensive_fetch(uri)
```

### Streaming Large Data
```python
@server.tool()
async def stream_large_dataset(query: str):
    """Stream results for large datasets"""
    async for chunk in database.stream(query):
        yield chunk
```

## Monitoring & Observability

### Metrics Collection
```python
from prometheus_client import Counter, Histogram

tool_calls = Counter('mcp_tool_calls', 'Tool invocations', ['tool_name'])
latency = Histogram('mcp_latency', 'Operation latency')

@server.tool()
@latency.time()
async def monitored_tool():
    tool_calls.labels(tool_name='monitored_tool').inc()
    # Tool implementation
```

### Error Tracking
```python
import logging

logger = logging.getLogger("mcp_server")

@server.tool()
async def error_tracked_tool():
    try:
        return await risky_operation()
    except Exception as e:
        logger.error(f"Tool failed: {e}", exc_info=True)
        raise
```

## Testing MCP Servers

### Unit Testing
```python
import pytest
from mcp.testing import MockServer

@pytest.mark.asyncio
async def test_customer_tool():
    server = MockServer()
    result = await server.call_tool("get_customer", {"id": "123"})
    assert result["customer_id"] == "123"
```

### Integration Testing
```python
@pytest.mark.asyncio
async def test_full_workflow():
    # Start test server
    async with TestMCPServer() as server:
        # Test resource access
        resource = await server.get_resource("test://data")
        assert resource is not None

        # Test tool execution
        result = await server.call_tool("process_data", {"input": "test"})
        assert result["success"] == True
```
