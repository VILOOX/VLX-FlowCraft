<script setup lang="ts">
import { computed } from 'vue'
import { useWorkflowStore } from '@/stores/workflow'

const store = useWorkflowStore()
const log = computed(() => store.executionState.log)

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
</script>

<template>
  <div class="exec-log">
    <div class="log-header">
      <span>Execution Log</span>
      <span class="log-count" v-if="log.length">{{ log.length }}</span>
    </div>
    <div class="log-body">
      <div v-if="!log.length" class="log-empty">No executions yet</div>
      <div v-for="(entry, i) in log" :key="i" class="log-entry" :class="`entry-${entry.status}`">
        <span class="entry-dot" :class="`dot-${entry.status}`" />
        <div class="entry-content">
          <span class="entry-node">{{ entry.nodeLabel }}</span>
          <span class="entry-msg">{{ entry.message }}</span>
        </div>
        <span class="entry-time">{{ formatTime(entry.timestamp) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.exec-log {
  height: 180px;
  border-top: 1px solid var(--panel-border);
  display: flex;
  flex-direction: column;
  background: var(--panel-bg);
  flex-shrink: 0;
}

.log-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px 7px;
  border-bottom: 1px solid var(--panel-border);
  font-size: 11px;
  font-weight: 600;
  color: var(--panel-text-muted);
  letter-spacing: 0.02em;
  flex-shrink: 0;
}

.log-count {
  background: rgba(128, 128, 128, 0.15);
  border-radius: 20px;
  padding: 1px 6px;
  font-size: 10px;
  font-weight: 500;
}

.log-body {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.log-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 11px;
  color: var(--panel-text-muted);
}

.log-entry {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 5px 14px;
  transition: background 0.1s;
}

.log-entry:hover {
  background: rgba(128, 128, 128, 0.05);
}

.entry-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
}

.dot-idle { background: rgba(128, 128, 128, 0.4); }
.dot-running { background: #22c55e; }
.dot-waiting { background: #eab308; }
.dot-success { background: #22c55e; }
.dot-error { background: #ef4444; }

.entry-content {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
  min-width: 0;
}

.entry-node {
  font-size: 11px;
  font-weight: 600;
  color: var(--panel-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.entry-msg {
  font-size: 10px;
  color: var(--panel-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.entry-time {
  font-size: 9px;
  color: var(--panel-text-muted);
  font-family: 'SF Mono', monospace;
  flex-shrink: 0;
}
</style>
