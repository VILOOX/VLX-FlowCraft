<script setup lang="ts">
import type { WebhookMessageNodeData } from '@/types/workflow'
import BaseNode from './BaseNode.vue'

defineProps<{
  id: string
  data: WebhookMessageNodeData
}>()
</script>

<template>
  <BaseNode
    :id="id"
    :data="data"
    :show-input="true"
    :show-output="true"
    :width="96"
    :height="96"
    :border-radius="16"
  >
    <template #default>
      <div class="webhook-inner">
        <svg class="webhook-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M22 2L11 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <path d="M22 2L15 22l-4-9-9-4L22 2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
        </svg>
        <span class="webhook-label">{{ data.label }}</span>
        <span class="webhook-url">{{ data.webhookUrl ? 'Configured' : 'No URL' }}</span>
      </div>
    </template>
  </BaseNode>
</template>

<style scoped>
.webhook-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 100%;
  height: 100%;
}

.webhook-icon {
  color: var(--accent-color, #3b82f6);
  margin-bottom: 2px;
}

.webhook-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--node-text);
  text-align: center;
  line-height: 1.2;
}

.webhook-url {
  font-size: 9px;
  color: var(--node-text-muted);
}
</style>
