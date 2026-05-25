import { executorForType } from './registry.js';
import { buildGraph, nodeById } from './graph.js';
import type { WorkflowNode, WorkflowEdge, ExecutionEvent } from '@vlx-flowcraft/shared';
import type { WebSocketServer } from '../websocket/index.js';

export async function executeWorkflowFromTrigger(
  trigger: WorkflowNode,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  broadcast: (event: ExecutionEvent | object) => void
) {
  const graph = buildGraph(nodes, edges);
  const visited = new Set<string>();

  async function executeNode(nodeId: string) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    const node = nodeById(nodes, nodeId);
    if (!node) return;

    broadcast({ type: 'node:update', payload: { nodeId: node.id, status: 'running' } });

    const executor = executorForType(node.type);
    if (!executor) {
      broadcast({ type: 'node:update', payload: { nodeId: node.id, status: 'error', message: 'Unsupported node type' } });
      return;
    }

    try {
      await executor(node);
      broadcast({ type: 'node:update', payload: { nodeId: node.id, status: 'success' } });
      const nextIds = graph.getNext(node.id);
      for (const nextId of nextIds) {
        const nextNode = nodeById(nodes, nextId);
        if (!nextNode) continue;
        broadcast({ type: 'node:update', payload: { nodeId: nextNode.id, status: 'waiting' } });
        await executeNode(nextId);
      }
    } catch (error) {
      broadcast({ type: 'node:update', payload: { nodeId: node.id, status: 'error', message: (error as Error).message } });
    }
  }

  await executeNode(trigger.id);
}
