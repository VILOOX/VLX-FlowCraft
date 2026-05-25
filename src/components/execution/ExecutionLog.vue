<script setup lang="ts">
import { computed, ref } from 'vue'
import { useExecutionStore } from '@/stores/execution.store'

const execStore = useExecutionStore()
const logs = computed(() => execStore.state.log)
const isExpanded = ref(true)

function statusColor(status: string) {
  if (status === 'running') return '#22c55e'
  if (status === 'success') return '#4ade80'
  if (status === 'error') return '#f87171'
  if (status === 'waiting') return '#eab308'
  return '#6b7280'
}

function formatTime(ts: number) {
  const d = new Date(ts)
  return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
</script>

<template>
  <div v-if="logs.length > 0 || execStore.isRunning" class="exec-log" :class="{ collapsed: !isExpanded }">
    <div class="log-header" @click="isExpanded = !isExpanded">
      <span class="log-title">Execution Log</span>
      <span class="log-count">{{ logs.length }}</span>
      <svg :class="{ rotated: isExpanded }" width="12" height="12" viewBox="0 0 24 24" fill="none">
        <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>

    <div v-if="isExpanded" class="log-body">
      <div
        v-for="(entry, i) in logs"
        :key="i"
        class="log-entry"
      >
        <span class="log-dot" :style="{ background: statusColor(entry.status) }" />
        <span class="log-time">{{ formatTime(entry.timestamp) }}</span>
        <span class="log-node">{{ entry.nodeLabel }}</span>
        <span class="log-msg">{{ entry.message }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.exec-log {
  border-top: 1px solid var(--panel-border);
  background: var(--panel-bg);
  max-height: 200px;
  display: flex;
  flex-direction: column;
}

.exec-log.collapsed {
  max-height: 36px;
}

.log-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
}

.log-header svg {
  color: var(--panel-text-muted);
  transition: transform 0.15s;
}

.log-header svg.rotated {
  transform: rotate(180deg);
}

.log-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--panel-text);
}

.log-count {
  font-size: 10px;
  color: var(--panel-text-muted);
  background: rgba(128, 128, 128, 0.12);
  padding: 1px 6px;
  border-radius: 8px;
}

.log-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px 8px;
}

.log-entry {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 0;
  font-size: 11px;
}

.log-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.log-time {
  color: var(--panel-text-muted);
  font-family: 'SF Mono', monospace;
  font-size: 10px;
  flex-shrink: 0;
}

.log-node {
  color: var(--panel-text);
  font-weight: 600;
  flex-shrink: 0;
}

.log-msg {
  color: var(--panel-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
