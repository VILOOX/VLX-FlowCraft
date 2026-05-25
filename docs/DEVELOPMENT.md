# Development Guide

## Project Setup

### Prerequisites
- Node.js 20+ (check with `node --version`)
- pnpm 8.14+ (install: `npm install -g pnpm`)
- PostgreSQL 16+ or Docker
- Git

### Initial Setup

```bash
# Clone repository
git clone https://github.com/yourusername/vlx-flow-app.git
cd vlx-flow-app

# Install dependencies (root)
pnpm install

# Setup environment
cd apps/backend
cp .env.example .env
# Edit .env with your database URL

# Return to root
cd ../..

# Initialize database
cd apps/backend
pnpm db:push
cd ../..
```

## Development Workflow

### Start Development Servers

```bash
# From root directory
pnpm dev

# This will start:
# - Frontend: http://localhost:5173
# - Backend: http://localhost:3000
```

### Individual Package Development

```bash
# Frontend only
cd apps/frontend
pnpm dev

# Backend only
cd apps/backend
pnpm dev

# Shared types only (compile on save)
cd apps/shared
pnpm build --watch
```

## File Structure & Conventions

### Frontend Conventions

```
src/
├── components/
│   ├── Canvas/          # React Flow canvas
│   ├── Nodes/           # Custom node components
│   ├── Toolbar/         # Top toolbar
│   └── LogPanel/        # Execution logs
├── hooks/               # Custom React hooks
├── services/            # API services
├── store/               # Zustand stores
├── types/               # TypeScript types
├── utils/               # Utility functions
└── styles/              # Global styles
```

**Naming Conventions:**
- Components: PascalCase (e.g., `WorkflowCanvas.tsx`)
- Hooks: camelCase with 'use' prefix (e.g., `useWorkflow.ts`)
- Services: camelCase with 'service' suffix (e.g., `workflow.service.ts`)
- Stores: camelCase with 'store' suffix (e.g., `workflow.store.ts`)
- Types: PascalCase (e.g., `Workflow.ts`)

### Backend Conventions

```
src/
├── modules/
│   ├── workflow/        # Workflow module
│   │   ├── workflow.controller.ts
│   │   ├── workflow.service.ts
│   │   └── workflow.routes.ts
│   ├── execution/       # Execution module
│   └── credentials/     # Credentials module
├── engine/
│   ├── parser/          # Workflow parser
│   └── executor/        # Node executor
├── database/
│   ├── prisma/
│   │   └── schema.prisma
│   └── database.ts
├── shared/
│   ├── logger/
│   ├── middleware/
│   └── utils/
├── types/               # TypeScript types
├── app.ts               # Express app setup
└── server.ts            # Server entry point
```

**Naming Conventions:**
- Controllers: `*.controller.ts`
- Services: `*.service.ts`
- Routes: `*.routes.ts`
- Middleware: `*.middleware.ts`
- Types: `*.types.ts`

## Code Style

### TypeScript

- Use strict mode (`"strict": true` in tsconfig)
- Explicit return types on functions
- Avoid `any` type, use `unknown` instead
- Use const by default, let only when needed

```typescript
// Good
interface User {
  id: string;
  name: string;
}

function getUser(id: string): Promise<User> {
  // ...
}

// Bad
function getUser(id) {  // No type annotation
  // ...
}
```

### React Components

- Functional components with hooks
- Memoize expensive computations
- Use proper TypeScript types

```typescript
// Good
interface Props {
  label: string;
  onClick: () => void;
}

export const Button: React.FC<Props> = ({ label, onClick }) => {
  return <button onClick={onClick}>{label}</button>;
};

// Bad
export const Button = ({ label, onClick }) => {
  return <button onClick={onClick}>{label}</button>;
};
```

### Express Routes

```typescript
// Good
export const routes = Router();

routes.get('/:id', async (req: Request, res: Response) => {
  try {
    const data = await service.getById(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bad
export const routes = Router();
routes.get('/:id', (req, res) => {
  service.getById(req.params.id).then(data => {
    res.json(data);
  });
});
```

