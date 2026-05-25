export interface WebhookMessageNodeConfig {
  url: string;
  message: string;
}

export interface WebhookMessageNodeData {
  title: string;
  type: 'webhook-message';
  config: WebhookMessageNodeConfig;
}
