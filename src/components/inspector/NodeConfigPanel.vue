<script setup lang="ts">
import { computed } from 'vue'
import { useWorkflowStore } from '@/stores/workflow.store'
import type { TriggerNodeData, DelayNodeData, WebhookMessageNodeData, TriggerMode, TimeUnit } from '@/types/workflow'

const store = useWorkflowStore()
const node = computed(() => store.selectedNode)
const nodeData = computed(() => node.value?.data)

function update(patch: Record<string, unknown>) {
  if (!node.value) return
  store.updateNodeData(node.value.id, patch)
}
</script>

<template>
  <aside v-if="node && nodeData" class="config-panel">
    <div class="panel-header">
      <span class="panel-title">Configure</span>
      <button class="close-btn" @click="store.selectNode(null)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>
    </div>
    <div class="panel-body">
      <label class="field">
        <span class="field-label">Label</span>
        <input class="field-input" :value="nodeData.label" @input="update({ label: ($event.target as HTMLInputElement).value })" />
      </label>

      <template v-if="nodeData.type === 'trigger'">
        <label class="field">
          <span class="field-label">Mode</span>
          <select class="field-input" :value="(nodeData as TriggerNodeData).mode"
            @change="update({ mode: ($event.target as HTMLSelectElement).value as TriggerMode })">
            <option value="manual">Manual</option>
            <option value="schedule">Schedule</option>
            <option value="interval">Interval</option>
          </select>
        </label>
        <label v-if="(nodeData as TriggerNodeData).mode === 'schedule'" class="field">
          <span class="field-label">Time</span>
          <input class="field-input" type="time" :value="(nodeData as TriggerNodeData).scheduleTime"
            @input="update({ scheduleTime: ($event.target as HTMLInputElement).value })" />
        </label>
        <template v-if="(nodeData as TriggerNodeData).mode === 'interval'">
          <label class="field">
            <span class="field-label">Interval</span>
            <input class="field-input" type="number" min="1" :value="(nodeData as TriggerNodeData).intervalValue"
              @input="update({ intervalValue: Number(($event.target as HTMLInputElement).value) || 1 })" />
          </label>
          <label class="field">
            <span class="field-label">Unit</span>
            <select class="field-input" :value="(nodeData as TriggerNodeData).intervalUnit"
              @change="update({ intervalUnit: ($event.target as HTMLSelectElement).value as TimeUnit })">
              <option value="seconds">Seconds</option>
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
            </select>
          </label>
        </template>
      </template>

      <template v-if="nodeData.type === 'delay'">
        <label class="field">
          <span class="field-label">Duration</span>
          <input class="field-input" type="number" min="1" :value="(nodeData as DelayNodeData).value"
            @input="update({ value: Number(($event.target as HTMLInputElement).value) || 1 })" />
        </label>
        <label class="field">
          <span class="field-label">Unit</span>
          <select class="field-input" :value="(nodeData as DelayNodeData).unit"
            @change="update({ unit: ($event.target as HTMLSelectElement).value as TimeUnit })">
            <option value="seconds">Seconds</option>
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
          </select>
        </label>
      </template>

      <template v-if="nodeData.type === 'webhookMessage'">
        <label class="field">
          <span class="field-label">Webhook URL</span>
          <input class="field-input" type="url" placeholder="https://..." :value="(nodeData as WebhookMessageNodeData).webhookUrl"
            @input="update({ webhookUrl: ($event.target as HTMLInputElement).value })" />
        </label>
        <label class="field">
          <span class="field-label">Message</span>
          <textarea class="field-input field-textarea" rows="3" :value="(nodeData as WebhookMessageNodeData).messageText"
            @input="update({ messageText: ($event.target as HTMLTextAreaElement).value })" />
        </label>
      </template>

      <button class="delete-btn" @click="store.removeNode(node.id)">Delete Node</button>
    </div>
  </aside>
</template>

<style scoped>
.config-panel {
  width: 260px; background: var(--sidebar-bg); border-left: 1px solid var(--sidebar-border);
  display: flex; flex-direction: column; overflow-y: auto; flex-shrink: 0;
}
.panel-header { padding: 12px 16px; border-bottom: 1px solid var(--sidebar-border); display: flex; align-items: center; justify-content: space-between; }
.panel-title { font-size: 13px; font-weight: 700; color: var(--panel-text); }
.close-btn {
  width: 24px; height: 24px; border-radius: 6px; border: none; background: none;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: var(--panel-text-muted); transition: all 0.1s;
}
.close-btn:hover { background: rgba(128,128,128,0.12); color: var(--panel-text); }
.panel-body { padding: 12px 16px; display: flex; flex-direction: column; gap: 12px; }
.field { display: flex; flex-direction: column; gap: 4px; }
.field-label { font-size: 10px; font-weight: 600; color: var(--panel-text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
.field-input {
  padding: 6px 10px; border-radius: 6px; border: 1px solid var(--input-border);
  background: var(--input-bg); color: var(--input-text); font-size: 12px;
  font-family: inherit; outline: none; transition: border-color 0.15s;
}
.field-input:focus { border-color: rgba(59,130,246,0.5); }
.field-textarea { resize: vertical; min-height: 60px; }
.delete-btn {
  margin-top: 8px; padding: 7px 12px; border-radius: 6px;
  border: 1px solid rgba(239,68,68,0.25); background: rgba(239,68,68,0.08);
  color: #f87171; font-size: 11px; font-weight: 600; cursor: pointer;
  font-family: inherit; transition: all 0.15s;
}
.delete-btn:hover { background: rgba(239,68,68,0.15); }
</style>
