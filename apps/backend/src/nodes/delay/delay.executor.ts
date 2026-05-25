import type { WorkflowNode } from '@vlx-flowcraft/shared';
import type { DelayNodeData } from './delay.schema.js';

export async function executeDelay(node: WorkflowNode) {
  const config = node.data.config as DelayNodeData['config'];
  const duration = config?.duration ?? 0;
  const unit = config?.unit ?? 'seconds';
  const multiplier = unit === 'minutes' ? 60_000 : unit === 'hours' ? 3_600_000 : 1000;
  const delayMs = duration * multiplier;

  await new Promise((resolve) => setTimeout(resolve, delayMs));
  return { node, payload: { delayMs } };
}
