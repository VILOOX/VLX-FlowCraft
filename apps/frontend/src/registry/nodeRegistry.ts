import type { WorkflowNodeType } from '@vlx-flowcraft/shared';

export interface NodeTemplate {
  type: WorkflowNodeType;
  label: string;
  category: 'trigger' | 'core';
}

export const nodeRegistry: NodeTemplate[] = [
  { type: 'trigger', label: 'Trigger', category: 'trigger' },
  { type: 'delay', label: 'Delay', category: 'core' },
  { type: 'webhook-message', label: 'Webhook Message', category: 'core' }
];
