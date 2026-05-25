export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  config: Record<string, any>;
  status?: 'idle' | 'running' | 'success' | 'error';
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  connections: Edge[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ExecutionResult {
  workflowId: string;
  status: 'running' | 'success' | 'error';
  startTime: Date;
  endTime?: Date;
  logs: ExecutionLog[];
}

export interface ExecutionLog {
  timestamp: Date;
  nodeId: string;
  nodeName: string;
  level: 'info' | 'error' | 'warning';
  message: string;
  data?: any;
}
