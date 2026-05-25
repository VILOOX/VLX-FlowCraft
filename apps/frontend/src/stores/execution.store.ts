import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ExecutionStatus } from '@vlx-flowcraft/shared';

export const useExecutionStore = defineStore('execution', () => {
  const status = ref<ExecutionStatus>('idle');
  const log = ref<string[]>([]);

  function updateStatus(newStatus: ExecutionStatus, message?: string) {
    status.value = newStatus;
    if (message) log.value.push(message);
  }

  function reset() {
    status.value = 'idle';
    log.value = [];
  }

  return { status, log, updateStatus, reset };
});
