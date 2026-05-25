<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useWorkflowStore } from '@/stores/workflow'
import TopBar from '@/components/TopBar.vue'
import WorkflowSidebar from '@/components/WorkflowSidebar.vue'
import WorkflowCanvas from '@/components/WorkflowCanvas.vue'
import NodeConfigPanel from '@/components/NodeConfigPanel.vue'
import ExecutionLog from '@/components/ExecutionLog.vue'
import type { NodeType } from '@/types/workflow'

const themeStore = useThemeStore()
const workflowStore = useWorkflowStore()

onMounted(() => {
  themeStore.init()
})

onUnmounted(() => {
  workflowStore.cleanup()
})

function addNodeFromSidebar(type: NodeType) {
  workflowStore.addNode(type, { x: 200 + Math.random() * 200, y: 200 + Math.random() * 100 })
}
</script>

<template>
  <div class="app-root">
    <TopBar />
    <div class="app-body">
      <WorkflowSidebar @add-node="addNodeFromSidebar" />
      <div class="canvas-area">
        <WorkflowCanvas />
        <ExecutionLog />
      </div>
      <NodeConfigPanel />
    </div>
  </div>
</template>

<style scoped>
.app-root {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--canvas-bg);
  color: var(--panel-text);
}

.app-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
  min-height: 0;
}

.canvas-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  position: relative;
}
</style>
