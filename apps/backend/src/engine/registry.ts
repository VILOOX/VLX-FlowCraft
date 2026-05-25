import { executeDelay } from '../nodes/delay/delay.executor.js';
import { executeTrigger } from '../nodes/trigger/trigger.executor.js';
import { executeWebhook } from '../nodes/webhook-message/webhook.executor.js';
import type { WorkflowNode } from '@vlx-flowcraft/shared';

export type NodeExecutor = (node: WorkflowNode) => Promise<{ node: WorkflowNode; payload: Record<string, unknown> }>;

export const nodeExecutors: Record<string, NodeExecutor> = {
  trigger: executeTrigger as NodeExecutor,
  delay: executeDelay as NodeExecutor,
  'webhook-message': executeWebhook as NodeExecutor
};

export function executorForType(type: string) {
  return nodeExecutors[type];
}
