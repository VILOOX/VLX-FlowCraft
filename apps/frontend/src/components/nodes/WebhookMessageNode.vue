<template>
  <div class="webhook-node group relative flex h-[96px] w-[96px] flex-col justify-between rounded-[12px] border border-slate-600 bg-gradient-to-br from-slate-800 to-slate-900 p-3 text-xs text-slate-100 shadow-lg shadow-black/30 transition-all hover:shadow-xl hover:shadow-black/50 hover:border-slate-500">
    <!-- Status indicator -->
    <div class="absolute top-2 right-2 h-3 w-3 rounded-full" :class="statusClass"></div>
    
    <!-- Content -->
    <div class="min-w-0">
      <p class="text-sm font-semibold">Webhook</p>
      <p class="mt-1 break-words text-[9px] text-slate-400">{{ urlLabel }}</p>
    </div>
    <div class="text-[9px] text-slate-400">{{ messageLabel }}</div>
    
    <!-- Handles -->
    <Handle type="target" position="left" id="input" class="connector connector-input" />
    <Handle type="source" position="right" id="output" class="connector connector-output" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Handle } from '@vue-flow/core';
import { WorkflowNodeData } from '@vlx-flowcraft/shared';

const props = defineProps<{ data: WorkflowNodeData }>();

const urlLabel = computed(() => {
  const url = props.data.config?.url as string;
  return url?.replace(/^https?:\/\//, '').slice(0, 15) + (url?.length > 15 ? '...' : '');
});

const messageLabel = computed(() => String(props.data.config?.message || 'No message').slice(0, 20));

const statusClass = computed(() => {
  switch (props.data.status) {
    case 'running':
      return 'bg-emerald-400 animate-pulse shadow-lg shadow-emerald-500/50';
    case 'waiting':
      return 'bg-amber-400 shadow-lg shadow-amber-500/50';
    case 'success':
      return 'bg-emerald-500 shadow-lg shadow-emerald-600/50';
    case 'error':
      return 'bg-rose-500 shadow-lg shadow-rose-600/50';
    default:
      return 'bg-slate-500 shadow-lg shadow-slate-600/30';
  }
});
</script>

<style scoped>
.webhook-node {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 0 1px rgba(148, 163, 184, 0.5) inset;
}

.webhook-node:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4), 0 0 1px rgba(148, 163, 184, 0.5) inset;
}

.connector {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #94a3b8;
  border: 2px solid #1e293b;
  transition: all 0.2s ease;
}

.connector:hover {
  background: #cbd5e1;
  border-color: #60a5fa;
  box-shadow: 0 0 8px rgba(96, 165, 250, 0.8);
}

.connector-input {
  left: -18px;
}

.connector-output {
  right: -18px;
}
</style>
