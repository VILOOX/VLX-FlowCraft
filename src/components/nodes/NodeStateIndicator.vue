<script setup lang="ts">
import type { NodeState } from '@/types/workflow'

const props = defineProps<{ state: NodeState }>()
</script>

<template>
  <div class="node-indicator" :class="`state-${props.state}`" />
</template>

<style scoped>
.node-indicator {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: background 0.3s, box-shadow 0.3s;
  z-index: 10;
}

.state-idle {
  background: rgba(128, 128, 128, 0.4);
}

.state-running {
  background: #22c55e;
  box-shadow: 0 0 6px 2px rgba(34, 197, 94, 0.5);
  animation: pulse-run 1s ease-in-out infinite;
}

.state-waiting {
  background: #eab308;
  box-shadow: 0 0 4px 1px rgba(234, 179, 8, 0.4);
  animation: pulse-wait 1.5s ease-in-out infinite;
}

.state-success {
  background: #22c55e;
}

.state-error {
  background: #ef4444;
}

@keyframes pulse-run {
  0%, 100% { box-shadow: 0 0 4px 1px rgba(34, 197, 94, 0.5); }
  50% { box-shadow: 0 0 8px 3px rgba(34, 197, 94, 0.8); }
}

@keyframes pulse-wait {
  0%, 100% { box-shadow: 0 0 3px 1px rgba(234, 179, 8, 0.4); }
  50% { box-shadow: 0 0 7px 2px rgba(234, 179, 8, 0.7); }
}
</style>
