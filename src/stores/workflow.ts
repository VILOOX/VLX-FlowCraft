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
  ExecutionLogEntry,
} from '@/types/workflow'

export const useWorkflowStore = defineStore('workflow', () => {
  const nodes = ref<WorkflowNode[]>([])
  const edges = ref<WorkflowEdge[]>([])
  const selectedNodeId = ref<string | null>(null)
  const executionState = ref<ExecutionState>({
    status: 'idle',
    currentNodeId: null,
    nodeStates: {},
    log: [],
  })
  const wsConnected = ref(false)

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
    executionState.value.nodeStates[nodeId] = state
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

  function addLog(entry: ExecutionLogEntry) {
    executionState.value.log.unshift(entry)
    if (executionState.value.log.length > 100) {
      executionState.value.log.pop()
    }
  }

  function setEdgeAnimated(sourceId: string, animated: boolean) {
    edges.value = edges.value.map(e =>
      e.source === sourceId ? { ...e, animated } : e
    )
  }

  // Simulated local execution engine (no backend needed for demo)
  async function runWorkflow() {
    const triggerNode = nodes.value.find(n => n.type === 'trigger')
    if (!triggerNode) return

    resetExecution()
    executionState.value.status = 'running'

    // Build execution order via topological sort
    const order = topologicalSort(nodes.value, edges.value)

    for (const nodeId of order) {
      const node = nodes.value.find(n => n.id === nodeId)
      if (!node) continue

      executionState.value.currentNodeId = nodeId
      setNodeState(nodeId, 'running')
      setEdgeAnimated(nodeId, true)

      addLog({
        timestamp: Date.now(),
        nodeId,
        nodeLabel: node.data.label,
        status: 'running',
        message: `Executing ${node.data.label}...`,
      })

      try {
        await executeNode(node)
        setNodeState(nodeId, 'success')
        addLog({
          timestamp: Date.now(),
          nodeId,
          nodeLabel: node.data.label,
          status: 'success',
          message: `${node.data.label} completed`,
        })
      } catch (err) {
        setNodeState(nodeId, 'error')
        setEdgeAnimated(nodeId, false)
        addLog({
          timestamp: Date.now(),
          nodeId,
          nodeLabel: node.data.label,
          status: 'error',
          message: `${node.data.label} failed: ${err}`,
        })
        executionState.value.status = 'error'
        executionState.value.currentNodeId = null
        return
      }
    }

    executionState.value.status = 'completed'
    executionState.value.currentNodeId = null
  }

  async function executeNode(node: WorkflowNode): Promise<void> {
    if (node.type === 'trigger') {
      await delay(400)
    } else if (node.type === 'delay') {
      const d = node.data as import('@/types/workflow').DelayNodeData
      const ms = d.unit === 'seconds' ? d.value * 1000
        : d.unit === 'minutes' ? d.value * 60000
        : d.value * 3600000
      // Cap at 3s for demo
      await delay(Math.min(ms, 3000))
    } else if (node.type === 'webhookMessage') {
      const d = node.data as import('@/types/workflow').WebhookMessageNodeData
      if (!d.webhookUrl) throw new Error('Webhook URL is required')
      // Simulate the request
      await delay(800)
      // In real use: await fetch(d.webhookUrl, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ content: d.messageText }) })
    }
  }

  function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  function topologicalSort(
    nodeList: WorkflowNode[],
    edgeList: WorkflowEdge[]
  ): string[] {
    const inDegree: Record<string, number> = {}
    const adj: Record<string, string[]> = {}

    for (const n of nodeList) {
      inDegree[n.id] = 0
      adj[n.id] = []
    }

    for (const e of edgeList) {
      adj[e.source].push(e.target)
      inDegree[e.target] = (inDegree[e.target] ?? 0) + 1
    }

    const queue = nodeList
      .filter(n => (inDegree[n.id] ?? 0) === 0)
      .map(n => n.id)

    const result: string[] = []
    while (queue.length > 0) {
      const id = queue.shift()!
      result.push(id)
      for (const next of (adj[id] ?? [])) {
        inDegree[next]--
        if (inDegree[next] === 0) queue.push(next)
      }
    }

    return result
  }

  function exportWorkflow() {
    return JSON.stringify({ nodes: nodes.value, edges: edges.value }, null, 2)
  }

  return {
    nodes,
    edges,
    selectedNodeId,
    selectedNode,
    executionState,
    wsConnected,
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
    exportWorkflow,
  }
})
