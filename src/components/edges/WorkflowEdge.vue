<script setup lang="ts">
import { computed } from 'vue'
import { getBezierPath, type EdgeProps } from '@vue-flow/core'

const props = defineProps<EdgeProps>()

const edgePath = computed(() =>
  getBezierPath({
    sourceX: props.sourceX, sourceY: props.sourceY, sourcePosition: props.sourcePosition,
    targetX: props.targetX, targetY: props.targetY, targetPosition: props.targetPosition,
  })[0]
)
</script>

<template>
  <g class="workflow-edge">
    <path :d="edgePath" class="edge-path" :class="{ animated: props.animated }" fill="none" />
  </g>
</template>

<style scoped>
.edge-path { stroke: var(--edge-color); stroke-width: 2px; }
.edge-path.animated {
  stroke: var(--edge-animated); stroke-dasharray: 8 4;
  animation: edge-flow 0.8s linear infinite;
}
@keyframes edge-flow {
  from { stroke-dashoffset: 24; }
  to { stroke-dashoffset: 0; }
}
</style>
