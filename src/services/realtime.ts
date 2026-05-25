import { supabase } from './supabase'
import type { ExecutionLogEntry, NodeState } from '@/types/workflow'

export interface ExecutionUpdate {
  id: string
  workflow_id: string
  status: string
  current_node_id: string | null
  node_states: Record<string, NodeState>
  log: ExecutionLogEntry[]
}

type OnUpdate = (update: ExecutionUpdate) => void

let channel: ReturnType<typeof supabase.channel> | null = null

export function subscribeToExecution(workflowId: string, onUpdate: OnUpdate) {
  unsubscribe()
  channel = supabase
    .channel('exec-realtime')
    .on('postgres_changes', {
      event: 'UPDATE', schema: 'public', table: 'executions',
      filter: `workflow_id=eq.${workflowId}`,
    }, (payload) => {
      onUpdate(payload.new as ExecutionUpdate)
    })
    .subscribe()
}

export function unsubscribe() {
  if (channel) { supabase.removeChannel(channel); channel = null }
}
