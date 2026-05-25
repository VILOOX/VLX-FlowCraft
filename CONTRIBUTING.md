# VLX Flow - Workflow Automation Platform

Selamat datang di **VLX Flow**! 🚀

Ini adalah full-stack workflow automation platform yang mirip dengan n8n v2, dengan visual canvas drag-and-drop untuk membuat dan menjalankan automated workflows.

## 📚 Dokumentasi

- [README.md](./README.md) - Overview dan quick start
- [docs/architecture.md](./docs/architecture.md) - Arsitektur dan design
- [docs/execution-flow.md](./docs/execution-flow.md) - Workflow execution & node system
- [docs/node-system.md](./docs/node-system.md) - Node development guide
- [docs/api-reference.md](./docs/api-reference.md) - REST API documentation
- [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) - Development workflow

## 🎯 Quick Start

### Prerequisites
```bash
node --version     # v20.0.0 or higher
pnpm --version     # v8.14.0 or higher
```

### Setup & Run
```bash
# Install dependencies
pnpm install

# Configure backend
cd apps/backend
cp .env.example .env
# Edit .env dengan database URL Anda

# Setup database
pnpm db:push

# Start development
cd ../..
pnpm dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Prisma Studio: `pnpm db:studio` (backend folder)

## 🏗 Project Structure

```
vlx-flow-app/
├── apps/
│   ├── frontend/          # React + React Flow UI
│   ├── backend/           # Express + Prisma API
│   └── shared/            # Shared types & constants
├── docker/                # Docker configurations
├── docs/                  # Documentation
├── scripts/               # Utility scripts
└── [config files]         # Turbo, pnpm, package.json, etc
```

## 💡 Key Features

### Frontend
- ✅ React Flow canvas untuk visual workflow editing
- ✅ Zustand untuk state management
- ✅ TailwindCSS untuk styling
- ✅ Real-time execution logs
- ✅ Dark mode theme
- ✅ Status indicators (idle, running, success, error)

### Backend
- ✅ Express REST API
- ✅ Prisma ORM dengan PostgreSQL
- ✅ Workflow execution engine
- ✅ Node executor system
- ✅ Winston logger
- ✅ Error handling & validation

### Database
- ✅ Workflows table
- ✅ Executions table dengan logs
- ✅ Credentials table (encrypted)

## 📦 Available Commands

```bash
# Development
pnpm dev              # Start all services

# Build
pnpm build            # Build all packages
pnpm build --filter=@vlx-flow/frontend
pnpm build --filter=@vlx-flow/backend

# Database
pnpm db:push          # Sync schema to database
pnpm db:migrate       # Create migration
pnpm db:seed          # Seed database

# Testing
pnpm test             # Run tests
pnpm lint             # Run linter
pnpm format           # Format code with Prettier

# Clean
pnpm clean            # Remove dist & node_modules
```

## 🔄 Workflow Execution Example

```bash
# 1. Create workflow via API
curl -X POST http://localhost:3000/api/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Send Message",
    "definition": {
      "nodes": [{
        "id": "start", "type": "start", "position": {"x":0,"y":0}, "config":{}
      }],
      "connections": []
    }
  }'

# 2. Execute workflow
curl -X POST http://localhost:3000/api/executions/workflows/{id}/execute

# 3. Check status
curl http://localhost:3000/api/executions/{execution-id}
```

## 🎨 Available Node Types

| Node | Type | Purpose |
|------|------|---------|
| **Start** | `start` | Trigger workflow |
| **Send URL** | `send-url-message` | HTTP request |
| **Webhook** | `send-webhook` | Webhook call |
| **Delay** | `delay` | Wait/pause execution |
| **Conditional** | `conditional` | If-else branching (future) |

## 🛠 Tech Stack

**Frontend:**
- React 18 + TypeScript
- React Flow (visual editor)
- Zustand (state management)
- TailwindCSS + PostCSS
- Vite (build tool)

**Backend:**
- Node.js 20 + TypeScript
- Express.js (REST API)
- Prisma (ORM)
- PostgreSQL (database)
- Winston (logging)

**DevOps:**
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- Turbo (monorepo builder)
- pnpm (package manager)

## 📖 Development

### File Organization

Frontend:
```
apps/frontend/src/
├── components/     # React components
├── hooks/          # Custom hooks
├── services/       # API calls
├── store/          # Zustand stores
├── types/          # TypeScript interfaces
├── utils/          # Utilities
└── styles/         # CSS/Tailwind
```

Backend:
```
apps/backend/src/
├── modules/        # Feature modules (workflow, execution)
├── engine/         # Workflow engine (parser, executor)
├── database/       # Prisma schema & migrations
├── shared/         # Logger, middleware, utils
└── types/          # TypeScript interfaces
```

### Creating Custom Nodes

1. Define config: `mynode.config.ts`
2. Create React component: `MyNode.tsx`
3. Create executor: `mynode.executor.ts`
4. Register in `nodeRegistry`

[See full guide in docs/node-system.md](./docs/node-system.md)

## 🧪 Testing

```bash
# All tests
pnpm test

# Frontend tests
cd apps/frontend && pnpm test

# Backend tests
cd apps/backend && pnpm test
```

## 🚀 Deployment

### Docker Deployment
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Vercel (Frontend)
```bash
pnpm build --filter=@vlx-flow/frontend
# Deploy dist/ folder to Vercel
```

### Heroku (Backend)
```bash
git push heroku main
heroku run "pnpm db:migrate"
```

## 🔐 Security

- ✅ Environment variables for secrets
- ✅ Credential encryption at rest
- ✅ CORS configuration
- ✅ Input validation & sanitization
- ✅ SQL injection prevention (Prisma)
- ✅ TypeScript strict mode

## 📚 API Documentation

Full API reference available in [docs/api-reference.md](./docs/api-reference.md)

**Main Endpoints:**
- `GET /api/workflows` - List workflows
- `POST /api/workflows` - Create workflow
- `POST /api/executions/workflows/:id/execute` - Execute workflow
- `GET /api/executions/:id` - Get execution status

## 🤝 Contributing

1. Fork & create feature branch
2. Make changes & commit
3. Push & create Pull Request
4. Follow code style (see .eslintrc.json)

## 🐛 Troubleshooting

**Port already in use?**
```bash
lsof -ti:3000 | xargs kill -9
```

**Database connection error?**
```bash
# Check DATABASE_URL in .env
# Format: postgresql://user:password@localhost:5432/dbname
```

**Module not found?**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 📞 Support

- 📖 [Documentation](./docs/)
- 🐛 [GitHub Issues](https://github.com/yourrepo/issues)
- 💬 [GitHub Discussions](https://github.com/yourrepo/discussions)

## 📄 License

MIT License - See [LICENSE](./LICENSE) file

---

**Happy Workflow Building!** 🎉

Untuk pertanyaan atau saran, buka issue atau diskusi di repository ini.
