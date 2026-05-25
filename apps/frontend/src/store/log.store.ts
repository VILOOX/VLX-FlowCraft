import { create } from 'zustand';
import { ExecutionLog } from '../types/workflow.types';

interface LogStore {
  logs: ExecutionLog[];
  addLog: (log: ExecutionLog) => void;
  clearLogs: () => void;
  filterLogs: (nodeId?: string) => ExecutionLog[];
}

export const useLogStore = create<LogStore>((set, get) => ({
  logs: [],

  addLog: (log) => set((state) => ({
    logs: [...state.logs, log]
  })),

  clearLogs: () => set({ logs: [] }),

  filterLogs: (nodeId?: string) => {
    const logs = get().logs;
    return nodeId ? logs.filter(l => l.nodeId === nodeId) : logs;
  }
}));
