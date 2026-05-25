export type WorkflowNodeType = 'trigger' | 'delay' | 'webhook-message';

export type ExecutionStatus = 'idle' | 'running' | 'waiting' | 'success' | 'error';

export interface WorkflowNodeData {
  title: string;
  type: WorkflowNodeType;
  config?: Record<string, unknown>;
  status?: ExecutionStatus;
}

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  position: { x: number; y: number };
  data: WorkflowNodeData;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  sourceHandle: string | null;
  target: string;
  targetHandle: string | null;
  animated?: boolean;
}

export interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface ExecutionEvent {
  type: 'node:update' | 'execution:finished';
  payload: {
    nodeId?: string;
    status?: ExecutionStatus;
    message?: string;
  };
}
