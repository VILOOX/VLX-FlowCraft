<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import NodeStateIndicator from './NodeStateIndicator.vue'
import type { DelayNodeData } from '@/types/workflow'

const props = defineProps<{ data: DelayNodeData; selected?: boolean }>()

const displayText = computed(() => `${props.data.value} ${props.data.unit}`)
</script>

<template>
  <div
    class="workflow-node action-node"
    :class="{ 'node-state-running': data.state === 'running' }"
  >
    <NodeStateIndicator :state="data.state" />

    <!-- Input handle -->
    <Handle
      id="input"
      type="target"
      :position="Position.Left"
      class="input-handle"
    />

    <div class="node-icon">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" opacity="0.8" />
        <polyline points="12,7 12,12 15,14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.8" />
      </svg>
    </div>

    <div class="node-label">{{ data.label }}</div>
    <div class="node-sublabel">{{ displayText }}</div>

    <!-- Output handle -->
    <Handle
      id="output"
      type="source"
      :position="Position.Right"
      class="output-handle"
    />
  </div>
</template>

<style scoped>
.action-node {
  width: 96px;
  height: 96px;
  border-radius: 24px;
  background: var(--node-bg);
  border: 1px solid var(--node-border);
  box-shadow: var(--node-shadow);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  position: relative;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  user-select: none;
}

.action-node:hover {
  border-color: rgba(59, 130, 246, 0.4);
}

.node-icon {
  color: var(--node-text-muted);
  line-height: 1;
  margin-bottom: 1px;
}

.node-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--node-text);
  letter-spacing: 0.01em;
  line-height: 1.2;
}

.node-sublabel {
  font-size: 9px;
  color: var(--node-text-muted);
  font-weight: 400;
  line-height: 1.2;
  text-align: center;
  padding: 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80px;
}

/* Input handle */
.input-handle {
  width: 24px !important;
  height: 24px !important;
  background: transparent !important;
  border: none !important;
  left: -12px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  cursor: crosshair !important;
}

.input-handle::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 12px;
  background: var(--connector-color);
  border-radius: 999px;
  pointer-events: none;
  transition: all 0.2s;
}

.input-handle:hover::after {
  width: 8px;
  height: 14px;
  background: rgba(59, 130, 246, 0.7);
}

/* Output handle */
.output-handle {
  width: 24px !important;
  height: 24px !important;
  background: transparent !important;
  border: none !important;
  right: -12px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  cursor: crosshair !important;
}

.output-handle::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 12px;
  background: var(--connector-color);
  border-radius: 999px;
  pointer-events: none;
  transition: all 0.2s;
}

.output-handle:hover::after {
  width: 8px;
  height: 14px;
  background: rgba(59, 130, 246, 0.7);
}

.output-handle.vue-flow__handle--connected::after {
  width: 12px;
  height: 12px;
  background: var(--connector-connected);
}
</style>
