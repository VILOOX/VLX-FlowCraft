<script setup lang="ts">
import { ref, markRaw, onMounted, onUnmounted, watch } from 'vue'
import {
  VueFlow, useVueFlow, MarkerType,
  type Connection, type NodeMouseEvent,
} from '@vue-flow/core'

import { useWorkflowStore } from '@/stores/workflow.store'
import { useCanvasStore } from '@/stores/canvas.store'
import type { NodeType } from '@/types/workflow'

import TriggerNode from '@/components/nodes/TriggerNode.vue'
import DelayNode from '@/components/nodes/DelayNode.vue'
import WebhookMessageNode from '@/components/nodes/WebhookMessageNode.vue'
import CanvasBackground from './CanvasBackground.vue'
import CanvasControls from './CanvasControls.vue'
import NodeAddMenu from '@/components/inspector/NodeAddMenu.vue'

const store = useWorkflowStore()
const canvasStore = useCanvasStore()

const nodeTypes = markRaw({
  trigger: TriggerNode as any, // eslint-disable-line @typescript-eslint/no-explicit-any
  delay: DelayNode as any,
  webhookMessage: WebhookMessageNode as any,
})

const { onConnect, project, addEdges, applyNodeChanges, applyEdgeChanges } = useVueFlow()

function syncToFlow() {
  applyNodeChanges(store.nodes.map(n => ({
    id: n.id, type: n.type, position: n.position, data: n.data,
    selected: n.id === store.selectedNodeId,
  })) as any) // eslint-disable-line @typescript-eslint/no-explicit-any

  applyEdgeChanges(store.edges.map(e => ({
    id: e.id, source: e.source, target: e.target,
    sourceHandle: e.sourceHandle ?? 'output',
    targetHandle: e.targetHandle ?? 'input',
    animated: e.animated ?? false,
    type: 'bezier' as const,
    markerEnd: { type: MarkerType.ArrowClosed },
  })) as any) // eslint-disable-line @typescript-eslint/no-explicit-any
}

syncToFlow()

onConnect((params: Connection) => {
  addEdges([{ ...params, type: 'bezier', animated: false, markerEnd: { type: MarkerType.ArrowClosed } }])
  if (params.source && params.target) {
    store.addEdge({
      id: `edge-${Date.now()}`,
      source: params.source, target: params.target,
      sourceHandle: params.sourceHandle ?? undefined,
      targetHandle: params.targetHandle ?? undefined,
    })
  }
})

function onNodeClick(event: NodeMouseEvent) { store.selectNode(event.node.id); syncToFlow() }
function onPaneClick() { store.selectNode(null); syncToFlow() }
function onNodeDragStop(event: { node: { id: string; position: { x: number; y: number } } }) {
  store.updateNodePosition(event.node.id, event.node.position)
}

function onPaneDoubleClick(event: MouseEvent) {
  const rect = (event.target as HTMLElement).closest('.vue-flow')?.getBoundingClientRect()
  if (!rect) return
  canvasStore.openAddMenu(
    { x: event.clientX, y: event.clientY },
    project({ x: event.clientX - rect.left, y: event.clientY - rect.top })
  )
}

const canvasRef = ref<HTMLElement | null>(null)

function onDragOver(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  const type = event.dataTransfer?.getData('application/node-type') as NodeType
  if (!type) return
  const rect = canvasRef.value?.getBoundingClientRect()
  if (!rect) return
  store.addNode(type, project({ x: event.clientX - rect.left, y: event.clientY - rect.top }))
  syncToFlow()
}

function handleAddNode(type: NodeType) {
  store.addNode(type, canvasStore.addMenuFlowPos)
  canvasStore.closeAddMenu()
  syncToFlow()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Tab' && !e.ctrlKey && !e.metaKey) {
    e.preventDefault()
    const el = document.querySelector('.vue-flow') as HTMLElement
    if (el) {
      const rect = el.getBoundingClientRect()
      canvasStore.openAddMenu(
        { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
        project({ x: rect.width / 2, y: rect.height / 2 })
      )
    }
  }
  if (e.key === 'Escape') canvasStore.closeAddMenu()
  if ((e.key === 'Delete' || e.key === 'Backspace') && store.selectedNodeId) {
    const active = document.activeElement
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return
    store.removeNode(store.selectedNodeId)
    syncToFlow()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

watch(() => store.nodes.length, () => syncToFlow())
watch(() => store.edges.length, () => syncToFlow())
watch(() => store.selectedNodeId, () => syncToFlow())
</script>

<template>
  <div ref="canvasRef" class="canvas-wrapper" @dragover="onDragOver" @drop="onDrop">
    <VueFlow
      :node-types="nodeTypes"
      :min-zoom="0.2"
      :max-zoom="2"
      :default-viewport="{ x: 0, y: 0, zoom: 1 }"
      fit-view-on-init
      :snap-to-grid="false"
      :elevate-nodes-on-select="false"
      :connect-on-click="false"
      @node-click="onNodeClick"
      @pane-click="onPaneClick"
      @node-drag-stop="onNodeDragStop"
      @pane-double-click="onPaneDoubleClick"
    >
      <CanvasBackground />
      <CanvasControls />
      <template #empty>
        <div class="empty-hint">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" stroke-width="1.2" opacity="0.4" />
            <rect x="13" y="3" width="8" height="8" rx="2" stroke="currentColor" stroke-width="1.2" opacity="0.4" />
            <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" stroke-width="1.2" opacity="0.4" />
            <path d="M17 13v8M13 17h8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.4" />
          </svg>
          <p class="empty-title">Empty canvas</p>
          <p class="empty-desc">Double-click or press <kbd>TAB</kbd> to add a node</p>
        </div>
      </template>
    </VueFlow>

    <NodeAddMenu
      v-if="canvasStore.addMenuVisible"
      :x="canvasStore.addMenuScreenPos.x"
      :y="canvasStore.addMenuScreenPos.y"
      @select="handleAddNode"
      @close="canvasStore.closeAddMenu()"
    />
  </div>
</template>

<style scoped>
.canvas-wrapper { flex: 1; position: relative; overflow: hidden; min-width: 0; }

.empty-hint {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 8px; pointer-events: none;
  color: var(--panel-text-muted); text-align: center;
}
.empty-title { font-size: 14px; font-weight: 600; margin: 0; }
.empty-desc { font-size: 12px; opacity: 0.7; margin: 0; line-height: 1.6; }
kbd {
  display: inline-flex; align-items: center; padding: 1px 5px;
  background: rgba(128,128,128,0.15); border: 1px solid rgba(128,128,128,0.25);
  border-radius: 4px; font-size: 10px; font-family: 'SF Mono', monospace;
}
</style>
