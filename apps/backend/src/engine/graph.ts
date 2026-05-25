import type { WorkflowNode, WorkflowEdge } from '@vlx-flowcraft/shared';

export function buildGraph(nodes: WorkflowNode[], edges: WorkflowEdge[]) {
  const adjacency = new Map<string, string[]>();
  for (const node of nodes) {
    adjacency.set(node.id, []);
  }
  for (const edge of edges) {
    const list = adjacency.get(edge.source);
    if (list) {
      list.push(edge.target);
    }
  }
  return {
    adjacency,
    getNext(nodeId: string) {
      return adjacency.get(nodeId) ?? [];
    }
  };
}

export function nodeById(nodes: WorkflowNode[], id: string) {
  return nodes.find((node) => node.id === id);
}
