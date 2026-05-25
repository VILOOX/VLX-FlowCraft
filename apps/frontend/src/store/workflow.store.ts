import { create } from 'zustand';
import { WorkflowNode, Edge, Workflow } from '../types/workflow.types';

interface WorkflowStore {
  currentWorkflow: Workflow | null;
  nodes: WorkflowNode[];
  edges: Edge[];
  selectedNodes: string[];
  isExecuting: boolean;

  setCurrentWorkflow: (workflow: Workflow) => void;
  setNodes: (nodes: WorkflowNode[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: WorkflowNode) => void;
  removeNode: (nodeId: string) => void;
  updateNode: (nodeId: string, data: Partial<WorkflowNode>) => void;
  addEdge: (edge: Edge) => void;
  removeEdge: (edgeId: string) => void;
  selectNode: (nodeId: string, multi?: boolean) => void;
  clearSelection: () => void;
  setExecuting: (isExecuting: boolean) => void;
}

export const useWorkflowStore = create<WorkflowStore>((set) => ({
  currentWorkflow: null,
  nodes: [],
  edges: [],
  selectedNodes: [],
  isExecuting: false,

  setCurrentWorkflow: (workflow) => set({ currentWorkflow: workflow, nodes: workflow.nodes, edges: workflow.connections }),
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),

  removeNode: (nodeId) => set((state) => ({
    nodes: state.nodes.filter(n => n.id !== nodeId),
    edges: state.edges.filter(e => e.source !== nodeId && e.target !== nodeId)
  })),

  updateNode: (nodeId, data) => set((state) => ({
    nodes: state.nodes.map(n => n.id === nodeId ? { ...n, ...data } : n)
  })),

  addEdge: (edge) => set((state) => {
    const exists = state.edges.some(e => e.id === edge.id);
    return { edges: exists ? state.edges : [...state.edges, edge] };
  }),

  removeEdge: (edgeId) => set((state) => ({
    edges: state.edges.filter(e => e.id !== edgeId)
  })),

  selectNode: (nodeId, multi = false) => set((state) => ({
    selectedNodes: multi ? [...state.selectedNodes, nodeId] : [nodeId]
  })),

  clearSelection: () => set({ selectedNodes: [] }),
  setExecuting: (isExecuting) => set({ isExecuting })
}));
