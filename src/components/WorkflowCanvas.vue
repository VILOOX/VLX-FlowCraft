<script setup lang="ts">
import { ref, computed, markRaw, onMounted, onUnmounted } from 'vue'
import {
  VueFlow,
  useVueFlow,
  type Node,
  type Edge,
  type Connection,
  type NodeMouseEvent,
} from '@vue-flow/core'
import { Background, BackgroundVariant } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'

import { useWorkflowStore } from '@/stores/workflow'
import { useThemeStore } from '@/stores/theme'
import type { NodeType } from '@/types/workflow'

import TriggerNode from './nodes/TriggerNode.vue'
import DelayNode from './nodes/DelayNode.vue'
import WebhookMessageNode from './nodes/WebhookMessageNode.vue'
import NodeAddMenu from './NodeAddMenu.vue'

const store = useWorkflowStore()
const themeStore = useThemeStore()
const isDark = computed(() => themeStore.theme === 'dark')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeTypes = markRaw({
  trigger: TriggerNode as any,
  delay: DelayNode as any,
  webhookMessage: WebhookMessageNode as any,
})

const { onConnect, project } = useVueFlow()

const flowNodes = computed<Node[]>(() =>
  store.nodes.map(n => ({
    id: n.id,
    type: n.type,
    position: n.position,
    data: n.data,
    selected: n.id === store.selectedNodeId,
  }))
)

const flowEdges = computed<Edge[]>(() =>
  store.edges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle ?? 'output',
    targetHandle: e.targetHandle ?? 'input',
    animated: e.animated ?? false,
    type: 'bezier',
  }))
)

// Node add menu
const addMenuVisible = ref(false)
const addMenuPos = ref({ x: 0, y: 0 })
const addMenuFlowPos = ref({ x: 0, y: 0 })

function openAddMenu(event: MouseEvent) {
  const rect = (event.target as HTMLElement).closest('.vue-flow')?.getBoundingClientRect()
  if (!rect) return
  const cx = event.clientX
  const cy = event.clientY
  addMenuPos.value = { x: cx, y: cy }
  addMenuFlowPos.value = project({ x: cx - rect.left, y: cy - rect.top })
  addMenuVisible.value = true
}

function closeAddMenu() {
  addMenuVisible.value = false
}

function handleAddNode(type: NodeType) {
  store.addNode(type, addMenuFlowPos.value)
  closeAddMenu()
}

// Drag drop from sidebar
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
  const pos = project({ x: event.clientX - rect.left, y: event.clientY - rect.top })
  store.addNode(type, pos)
}

// Node interactions
function onNodeClick(event: NodeMouseEvent) {
  store.selectNode(event.node.id)
}

function onPaneClickHandler() {
  store.selectNode(null)
}

// Connection
onConnect((connection: Connection) => {
  const id = `edge-${Date.now()}`
  store.addEdge({
    id,
    source: connection.source,
    target: connection.target,
    sourceHandle: connection.sourceHandle ?? undefined,
    targetHandle: connection.targetHandle ?? undefined,
  })
})

// Node position update
function onNodeDragStop(event: { node: Node }) {
  store.updateNodePosition(event.node.id, event.node.position)
}

// Remove edge on click
function onEdgeClick(event: { edge: Edge }) {
  store.removeEdge(event.edge.id)
}

// Keyboard shortcuts
function onKeydown(e: KeyboardEvent) {
  if ((e.key === 'Tab') && !e.ctrlKey && !e.metaKey) {
    e.preventDefault()
    const centerEl = document.querySelector('.vue-flow') as HTMLElement
    if (centerEl) {
      const rect = centerEl.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      addMenuPos.value = { x: cx, y: cy }
      addMenuFlowPos.value = project({ x: rect.width / 2, y: rect.height / 2 })
      addMenuVisible.value = true
    }
  }
  if (e.key === 'Escape') closeAddMenu()
  if ((e.key === 'Delete' || e.key === 'Backspace') && store.selectedNodeId) {
    const active = document.activeElement
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return
    store.removeNode(store.selectedNodeId)
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  store.cleanup()
})
</script>

<template>
  <div
    ref="canvasRef"
    class="canvas-wrapper"
    @dragover="onDragOver"
    @drop="onDrop"
  >
    <VueFlow
      :nodes="flowNodes"
      :edges="flowEdges"
      :node-types="nodeTypes"
      :min-zoom="0.2"
      :max-zoom="2"
      :default-viewport="{ x: 0, y: 0, zoom: 1 }"
      fit-view-on-init
      :snap-to-grid="false"
      :elevate-nodes-on-select="false"
      :connect-on-click="false"
      @node-click="onNodeClick"
      @pane-click="onPaneClickHandler"
      @node-drag-stop="onNodeDragStop"
      @edge-click="onEdgeClick"
      @pane-double-click="openAddMenu"
    >
      <Background
        :variant="BackgroundVariant.Dots"
        :gap="22"
        :size="1.2"
        :color="isDark ? '#ffffff14' : '#00000014'"
      />

      <Controls
        :show-interactive="false"
        position="bottom-right"
      />

      <!-- Empty state hint -->
      <template #empty>
        <div class="empty-hint">
          <div class="empty-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" stroke-width="1.2" opacity="0.4" />
              <rect x="13" y="3" width="8" height="8" rx="2" stroke="currentColor" stroke-width="1.2" opacity="0.4" />
              <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" stroke-width="1.2" opacity="0.4" />
              <path d="M17 13v8M13 17h8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.4" />
            </svg>
          </div>
          <p class="empty-title">Empty canvas</p>
          <p class="empty-desc">Double-click or press <kbd>TAB</kbd> to add a node.<br />Drag from the sidebar, or click <kbd>+</kbd> in a node.</p>
        </div>
      </template>
    </VueFlow>

    <!-- Node add menu -->
    <NodeAddMenu
      v-if="addMenuVisible"
      :x="addMenuPos.x"
      :y="addMenuPos.y"
      @select="handleAddNode"
      @close="closeAddMenu"
    />
  </div>
</template>

<style scoped>
.canvas-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-width: 0;
}

:deep(.vue-flow) {
  width: 100%;
  height: 100%;
}

:deep(.vue-flow__edges) {
  z-index: 5 !important;
}

:deep(.vue-flow__background) {
  background-color: var(--canvas-bg) !important;
}

:deep(.vue-flow__pane) {
  background-color: var(--canvas-bg) !important;
}

:deep(.vue-flow__node) {
  padding: 0 !important;
  background: none !important;
  border: none !important;
  border-radius: 0 !important;
  width: auto !important;
}

:deep(.vue-flow__node.selected > *) {
  outline: 1.5px solid rgba(59, 130, 246, 0.5);
  outline-offset: 3px;
}

.empty-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  pointer-events: none;
  color: var(--panel-text-muted);
  text-align: center;
}

.empty-icon {
  margin-bottom: 4px;
  color: var(--panel-text-muted);
}

.empty-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--panel-text-muted);
  margin: 0;
}

.empty-desc {
  font-size: 12px;
  color: var(--panel-text-muted);
  opacity: 0.7;
  margin: 0;
  line-height: 1.6;
}

kbd {
  display: inline-flex;
  align-items: center;
  padding: 1px 5px;
  background: rgba(128, 128, 128, 0.15);
  border: 1px solid rgba(128, 128, 128, 0.25);
  border-radius: 4px;
  font-size: 10px;
  font-family: 'SF Mono', monospace;
}
</style>
