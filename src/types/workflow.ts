export type NodeType = 'trigger' | 'delay' | 'webhookMessage'

export type NodeState = 'idle' | 'running' | 'waiting' | 'success' | 'error'

export type TriggerMode = 'manual' | 'schedule' | 'interval'

export type TimeUnit = 'seconds' | 'minutes' | 'hours'

export interface TriggerNodeData {
  type: 'trigger'
  label: string
  mode: TriggerMode
  scheduleTime: string
  intervalValue: number
  intervalUnit: TimeUnit
  state: NodeState
}

export interface DelayNodeData {
  type: 'delay'
  label: string
  value: number
  unit: TimeUnit
  state: NodeState
}

export interface WebhookMessageNodeData {
  type: 'webhookMessage'
  label: string
  webhookUrl: string
  messageText: string
  state: NodeState
}

export type NodeData = TriggerNodeData | DelayNodeData | WebhookMessageNodeData

export interface WorkflowNode {
  id: string
  type: NodeType
  position: { x: number; y: number }
  data: NodeData
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  animated?: boolean
}

export interface ExecutionLogEntry {
  timestamp: number
  nodeId: string
  nodeLabel: string
  status: NodeState
  message: string
}

export interface ExecutionState {
  status: 'idle' | 'running' | 'completed' | 'error'
  currentNodeId: string | null
  nodeStates: Record<string, NodeState>
  log: ExecutionLogEntry[]
}
