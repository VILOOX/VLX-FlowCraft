export interface TriggerNodeConfig {
  mode: 'manual' | 'schedule' | 'interval';
  interval: number;
}

export interface TriggerNodeData {
  title: string;
  type: 'trigger';
  config: TriggerNodeConfig;
}
