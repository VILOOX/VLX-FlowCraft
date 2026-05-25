# Node System Documentation

## Overview

VLX Flow menggunakan sistem node modular yang memungkinkan penambahan node baru tanpa merubah core engine.

## Node Architecture

```
┌─────────────────────────────────────┐
│          Node Definition            │
├─────────────────────────────────────┤
│  ├─ ID (Unique identifier)          │
│  ├─ Type (start, send-url, etc)     │
│  ├─ Position (x, y coordinates)     │
│  ├─ Config (Node-specific config)   │
│  └─ Status (idle, running, etc)     │
└─────────────────────────────────────┘
         │
         ├─→ Frontend Renderer
         │   (React Component)
         │
         └─→ Backend Executor
             (Node Executor)
```

## Built-in Nodes

### 1. Start Node
**Type:** `start`

Trigger node untuk memulai workflow execution.

**Configuration:**
```json
{
  "trigger": "manual"
}
```

**Trigger Types:**
- `manual` - Dipicu secara manual
- `webhook` - Dipicu dari webhook (future)
- `schedule` - Dipicu secara berkala (future)
- `event` - Dipicu dari event (future)

**Output:**
```json
{
  "started": true,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 2. Send URL Message Node
**Type:** `send-url-message`

Mengirim HTTP request ke URL.

**Configuration:**
```json
{
  "method": "POST",
  "url": "https://api.example.com/send",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer token"
  },
  "body": {
    "message": "Hello",
    "user": "{{ input.user }}"
  }
}
```

**Supported Methods:**
- GET
- POST
- PUT
- PATCH
- DELETE
- HEAD

**Output:**
```json
{
  "status": "sent",
  "statusCode": 200,
  "data": {
    "id": "msg_123"
  }
}
```

**Error Handling:**
- Network timeout → Error log + stop execution
- Non-2xx status → Error log + include response
- Invalid URL → Validation error

### 3. Send Webhook Node
**Type:** `send-webhook`

Mengirim webhook dengan retry logic.

**Configuration:**
```json
{
  "url": "https://webhook.example.com",
  "method": "POST",
  "payload": {
    "event": "workflow_complete",
    "data": "{{ previousNode.data }}"
  },
  "retries": 3,
  "retryDelay": 1000,
  "timeout": 10000
}
```

**Output:**
```json
{
  "status": "webhook_sent",
  "statusCode": 200,
  "attempts": 1
}
```

### 4. Delay Node
**Type:** `delay`

Menunda eksekusi untuk durasi tertentu.

**Configuration:**
```json
{
  "duration": 5,
  "unit": "seconds"
}
```

**Supported Units:**
- milliseconds (ms)
- seconds (s)
- minutes (m)
- hours (h)

**Output:**
```json
{
  "status": "delayed",
  "delayedFor": 5000
}
```

## Creating Custom Nodes

### Step 1: Define Node Config

Create `mynode.config.ts`:

```typescript
export const nodeConfig = {
  type: 'my-custom-node',
  name: 'My Custom Node',
  icon: 'icon-name',
  category: 'action',
  
  inputs: ['main'],
  outputs: ['main', 'error'],
  
  properties: {
    apiKey: {
      type: 'string',
      required: true,
      description: 'API Key for service'
    },
    timeout: {
      type: 'number',
      required: false,
      default: 5000,
      description: 'Request timeout in ms'
    }
  }
};
```

### Step 2: Create Frontend Component

Create `MyCustomNode.tsx`:

```typescript
import React from 'react';
import { BaseNode, BaseNodeProps } from './BaseNode';

export const MyCustomNode: React.FC<BaseNodeProps> = (props) => {
  return (
    <BaseNode
      {...props}
      data={{
        ...props.data,
        label: 'My Custom Node',
        type: 'my-custom-node'
      }}
    />
  );
};
```

### Step 3: Create Backend Executor

Create `myCustomNode.executor.ts`:

```typescript
export class MyCustomNodeExecutor {
  async execute(config: any, input: any) {
    try {
      // Validate config
      if (!config.apiKey) {
        throw new Error('API Key is required');
      }

      // Execute logic
      const result = await this.callService(config.apiKey, input);

      return {
        status: 'success',
        data: result
      };
    } catch (error: any) {
      throw new Error(`Node execution failed: ${error.message}`);
    }
  }

