import type { WorkflowState } from '@vlx-flowcraft/shared';
import type { WebSocketServer } from '../websocket/index.js';

let scheduleState: WorkflowState = { nodes: [], edges: [] };
let intervalHandles: NodeJS.Timer[] = [];
let wsServer: WebSocketServer | null = null;
let triggerCallback: ((nodeId: string) => Promise<void>) | null = null;

export function setSchedulerState(state: WorkflowState) {
  scheduleState = state;
  resetIntervals();
}

export function registerWebsocketServer(server: WebSocketServer) {
  wsServer = server;
}

export function registerTriggerCallback(callback: (nodeId: string) => Promise<void>) {
  triggerCallback = callback;
}

function resetIntervals() {
  for (const handle of intervalHandles) {
    clearInterval(handle);
  }
  intervalHandles = [];

  for (const node of scheduleState.nodes) {
    if (node.type !== 'trigger') continue;
    const mode = node.data.config?.mode;
    if (mode !== 'interval') continue;
    const interval = node.data.config?.interval ?? 15;
    const ms = Math.max(1000, interval * 1000);
    const handle = setInterval(async () => {
      wsServer?.broadcast({ type: 'node:update', payload: { nodeId: node.id, status: 'running', message: 'Interval trigger started' } });
      if (triggerCallback) {
        await triggerCallback(node.id);
      }
    }, ms);
    intervalHandles.push(handle);
  }
}

export function startScheduler(server: WebSocketServer) {
  registerWebsocketServer(server);
  if (scheduleState.nodes.length > 0) {
    resetIntervals();
  }
}
