import axios from 'axios';
import { logger } from '../../shared/logger/logger.js';

interface NodeExecutorConfig {
  [key: string]: any;
}

export const nodeExecutor = {
  async execute(nodeType: string, config: NodeExecutorConfig) {
    switch (nodeType) {
      case 'start':
        return this.executeStart(config);
      case 'send-url-message':
        return this.executeSendUrlMessage(config);
      case 'send-webhook':
        return this.executeSendWebhook(config);
      default:
        throw new Error(`Unknown node type: ${nodeType}`);
    }
  },

  async executeStart(config: any) {
    logger.info('Starting workflow');
    return {
      status: 'started',
      timestamp: new Date().toISOString()
    };
  },

  async executeSendUrlMessage(config: any) {
    if (!config.url) throw new Error('URL is required');

    try {
      const response = await axios({
        method: config.method || 'POST',
        url: config.url,
        headers: config.headers || { 'Content-Type': 'application/json' },
        data: config.body,
        timeout: 10000
      });

      logger.info(`Sent message to ${config.url}`);
      return {
        status: 'sent',
        statusCode: response.status,
        data: response.data
      };
    } catch (error: any) {
      logger.error(`Failed to send message: ${error.message}`);
      throw new Error(`HTTP request failed: ${error.message}`);
    }
  },

  async executeSendWebhook(config: any) {
    if (!config.url) throw new Error('Webhook URL is required');

    try {
      const response = await axios({
        method: config.method || 'POST',
        url: config.url,
        headers: config.headers || { 'Content-Type': 'application/json' },
        data: config.payload,
        timeout: 10000
      });

      return {
        status: 'webhook_sent',
        statusCode: response.status,
        data: response.data
      };
    } catch (error: any) {
      throw new Error(`Webhook failed: ${error.message}`);
    }
  }
};
