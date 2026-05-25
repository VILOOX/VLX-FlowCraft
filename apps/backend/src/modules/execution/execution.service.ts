import { PrismaClient } from '@prisma/client';
import { nodeExecutor } from '../../engine/executor/node.executor.js';
import { logger } from '../../shared/logger/logger.js';

const prisma = new PrismaClient();

interface ExecutionLog {
  timestamp: string;
  nodeId: string;
  nodeName: string;
  level: 'info' | 'error' | 'warning';
  message: string;
  data?: any;
}

export const executionService = {
  async executeWorkflow(workflowId: string) {
    try {
      const workflow = await prisma.workflow.findUnique({
        where: { id: workflowId }
      });

      if (!workflow) throw new Error('Workflow not found');

      // Create execution record
      const execution = await prisma.execution.create({
        data: {
          workflowId,
          status: 'running',
          startTime: new Date(),
          logs: []
        }
      });

      const logs: ExecutionLog[] = [];

      try {
        // Parse and execute workflow
        const definition = workflow.definition as any;
        const nodes = definition.nodes || [];
        const connections = definition.connections || [];

        logger.info(`Executing workflow: ${workflow.name}`);

        // Execute nodes in sequence
        for (const node of nodes) {
          try {
            logs.push({
              timestamp: new Date().toISOString(),
              nodeId: node.id,
              nodeName: node.type,
              level: 'info',
              message: `Executing node: ${node.type}`
            });

            // Execute node
            const result = await nodeExecutor.execute(node.type, node.config);

            logs.push({
              timestamp: new Date().toISOString(),
              nodeId: node.id,
              nodeName: node.type,
              level: 'info',
              message: `Node executed successfully`,
              data: result
            });
          } catch (nodeError: any) {
            logs.push({
              timestamp: new Date().toISOString(),
              nodeId: node.id,
              nodeName: node.type,
              level: 'error',
              message: nodeError.message
            });
            throw nodeError;
          }
        }

        // Update execution as success
        await prisma.execution.update({
          where: { id: execution.id },
          data: {
            status: 'success',
            endTime: new Date(),
            logs
          }
        });

        return { ...execution, logs };
      } catch (error: any) {
        // Update execution as error
        await prisma.execution.update({
          where: { id: execution.id },
          data: {
            status: 'error',
            endTime: new Date(),
            error: error.message,
            logs
          }
        });

        throw error;
      }
    } catch (error: any) {
      logger.error(`Workflow execution failed: ${error.message}`);
      throw error;
    }
  },

  async getExecution(executionId: string) {
    return prisma.execution.findUnique({
      where: { id: executionId }
    });
  }
};
