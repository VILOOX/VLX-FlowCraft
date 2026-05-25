import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  WorkflowNode,
  WorkflowEdge,
  WorkflowNodeData,
  TriggerNodeData,
  DelayNodeData,
  WebhookMessageNodeData,
  NodeType,
  NodeState,
  ExecutionState,
} from '@/types/workflow'
import { saveWorkflow, executeWorkflow } from '@/services/api'
import { subscribeToExecution, unsubscribe, type ExecutionUpdate } from '@/services/realtime'

export const useWorkflowStore = defineStore('workflow', () => {
  const nodes = ref<WorkflowNode[]>([])
  const edges = ref<WorkflowEdge[]>([])
  const selectedNodeId = ref<string | null>(null)
  const workflowId = ref<string | null>(null)
  const workflowName = ref('Untitled Workflow')

  const executionState = ref<ExecutionState>({
    status: 'idle',
    currentNodeId: null,
    nodeStates: {},
    log: [],
  })

  const selectedNode = computed(() =>
    nodes.value.find(n => n.id === selectedNodeId.value) ?? null
  )

  function createNodeData(type: NodeType): WorkflowNodeData {
    if (type === 'trigger') {
      return {
        type: 'trigger',
        label: 'Trigger',
        mode: 'manual',
        scheduleTime: '08:00',
        intervalValue: 5,
        intervalUnit: 'minutes',
        state: 'idle',
      } as TriggerNodeData
    }
    if (type === 'delay') {
      return {
        type: 'delay',
        label: 'Delay',
        value: 5,
        unit: 'seconds',
        state: 'idle',
      } as DelayNodeData
    }
    return {
      type: 'webhookMessage',
      label: 'Webhook Message',
      webhookUrl: '',
      messageText: '',
      state: 'idle',
    } as WebhookMessageNodeData
  }

  function addNode(type: NodeType, position: { x: number; y: number }) {
    const id = `node-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const node: WorkflowNode = {
      id,
      type,
      position,
      data: createNodeData(type),
    }
    nodes.value.push(node)
    return id
  }

  function removeNode(id: string) {
    nodes.value = nodes.value.filter(n => n.id !== id)
    edges.value = edges.value.filter(e => e.source !== id && e.target !== id)
    if (selectedNodeId.value === id) selectedNodeId.value = null
  }

  function updateNodeData(id: string, patch: Partial<WorkflowNodeData>) {
    const node = nodes.value.find(n => n.id === id)
    if (!node) return
    node.data = { ...node.data, ...patch } as WorkflowNodeData
  }

  function updateNodePosition(id: string, position: { x: number; y: number }) {
    const node = nodes.value.find(n => n.id === id)
    if (node) node.position = position
  }

  function selectNode(id: string | null) {
    selectedNodeId.value = id
  }

  function addEdge(edge: WorkflowEdge) {
    const exists = edges.value.some(
      e => e.source === edge.source && e.target === edge.target
    )
    if (!exists) edges.value.push(edge)
  }

  function removeEdge(id: string) {
    edges.value = edges.value.filter(e => e.id !== id)
  }

  function setNodeState(nodeId: string, state: NodeState) {
    const node = nodes.value.find(n => n.id === nodeId)
    if (node) {
      node.data = { ...node.data, state }
    }
  }

  function setEdgeAnimated(sourceId: string, animated: boolean) {
    edges.value = edges.value.map(e =>
      e.source === sourceId ? { ...e, animated } : e
    )
  }

  function resetExecution() {
    executionState.value = {
      status: 'idle',
      currentNodeId: null,
      nodeStates: {},
      log: [],
    }
    nodes.value.forEach(n => {
      n.data = { ...n.data, state: 'idle' }
    })
    edges.value = edges.value.map(e => ({ ...e, animated: false }))
  }

  // Handle Realtime updates from backend execution
  function handleExecutionUpdate(update: ExecutionUpdate) {
    executionState.value = {
      status: update.status as ExecutionState['status'],
      currentNodeId: update.current_node_id,
      nodeStates: update.node_states ?? {},
      log: (update.log ?? []).reverse(),
    }

    const states = update.node_states ?? {}
    for (const [nodeId, state] of Object.entries(states)) {
      setNodeState(nodeId, state as NodeState)
      if (state === 'running') {
        setEdgeAnimated(nodeId, true)
      }
    }

    for (const [nodeId, state] of Object.entries(states)) {
      if (state === 'success' || state === 'error') {
        setEdgeAnimated(nodeId, false)
      }
    }
  }

  // Persist workflow to DB then trigger backend execution
  async function runWorkflow() {
    const triggerNode = nodes.value.find(n => n.type === 'trigger')
    if (!triggerNode) return

    resetExecution()

    try {
      const id = await saveWorkflow(
        workflowId.value,
        workflowName.value,
        nodes.value,
        edges.value
      )
      workflowId.value = id

      subscribeToExecution(id, handleExecutionUpdate)

      executionState.value.status = 'running'
      await executeWorkflow(id)
    } catch (err) {
      executionState.value.status = 'error'
      console.error('Failed to run workflow:', err)
    }
  }

  async function persistWorkflow() {
    try {
      const id = await saveWorkflow(
        workflowId.value,
        workflowName.value,
        nodes.value,
        edges.value
      )
      workflowId.value = id
    } catch (err) {
      console.error('Failed to save workflow:', err)
    }
  }

  function loadFromData(data: { id: string; name: string; nodes: WorkflowNode[]; edges: WorkflowEdge[] }) {
    workflowId.value = data.id
    workflowName.value = data.name
    nodes.value = data.nodes
    edges.value = data.edges
    selectedNodeId.value = null
    resetExecution()
  }

  function exportWorkflow() {
    return JSON.stringify({ nodes: nodes.value, edges: edges.value }, null, 2)
  }

  function cleanup() {
    unsubscribe()
  }

  return {
    nodes,
    edges,
    selectedNodeId,
    selectedNode,
    executionState,
    workflowId,
    workflowName,
    addNode,
    removeNode,
    updateNodeData,
    updateNodePosition,
    selectNode,
    addEdge,
    removeEdge,
    setNodeState,
    resetExecution,
    runWorkflow,
    persistWorkflow,
    loadFromData,
    exportWorkflow,
    cleanup,
  }
})
