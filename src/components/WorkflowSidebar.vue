<script setup lang="ts">
import type { NodeType } from '@/types/workflow'

const emit = defineEmits<{
  addNode: [type: NodeType]
}>()

const categories = [
  {
    label: 'TRIGGERS',
    items: [
      {
        type: 'trigger' as NodeType,
        label: 'Trigger',
        desc: 'Start workflow',
        iconPath: 'M5,3 L19,12 L5,21Z',
      },
    ],
  },
  {
    label: 'CORE',
    items: [
      {
        type: 'delay' as NodeType,
        label: 'Delay',
        desc: 'Wait before next',
        iconPath: null,
        isClock: true,
      },
      {
        type: 'webhookMessage' as NodeType,
        label: 'Webhook Message',
        desc: 'Send POST request',
        iconPath: 'M20 12V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6M16 18l2 2 4-4',
      },
    ],
  },
]

function onDragStart(event: DragEvent, type: NodeType) {
  if (!event.dataTransfer) return
  event.dataTransfer.setData('application/node-type', type)
  event.dataTransfer.effectAllowed = 'move'
}
</script>

<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="logo-icon">
        <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" stroke-width="1.5" />
        <rect x="13" y="3" width="8" height="8" rx="2" stroke="currentColor" stroke-width="1.5" />
        <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" stroke-width="1.5" />
        <rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" stroke-width="1.5" />
      </svg>
      <span class="sidebar-title">Nodes</span>
    </div>

    <div class="sidebar-body">
      <div v-for="cat in categories" :key="cat.label" class="category">
        <div class="category-label">{{ cat.label }}</div>

        <div
          v-for="item in cat.items"
          :key="item.type"
          class="node-card"
          draggable="true"
          @dragstart="onDragStart($event, item.type)"
          @click="emit('addNode', item.type)"
        >
          <div class="node-card-icon">
            <svg v-if="!item.isClock" width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path :d="item.iconPath || ''" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
            </svg>
            <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" />
              <polyline points="12,7 12,12 15,14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </div>
          <div class="node-card-text">
            <span class="node-card-name">{{ item.label }}</span>
            <span class="node-card-desc">{{ item.desc }}</span>
          </div>
          <div class="drag-handle">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <circle cx="9" cy="7" r="1.5" fill="currentColor" />
              <circle cx="15" cy="7" r="1.5" fill="currentColor" />
              <circle cx="9" cy="12" r="1.5" fill="currentColor" />
              <circle cx="15" cy="12" r="1.5" fill="currentColor" />
              <circle cx="9" cy="17" r="1.5" fill="currentColor" />
              <circle cx="15" cy="17" r="1.5" fill="currentColor" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  width: 200px;
  height: 100%;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px 12px;
  border-bottom: 1px solid var(--sidebar-border);
  flex-shrink: 0;
}

.logo-icon {
  color: var(--panel-text-muted);
}

.sidebar-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--panel-text);
}

.sidebar-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.category {
  padding: 8px 0;
}

.category + .category {
  border-top: 1px solid var(--sidebar-border);
}

.category-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--panel-text-muted);
  padding: 4px 14px 6px;
}

.node-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  cursor: grab;
  transition: background 0.15s;
  position: relative;
}

.node-card:hover {
  background: rgba(128, 128, 128, 0.07);
}

.node-card:hover .drag-handle {
  opacity: 1;
}

.node-card-icon {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: rgba(128, 128, 128, 0.1);
  border: 1px solid var(--sidebar-border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--panel-text-muted);
}

.node-card-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  flex: 1;
}

.node-card-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--panel-text);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-card-desc {
  font-size: 10px;
  color: var(--panel-text-muted);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.drag-handle {
  color: var(--panel-text-muted);
  opacity: 0;
  transition: opacity 0.15s;
  flex-shrink: 0;
}
</style>
