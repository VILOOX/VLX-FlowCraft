<script setup lang="ts">
import { triggers, coreNodes } from '@/registry/nodeRegistry'
import type { NodeType } from '@/types/workflow'

const emit = defineEmits<{
  addNode: [type: NodeType]
}>()

function onDragStart(event: DragEvent, type: NodeType) {
  if (!event.dataTransfer) return
  event.dataTransfer.setData('application/node-type', type)
  event.dataTransfer.effectAllowed = 'move'
}

function iconSvg(icon: string) {
  if (icon === 'zap')
    return '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>'
  if (icon === 'clock')
    return '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/><path d="M12 7v5l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
  return '<path d="M22 2L11 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M22 2L15 22l-4-9-9-4L22 2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>'
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <span class="sidebar-title">Nodes</span>
    </div>

    <div class="sidebar-section">
      <span class="section-label">TRIGGERS</span>
      <div
        v-for="def in triggers"
        :key="def.type"
        class="sidebar-item"
        draggable="true"
        @dragstart="onDragStart($event, def.type)"
        @click="emit('addNode', def.type)"
      >
        <div class="item-icon" v-html="`<svg width='16' height='16' viewBox='0 0 24 24' fill='none'>${iconSvg(def.icon)}</svg>`" />
        <div class="item-info">
          <span class="item-name">{{ def.label }}</span>
          <span class="item-desc">{{ def.description }}</span>
        </div>
      </div>
    </div>

    <div class="sidebar-section">
      <span class="section-label">CORE</span>
      <div
        v-for="def in coreNodes"
        :key="def.type"
        class="sidebar-item"
        draggable="true"
        @dragstart="onDragStart($event, def.type)"
        @click="emit('addNode', def.type)"
      >
        <div class="item-icon" v-html="`<svg width='16' height='16' viewBox='0 0 24 24' fill='none'>${iconSvg(def.icon)}</svg>`" />
        <div class="item-info">
          <span class="item-name">{{ def.label }}</span>
          <span class="item-desc">{{ def.description }}</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 220px;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--sidebar-border);
}

.sidebar-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--panel-text);
}

.sidebar-section {
  padding: 12px 12px 8px;
}

.section-label {
  display: block;
  font-size: 10px;
  font-weight: 600;
  color: var(--panel-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: grab;
  transition: background 0.15s;
  margin-bottom: 2px;
}

.sidebar-item:hover {
  background: rgba(128, 128, 128, 0.1);
}

.sidebar-item:active {
  cursor: grabbing;
}

.item-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(59, 130, 246, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  flex-shrink: 0;
}

.item-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.item-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--panel-text);
}

.item-desc {
  font-size: 10px;
  color: var(--panel-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
