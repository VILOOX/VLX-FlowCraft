export type NodeState = 'idle' | 'running' | 'waiting' | 'success' | 'error'

export type NodeType = 'trigger' | 'delay' | 'webhookMessage'

export type TriggerMode = 'manual' | 'schedule' | 'interval'
export type DelayUnit = 'seconds' | 'minutes' | 'hours'

export interface TriggerNodeData {
  type: 'trigger'
  label: string
  mode: TriggerMode
  scheduleTime?: string
  intervalValue?: number
  intervalUnit?: DelayUnit
  state: NodeState
}

export interface DelayNodeData {
  type: 'delay'
  label: string
  value: number
  unit: DelayUnit
  state: NodeState
}

export interface WebhookMessageNodeData {
  type: 'webhookMessage'
  label: string
  webhookUrl: string
  messageText: string
  state: NodeState
}

export type WorkflowNodeData = TriggerNodeData | DelayNodeData | WebhookMessageNodeData

export interface WorkflowNode {
  id: string
  type: NodeType
  position: { x: number; y: number }
  data: WorkflowNodeData
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  animated?: boolean
}

export interface WorkflowDefinition {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

export type ExecutionStatus = 'idle' | 'running' | 'completed' | 'error'

export interface ExecutionState {
  status: ExecutionStatus
  currentNodeId: string | null
  nodeStates: Record<string, NodeState>
  log: ExecutionLogEntry[]
}

export interface ExecutionLogEntry {
  timestamp: number
  nodeId: string
  nodeLabel: string
  status: NodeState
  message: string
}
