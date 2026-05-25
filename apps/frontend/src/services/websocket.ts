import { useWorkflowStore } from '../stores/workflow.store';
import { useExecutionStore } from '../stores/execution.store';
import type { ExecutionEvent, WorkflowState } from '@vlx-flowcraft/shared';

let socket: WebSocket | null = null;

export function useWebsocket() {
  const workflowStore = useWorkflowStore();
  const executionStore = useExecutionStore();

  if (socket) return;

  try {
    socket = new WebSocket(`ws://${window.location.hostname}:4174`);

    socket.addEventListener('open', () => {
      console.log('[WebSocket] Connected');
      socket?.send(JSON.stringify({ type: 'sync:request' }));
    });

    socket.addEventListener('message', async (event) => {
      try {
        const data = JSON.parse(event.data) as ExecutionEvent | WorkflowState;

        if ('nodes' in data && 'edges' in data) {
          workflowStore.setNodes(data.nodes);
          workflowStore.setEdges(data.edges);
          return;
        }

        if (data.type === 'node:update' && data.payload) {
          const node = workflowStore.nodes.find((item) => item.id === data.payload?.nodeId);
          if (node && data.payload?.status) {
            node.data.status = data.payload.status;
          }
          executionStore.updateStatus(data.payload?.status || 'idle', data.payload?.message);
        }

        if (data.type === 'execution:finished' && data.payload) {
          executionStore.updateStatus('success', data.payload?.message || 'Execution finished');
        }
      } catch (error) {
        console.warn('[WebSocket] Message parse error:', error);
      }
    });

    socket.addEventListener('error', (event) => {
      console.warn('[WebSocket] Connection error:', event);
    });

    socket.addEventListener('close', () => {
      console.log('[WebSocket] Disconnected');
      socket = null;
    });
  } catch (error) {
    console.warn('[WebSocket] Failed to initialize:', error);
  }
}
