# Arsitektur VLX Flow

## Diagram Alur

```
User Interface (Canvas)
         ↓
  Frontend (React Flow)
         ↓
  State Management (Zustand)
         ↓
  API Service Layer (Axios)
         ↓
  Backend Express Server
         ↓
  Workflow Engine
         ↓
  Node Executor
         ↓
  External Services (HTTP, Webhooks)
```

## Component Stack

### Frontend
1. **Canvas Component** - React Flow visual editor
2. **Node Components** - Custom nodes (Start, SendURL, etc)
3. **Toolbar** - Controls untuk zoom, execute, save
4. **Log Panel** - Real-time execution logs
5. **Store** - Zustand untuk state management

### Backend
1. **Express Server** - REST API
2. **Workflow Service** - Business logic
3. **Execution Engine** - Node execution orchestration
4. **Node Executor** - Individual node executors
5. **Prisma ORM** - Database layer
6. **Logger** - Winston logger

### Database
1. **Workflows** - Workflow definitions
2. **Executions** - Execution history & logs
3. **Credentials** - API keys & secrets

## Execution Flow

```
1. User creates workflow in canvas
   ↓
2. Workflow saved to database
   ↓
3. User clicks Execute button
   ↓
4. Frontend sends POST /executions/workflows/:id/execute
   ↓
5. Backend creates Execution record with status=running
   ↓
6. Backend parses workflow JSON
   ↓
7. For each node:
   - Create log entry
   - Execute node (HTTP call, etc)
   - Store result/error
   - Update node status
   ↓
8. Update Execution record with status=success/error
   ↓
9. Frontend polls/streams logs in real-time
   ↓
10. Display results in Log Panel
```

## Data Models

### Workflow
```typescript
{
  id: string (uuid)
  name: string
  description: string
  definition: JSON {
    nodes: Node[]
    connections: Edge[]
  }
  createdAt: Date
  updatedAt: Date
}
```

### Execution
```typescript
{
  id: string (uuid)
  workflowId: string (fk)
  status: 'pending' | 'running' | 'success' | 'error'
  startTime: Date
  endTime: Date
  logs: ExecutionLog[]
  error: string
  result: JSON
  createdAt: Date
}
```

### ExecutionLog
```typescript
{
  timestamp: Date
  nodeId: string
  nodeName: string
  level: 'info' | 'error' | 'warning'
  message: string
  data: JSON (optional)
}
```

## Node System Architecture

### Node Structure
```typescript
interface Node {
  id: string
  type: string (start, send-url, webhook, etc)
  position: { x, y }
  config: {
    // Node-specific configuration
  }
  status: 'idle' | 'running' | 'success' | 'error'
}
```

### Node Executor Pattern
```typescript
nodeExecutor.execute(nodeType, config) => Promise<result>

// Supported types
- start: triggers workflow
- send-url-message: HTTP POST request
- send-webhook: webhook call
- delay: wait time
- conditional: if-else logic
```

## API Architecture

### REST Endpoints
```
GET  /api/workflows           - List workflows
GET  /api/workflows/:id       - Get workflow
POST /api/workflows           - Create workflow
PUT  /api/workflows/:id       - Update workflow
DEL  /api/workflows/:id       - Delete workflow

POST /api/executions/workflows/:id/execute  - Execute
GET  /api/executions/:id      - Get execution
GET  /api/executions/:id/logs - Get logs
```

### Response Format
```json
{
  "status": "success",
  "data": { ... },
  "error": null,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Scaling Considerations

### Frontend
- Virtualize long node lists (react-window)
- Memoize components (React.memo)
- Debounce expensive operations
- Use Web Workers for heavy computations

### Backend
- Queue large executions (BullMQ)
- Cache workflow definitions
- Horizontal scaling with load balancer
- Database connection pooling

### Database
- Index frequently queried columns
- Partition large execution logs
- Archive old executions
- Connection pooling

## Security

- API authentication (JWT tokens)
- Credential encryption at rest
- HTTPS/TLS in production
- CORS configuration
- Rate limiting on endpoints
- Input validation & sanitization
- SQL injection prevention (Prisma)

## Performance Optimization

### Frontend
- Code splitting with Vite
- Lazy loading components
- Image optimization
- CSS-in-JS optimization
- Service workers for offline support

### Backend
- Node.js clustering
- Database query optimization
- Caching strategies (Redis)
- Compression (gzip)
- Async/await patterns

### Network
- CDN for static assets
- API response pagination
- WebSocket for real-time updates
- Request batching