## Testing

### Frontend Tests

```bash
cd apps/frontend
pnpm test
```

Example test:
```typescript
import { render, screen } from '@testing-library/react';
import { WorkflowCanvas } from './WorkflowCanvas';

describe('WorkflowCanvas', () => {
  it('renders canvas', () => {
    render(<WorkflowCanvas />);
    expect(screen.getByRole('application')).toBeInTheDocument();
  });
});
```

### Backend Tests

```bash
cd apps/backend
pnpm test
```

Example test:
```typescript
import { workflowService } from './workflow.service';

describe('WorkflowService', () => {
  it('should create workflow', async () => {
    const workflow = await workflowService.createWorkflow({
      name: 'Test',
      definition: { nodes: [] }
    });
    
    expect(workflow.id).toBeDefined();
  });
});
```

## Debugging

### Frontend Debugging

1. **DevTools** - F12 or Cmd+Shift+I
2. **React DevTools** - Install Chrome extension
3. **Console** - `console.log()` or `console.table()`
4. **Debugger** - `debugger;` keyword or breakpoints

### Backend Debugging

```bash
# Run with Node debugger
cd apps/backend
node --inspect-brk dist/server.js

# Open chrome://inspect in Chrome
```

Or use VS Code debugger:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Backend",
      "program": "${workspaceFolder}/apps/backend/src/server.ts",
      "preLaunchTask": "tsc: build - tsconfig.json",
      "outFiles": ["${workspaceFolder}/apps/backend/dist/**/*"]
    }
  ]
}
```

## Database Management

### Prisma Commands

```bash
# Create migration
pnpm db:migrate

# Apply schema to database
pnpm db:push

# Reset database (warning: deletes all data)
pnpm db:reset

# Seed database
pnpm db:seed

# Open Prisma Studio (visual database explorer)
pnpm prisma studio
```

### Writing Migrations

```bash
# Create migration after schema change
pnpm prisma migrate dev --name add_user_email
```

## Building for Production

### Build All Packages

```bash
pnpm build
```

### Frontend Build

```bash
cd apps/frontend
pnpm build
# Output: dist/
```

### Backend Build

```bash
cd apps/backend
pnpm build
# Output: dist/
```

## Deployment

### Docker Deployment

```bash
# Build image
docker build -f docker/backend.Dockerfile -t vlx-flow-backend .

# Run container
docker run -p 3000:3000 -e DATABASE_URL="..." vlx-flow-backend
```

### Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Common Issues & Solutions

### Port Already in Use

```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database Connection Error

```bash
# Check PostgreSQL is running
psql -U vlx_user -d vlx_flow -h localhost

# Check DATABASE_URL in .env
# Format: postgresql://user:password@host:port/database
```

### Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Port Conflicts with WSL/Docker

```bash
# Use explicit ports in .env
FRONTEND_PORT=5174
BACKEND_PORT=3001
```

## Performance Optimization

### Frontend

1. Use `React.memo()` for expensive components
2. Use `useCallback()` for stable function references
3. Use `useMemo()` for expensive calculations
4. Implement code splitting with dynamic imports
5. Optimize bundle size with `pnpm dlx webpack-bundle-analyzer`

### Backend

1. Add database indexes for frequently queried columns
2. Use connection pooling
3. Implement caching strategies
4. Use async/await properly to avoid blocking
5. Monitor query performance with `EXPLAIN ANALYZE`

## Contributing Guidelines

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Make changes and commit: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Create Pull Request with description

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No unnecessary console logs
- [ ] TypeScript types properly defined
- [ ] Error handling implemented
- [ ] No hardcoded values/secrets

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Express.js Guide](https://expressjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Flow Documentation](https://reactflow.dev)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

## Support & Questions

- Create GitHub issue for bugs
- Use GitHub discussions for questions
- Check existing issues before creating new ones
- Provide minimal reproducible example (MRE)

## License

MIT - See LICENSE file
