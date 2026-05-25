# Workflow Execution & Node System

## Workflow Execution Flow

```
START
  ↓
Parse Workflow Definition
  ↓
Extract Nodes & Connections
  ↓
Topological Sort (if needed)
  ↓
FOR EACH NODE:
  ├── Create Execution Context
  ├── Validate Configuration
  ├── Execute Node
  ├── Capture Output
  └── Log Result
  ↓
MERGE OUTPUTS
  ↓
UPDATE STATUS
  ↓
END
```

## Node Lifecycle

1. **Idle** - Node is ready to execute
2. **Running** - Node is currently executing
3. **Success** - Node executed successfully
4. **Error** - Node execution failed

## Node Types & Implementations

### 1. Start Node
Trigger node untuk memulai workflow.

```javascript
// Config
{
  trigger: 'manual'  // Bisa juga 'webhook', 'schedule'
}

// Output
{
  started: true,
  timestamp: '2024-01-01T00:00:00Z'
}
```

### 2. Send URL Message Node
Mengirim HTTP request ke URL.

```javascript
// Config
{
  method: 'POST',
  url: 'https://api.example.com/send',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token'
  },
  body: {
    message: 'Hello World',
    timestamp: '{{ timestamp }}'
  }
}

// Output
{
  status: 'sent',
  statusCode: 200,
  data: { /* response */ }
}
```

### 3. Send Webhook Node
Similar ke Send URL tapi dengan retry logic.

```javascript
// Config
{
  url: 'https://webhook.example.com',
  method: 'POST',
  payload: { /* data */ },
  retries: 3,
  timeout: 10000
}

// Output
{
  status: 'webhook_sent',
  statusCode: 200,
  attempts: 1
}
```

### 4. Delay Node
Menunda eksekusi untuk durasi tertentu.

```javascript
// Config
{
  duration: 5000,  // milliseconds
  unit: 'ms'       // atau 's', 'm', 'h'
}

// Output
{
  status: 'delayed',
  delayedFor: 5000
}
```

### 5. Conditional Node (Future)
Logic if-else untuk branching workflow.

```javascript
// Config
{
  condition: 'input.status === "success"',
  trueBranch: 'node_success',
  falseBranch: 'node_error'
}

// Output
{
  matched: true,
  nextNode: 'node_success'
}
```

## Node Configuration Schema

```typescript
interface NodeConfig {
  type: string;
  name: string;
  description?: string;
  icon?: string;
  category?: string;
  
  inputs?: string[];       // Input port names
  outputs?: string[];      // Output port names
  
  properties?: {
    [key: string]: {
      type: 'string' | 'number' | 'boolean' | 'object';
      required?: boolean;
      default?: any;
      description?: string;
    }
  };
}
```

## Execution Context

Setiap node execution memiliki context:

```typescript
interface ExecutionContext {
  workflowId: string;
  executionId: string;
  nodeId: string;
  nodeType: string;
  config: Record<string, any>;
  
  previousOutput?: any;    // Output dari node sebelumnya
  globalContext?: Record<string, any>;  // Workflow-level context
  
  timestamp: Date;
  retry: number;
  
  // Helper methods
  log(message: string, level?: 'info' | 'error' | 'warning'): void;
  setOutput(output: any): void;
}
```

## Error Handling

```javascript
// Node Executor
try {
  const result = await executeNode(node);
  logSuccess(result);
} catch (error) {
  logError(error);
  
  if (node.config.retryOnError && retryCount < node.config.maxRetries) {
    // Retry logic
    await delay(node.config.retryDelay);
    return executeNode(node, retryCount + 1);
  } else {
    // Stop or continue based on config
    if (node.config.stopOnError) {
      throw error;  // Stop entire workflow
    } else {
      // Continue to next node
    }
  }
}
```

## Output Mapping & Variable Substitution

Node outputs dapat digunakan di node berikutnya:

```javascript
// Node A output
{
  message: 'Hello',
  id: 123
}

// Node B config - gunakan output dari Node A
{
  url: 'https://api.example.com/send',
  body: {
    message: '{{ nodeA.message }}',  // Reference to previous node output
    id: '{{ nodeA.id }}'
  }
}
```

## Execution Logging

Setiap step dilog untuk debugging:

```typescript
interface ExecutionLog {
  timestamp: Date;
  nodeId: string;
  nodeName: string;
  level: 'info' | 'error' | 'warning';
  message: string;
  
  input?: any;   // Node input
  output?: any;  // Node output
  error?: string;  // Error message if failed
  duration?: number;  // Execution time in ms
}
```

## Performance Optimization

### Parallel Execution
Untuk independent branches:

```javascript
// Workflow dengan parallel nodes
START
  ├── Send Email (parallel)
  ├── Send Webhook (parallel)
  └── Log to Database (parallel)

Promise.all([
  executeNode(emailNode),
  executeNode(webhookNode),
  executeNode(logNode)
]);
```

### Caching
Cache node outputs untuk reuse:

```javascript
const executionCache = new Map();

if (executionCache.has(nodeId)) {
  return executionCache.get(nodeId);
}

const result = await executeNode(node);
executionCache.set(nodeId, result);
return result;
```

## Testing Nodes

```javascript
// Unit test untuk node executor
describe('SendUrlNode', () => {
  it('should send HTTP POST request', async () => {
    const node = {
      id: 'test-node',
      type: 'send-url-message',
      config: {
        url: 'https://httpbin.org/post',
        method: 'POST',
        body: { test: 'data' }
      }
    };

    const result = await nodeExecutor.execute('send-url-message', node.config);
    
    expect(result.status).toBe('sent');
    expect(result.statusCode).toBe(200);
  });
});
```

## Future Enhancements

1. **Advanced Routing** - Switch/case untuk multiple outputs
2. **Transform Nodes** - JSON transform, regex, math operations
3. **Loop Nodes** - For-each, while loops
4. **Error Handlers** - Try-catch nodes
5. **Database Nodes** - Query, update, delete
6. **File Operations** - Read, write, transform files
7. **AI Nodes** - OpenAI, Claude integration
8. **Communication** - Email, Slack, Teams, Discord
9. **Storage** - Cloud storage integrations
10. **Custom Nodes** - User-defined node creation
