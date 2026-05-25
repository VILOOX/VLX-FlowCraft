import type { WorkflowState } from '@vlx-flowcraft/shared';

const API_BASE = '/api';

export async function fetchWorkflow() {
  try {
    const response = await fetch(`${API_BASE}/workflow`);
    if (!response.ok) {
      console.warn('Failed to load workflow:', response.statusText);
      return { nodes: [], edges: [] } as WorkflowState;
    }
    return (await response.json()) as WorkflowState;
  } catch (error) {
    console.warn('[API] fetchWorkflow error:', error);
    return { nodes: [], edges: [] } as WorkflowState;
  }
}

export async function persistWorkflow(state: WorkflowState) {
  try {
    const response = await fetch(`${API_BASE}/workflow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state)
    });
    if (!response.ok) {
      console.warn('Failed to persist workflow:', response.statusText);
    }
  } catch (error) {
    console.warn('[API] persistWorkflow error:', error);
  }
}

export async function triggerManual() {
  try {
    const response = await fetch(`${API_BASE}/execute/manual`, { method: 'POST' });
    if (!response.ok) {
      console.warn('Failed to trigger manual execution:', response.statusText);
    }
  } catch (error) {
    console.warn('[API] triggerManual error:', error);
  }
}
