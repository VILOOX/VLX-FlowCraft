import { WebSocketServer as WS, WebSocket } from 'ws';
import type { Server } from 'http';
import { workflowState } from '../engine/execution-manager.js';
import { ExecutionEvent } from '@vlx-flowcraft/shared';

export class WebSocketServer {
  private server: WS;
  private clients = new Set<WebSocket>();

  constructor(httpServer: Server) {
    this.server = new WS({ server: httpServer });
    this.server.on('connection', (socket) => this.handleConnection(socket));
  }

  private handleConnection(socket: WebSocket) {
    this.clients.add(socket);
    socket.on('message', (message) => this.handleMessage(socket, message.toString()));
    socket.on('close', () => this.clients.delete(socket));
    socket.send(JSON.stringify(workflowState));
  }

  private handleMessage(socket: WebSocket, raw: string) {
    try {
      const data = JSON.parse(raw);
      if (data?.type === 'sync:request') {
        socket.send(JSON.stringify(workflowState));
      }
    } catch {
      // ignore invalid messages
    }
  }

  broadcast(event: ExecutionEvent | object) {
    const payload = JSON.stringify(event);
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }
}
