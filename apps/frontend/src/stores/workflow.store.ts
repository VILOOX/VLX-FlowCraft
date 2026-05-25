import { defineStore } from 'pinia';
import { ref } from 'vue';
import { addEdge as addEdgeVueFlow, applyEdgeChanges, applyNodeChanges } from '@vue-flow/core';
import { WorkflowNodeType, WorkflowNode, WorkflowEdge } from '@vlx-flowcraft/shared';
import { persistWorkflow } from '../services/api';

export const useWorkflowStore = defineStore('workflow', () => {
  const nodes = ref<WorkflowNode[]>([]);
  const edges = ref<WorkflowEdge[]>([]);

  function updateNodes(changes: any[]) {
    try {
      // Apply Vue Flow changes
      const updated = applyNodeChanges(changes, nodes.value as any) as any;
      
      // Force Vue reactivity by creating new array with deep copies
      const deepCopy = updated.map((node: any) => {
        const workflowNode: any = {
          id: node.id,
          type: node.type as WorkflowNodeType,
          position: {
            x: Math.round(node.position?.x || 0),
            y: Math.round(node.position?.y || 0)
          },
          data: { ...node.data }
        };
        
        // Preserve Vue Flow runtime properties
        if (node.draggable !== undefined) workflowNode.draggable = node.draggable;
        if (node.selectable !== undefined) workflowNode.selectable = node.selectable;
        if (node.focusable !== undefined) workflowNode.focusable = node.focusable;
        
        return workflowNode;
      });
      
      nodes.value = deepCopy as WorkflowNode[];
      
      // Debounce persist to avoid too many API calls
      clearTimeout((updateNodes as any).timer);
      (updateNodes as any).timer = setTimeout(() => {
        persistWorkflow({ nodes: nodes.value, edges: edges.value });
      }, 300);
    } catch (error) {
      console.error('[WorkflowStore] updateNodes error:', error);
    }
  }

  function updateEdges(changes: any[]) {
    try {
      const updated = applyEdgeChanges(changes, edges.value as any) as any;
      
      // Map back to our WorkflowEdge type, extracting only needed properties
      const edgesData = updated.map((edge: any) => ({
        id: edge.id,
        source: edge.source,
        sourceHandle: edge.sourceHandle || null,
        target: edge.target,
        targetHandle: edge.targetHandle || null,
        animated: edge.animated || false
      } as WorkflowEdge));
      
      edges.value = edgesData;
      
      // Debounce persist
      clearTimeout((updateEdges as any).timer);
      (updateEdges as any).timer = setTimeout(() => {
        persistWorkflow({ nodes: nodes.value, edges: edges.value });
      }, 300);
    } catch (error) {
      console.error('[WorkflowStore] updateEdges error:', error);
    }
  }

  function addNode(type: WorkflowNodeType, position = { x: 320, y: 160 }) {
    const id = `${type}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
    const defaultData = getNodeDefaultData(type);
    nodes.value.push({
      id,
      type,
      position,
      data: defaultData,
      draggable: true,
      selectable: true,
      focusable: true
    } as any);
    persistWorkflow({ nodes: nodes.value, edges: edges.value });
  }

  function addEdge(params: any) {
    // Validation: prevent self-connections
    if (params.source === params.target) {
      console.warn('[WorkflowStore] Invalid connection: Cannot connect node to itself');
      return;
    }

    // Validation: prevent connecting to trigger (trigger is source only)
    const targetNode = nodes.value.find(n => n.id === params.target);
    if (targetNode?.type === 'trigger') {
      console.warn('[WorkflowStore] Invalid connection: Trigger nodes cannot be targets');
      return;
    }

    // Validation: prevent duplicate source handles
    const existingEdges = edges.value.filter(e => 
      e.source === params.source && e.sourceHandle === params.sourceHandle
    );
    if (existingEdges.length > 0) {
      console.warn('[WorkflowStore] Invalid connection: Edge already exists from this source');
      return;
    }

    edges.value = addEdgeVueFlow({ ...params, type: 'default', animated: false }, edges.value as any)
      .filter(e => typeof e === 'object' && 'id' in e)
      .map((e: any) => ({
        id: e.id,
        source: e.source,
        sourceHandle: e.sourceHandle || null,
        target: e.target,
        targetHandle: e.targetHandle || null,
        animated: e.animated || false
      } as WorkflowEdge));
    persistWorkflow({ nodes: nodes.value, edges: edges.value });
  }

  function setNodes(updatedNodes: WorkflowNode[]) {
    nodes.value = updatedNodes;
  }

  function setEdges(updatedEdges: WorkflowEdge[]) {
    edges.value = updatedEdges;
  }

  function deleteNodes(deleted: any[]) {
    const removeIds = deleted.map((node) => node.id);
    nodes.value = nodes.value.filter((node) => !removeIds.includes(node.id));
    edges.value = edges.value.filter((edge) => !removeIds.includes(edge.source) && !removeIds.includes(edge.target));
    persistWorkflow({ nodes: nodes.value, edges: edges.value });
  }

  function deleteEdges(deleted: any[]) {
    const removeIds = deleted.map((edge) => edge.id);
    edges.value = edges.value.filter((edge) => !removeIds.includes(edge.id));
    persistWorkflow({ nodes: nodes.value, edges: edges.value });
  }

  return {
    nodes,
    edges,
    updateNodes,
    updateEdges,
    addNode,
    addEdge,
    deleteNodes,
    deleteEdges,
    setNodes,
    setEdges
  };
});

function getNodeDefaultData(type: WorkflowNodeType) {
  if (type === 'trigger') {
    return {
      title: 'Trigger',
      type,
      config: { mode: 'manual', interval: 15 },
      status: 'idle'
    };
  }

  if (type === 'delay') {
    return {
      title: 'Delay',
      type,
      config: { duration: 10, unit: 'seconds' },
      status: 'idle'
    };
  }

  return {
    title: 'Webhook Message',
    type,
    config: { url: 'https://example.com/webhook', message: 'Hello from FlowCraft' },
    status: 'idle'
  };
}
