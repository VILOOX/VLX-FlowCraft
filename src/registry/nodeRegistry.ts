import type { NodeType, NodeData, TriggerNodeData, DelayNodeData, WebhookMessageNodeData } from '@/types/workflow'

export interface NodeDefinition {
  type: NodeType
  label: string
  category: 'triggers' | 'core'
  description: string
  icon: string
  createData: () => NodeData
}

export const nodeRegistry: NodeDefinition[] = [
  {
    type: 'trigger',
    label: 'Trigger',
    category: 'triggers',
    description: 'Start a workflow manually, on schedule, or at intervals',
    icon: 'zap',
    createData: (): TriggerNodeData => ({
      type: 'trigger',
      label: 'Trigger',
      mode: 'manual',
      scheduleTime: '08:00',
      intervalValue: 5,
      intervalUnit: 'minutes',
      state: 'idle',
    }),
  },
  {
    type: 'delay',
    label: 'Delay',
    category: 'core',
    description: 'Pause execution for a specified duration',
    icon: 'clock',
    createData: (): DelayNodeData => ({
      type: 'delay',
      label: 'Delay',
      value: 5,
      unit: 'seconds',
      state: 'idle',
    }),
  },
  {
    type: 'webhookMessage',
    label: 'Webhook Message',
    category: 'core',
    description: 'Send a POST request to a webhook URL',
    icon: 'send',
    createData: (): WebhookMessageNodeData => ({
      type: 'webhookMessage',
      label: 'Webhook Message',
      webhookUrl: '',
      messageText: '',
      state: 'idle',
    }),
  },
]

export const triggers = nodeRegistry.filter(n => n.category === 'triggers')
export const coreNodes = nodeRegistry.filter(n => n.category === 'core')

export function getDefinition(type: NodeType): NodeDefinition | undefined {
  return nodeRegistry.find(n => n.type === type)
}
