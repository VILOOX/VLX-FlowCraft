<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useWorkflowStore } from '@/stores/workflow'

const themeStore = useThemeStore()
const workflowStore = useWorkflowStore()

const isDark = computed(() => themeStore.theme === 'dark')
const isRunning = computed(() => workflowStore.executionState.status === 'running')
const isCompleted = computed(() => workflowStore.executionState.status === 'completed')
const isError = computed(() => workflowStore.executionState.status === 'error')

function run() {
  workflowStore.runWorkflow()
}

function stop() {
  workflowStore.resetExecution()
}

function toggleTheme() {
  themeStore.toggle()
}
</script>

<template>
  <div class="topbar">
    <div class="topbar-left">
      <div class="brand">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
          <path d="M2 17l10 5 10-5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
          <path d="M2 12l10 5 10-5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
        </svg>
        <span class="brand-name">FlowCraft</span>
      </div>

      <div class="divider" />

      <span class="workflow-name">{{ workflowStore.workflowName }}</span>
    </div>

    <div class="topbar-right">
      <!-- Execution status -->
      <div v-if="isRunning || isCompleted || isError" class="status-badge" :class="{
        'status-running': isRunning,
        'status-success': isCompleted,
        'status-error': isError
      }">
        <div class="status-dot" />
        <span>{{ isRunning ? 'Running' : isCompleted ? 'Completed' : 'Failed' }}</span>
      </div>

      <!-- Controls -->
      <button v-if="!isRunning" class="run-btn" @click="run">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <polygon points="5,3 19,12 5,21" fill="currentColor" />
        </svg>
        <span>Run</span>
      </button>

      <button v-else class="stop-btn" @click="stop">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" />
        </svg>
        <span>Stop</span>
      </button>

      <button class="icon-btn" @click="toggleTheme" :title="isDark ? 'Light mode' : 'Dark mode'">
        <svg v-if="isDark" width="15" height="15" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
        <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.topbar {
  height: 48px;
  background: var(--panel-bg);
  border-bottom: 1px solid var(--panel-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  flex-shrink: 0;
  z-index: 200;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--panel-text);
}

.brand-name {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.divider {
  width: 1px;
  height: 16px;
  background: var(--panel-border);
}

.workflow-name {
  font-size: 13px;
  color: var(--panel-text-muted);
  font-weight: 400;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
  border: 1px solid transparent;
}

.status-running {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.25);
  color: #22c55e;
}

.status-success {
  background: rgba(34, 197, 94, 0.08);
  border-color: rgba(34, 197, 94, 0.2);
  color: #4ade80;
}

.status-error {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.25);
  color: #f87171;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.status-running .status-dot {
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.run-btn, .stop-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.run-btn {
  background: rgba(59, 130, 246, 0.15);
  color: rgb(96, 165, 250);
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.run-btn:hover {
  background: rgba(59, 130, 246, 0.25);
}

.stop-btn {
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.25);
}

.stop-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

.icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: none;
  border: 1px solid var(--panel-border);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--panel-text-muted);
  transition: all 0.15s;
}

.icon-btn:hover {
  background: rgba(128, 128, 128, 0.1);
  color: var(--panel-text);
}
</style>
