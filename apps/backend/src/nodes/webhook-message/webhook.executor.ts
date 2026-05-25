import type { WorkflowNode } from '@vlx-flowcraft/shared';
import type { WebhookMessageNodeData } from './webhook.schema.js';

export async function executeWebhook(node: WorkflowNode) {
  const config = node.data.config as WebhookMessageNodeData['config'];
  const url = config?.url ?? '';
  const message = config?.message ?? '';
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: message })
  });
  return { node, payload: { url, message } };
}
