import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ExecutionState, NodeState, ExecutionLogEntry } from '@/types/workflow'
import { executeWorkflow as apiExecute } from '@/services/api'
import { subscribeToExecution, unsubscribe } from '@/services/realtime'
import { useWorkflowStore } from './workflow.store'

export const useExecutionStore = defineStore('execution', () => {
  const state = ref<ExecutionState>({
    status: 'idle',
    currentNodeId: null,
    nodeStates: {},
    log: [],
  })

  const isRunning = ref(false)

  function reset() {
    state.value = { status: 'idle', currentNodeId: null, nodeStates: {}, log: [] }
    isRunning.value = false
    const wf = useWorkflowStore()
    wf.resetAllStates()
  }

  function onRealtimeUpdate(payload: {
    status: string
    current_node_id: string | null
    node_states: Record<string, string>
    log: ExecutionLogEntry[]
  }) {
    const wf = useWorkflowStore()

    state.value = {
      status: payload.status as ExecutionState['status'],
      currentNodeId: payload.current_node_id,
      nodeStates: (payload.node_states ?? {}) as Record<string, NodeState>,
      log: (payload.log ?? []).slice().reverse(),
    }

    // Sync node states to workflow store
    const ns = payload.node_states ?? {}
    for (const [nodeId, nodeState] of Object.entries(ns)) {
      wf.setNodeState(nodeId, nodeState as NodeState)
      if (nodeState === 'running') {
        wf.setEdgesAnimatedBySource(nodeId, true)
      }
      if (nodeState === 'success' || nodeState === 'error') {
        wf.setEdgesAnimatedBySource(nodeId, false)
      }
    }

    if (payload.status === 'completed' || payload.status === 'error') {
      isRunning.value = false
    }
  }

  async function run() {
    const wf = useWorkflowStore()
    const trigger = wf.nodes.find(n => n.type === 'trigger')
    if (!trigger) return

    reset()
    isRunning.value = true

    try {
      // Persist first
      await wf.persist()

      // Subscribe to realtime
      if (wf.workflowId) {
        subscribeToExecution(wf.workflowId, onRealtimeUpdate)
      }

      // Trigger backend
      await apiExecute(wf.workflowId!)
    } catch (err) {
      state.value.status = 'error'
      isRunning.value = false
      console.error('Execution failed:', err)
    }
  }

  function cleanup() {
    unsubscribe()
  }

  return { state, isRunning, reset, run, cleanup }
})
