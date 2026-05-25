import React from 'react';
import { useLogStore } from '../../store/log.store';

export const LogPanel: React.FC = () => {
  const logs = useLogStore((state) => state.logs);
  const clearLogs = useLogStore((state) => state.clearLogs);

  return (
    <div className="fixed bottom-0 right-0 w-96 h-64 bg-gray-800 border-t-2 border-l-2 border-gray-700 rounded-tl-lg shadow-lg overflow-hidden flex flex-col">
      <div className="flex justify-between items-center p-3 border-b border-gray-700 bg-gray-900">
        <h3 className="text-sm font-bold text-white">Execution Logs</h3>
        <button
          onClick={clearLogs}
          className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition"
        >
          Clear
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {logs.length === 0 ? (
          <div className="text-gray-500 text-xs italic">No logs yet...</div>
        ) : (
          logs.map((log, idx) => (
            <div
              key={idx}
              className={`text-xs p-1 rounded font-mono ${
                log.level === 'error'
                  ? 'bg-red-900 text-red-200'
                  : log.level === 'warning'
                  ? 'bg-yellow-900 text-yellow-200'
                  : 'bg-blue-900 text-blue-200'
              }`}
            >
              <span className="text-gray-300">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
              {' '}
              <span className="font-bold">{log.nodeName}</span>
              {' '}
              {log.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
