<template>
  <button
    draggable="true"
    @dragstart="dragStart"
    @click.prevent="createNode"
    class="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-left text-sm text-slate-100 transition hover:border-slate-500 hover:bg-slate-700"
  >
    {{ label }}
  </button>
</template>

<script setup lang="ts">
import { useWorkflowStore } from '../../stores/workflow.store';

const props = defineProps<{ label: string; type: string }>();
const workflowStore = useWorkflowStore();

function createNode() {
  // Generate random offset so nodes don't stack on top of each other
  const offsetX = Math.random() * 100 - 50; // -50 to +50
  const offsetY = Math.random() * 100 - 50;
  workflowStore.addNode(props.type as any, { x: 320 + offsetX, y: 160 + offsetY });
}

function dragStart(event: DragEvent) {
  event.dataTransfer!.effectAllowed = 'copy';
  event.dataTransfer?.setData('application/node-type', props.type);
}
</script>
