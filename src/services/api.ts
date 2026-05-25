import { supabase } from './supabase'
import type { WorkflowNode, WorkflowEdge } from '@/types/workflow'

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/workflow-engine`

function headers() {
  return {
    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    Apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  }
}

export async function saveWorkflow(
  id: string | null, name: string, nodes: WorkflowNode[], edges: WorkflowEdge[]
): Promise<string> {
  if (id) {
    const { error } = await supabase
      .from('workflows')
      .update({ name, nodes, edges, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
    return id
  }
  const { data, error } = await supabase
    .from('workflows')
    .insert({ name, nodes, edges })
    .select('id')
    .maybeSingle()
  if (error) throw error
  if (!data) throw new Error('Failed to create workflow')
  return data.id
}

export async function executeWorkflow(workflowId: string): Promise<{ executionId: string }> {
  const res = await fetch(`${FUNCTION_URL}/execute`, {
    method: 'POST', headers: headers(),
    body: JSON.stringify({ workflowId }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Execution failed')
  }
  return res.json()
}
