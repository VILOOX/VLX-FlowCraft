export interface DelayNodeConfig {
  duration: number;
  unit: 'seconds' | 'minutes' | 'hours';
}

export interface DelayNodeData {
  title: string;
  type: 'delay';
  config: DelayNodeConfig;
}
