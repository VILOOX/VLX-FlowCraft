import type { WorkflowNode, WorkflowEdge, WorkflowState, ExecutionEvent } from '@vlx-flowcraft/shared';
import { executeWorkflowFromTrigger } from './executor.js';
import { registerTriggerCallback, setSchedulerState } from './scheduler.js';
import type { WebSocketServer } from '../websocket/index.js';

export const workflowState: { nodes: WorkflowNode[]; edges: WorkflowEdge[] } = {
  nodes: [],
  edges: []
};

let websocketServer: WebSocketServer | null = null;

export function setWebsocketServer(server: WebSocketServer) {
  websocketServer = server;
  registerTriggerCallback(executeTriggerNode);
}

export function setWorkflowState(state: WorkflowState) {
  workflowState.nodes = state.nodes ?? [];
  workflowState.edges = state.edges ?? [];
  websocketServer?.broadcast(workflowState);
  setSchedulerState(workflowState);
}

function broadcast(event: ExecutionEvent | object) {
  websocketServer?.broadcast(event);
}

export async function executeManualWorkflow() {
  const manualTriggers = workflowState.nodes.filter((node) => node.type === 'trigger' && node.data.config?.mode === 'manual');
  if (manualTriggers.length === 0) {
    broadcast({ type: 'execution:finished', payload: { message: 'No manual triggers configured' } });
    return;
  }

  for (const trigger of manualTriggers) {
    await executeWorkflowFromTrigger(trigger, workflowState.nodes, workflowState.edges, broadcast);
  }
  broadcast({ type: 'execution:finished', payload: { message: 'Manual execution complete' } });
}

export async function executeTriggerNode(triggerId: string) {
  const trigger = workflowState.nodes.find((node) => node.id === triggerId);
  if (!trigger) return;
  await executeWorkflowFromTrigger(trigger, workflowState.nodes, workflowState.edges, broadcast);
  broadcast({ type: 'execution:finished', payload: { message: `Trigger ${triggerId} completed` } });
}
