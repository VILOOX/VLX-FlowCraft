<script setup lang="ts">
import type { TriggerNodeData } from '@/types/workflow'
import BaseNode from './BaseNode.vue'

defineProps<{ id: string; data: TriggerNodeData }>()
</script>

<template>
  <BaseNode :id="id" :data="data" :show-input="false" :show-output="true" :width="82" :height="82" :border-radius="14">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="node-icon">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
    </svg>
    <span class="node-label">{{ data.label }}</span>
    <span class="node-sub">{{ data.mode }}</span>
  </BaseNode>
</template>

<style scoped>
.node-icon { color: var(--accent-color); margin-bottom: 2px; }
.node-label { font-size: 11px; font-weight: 600; color: var(--node-text); text-align: center; line-height: 1.2; }
.node-sub { font-size: 9px; color: var(--node-text-muted); text-transform: uppercase; letter-spacing: 0.03em; }
</style>
