<script setup lang="ts">
import type { DelayNodeData } from '@/types/workflow'
import BaseNode from './BaseNode.vue'

defineProps<{
  id: string
  data: DelayNodeData
}>()

function formatDelay(value: number, unit: string) {
  return `${value} ${unit}`
}
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
      <div class="delay-inner">
        <svg class="delay-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" />
          <path d="M12 7v5l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span class="delay-label">{{ data.label }}</span>
        <span class="delay-value">{{ formatDelay(data.value, data.unit) }}</span>
      </div>
    </template>
  </BaseNode>
</template>

<style scoped>
.delay-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 100%;
  height: 100%;
}

.delay-icon {
  color: var(--accent-color, #3b82f6);
  margin-bottom: 2px;
}

.delay-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--node-text);
  text-align: center;
  line-height: 1.2;
}

.delay-value {
  font-size: 9px;
  color: var(--node-text-muted);
}
</style>
