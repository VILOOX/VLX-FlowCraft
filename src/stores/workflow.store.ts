import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { WorkflowNode, WorkflowEdge, NodeData, NodeType, NodeState, TriggerNodeData, DelayNodeData, WebhookMessageNodeData } from '@/types/workflow'
import { saveWorkflow } from '@/services/api'

export const useWorkflowStore = defineStore('workflow', () => {
  const nodes = ref<WorkflowNode[]>([])
  const edges = ref<WorkflowEdge[]>([])
  const selectedNodeId = ref<string | null>(null)
  const workflowId = ref<string | null>(null)
  const workflowName = ref('Untitled Workflow')

  const selectedNode = computed(() => nodes.value.find(n => n.id === selectedNodeId.value) ?? null)

  function addNode(type: NodeType, position: { x: number; y: number }) {
    const id = `node-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    let data: NodeData
    if (type === 'trigger') {
      data = { type: 'trigger', label: 'Trigger', mode: 'manual', scheduleTime: '08:00', intervalValue: 5, intervalUnit: 'minutes', state: 'idle' } satisfies TriggerNodeData
    } else if (type === 'delay') {
      data = { type: 'delay', label: 'Delay', value: 5, unit: 'seconds', state: 'idle' } satisfies DelayNodeData
    } else {
      data = { type: 'webhookMessage', label: 'Webhook Message', webhookUrl: '', messageText: '', state: 'idle' } satisfies WebhookMessageNodeData
    }
    nodes.value = [...nodes.value, { id, type, position, data }]
    return id
  }

  function removeNode(id: string) {
    nodes.value = nodes.value.filter(n => n.id !== id)
    edges.value = edges.value.filter(e => e.source !== id && e.target !== id)
    if (selectedNodeId.value === id) selectedNodeId.value = null
  }

  function updateNodeData(id: string, patch: Partial<NodeData>) {
    nodes.value = nodes.value.map(n =>
      n.id === id ? { ...n, data: { ...n.data, ...patch } as NodeData } : n
    )
  }

  function updateNodePosition(id: string, position: { x: number; y: number }) {
    nodes.value = nodes.value.map(n =>
      n.id === id ? { ...n, position } : n
    )
  }

  function selectNode(id: string | null) { selectedNodeId.value = id }

  function addEdge(edge: WorkflowEdge) {
    if (edges.value.some(e => e.source === edge.source && e.target === edge.target)) return
    edges.value = [...edges.value, { ...edge, animated: false }]
  }

  function removeEdge(id: string) {
    edges.value = edges.value.filter(e => e.id !== id)
  }

  function setEdgesAnimatedBySource(sourceId: string, animated: boolean) {
    edges.value = edges.value.map(e => e.source === sourceId ? { ...e, animated } : e)
  }

  function setNodeState(nodeId: string, state: NodeState) {
    nodes.value = nodes.value.map(n =>
      n.id === nodeId ? { ...n, data: { ...n.data, state } as NodeData } : n
    )
  }

  function resetAllStates() {
    nodes.value = nodes.value.map(n => ({ ...n, data: { ...n.data, state: 'idle' } as NodeData }))
    edges.value = edges.value.map(e => ({ ...e, animated: false }))
  }

  async function persist() {
    try {
      const id = await saveWorkflow(workflowId.value, workflowName.value, nodes.value, edges.value)
      if (!workflowId.value) workflowId.value = id
    } catch (err) { console.error('Persist failed:', err) }
  }

  return {
    nodes, edges, selectedNodeId, selectedNode, workflowId, workflowName,
    addNode, removeNode, updateNodeData, updateNodePosition,
    selectNode, addEdge, removeEdge,
    setEdgesAnimatedBySource, setNodeState, resetAllStates, persist,
  }
})
