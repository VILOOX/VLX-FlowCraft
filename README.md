# VLX Flow - Workflow Automation Platform

Workflow automation platform mirip dengan **n8n v2**, memungkinkan pengguna membuat dan mengeksekusi workflow melalui visual canvas dengan drag-and-drop interface.

## 📋 Fitur Utama

- **Visual Canvas**: Interface drag-and-drop untuk membuat workflow
- **Node System**: Sistem node modular (Start, Send URL, Webhook, dll)
- **Workflow Execution**: Engine untuk mengeksekusi workflow secara urut
- **Execution Logs**: Log real-time dari setiap node execution
- **Dark Mode**: UI dengan tema gelap default
- **Status Indicators**: Visual status dot untuk tiap node (idle, running, success, error)
- **Auto-Layout**: Tata letak otomatis dengan Dagre algorithm

## 🏗 Arsitektur

```
Frontend (React + React Flow) → Backend (Express) → Database (PostgreSQL)
```

### Frontend
- React 18 + TypeScript
- React Flow untuk canvas
- Zustand untuk state management
- TailwindCSS untuk styling
- Vite untuk build tool

### Backend
- Node.js + Express
- Prisma ORM
- PostgreSQL database
- Winston untuk logging
- Workflow execution engine

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm 8.14+
- PostgreSQL 16+
- Docker & Docker Compose (optional)

### Development Setup

```bash
# Clone repository
git clone <repo-url>
cd vlx-flow-app

# Install dependencies
pnpm install

# Setup environment variables
cp apps/backend/.env.example apps/backend/.env
# Edit .env dengan config database Anda

# Run migrations
cd apps/backend
pnpm db:push

# Start development servers
pnpm dev
```

Frontend akan berjalan di `http://localhost:5173`
Backend akan berjalan di `http://localhost:3000`

### Docker Setup

```bash
# Build dan run dengan Docker Compose
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

## 📁 Project Structure

```
vlx-flow-app/
├── apps/
│   ├── frontend/          # React + React Flow
│   ├── backend/           # Express + Prisma
│   └── shared/            # Shared types & constants
├── docker/                # Docker configuration
├── docs/                  # Documentation
├── package.json           # Root package
├── pnpm-workspace.yaml    # pnpm workspaces
├── turbo.json             # Turbo config
└── docker-compose.yml     # Docker compose

## 🔧 Scripts

```bash
# Development
pnpm dev              # Start all services

# Build
pnpm build            # Build all packages
pnpm build --filter=@vlx-flow/frontend  # Build frontend only

# Database
pnpm db:push          # Push schema ke database
pnpm db:seed          # Seed database
pnpm db:migrate       # Run migrations

# Testing & Linting
pnpm test             # Run tests
pnpm lint             # Run linter
```

## 📝 API Endpoints

### Workflows
- `GET /api/workflows` - Get all workflows
- `GET /api/workflows/:id` - Get workflow by ID
- `POST /api/workflows` - Create workflow
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow

### Execution
- `POST /api/executions/workflows/:workflowId/execute` - Execute workflow
- `GET /api/executions/:executionId` - Get execution status
- `GET /api/executions/:executionId/logs` - Get execution logs

## 🔄 Workflow JSON Format

```json
{
  "id": "workflow_001",
  "name": "Send Message Flow",
  "nodes": [
    {
      "id": "node_start",
      "type": "start",
      "position": { "x": 100, "y": 200 },
      "config": { "trigger": "manual" }
    },
    {
      "id": "node_send",
      "type": "send-url-message",
      "position": { "x": 500, "y": 200 },
      "config": {
        "method": "POST",
        "url": "https://api.example.com/send",
        "body": { "message": "Hello World" }
      }
    }
  ],
  "connections": [
    { "source": "node_start", "target": "node_send" }
  ]
}
```

## 🎨 Node Types

- **Start**: Trigger node untuk memulai workflow
- **Send URL Message**: Mengirim HTTP request ke URL tertentu
- **Send Webhook**: Mengirim webhook ke endpoint external
- **Delay**: Menunda eksekusi untuk durasi tertentu
- **Conditional**: Node untuk logic kondisional (if-else)

## 🧪 Testing

```bash
# Frontend tests
cd apps/frontend
pnpm test

# Backend tests
cd apps/backend
pnpm test
```

## 📦 Deployment

### Vercel (Frontend)
```bash
pnpm build --filter=@vlx-flow/frontend
# Deploy dist/ ke Vercel
```

### Heroku (Backend)
```bash
heroku create vlx-flow-backend
git push heroku main
heroku run "npm run db:migrate"
```

### Docker
```bash
docker-compose -f docker-compose.prod.yml up
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- GitHub Issues untuk bug reports
- GitHub Discussions untuk questions
- Email: support@vlx-flow.dev

## 🔮 Roadmap

- [ ] WebSocket untuk real-time log streaming
- [ ] Conditional nodes dengan logic builder
- [ ] Delay nodes dengan scheduling
- [ ] Database integration nodes
- [ ] AI Agent nodes
- [ ] Email node
- [ ] Slack integration
- [ ] More node types (File, Image, PDF, etc.)
- [ ] Node marketplace
- [ ] Team collaboration
- [ ] Workflow versioning
- [ ] Advanced error handling & retry logic
