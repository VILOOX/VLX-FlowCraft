import { Router, Request, Response } from 'express';
import { workflowService } from './workflow.service.js';

export const workflowRoutes = Router();

interface WorkflowRequest extends Request {
  body: {
    name: string;
    description?: string;
    definition: any;
  };
}

// Get all workflows
workflowRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const workflows = await workflowService.getAllWorkflows();
    res.json(workflows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get workflow by ID
workflowRoutes.get('/:id', async (req: Request, res: Response) => {
  try {
    const workflow = await workflowService.getWorkflow(req.params.id);
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' });
    res.json(workflow);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create workflow
workflowRoutes.post('/', async (req: WorkflowRequest, res: Response) => {
  try {
    const { name, description, definition } = req.body;
    const workflow = await workflowService.createWorkflow({
      name,
      description,
      definition
    });
    res.status(201).json(workflow);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update workflow
workflowRoutes.put('/:id', async (req: WorkflowRequest, res: Response) => {
  try {
    const workflow = await workflowService.updateWorkflow(req.params.id, req.body);
    res.json(workflow);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete workflow
workflowRoutes.delete('/:id', async (req: Request, res: Response) => {
  try {
    await workflowService.deleteWorkflow(req.params.id);
    res.json({ message: 'Workflow deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
