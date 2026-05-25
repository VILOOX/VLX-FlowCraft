<template>
  <g class="workflow-edge" :class="{ selected: data?.selected }">
    <!-- Edge shadow for depth -->
    <path :d="pathData" :stroke="shadowColor" fill="none" :stroke-width="3" opacity="0.15" stroke-linecap="round" stroke-linejoin="round" />
    <!-- Main edge path -->
    <path :d="pathData" :stroke="strokeColor" fill="none" :stroke-width="strokeWidth" stroke-linecap="round" stroke-linejoin="round" />
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getSmoothStepPath, Position } from '@vue-flow/core';
import { useThemeStore } from '../../stores/theme.store';

interface WorkflowEdgeProps {
  id?: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition?: string;
  targetPosition?: string;
  data?: any;
  selected?: boolean;
  markerEnd?: any;
}

const props = withDefaults(defineProps<WorkflowEdgeProps>(), {
  sourcePosition: 'right',
  targetPosition: 'left',
  selected: false
});

const themeStore = useThemeStore();

const pathData = computed(() => {
  try {
    const sourcePos = props.sourcePosition as Position || Position.Right;
    const targetPos = props.targetPosition as Position || Position.Left;
    
    const result = getSmoothStepPath({
      sourceX: props.sourceX,
      sourceY: props.sourceY,
      sourcePosition: sourcePos,
      targetX: props.targetX,
      targetY: props.targetY,
      targetPosition: targetPos,
      borderRadius: 12
    });

    // getSmoothStepPath returns [path, labelX, labelY]
    const path = Array.isArray(result) ? result[0] : result;
    return typeof path === 'string' ? path : `M${props.sourceX},${props.sourceY} L${props.targetX},${props.targetY}`;
  } catch (error) {
    console.warn('[WorkflowEdge] Path error:', error);
    return `M${props.sourceX},${props.sourceY} L${props.targetX},${props.targetY}`;
  }
});

const strokeColor = computed(() => {
  if (props.selected) {
    return themeStore.theme === 'light' ? '#0284c7' : '#3b82f6';
  }
  return themeStore.theme === 'light' ? '#94a3b8' : '#7a7a7a';
});

const shadowColor = computed(() => (themeStore.theme === 'light' ? '#0284c7' : '#60a5fa'));
const strokeWidth = computed(() => (props.selected ? 3 : 2));
</script>

<style scoped>
.workflow-edge {
  pointer-events: auto;
}

.workflow-edge.selected path {
  filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.8));
}
</style>
