<script setup lang="ts">
import { computed } from 'vue'
import { useWorkflowStore } from '@/stores/workflow'
import type {
  TriggerNodeData,
  DelayNodeData,
  WebhookMessageNodeData,
  TriggerMode,
  DelayUnit,
} from '@/types/workflow'

const store = useWorkflowStore()

const node = computed(() => store.selectedNode)

function close() {
  store.selectNode(null)
}

function deleteNode() {
  if (node.value) {
    store.removeNode(node.value.id)
  }
}

function updateField(field: string, value: unknown) {
  if (!node.value) return
  store.updateNodeData(node.value.id, { [field]: value } as never)
}

const triggerData = computed(() =>
  node.value?.data.type === 'trigger' ? (node.value.data as TriggerNodeData) : null
)
const delayData = computed(() =>
  node.value?.data.type === 'delay' ? (node.value.data as DelayNodeData) : null
)
const webhookData = computed(() =>
  node.value?.data.type === 'webhookMessage' ? (node.value.data as WebhookMessageNodeData) : null
)
</script>

<template>
  <Transition name="panel-slide">
    <div v-if="node" class="config-panel">
      <!-- Header -->
      <div class="panel-header">
        <div class="header-left">
          <div class="node-type-badge">{{ node.type }}</div>
          <input
            class="node-name-input"
            :value="node.data.label"
            @input="updateField('label', ($event.target as HTMLInputElement).value)"
          />
        </div>
        <div class="header-actions">
          <button class="icon-btn danger" title="Delete node" @click="deleteNode">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <button class="icon-btn" title="Close" @click="close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Body -->
      <div class="panel-body">

        <!-- TRIGGER -->
        <template v-if="triggerData">
          <div class="field-group">
            <label class="field-label">Mode</label>
            <div class="mode-selector">
              <button
                v-for="m in ['manual', 'schedule', 'interval']"
                :key="m"
                class="mode-btn"
                :class="{ active: triggerData.mode === m }"
                @click="updateField('mode', m as TriggerMode)"
              >
                {{ m.charAt(0).toUpperCase() + m.slice(1) }}
              </button>
            </div>
          </div>

          <div v-if="triggerData.mode === 'schedule'" class="field-group">
            <label class="field-label">Time (daily)</label>
            <input
              type="time"
              class="field-input"
              :value="triggerData.scheduleTime"
              @input="updateField('scheduleTime', ($event.target as HTMLInputElement).value)"
            />
          </div>

          <template v-if="triggerData.mode === 'interval'">
            <div class="field-group">
              <label class="field-label">Interval</label>
              <input
                type="number"
                class="field-input"
                :value="triggerData.intervalValue"
                min="1"
                @input="updateField('intervalValue', Number(($event.target as HTMLInputElement).value))"
              />
            </div>
            <div class="field-group">
              <label class="field-label">Unit</label>
              <select
                class="field-input"
                :value="triggerData.intervalUnit"
                @change="updateField('intervalUnit', ($event.target as HTMLSelectElement).value as DelayUnit)"
              >
                <option value="seconds">Seconds</option>
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
              </select>
            </div>
          </template>
        </template>

        <!-- DELAY -->
        <template v-else-if="delayData">
          <div class="field-group">
            <label class="field-label">Duration</label>
            <input
              type="number"
              class="field-input"
              :value="delayData.value"
              min="1"
              @input="updateField('value', Number(($event.target as HTMLInputElement).value))"
            />
          </div>
          <div class="field-group">
            <label class="field-label">Unit</label>
            <div class="mode-selector">
              <button
                v-for="u in ['seconds', 'minutes', 'hours']"
                :key="u"
                class="mode-btn"
                :class="{ active: delayData.unit === u }"
                @click="updateField('unit', u as DelayUnit)"
              >
                {{ u.charAt(0).toUpperCase() + u.slice(1) }}
              </button>
            </div>
          </div>
        </template>

        <!-- WEBHOOK MESSAGE -->
        <template v-else-if="webhookData">
          <div class="field-group">
            <label class="field-label">Webhook URL</label>
            <input
              type="url"
              class="field-input"
              placeholder="https://..."
              :value="webhookData.webhookUrl"
              @input="updateField('webhookUrl', ($event.target as HTMLInputElement).value)"
            />
          </div>
          <div class="field-group">
            <label class="field-label">Message Text</label>
            <textarea
              class="field-input field-textarea"
              placeholder="Enter message..."
              :value="webhookData.messageText"
              rows="4"
              @input="updateField('messageText', ($event.target as HTMLTextAreaElement).value)"
            />
          </div>
          <div class="request-preview">
            <div class="preview-label">Request Preview</div>
            <pre class="preview-code">POST {{ webhookData.webhookUrl || 'https://...' }}
