import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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

  const queue = nodes.filter((n) => (inDegree[n.id] ?? 0) === 0).map((n) => n.id);
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

async function executeNode(node: WorkflowNode): Promise<void> {
  if (node.type === "trigger") {
    // Trigger fires immediately
    await new Promise((r) => setTimeout(r, 400));
  } else if (node.type === "delay") {
    const d = node.data as { value: number; unit: string };
    const value = d.value ?? 5;
    const unit = d.unit ?? "seconds";
    const ms =
      unit === "seconds"
        ? value * 1000
        : unit === "minutes"
        ? value * 60000
        : value * 3600000;
    // Cap at 3s for demo safety
    await new Promise((r) => setTimeout(r, Math.min(ms, 3000)));
  } else if (node.type === "webhookMessage") {
    const d = node.data as { webhookUrl: string; messageText: string };
    if (!d.webhookUrl) throw new Error("Webhook URL is required");
    await fetch(d.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: d.messageText }),
    });
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace("/workflow-engine", "");

    // POST /execute - Run a workflow
    if (path === "/execute" && req.method === "POST") {
      const body = await req.json();
      const { workflowId } = body as { workflowId: string };

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      // Fetch workflow
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

      // Create execution record
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

      const executionId = execution.id;
      const nodeStates: Record<string, string> = {};
      const logEntries: LogEntry[] = [];

      // Run execution in background using waitUntil
      const runPromise = (async () => {
        try {
          const order = topologicalSort(nodes, edges);

          for (const nodeId of order) {
            const node = nodes.find((n) => n.id === nodeId);
            if (!node) continue;

            nodeStates[nodeId] = "running";
            const nodeLabel = (node.data as Record<string, unknown>).label as string ?? node.type;

            logEntries.push({
              timestamp: Date.now(),
              nodeId,
              nodeLabel,
              status: "running",
              message: `Executing ${nodeLabel}...`,
            });

            // Update execution state in DB (triggers Realtime)
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
                message: `${nodeLabel} failed: ${err}`,
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
        } catch (err) {
          await supabase
            .from("executions")
            .update({
              status: "error",
              current_node_id: null,
              node_states: { ...nodeStates },
              log: [
                ...logEntries,
                {
                  timestamp: Date.now(),
                  nodeId: "",
                  nodeLabel: "Engine",
                  status: "error",
                  message: `Engine error: ${err}`,
                },
              ],
              finished_at: new Date().toISOString(),
            })
            .eq("id", executionId);
        }
      })();

      // Use waitUntil to run execution in background
      EdgeRuntime.waitUntil(runPromise);

      // Return execution ID immediately
      return new Response(
        JSON.stringify({ executionId, status: "running" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET /executions/:workflowId - Get latest execution for a workflow
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

    // GET /health
    if (path === "/health") {
      return new Response(JSON.stringify({ status: "ok" }), {
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
