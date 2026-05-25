<template>
  <div class="relative h-[calc(100vh-3rem)] rounded-3xl bg-slate-950">
    <div class="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-2xl bg-slate-900/90 p-3 text-xs text-slate-200 shadow-lg shadow-black/20">
      <button @click="zoomIn" class="rounded-lg border border-slate-700 px-2 py-1 hover:bg-slate-800">+</button>
      <button @click="zoomOut" class="rounded-lg border border-slate-700 px-2 py-1 hover:bg-slate-800">−</button>
      <button @click="fitView" class="rounded-lg border border-slate-700 px-2 py-1 hover:bg-slate-800">Fit</button>
      <span class="text-slate-400">Drag nodes, connect edges, double click to create.</span>
    </div>

    <VueFlow
      ref="flowRef"
      class="h-full rounded-3xl"
      :nodes="nodes"
      :edges="edges"
      :node-types="nodeTypes"
      :edge-types="edgeTypes"
      :default-edge-options="defaultEdgeOptions"
      :fit-view="false"
      :snap-to-grid="false"
      :connection-line-type="'smoothstep'"
      :connection-line-style="connectionPreviewStyle"
      :selection-mode="SelectionMode.Partial"
      :min-zoom="0.5"
      :max-zoom="3"
      @nodes-change="onNodesChange"
      @edges-change="onEdgesChange"
      @connect="onConnect"
      @pane-dblclick="onPaneDoubleClick"
      @pane-drop="onPaneDrop"
      @dragover.prevent="onDragOver"
      @drop.prevent="onPaneDrop"
      @nodes-delete="onNodesDelete"
      @edges-delete="onEdgesDelete"
      @pane-context-menu.prevent
    >

    </VueFlow>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onErrorCaptured } from 'vue';
import { VueFlow, applyNodeChanges, applyEdgeChanges, addEdge, SelectionMode } from '@vue-flow/core';
import '@vue-flow/core/dist/style.css';
import { useWorkflowStore } from '../../stores/workflow.store';
import { useThemeStore } from '../../stores/theme.store';
import TriggerNode from '../nodes/TriggerNode.vue';
import DelayNode from '../nodes/DelayNode.vue';
import WebhookMessageNode from '../nodes/WebhookMessageNode.vue';
import WorkflowEdge from '../edges/WorkflowEdge.vue';
import { useWebsocket } from '../../services/websocket';

const workflowStore = useWorkflowStore();
const themeStore = useThemeStore();

try {
  useWebsocket();
} catch (error) {
  console.warn('[WorkflowCanvas] WebSocket initialization failed:', error);
}

onErrorCaptured((err) => {
  console.warn('[WorkflowCanvas] Component error:', err);
  return false;
});

const flowRef = ref();
const nodeTypes = { trigger: TriggerNode, delay: DelayNode, 'webhook-message': WebhookMessageNode };
const edgeTypes = { default: WorkflowEdge };
const connectionPreviewStyle = { stroke: '#60a5fa', strokeWidth: 2 };

const nodes = computed(() => workflowStore.nodes);
const edges = computed(() => workflowStore.edges);
const backgroundColor = computed(() => (themeStore.theme === 'light' ? '#00000014' : '#ffffff14'));

const defaultEdgeOptions = {
  animated: false,
  markerEnd: {
    type: 'arrowclosed',
    color: themeStore.theme === 'light' ? '#6b7280' : '#7a7a7a'
  },
  style: {
    stroke: themeStore.theme === 'light' ? '#6b7280' : '#7a7a7a',
    strokeWidth: 2
  }
};

function onNodesChange(changes: any[]) {
  workflowStore.updateNodes(changes);
}

function onEdgesChange(changes: any[]) {
  workflowStore.updateEdges(changes);
}

function onConnect(params: any) {
  workflowStore.addEdge(params);
}

function onPaneDoubleClick(event: MouseEvent) {
  const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const x = event.clientX - bounds.left;
  const y = event.clientY - bounds.top;
  workflowStore.addNode('trigger', { x: x - 40, y: y - 40 });
}

function onDragOver(event: DragEvent) {
  event.preventDefault();
  event.dataTransfer!.dropEffect = 'copy';
}

function onPaneDrop(event: DragEvent) {
  event.preventDefault();
  event.stopPropagation();
  
  const type = event.dataTransfer?.getData('application/node-type');
  if (!type) return;
  
  const flowElement = flowRef.value?.$el as HTMLElement;
  if (!flowElement) return;
  
  const bounds = flowElement.getBoundingClientRect();
  const x = event.clientX - bounds.left;
  const y = event.clientY - bounds.top;
  
  // Get viewport offset for accurate positioning
  const flowInstance = flowRef.value as any;
  const viewport = flowInstance.getViewport?.();
  
  if (viewport) {
    // Adjust for zoom and pan
    const adjustedX = (x - viewport.x) / viewport.zoom;
    const adjustedY = (y - viewport.y) / viewport.zoom;
    // Center node on cursor (offset based on node size ~96px)
    workflowStore.addNode(type, { x: adjustedX - 48, y: adjustedY - 48 });
  } else {
    // Fallback if viewport not available
    workflowStore.addNode(type, { x: x - 48, y: y - 48 });
  }
}

function onNodesDelete(event: any) {
  workflowStore.deleteNodes(event.nodes);
}

function onEdgesDelete(event: any) {
  workflowStore.deleteEdges(event.edges);
}

function zoomIn() {
  flowRef.value?.zoomIn();
}

function zoomOut() {
  flowRef.value?.zoomOut();
}

function fitView() {
  flowRef.value?.fitView({ padding: 0.1 });
}
</script>
