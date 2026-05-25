import React from 'react';
import { Handle, Position } from '@xyflow/react';

export interface BaseNodeProps {
  id: string;
  data: {
    label: string;
    type: string;
    status?: 'idle' | 'running' | 'success' | 'error';
  };
  isConnectable?: boolean;
}

const statusColors = {
  idle: '#6c757d',
  running: '#0d6efd',
  success: '#198754',
  error: '#dc3545'
};

export const BaseNode: React.FC<BaseNodeProps> = ({ id, data, isConnectable }) => {
  const status = data.status || 'idle';
  const statusColor = statusColors[status];

  return (
    <div className="bg-gray-800 border-2 border-gray-700 rounded-lg p-3 min-w-40 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="text-sm font-bold text-gray-100">{data.label}</div>
          <div className="text-xs text-gray-400">{data.type}</div>
        </div>
        {/* Status Dot */}
        <div
          className={`w-3 h-3 rounded-full border border-gray-600 ${
            status === 'running' ? 'animate-pulse' : ''
          }`}
          style={{ backgroundColor: statusColor }}
          title={status}
          aria-label={`Status: ${status}`}
        />
      </div>

      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
      />
    </div>
  );
};
