<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import type { NodeData, NodeState } from '@/types/workflow'

const props = defineProps<{
  id: string
  data: NodeData
  showInput?: boolean
  showOutput?: boolean
  width?: number
  height?: number
  borderRadius?: number
}>()

const state = computed(() => props.data.state as NodeState)

const stateColor = computed(() => {
  switch (state.value) {
    case 'running': return '#22c55e'
    case 'waiting': return '#eab308'
    case 'success': return '#22c55e'
    case 'error': return '#ef4444'
    default: return '#6b7280'
  }
})

const stateClass = computed(() => `state-${state.value}`)

const containerStyle = computed(() => ({
  width: `${props.width ?? 96}px`,
  height: `${props.height ?? 96}px`,
  borderRadius: `${props.borderRadius ?? 16}px`,
}))

const isRunning = computed(() => state.value === 'running')
</script>

<template>
  <div
    class="workflow-node"
    :class="[stateClass, { 'is-running': isRunning }]"
    :style="containerStyle"
  >
    <!-- Input Handle: left side, vertical rectangle 6x12, radius 2 -->
    <Handle
      v-if="showInput !== false"
      type="target"
      :position="Position.Left"
      class="connector connector-input"
    />

    <!-- Output Handle: right side, vertical rectangle 6x12, radius 2 -->
    <Handle
      v-if="showOutput !== false"
      type="source"
      :position="Position.Right"
      class="connector connector-output"
    />

    <!-- State Indicator: top-right corner, 8px dot -->
    <div
      v-if="state !== 'idle'"
      class="state-indicator"
      :style="{ '--state-color': stateColor }"
    />

    <!-- Node content slot -->
    <div class="node-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.workflow-node {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--node-bg);
  border: 1px solid var(--node-border);
  box-shadow: var(--node-shadow);
  cursor: grab;
  transition: box-shadow 0.2s, border-color 0.2s;
}

.workflow-node:hover {
  border-color: rgba(59, 130, 246, 0.4);
}

.workflow-node:active {
  cursor: grabbing;
}

/* Connector hitbox: 24x24 transparent area, visual is 6x12 */
.connector {
  width: 24px !important;
  height: 24px !important;
  background: transparent !important;
  border: none !important;
  position: relative;
}

/* Input connector visual: vertical rectangle 6x12, border-radius 2 */
.connector-input::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 12px;
  border-radius: 2px;
  background: var(--connector-color);
  border: 1px solid var(--node-border);
  transition: background 0.15s, transform 0.15s;
}

/* Output connector visual: vertical rectangle 6x12, border-radius 2 */
.connector-output::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 12px;
  border-radius: 2px;
  background: var(--connector-color);
  border: 1px solid var(--node-border);
  transition: background 0.15s, transform 0.15s;
}

/* Connected output: gray circle 12x12 */
.connector-output.connected::after {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--connector-connected);
}

.connector:hover::after {
  background: rgba(59, 130, 246, 0.6);
  transform: translate(-50%, -50%) scale(1.2);
}

/* State indicator: 8px dot top-right */
.state-indicator {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--state-color);
  z-index: 10;
}

.state-running .state-indicator {
  animation: pulse-green 1s ease-in-out infinite;
}

@keyframes pulse-green {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.3); }
}

.state-error .workflow-node {
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.5) !important;
}

.node-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  gap: 4px;
  overflow: hidden;
  padding: 8px;
}
</style>
