import React, { useCallback } from 'react';
import { ReactFlow, Background, Controls, MiniMap, addEdge, Connection, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { StartNode } from '../Nodes/StartNode';
import { SendUrlNode } from '../Nodes/SendUrlNode';

const nodeTypes = {
  start: StartNode,
  'send-url': SendUrlNode,
};

const initialNodes = [
  {
    id: '1',
    type: 'start',
    data: { label: 'Start', type: 'trigger' },
    position: { x: 100, y: 100 },
  },
];

const initialEdges = [];

export const WorkflowCanvas: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge(connection, eds));
  }, [setEdges]);

  return (
    <div className="w-full h-full bg-gray-900">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};
