export const NODE_TYPES = {
  START: 'start',
  SEND_URL: 'send-url-message',
  WEBHOOK: 'send-webhook',
  DELAY: 'delay',
  CONDITIONAL: 'conditional'
} as const;

export const EXECUTION_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  SUCCESS: 'success',
  ERROR: 'error'
} as const;

export const LOG_LEVELS = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error'
} as const;
