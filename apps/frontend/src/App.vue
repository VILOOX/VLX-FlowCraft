<template>
  <div :class="['min-h-screen', themeClass]">
    <div class="grid grid-cols-[260px_1fr] gap-2 p-3">
      <aside class="rounded-xl border border-slate-700/60 bg-slate-900/80 p-4 shadow-xl shadow-black/20 backdrop-blur-xl text-slate-100">
        <div class="mb-6 flex items-center justify-between">
          <div>
            <h1 class="text-lg font-semibold">FlowCraft</h1>
            <p class="text-sm text-slate-400">Modern workflow editor</p>
          </div>
          <button @click="toggleTheme" class="rounded-lg border border-slate-600 px-3 py-2 text-sm hover:bg-slate-700/70">
            {{ themeLabel }}
          </button>
        </div>

        <div class="space-y-4">
          <section>
            <h2 class="text-xs uppercase tracking-[0.2em] text-slate-400">Triggers</h2>
            <div class="mt-3 space-y-2">
              <SidebarButton label="Trigger" type="trigger" />
            </div>
          </section>

          <section>
            <h2 class="text-xs uppercase tracking-[0.2em] text-slate-400">Core</h2>
            <div class="mt-3 space-y-2">
              <SidebarButton label="Delay" type="delay" />
              <SidebarButton label="Webhook Message" type="webhook-message" />
            </div>
          </section>

          <section>
            <h2 class="text-xs uppercase tracking-[0.2em] text-slate-400">Execution</h2>
            <div class="mt-3 flex flex-col gap-2">
              <button @click="runManual" class="rounded-xl bg-slate-700 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-600">
                Run Manual Trigger
              </button>
              <p class="text-sm text-slate-400">Manual triggers execute backend scheduler through websocket.</p>
            </div>
          </section>
        </div>
      </aside>

      <main class="rounded-3xl border border-slate-700/60 bg-slate-950/80 p-2 shadow-2xl shadow-black/20 overflow-hidden">
        <WorkflowCanvas />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useThemeStore } from './stores/theme.store';
import { triggerManual } from './services/api';
import WorkflowCanvas from './components/canvas/WorkflowCanvas.vue';
import SidebarButton from './components/sidebar/SidebarButton.vue';

const themeStore = useThemeStore();

const themeClass = computed(() => (themeStore.theme === 'light' ? 'light' : ''));
const themeLabel = computed(() => (themeStore.theme === 'light' ? 'Dark' : 'Light'));

function toggleTheme() {
  themeStore.toggleTheme();
}

async function runManual() {
  await triggerManual();
}
</script>
