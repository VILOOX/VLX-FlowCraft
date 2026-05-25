# VLX FlowCraft

Modern workflow editor built with Vue 3, TypeScript, Vue Flow, TailwindCSS, Pinia, Vite, and a backend execution engine.

## Run locally

```bash
npm install
npm run dev:frontend
npm run dev:backend
```

The frontend listens on `http://localhost:4173` and proxies API requests to the backend on `http://localhost:4174`.

## Project layout

- `apps/frontend` - Vue 3 editor UI
- `apps/backend` - Node backend, workflow execution engine, websocket sync
- `apps/shared` - shared workflow typings
