# API Reference

## Base URL
```
http://localhost:3000/api
```

## Authentication (Future)
```
Authorization: Bearer <token>
```

## Workflow Endpoints

### List All Workflows
```http
GET /workflows
```

**Response:**
```json
{
  "data": [
    {
      "id": "cm1234",
      "name": "Send Message",
      "description": "Send message to webhook",
      "definition": { ... },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Get Workflow by ID
```http
GET /workflows/:id
```

**Parameters:**
- `id` (path, required) - Workflow ID

**Response:**
```json
{
  "id": "cm1234",
  "name": "Send Message",
  "definition": {
    "nodes": [ ... ],
    "connections": [ ... ]
  },
  "executions": [ ... ]
}
```

### Create Workflow
```http
POST /workflows
Content-Type: application/json

{
  "name": "My Workflow",
  "description": "Description here",
  "definition": {
    "nodes": [
      {
        "id": "node_1",
        "type": "start",
        "position": { "x": 100, "y": 100 },
        "config": { "trigger": "manual" }
      }
    ],
    "connections": []
  }
}
```

**Response:** (201 Created)
```json
{
  "id": "cm1234",
  "name": "My Workflow",
  "definition": { ... },
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Update Workflow
```http
PUT /workflows/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "definition": { ... }
}
```

**Response:** (200 OK)
```json
{
  "id": "cm1234",
  "name": "Updated Name",
  "definition": { ... },
  "updatedAt": "2024-01-01T00:00:01Z"
}
```

### Delete Workflow
```http
DELETE /workflows/:id
```

**Response:** (200 OK)
```json
{
  "message": "Workflow deleted"
}
```

## Execution Endpoints

### Execute Workflow
```http
POST /executions/workflows/:workflowId/execute
```

**Parameters:**
- `workflowId` (path, required) - Workflow ID

**Request Body (Optional):**
```json
{
  "context": {
    "custom_var": "value"
  }
}
```

**Response:** (200 OK)
```json
{
  "id": "exec_5678",
  "workflowId": "cm1234",
  "status": "running",
  "startTime": "2024-01-01T00:00:00Z",
  "logs": [
    {
      "timestamp": "2024-01-01T00:00:00Z",
      "nodeId": "node_1",
      "nodeName": "start",
      "level": "info",
      "message": "Workflow started"
    }
  ]
}
```

### Get Execution Status
```http
GET /executions/:executionId
```

**Parameters:**
- `executionId` (path, required) - Execution ID

**Response:** (200 OK)
```json
{
  "id": "exec_5678",
  "workflowId": "cm1234",
  "status": "success",
  "startTime": "2024-01-01T00:00:00Z",
  "endTime": "2024-01-01T00:00:02Z",
  "logs": [ ... ],
  "result": { ... }
}
```

### Get Execution Logs
```http
GET /executions/:executionId/logs
```

**Query Parameters:**
- `level` (optional) - Filter by log level: 'info', 'error', 'warning'
- `nodeId` (optional) - Filter by node ID
- `limit` (optional) - Max logs to return (default: 100)
- `offset` (optional) - Pagination offset (default: 0)

**Response:** (200 OK)
```json
{
  "data": [
    {
      "timestamp": "2024-01-01T00:00:00Z",
      "nodeId": "node_1",
      "nodeName": "start",
      "level": "info",
      "message": "Node executed",
      "data": { ... }
    }
  ],
  "total": 10,
  "limit": 100,
  "offset": 0
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid workflow definition",
  "path": "/workflows",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 404 Not Found
```json
{
  "error": "Workflow not found",
  "path": "/workflows/unknown-id",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "path": "/workflows",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error |

## WebSocket (Future)

Real-time execution log streaming:

```javascript
const ws = new WebSocket('ws://localhost:3000/executions/:executionId/logs');

ws.onmessage = (event) => {
  const log = JSON.parse(event.data);
  console.log(log);
};
```

## Rate Limiting (Future)

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

## Example: Create & Execute Workflow

```bash
# 1. Create workflow
curl -X POST http://localhost:3000/api/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hello World",
    "definition": {
      "nodes": [
        {
          "id": "start",
          "type": "start",
          "position": { "x": 0, "y": 0 },
          "config": {}
        }
      ],
      "connections": []
    }
  }'

# Response
# {
#   "id": "cm1234",
#   ...
# }

# 2. Execute workflow
curl -X POST http://localhost:3000/api/executions/workflows/cm1234/execute

# Response
# {
#   "id": "exec_5678",
#   "status": "running",
#   ...
# }

# 3. Check status
curl http://localhost:3000/api/executions/exec_5678

# Response
# {
#   "id": "exec_5678",
#   "status": "success",
#   ...
# }
```

## Testing with Postman

Import this collection:

```json
{
  "info": {
    "name": "VLX Flow API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Workflows",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/workflows"
      }
    },
    {
      "name": "Create Workflow",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/workflows",
        "body": {
          "mode": "raw",
          "raw": "{ ... }"
        }
      }
    }
  ]
}
```

## Validation Rules

### Workflow Definition
- `name` (required): string, 1-255 characters
- `description` (optional): string, max 1000 characters
- `definition` (required): object
  - `nodes` (required): array of nodes
  - `connections` (optional): array of edges

### Node
- `id` (required): unique string
- `type` (required): one of: start, send-url-message, send-webhook, delay
- `position` (required): { x: number, y: number }
- `config` (required): object (structure depends on node type)

### Connection
- `source` (required): node ID
- `target` (required): node ID
