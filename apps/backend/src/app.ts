import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { workflowRoutes } from './modules/workflow/workflow.routes.js';
import { executionRoutes } from './modules/execution/execution.routes.js';
import { errorHandler } from './shared/middleware/error.handler.js';
import { logger } from './shared/logger/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req: Request, res: Response, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/workflows', workflowRoutes);
app.use('/api/executions', executionRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

export default app;
