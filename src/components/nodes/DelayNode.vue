<script setup lang="ts">
import type { DelayNodeData } from '@/types/workflow'
import BaseNode from './BaseNode.vue'

defineProps<{ id: string; data: DelayNodeData }>()
</script>

<template>
  <BaseNode :id="id" :data="data" :show-input="true" :show-output="true" :width="96" :height="96" :border-radius="16">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="node-icon">
      <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" />
      <path d="M12 7v5l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <span class="node-label">{{ data.label }}</span>
    <span class="node-sub">{{ data.value }} {{ data.unit }}</span>
  </BaseNode>
</template>

<style scoped>
.node-icon { color: var(--accent-color); margin-bottom: 2px; }
.node-label { font-size: 11px; font-weight: 600; color: var(--node-text); text-align: center; line-height: 1.2; }
.node-sub { font-size: 9px; color: var(--node-text-muted); }
</style>
