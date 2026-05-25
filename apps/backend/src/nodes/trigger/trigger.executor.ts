import type { WorkflowNode } from '@vlx-flowcraft/shared';
import type { TriggerNodeData } from './trigger.schema.js';

export async function executeTrigger(node: WorkflowNode) {
  const config = node.data.config as TriggerNodeData['config'];
  return {
    node,
    payload: {
      triggeredAt: new Date().toISOString(),
      mode: config?.mode ?? 'manual'
    }
  };
}
