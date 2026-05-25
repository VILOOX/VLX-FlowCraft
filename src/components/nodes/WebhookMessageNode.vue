<script setup lang="ts">
import type { WebhookMessageNodeData } from '@/types/workflow'
import BaseNode from './BaseNode.vue'

defineProps<{ id: string; data: WebhookMessageNodeData }>()
</script>

<template>
  <BaseNode :id="id" :data="data" :show-input="true" :show-output="true" :width="96" :height="96" :border-radius="16">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="node-icon">
      <path d="M22 2L11 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      <path d="M22 2L15 22l-4-9-9-4L22 2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
    </svg>
    <span class="node-label">{{ data.label }}</span>
    <span class="node-sub">{{ data.webhookUrl ? 'Configured' : 'No URL' }}</span>
  </BaseNode>
</template>

<style scoped>
.node-icon { color: var(--accent-color); margin-bottom: 2px; }
.node-label { font-size: 11px; font-weight: 600; color: var(--node-text); text-align: center; line-height: 1.2; }
.node-sub { font-size: 9px; color: var(--node-text-muted); }
</style>
