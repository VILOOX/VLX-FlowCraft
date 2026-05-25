<template>
  <div :class="['node-card relative flex flex-col items-center justify-center gap-2 rounded-xl border p-3 text-sm shadow-sm', themeClass]">
    <div class="absolute top-3 right-3 h-2.5 w-2.5 rounded-full" :class="statusClass"></div>
    <div class="text-center font-medium">{{ data.title }}</div>
    <div v-if="showBody" class="space-y-1 text-xs text-slate-400">
      <slot />
    </div>
    <template #input>
      <Handle
        v-if="hasInput"
        type="target"
        position="left"
        id="input"
        class="connector connector-input"
      />
    </template>
    <template #output>
      <Handle
        type="source"
        position="right"
        id="output"
        class="connector connector-output"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Handle } from '@vue-flow/core';
import { WorkflowNodeData } from '@vlx-flowcraft/shared';

const props = defineProps<{ data: WorkflowNodeData; hasInput: boolean; hasOutput: boolean; showBody?: boolean }>();

const themeClass = computed(() => (document.body.classList.contains('light') ? 'bg-slate-100 text-slate-900 border-slate-200' : 'bg-slate-900 text-slate-100 border-slate-700'));

const statusClass = computed(() => {
  switch (props.data.status) {
    case 'running':
      return 'bg-emerald-400 animate-pulse';
    case 'waiting':
      return 'bg-amber-400';
    case 'success':
      return 'bg-emerald-500';
    case 'error':
      return 'bg-rose-500';
    default:
      return 'bg-slate-500';
  }
});
</script>

<style scoped>
.node-card {
  width: 96px;
  height: 96px;
  border-radius: 16px;
}
.connector {
  width: 6px;
  height: 12px;
  border-radius: 2px;
  background: #94a3b8;
}
.connector-input {
  left: -12px;
}
.connector-output {
  right: -12px;
}
</style>
