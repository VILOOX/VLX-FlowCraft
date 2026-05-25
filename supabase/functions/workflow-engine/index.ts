/*
  Workflow Execution Engine - Supabase Edge Function

  Handles:
  - POST /execute: Start workflow execution
  - GET /executions/:workflowId: Get latest execution
  - GET /health: Health check

  Execution flow:
  1. Persist execution record
  2. Topological sort nodes
  3. Execute each node in order (trigger/delay/webhook)
  4. Update execution state in DB (triggers Realtime to frontend)
  5. Mark completed or error
*/

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// --- Types ---

interface WorkflowNode {
  id: string;
  type: "trigger" | "delay" | "webhookMessage";
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

interface LogEntry {
  timestamp: number;
  nodeId: string;
  nodeLabel: string;
  status: string;
  message: string;
}

// --- Graph Utilities ---

function topologicalSort(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): string[] {
  const inDegree: Record<string, number> = {};
  const adj: Record<string, string[]> = {};

  for (const n of nodes) {
    inDegree[n.id] = 0;
    adj[n.id] = [];
  }

  for (const e of edges) {
    if (adj[e.source]) adj[e.source].push(e.target);
    inDegree[e.target] = (inDegree[e.target] ?? 0) + 1;
  }

  const queue: string[] = nodes
    .filter((n) => (inDegree[n.id] ?? 0) === 0)
    .map((n) => n.id);
  const result: string[] = [];

  while (queue.length > 0) {
    const id = queue.shift()!;
    result.push(id);
    for (const next of adj[id] ?? []) {
      inDegree[next]--;
      if (inDegree[next] === 0) queue.push(next);
    }
  }

  return result;
}

// --- Node Executors ---

async function executeTriggerNode(_data: Record<string, unknown>): Promise<void> {
  // Trigger fires immediately - just a small delay to simulate
  await new Promise((r) => setTimeout(r, 300));
}

async function executeDelayNode(data: Record<string, unknown>): Promise<void> {
  const value = (data.value as number) ?? 5;
  const unit = (data.unit as string) ?? "seconds";
  const ms =
    unit === "seconds"
      ? value * 1000
      : unit === "minutes"
      ? value * 60000
      : value * 3600000;
  // Cap at 5s for safety
  await new Promise((r) => setTimeout(r, Math.min(ms, 5000)));
}

async function executeWebhookNode(data: Record<string, unknown>): Promise<void> {
  const url = data.webhookUrl as string;
  const message = data.messageText as string;
  if (!url) throw new Error("Webhook URL is required");
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: message }),
  });
}

async function executeNode(node: WorkflowNode): Promise<void> {
  switch (node.type) {
    case "trigger":
      await executeTriggerNode(node.data);
      break;
    case "delay":
      await executeDelayNode(node.data);
      break;
    case "webhookMessage":
      await executeWebhookNode(node.data);
      break;
    default:
      throw new Error(`Unknown node type: ${node.type}`);
  }
}

// --- Main Execution Logic ---

async function runExecution(
  supabase: ReturnType<typeof createClient>,
  executionId: string,
  workflowId: string,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): Promise<void> {
  const nodeStates: Record<string, string> = {};
  const logEntries: LogEntry[] = [];

  const order = topologicalSort(nodes, edges);

  for (const nodeId of order) {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) continue;

    const nodeLabel = (node.data.label as string) ?? node.type;

    // Mark running
    nodeStates[nodeId] = "running";
    logEntries.push({
      timestamp: Date.now(),
      nodeId,
      nodeLabel,
      status: "running",
      message: `Executing ${nodeLabel}...`,
    });

    await supabase
      .from("executions")
      .update({
        current_node_id: nodeId,
        node_states: { ...nodeStates },
        log: [...logEntries],
      })
      .eq("id", executionId);

    try {
      await executeNode(node);
      nodeStates[nodeId] = "success";
      logEntries.push({
        timestamp: Date.now(),
        nodeId,
        nodeLabel,
        status: "success",
        message: `${nodeLabel} completed`,
      });
    } catch (err) {
      nodeStates[nodeId] = "error";
      logEntries.push({
        timestamp: Date.now(),
        nodeId,
        nodeLabel,
        status: "error",
        message: `${nodeLabel} failed: ${err instanceof Error ? err.message : String(err)}`,
      });

      await supabase
        .from("executions")
        .update({
          status: "error",
          current_node_id: null,
          node_states: { ...nodeStates },
          log: [...logEntries],
          finished_at: new Date().toISOString(),
        })
        .eq("id", executionId);
      return;
    }
  }

  // Mark completed
  await supabase
    .from("executions")
    .update({
      status: "completed",
      current_node_id: null,
      node_states: { ...nodeStates },
      log: [...logEntries],
      finished_at: new Date().toISOString(),
    })
    .eq("id", executionId);
}

// --- HTTP Handler ---

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace("/workflow-engine", "");

    // GET /health
    if (path === "/health") {
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /execute
    if (path === "/execute" && req.method === "POST") {
      const body = await req.json();
      const { workflowId } = body as { workflowId: string };

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const { data: workflow, error: wfError } = await supabase
        .from("workflows")
        .select("nodes, edges")
        .eq("id", workflowId)
        .maybeSingle();

      if (wfError || !workflow) {
        return new Response(
          JSON.stringify({ error: "Workflow not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const nodes = workflow.nodes as WorkflowNode[];
      const edges = workflow.edges as WorkflowEdge[];

      const triggerNode = nodes.find((n) => n.type === "trigger");
      if (!triggerNode) {
        return new Response(
          JSON.stringify({ error: "No trigger node found" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: execution, error: execError } = await supabase
        .from("executions")
        .insert({
          workflow_id: workflowId,
          status: "running",
          node_states: {},
          log: [],
        })
        .select("id")
        .maybeSingle();

      if (execError || !execution) {
        return new Response(
          JSON.stringify({ error: "Failed to create execution" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Run in background
      const runPromise = runExecution(
        supabase,
        execution.id,
        workflowId,
        nodes,
        edges
      );

      EdgeRuntime.waitUntil(runPromise);

      return new Response(
        JSON.stringify({ executionId: execution.id, status: "running" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET /executions/:workflowId
    const execMatch = path.match(/^\/executions\/([a-f0-9-]+)$/);
    if (execMatch && req.method === "GET") {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const { data, error } = await supabase
        .from("executions")
        .select("*")
        .eq("workflow_id", execMatch[1])
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
