<script setup lang="ts">
import type { TriggerNodeData } from '@/types/workflow'
import BaseNode from './BaseNode.vue'

defineProps<{
  id: string
  data: TriggerNodeData
}>()

function modeLabel(mode: string) {
  if (mode === 'manual') return 'Manual'
  if (mode === 'schedule') return 'Schedule'
  return 'Interval'
}
</script>

<template>
  <BaseNode
    :id="id"
    :data="data"
    :show-input="false"
    :show-output="true"
    :width="82"
    :height="82"
    :border-radius="14"
  >
    <template #default>
      <div class="trigger-inner">
        <svg class="trigger-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
        </svg>
        <span class="trigger-label">{{ data.label }}</span>
        <span class="trigger-mode">{{ modeLabel(data.mode) }}</span>
      </div>
    </template>
  </BaseNode>
</template>

<style scoped>
.trigger-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 100%;
  height: 100%;
}

.trigger-icon {
  color: var(--accent-color, #3b82f6);
  margin-bottom: 2px;
}

.trigger-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--node-text);
  text-align: center;
  line-height: 1.2;
}

.trigger-mode {
  font-size: 9px;
  color: var(--node-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
</style>
