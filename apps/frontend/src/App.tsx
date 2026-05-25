import React from 'react';
import { WorkflowCanvas } from './components/Canvas/WorkflowCanvas';
import { Toolbar } from './components/Toolbar/Toolbar';
import { LogPanel } from './components/LogPanel/LogPanel';
import { useWorkflowStore } from './store/workflow.store';
import { useLogStore } from './store/log.store';
import './styles/globals.css';

function App() {
  const setExecuting = useWorkflowStore((state) => state.setExecuting);
  const addLog = useLogStore((state) => state.addLog);

  const handleExecute = async () => {
    setExecuting(true);
    addLog({
      timestamp: new Date(),
      nodeId: '1',
      nodeName: 'Start',
      level: 'info',
      message: 'Workflow execution started'
    });

    try {
      // Simulate execution
      await new Promise(r => setTimeout(r, 2000));
      addLog({
        timestamp: new Date(),
        nodeId: '1',
        nodeName: 'Start',
        level: 'info',
        message: 'Workflow completed successfully'
      });
    } catch (error) {
      addLog({
        timestamp: new Date(),
        nodeId: '1',
        nodeName: 'Start',
        level: 'error',
        message: 'Execution failed'
      });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-gray-950 flex flex-col">
      <Toolbar onExecute={handleExecute} />
      <div className="flex-1 mt-16">
        <WorkflowCanvas />
      </div>
      <LogPanel />
    </div>
  );
}

export default App;
