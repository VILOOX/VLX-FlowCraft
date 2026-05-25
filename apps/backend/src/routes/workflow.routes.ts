import { Router } from 'express';
import { workflowState, setWorkflowState, executeManualWorkflow } from '../engine/execution-manager.js';

export const workflowRouter = Router();

workflowRouter.get('/workflow', (req, res) => {
  res.json(workflowState);
});

workflowRouter.post('/workflow', (req, res) => {
  const state = req.body;
  setWorkflowState(state);
  res.status(204).end();
});

workflowRouter.post('/execute/manual', async (req, res) => {
  await executeManualWorkflow();
  res.status(202).json({ message: 'Manual execution started' });
});
