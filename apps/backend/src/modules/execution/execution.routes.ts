import { Router, Request, Response } from 'express';
import { executionService } from './execution.service.js';

export const executionRoutes = Router();

// Execute workflow
executionRoutes.post('/workflows/:workflowId/execute', async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.params;
    const execution = await executionService.executeWorkflow(workflowId);
    res.json(execution);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get execution logs
executionRoutes.get('/:executionId/logs', async (req: Request, res: Response) => {
  try {
    const execution = await executionService.getExecution(req.params.executionId);
    res.json(execution?.logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get execution status
executionRoutes.get('/:executionId', async (req: Request, res: Response) => {
  try {
    const execution = await executionService.getExecution(req.params.executionId);
    if (!execution) return res.status(404).json({ error: 'Execution not found' });
    res.json(execution);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
