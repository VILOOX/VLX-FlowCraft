import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from './websocket/index.js';
import { workflowRouter } from './routes/workflow.routes.js';
import { startScheduler } from './engine/scheduler.js';
import { setWebsocketServer } from './engine/execution-manager.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', workflowRouter);

const server = createServer(app);

const wsServer = new WebSocketServer(server);
setWebsocketServer(wsServer);
startScheduler(wsServer);

const port = process.env.PORT ? Number(process.env.PORT) : 4174;
server.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
