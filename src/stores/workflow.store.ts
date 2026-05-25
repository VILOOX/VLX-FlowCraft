import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  WorkflowNode,
  WorkflowEdge,
  NodeData,
  NodeType,
  TriggerNodeData,
  DelayNodeData,
  WebhookMessageNodeData,
  NodeState,
} from '@/types/workflow'
import { saveWorkflow, loadWorkflow, deleteWorkflow } from '@/services/api'

export const useWorkflowStore = defineStore('workflow', () => {
  const nodes = ref<WorkflowNode[]>([])
  const edges = ref<WorkflowEdge[]>([])
  const selectedNodeId = ref<string | null>(null)
  const workflowId = ref<string | null>(null)
  const workflowName = ref('Untitled Workflow')
  const isDirty = ref(false)

  const selectedNode = computed(() =>
    nodes.value.find(n => n.id === selectedNodeId.value) ?? null
  )

  function createNodeData(type: NodeType): NodeData {
    if (type === 'trigger') {
      return {
        type: 'trigger',
        label: 'Trigger',
        mode: 'manual',
        scheduleTime: '08:00',
        intervalValue: 5,
        intervalUnit: 'minutes',
        state: 'idle',
      } satisfies TriggerNodeData
    }
    if (type === 'delay') {
      return {
        type: 'delay',
        label: 'Delay',
        value: 5,
        unit: 'seconds',
        state: 'idle',
      } satisfies DelayNodeData
    }
    return {
      type: 'webhookMessage',
      label: 'Webhook Message',
      webhookUrl: '',
      messageText: '',
      state: 'idle',
    } satisfies WebhookMessageNodeData
  }

  function addNode(type: NodeType, position: { x: number; y: number }) {
    const id = `node-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const node: WorkflowNode = { id, type, position, data: createNodeData(type) }
    nodes.value = [...nodes.value, node]
    isDirty.value = true
    return id
  }

  function removeNode(id: string) {
    nodes.value = nodes.value.filter(n => n.id !== id)
    edges.value = edges.value.filter(e => e.source !== id && e.target !== id)
    if (selectedNodeId.value === id) selectedNodeId.value = null
    isDirty.value = true
  }

  function updateNodeData(id: string, patch: Partial<NodeData>) {
    const idx = nodes.value.findIndex(n => n.id === id)
    if (idx === -1) return
    const updated = { ...nodes.value[idx], data: { ...nodes.value[idx].data, ...patch } as NodeData }
    nodes.value = nodes.value.map(n => n.id === id ? updated : n)
    isDirty.value = true
  }

  function updateNodePosition(id: string, position: { x: number; y: number }) {
    const idx = nodes.value.findIndex(n => n.id === id)
    if (idx === -1) return
    const updated = { ...nodes.value[idx], position }
    nodes.value = nodes.value.map(n => n.id === id ? updated : n)
    isDirty.value = true
  }

  function selectNode(id: string | null) {
    selectedNodeId.value = id
  }

  function addEdge(edge: WorkflowEdge) {
    const exists = edges.value.some(e => e.source === edge.source && e.target === edge.target)
    if (exists) return
    edges.value = [...edges.value, { ...edge, animated: false }]
    isDirty.value = true
  }

  function removeEdge(id: string) {
    edges.value = edges.value.filter(e => e.id !== id)
    isDirty.value = true
  }

  function setEdgeAnimated(edgeId: string, animated: boolean) {
    edges.value = edges.value.map(e => e.id === edgeId ? { ...e, animated } : e)
  }

  function setEdgesAnimatedBySource(sourceId: string, animated: boolean) {
    edges.value = edges.value.map(e => e.source === sourceId ? { ...e, animated } : e)
  }

  function setNodeState(nodeId: string, state: NodeState) {
    const idx = nodes.value.findIndex(n => n.id === nodeId)
    if (idx === -1) return
    const updated = {
      ...nodes.value[idx],
      data: { ...nodes.value[idx].data, state } as NodeData,
    }
    nodes.value = nodes.value.map(n => n.id === nodeId ? updated : n)
  }

  function resetAllStates() {
    nodes.value = nodes.value.map(n => ({
      ...n,
      data: { ...n.data, state: 'idle' } as NodeData,
    }))
    edges.value = edges.value.map(e => ({ ...e, animated: false }))
  }

  async function persist() {
    try {
      const id = await saveWorkflow(workflowId.value, workflowName.value, nodes.value, edges.value)
      if (!workflowId.value) workflowId.value = id
      isDirty.value = false
    } catch (err) {
      console.error('Persist failed:', err)
    }
  }

  async function load(id: string) {
    const data = await loadWorkflow(id)
    if (!data) return
    workflowId.value = data.id
    workflowName.value = data.name
    nodes.value = data.nodes as WorkflowNode[]
    edges.value = data.edges as WorkflowEdge[]
    selectedNodeId.value = null
    isDirty.value = false
  }

  async function remove(id: string) {
    await deleteWorkflow(id)
    if (workflowId.value === id) {
      workflowId.value = null
      nodes.value = []
      edges.value = []
      workflowName.value = 'Untitled Workflow'
    }
  }

  return {
    nodes, edges, selectedNodeId, selectedNode,
    workflowId, workflowName, isDirty,
    addNode, removeNode, updateNodeData, updateNodePosition,
    selectNode, addEdge, removeEdge,
    setEdgeAnimated, setEdgesAnimatedBySource, setNodeState,
    resetAllStates, persist, load, remove,
  }
})
