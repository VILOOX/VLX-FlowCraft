import { Workflow, WorkflowNode, Edge } from '../types/workflow.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const workflowService = {
  async getWorkflows(): Promise<Workflow[]> {
    const response = await fetch(`${API_URL}/workflows`);
    return response.json();
  },

  async getWorkflow(id: string): Promise<Workflow> {
    const response = await fetch(`${API_URL}/workflows/${id}`);
    return response.json();
  },

  async createWorkflow(data: Partial<Workflow>): Promise<Workflow> {
    const response = await fetch(`${API_URL}/workflows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async updateWorkflow(id: string, data: Partial<Workflow>): Promise<Workflow> {
    const response = await fetch(`${API_URL}/workflows/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async deleteWorkflow(id: string): Promise<void> {
    await fetch(`${API_URL}/workflows/${id}`, { method: 'DELETE' });
  },

  async executeWorkflow(id: string): Promise<any> {
    const response = await fetch(`${API_URL}/workflows/${id}/execute`, {
      method: 'POST'
    });
    return response.json();
  }
};
