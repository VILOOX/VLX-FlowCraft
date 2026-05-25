<script setup lang="ts">
import { triggers, coreNodes } from '@/registry/nodeRegistry'
import type { NodeType } from '@/types/workflow'

defineProps<{
  x: number
  y: number
}>()

const emit = defineEmits<{
  select: [type: NodeType]
  close: []
}>()

function iconSvg(icon: string) {
  if (icon === 'zap')
    return '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>'
  if (icon === 'clock')
    return '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/><path d="M12 7v5l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
  return '<path d="M22 2L11 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M22 2L15 22l-4-9-9-4L22 2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>'
}
</script>

<template>
  <div class="add-menu" :style="{ left: `${x}px`, top: `${y}px` }">
    <div class="menu-section">
      <span class="menu-label">TRIGGERS</span>
      <button
        v-for="def in triggers"
        :key="def.type"
        class="menu-item"
        @click="emit('select', def.type)"
      >
        <div class="menu-icon" v-html="`<svg width='14' height='14' viewBox='0 0 24 24' fill='none'>${iconSvg(def.icon)}</svg>`" />
        <span>{{ def.label }}</span>
      </button>
    </div>
    <div class="menu-section">
      <span class="menu-label">CORE</span>
      <button
        v-for="def in coreNodes"
        :key="def.type"
        class="menu-item"
        @click="emit('select', def.type)"
      >
        <div class="menu-icon" v-html="`<svg width='14' height='14' viewBox='0 0 24 24' fill='none'>${iconSvg(def.icon)}</svg>`" />
        <span>{{ def.label }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.add-menu {
  position: fixed;
  z-index: 1000;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 10px;
  padding: 6px;
  min-width: 180px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.menu-section {
  padding: 4px 0;
}

.menu-section + .menu-section {
  border-top: 1px solid var(--panel-border);
}

.menu-label {
  display: block;
  padding: 4px 10px 2px;
  font-size: 9px;
  font-weight: 600;
  color: var(--panel-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 10px;
  border: none;
  background: none;
  color: var(--panel-text);
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.1s;
}

.menu-item:hover {
  background: rgba(128, 128, 128, 0.12);
}

.menu-icon {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: rgba(59, 130, 246, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  flex-shrink: 0;
}
</style>
