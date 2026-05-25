import React from 'react';
import { Play, Plus, Zap } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflow.store';

export const Toolbar: React.FC<{ onExecute: () => void }> = ({ onExecute }) => {
  const isExecuting = useWorkflowStore((state) => state.isExecuting);

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-4 z-40">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-white">VLX Flow</h1>
        <span className="text-xs text-gray-400">Workflow Automation</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onExecute}
          disabled={isExecuting}
        >
          <Play size={16} />
          {isExecuting ? 'Running...' : 'Execute'}
        </button>

        <button className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition">
          <Plus size={16} />
          Add Node
        </button>

        <button className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition">
          <Zap size={16} />
          Save
        </button>
      </div>
    </div>
  );
};
