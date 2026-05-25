import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const workflowService = {
  async getAllWorkflows() {
    return prisma.workflow.findMany({
      orderBy: { createdAt: 'desc' }
    });
  },

  async getWorkflow(id: string) {
    return prisma.workflow.findUnique({
      where: { id },
      include: { executions: { take: 10, orderBy: { createdAt: 'desc' } } }
    });
  },

  async createWorkflow(data: { name: string; description?: string; definition: any }) {
    return prisma.workflow.create({
      data: {
        name: data.name,
        description: data.description,
        definition: data.definition
      }
    });
  },

  async updateWorkflow(id: string, data: any) {
    return prisma.workflow.update({
      where: { id },
      data
    });
  },

  async deleteWorkflow(id: string) {
    return prisma.workflow.delete({
      where: { id }
    });
  }
};