  private async callService(apiKey: string, input: any) {
    // Implementation
    return { /* result */ };
  }
}
```

### Step 4: Register Node

In `nodeRegistry.ts`:

```typescript
import { MyCustomNode } from './MyCustomNode';
import { myCustomNodeExecutor } from './myCustomNode.executor';

nodeRegistry.register({
  type: 'my-custom-node',
  component: MyCustomNode,
  executor: myCustomNodeExecutor,
  config: nodeConfig
});
```

## Node Configuration Schema

```typescript
interface NodeDefinition {
  // Identifiers
  type: string;          // Unique node type ID
  name: string;          // Display name
  description?: string;
  icon?: string;         // Icon name or URL
  category?: string;     // Category for grouping
  
  // Connectivity
  inputs?: string[];     // Input port names
  outputs?: string[];    // Output port names
  
  // Configuration
  properties?: {
    [key: string]: {
      type: 'string' | 'number' | 'boolean' | 'object' | 'array';
      required?: boolean;
      default?: any;
      description?: string;
      enum?: any[];        // For dropdown
      min?: number;        // For number fields
      max?: number;
      pattern?: string;    // Regex pattern
    }
  };
  
  // Validation
  validate?: (config: any) => boolean | string;
  
  // Metadata
  color?: string;        // Node color
  width?: number;        // Default width
  height?: number;       // Default height
}
```

## Variable Substitution

Syntax untuk mengacu ke output node lain:

```javascript
{
  message: "Hello {{ nodeA.output.name }}",
  userId: "{{ nodeB.output.id }}",
  timestamp: "{{ $timestamp }}",
  workflowId: "{{ $workflowId }}"
}
```

**Built-in Variables:**
- `$timestamp` - Current timestamp
- `$workflowId` - Current workflow ID
- `$executionId` - Current execution ID
- `$nodeId` - Current node ID
- `$input` - Input dari node sebelumnya

## Node Status Lifecycle

```
IDLE
  ↓ (when execution reaches this node)
RUNNING
  ├→ SUCCESS (execution completed)
  └→ ERROR (execution failed)
```

**Status Visual:**
- IDLE: Gray (#6c757d)
- RUNNING: Blue (#0d6efd) with pulse animation
- SUCCESS: Green (#198754)
- ERROR: Red (#dc3545)

## Error Handling in Nodes

```typescript
// Try-catch pattern
async execute(config: any, input: any) {
  try {
    // Validate
    this.validate(config);
    
    // Execute
    const result = await this.doSomething(config, input);
    
    // Return success
    return {
      status: 'success',
      data: result
    };
  } catch (error: any) {
    // Return error
    return {
      status: 'error',
      error: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    };
  }
}
```

## Testing Nodes

```typescript
describe('MyCustomNode', () => {
  it('should execute successfully', async () => {
    const config = {
      apiKey: 'test-key',
      timeout: 5000
    };
    
    const input = { data: 'test' };
    
    const executor = new MyCustomNodeExecutor();
    const result = await executor.execute(config, input);
    
    expect(result.status).toBe('success');
  });

  it('should handle errors', async () => {
    const config = {};  // Missing apiKey
    
    const executor = new MyCustomNodeExecutor();
    
    expect(() => executor.execute(config, {}))
      .rejects.toThrow('API Key is required');
  });
});
```

## Node Performance Tips

1. **Cache External Calls** - Cache API responses jika memungkinkan
2. **Timeout Management** - Set reasonable timeout values
3. **Error Retry** - Implement exponential backoff untuk retries
4. **Async Operations** - Gunakan async/await pattern
5. **Logging** - Log important events untuk debugging
6. **Validation** - Validate input early untuk fail-fast

## Built-in Node Utilities

```typescript
// Logger
logger.info('Processing node');
logger.error('Node failed: ' + error);
logger.warn('Using default value');

// Context
const { workflowId, executionId, nodeId } = context;

// Output helper
context.setOutput(result);
context.log('Node completed', 'info');
```

## Future Node Types

- **Conditional** - If-else branching
- **Loop** - For-each, while loops
- **Transform** - JSON transform, regex, math
- **Database** - Query, insert, update
- **File** - Read, write, transform
- **Email** - Send email
- **Slack** - Send Slack message
- **OpenAI** - AI integration
- **Database** - MySQL, PostgreSQL
- **FTP** - File upload/download