Content-Type: application/json

{{ JSON.stringify({ content: webhookData.messageText || 'message' }, null, 2) }}</pre>
          </div>
        </template>

      </div>

      <!-- State badge -->
      <div class="panel-footer">
        <div class="state-row">
          <span class="state-dot" :class="`dot-${node.data.state}`" />
          <span class="state-text">{{ node.data.state }}</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.config-panel {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 280px;
  background: var(--panel-bg);
  border-left: 1px solid var(--panel-border);
  display: flex;
  flex-direction: column;
  z-index: 100;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 12px;
  border-bottom: 1px solid var(--panel-border);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
  margin-right: 8px;
}

.node-type-badge {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--panel-text-muted);
}

.node-name-input {
  background: none;
  border: none;
  outline: none;
  font-size: 14px;
  font-weight: 600;
  color: var(--panel-text);
  font-family: inherit;
  padding: 0;
  width: 100%;
}

.node-name-input:focus {
  border-bottom: 1px solid rgba(59, 130, 246, 0.5);
}

.header-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.icon-btn {
  width: 28px;
  height: 28px;
  border: 1px solid var(--panel-border);
  border-radius: 7px;
  background: none;
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

.icon-btn.danger:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--panel-text-muted);
  letter-spacing: 0.02em;
}

.field-input {
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 13px;
  color: var(--input-text);
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
}

.field-input:focus {
  border-color: rgba(59, 130, 246, 0.5);
}

.field-textarea {
  resize: vertical;
  min-height: 80px;
}

select.field-input {
  cursor: pointer;
}

.mode-selector {
  display: flex;
  gap: 4px;
}

.mode-btn {
  flex: 1;
  padding: 6px 8px;
  font-size: 11px;
  font-weight: 500;
  border: 1px solid var(--panel-border);
  border-radius: 7px;
  background: none;
  cursor: pointer;
  color: var(--panel-text-muted);
  transition: all 0.15s;
  font-family: inherit;
}

.mode-btn:hover {
  background: rgba(128, 128, 128, 0.08);
  color: var(--panel-text);
}

.mode-btn.active {
  background: rgba(59, 130, 246, 0.12);
  border-color: rgba(59, 130, 246, 0.4);
  color: rgb(96, 165, 250);
}

.request-preview {
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  overflow: hidden;
}

.preview-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--panel-text-muted);
  padding: 6px 10px;
  border-bottom: 1px solid var(--panel-border);
  background: rgba(128, 128, 128, 0.04);
}

.preview-code {
  font-size: 10px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: var(--panel-text-muted);
  padding: 8px 10px;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.6;
  margin: 0;
}

.panel-footer {
  padding: 10px 16px;
  border-top: 1px solid var(--panel-border);
  flex-shrink: 0;
}

.state-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.state-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.dot-idle { background: rgba(128, 128, 128, 0.4); }
.dot-running { background: #22c55e; }
.dot-waiting { background: #eab308; }
.dot-success { background: #22c55e; }
.dot-error { background: #ef4444; }

.state-text {
  font-size: 11px;
  color: var(--panel-text-muted);
  text-transform: capitalize;
}

/* Panel slide transition */
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
