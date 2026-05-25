<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { NodeType } from '@/types/workflow'

defineProps<{
  x: number
  y: number
}>()

const emit = defineEmits<{
  select: [type: NodeType]
  close: []
}>()

const menuRef = ref<HTMLElement | null>(null)

const categories = [
  {
    label: 'TRIGGERS',
    items: [
      { type: 'trigger' as NodeType, label: 'Trigger', desc: 'Start workflow', icon: 'M5,3 L19,12 L5,21Z' },
    ],
  },
  {
    label: 'CORE',
    items: [
      { type: 'delay' as NodeType, label: 'Delay', desc: 'Wait before next step', icon: 'M12 3a9 9 0 1 0 0 18A9 9 0 0 0 12 3zm0 4v5l3 2' },
      { type: 'webhookMessage' as NodeType, label: 'Webhook Message', desc: 'Send POST request', icon: 'M20 12V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6M16 18l2 2 4-4' },
    ],
  },
]

function select(type: NodeType) {
  emit('select', type)
}

onMounted(() => {
  menuRef.value?.focus()
})
</script>

<template>
  <Teleport to="body">
    <div class="menu-overlay" @click.self="emit('close')" @keydown.esc="emit('close')">
      <div
        ref="menuRef"
        class="add-menu"
        :style="{ left: `${x}px`, top: `${y}px` }"
        tabindex="-1"
      >
        <div class="menu-header">
          <span>Add Node</span>
          <button class="close-btn" @click="emit('close')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <div v-for="cat in categories" :key="cat.label" class="category">
          <div class="category-label">{{ cat.label }}</div>
          <button
            v-for="item in cat.items"
            :key="item.type"
            class="node-item"
            @click="select(item.type)"
          >
            <div class="node-item-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path :d="item.icon" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
              </svg>
            </div>
            <div class="node-item-text">
              <span class="node-item-name">{{ item.label }}</span>
              <span class="node-item-desc">{{ item.desc }}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
}

.add-menu {
  position: fixed;
  width: 220px;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  outline: none;
  transform: translate(-50%, -50%);
}

.menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px 10px;
  border-bottom: 1px solid var(--panel-border);
  font-size: 12px;
  font-weight: 600;
  color: var(--panel-text);
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--panel-text-muted);
  padding: 2px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: color 0.15s;
}

.close-btn:hover {
  color: var(--panel-text);
}

.category {
  padding: 8px 0;
}

.category + .category {
  border-top: 1px solid var(--panel-border);
}

.category-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--panel-text-muted);
  padding: 4px 14px 6px;
}

.node-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  padding: 7px 14px;
  transition: background 0.15s;
  text-align: left;
}

.node-item:hover {
  background: rgba(128, 128, 128, 0.08);
}

.node-item-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(128, 128, 128, 0.1);
  border: 1px solid var(--panel-border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--panel-text-muted);
}

.node-item-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.node-item-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--panel-text);
  line-height: 1.3;
}

.node-item-desc {
  font-size: 10px;
  color: var(--panel-text-muted);
  line-height: 1.3;
}
</style>
