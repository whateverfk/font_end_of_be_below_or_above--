<template>
  <div class="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
    <!-- Configuration Cards -->
    <div class="lg:col-span-1 space-y-6">
      <!-- Auto Sync Toggle -->
      <div class="glass-card p-6 overflow-hidden relative group">
        <div
          class="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"
        >
          <RefreshCw class="w-16 h-16 text-teal-500" />
        </div>

        <h3 class="text-lg font-bold mb-6 flex items-center gap-2">
          <Settings2 class="w-5 h-5 text-teal-400" /> Auto Sync
        </h3>

        <div class="space-y-6 relative z-10">
          <div
            class="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5"
          >
            <div>
              <p class="font-semibold text-zinc-200">Enable Synchronization</p>
              <p class="text-xs text-zinc-500">Run sync automatically in background</p>
            </div>
            <button
              @click="syncStore.isAutoSyncEnabled = !syncStore.isAutoSyncEnabled"
              class="w-12 h-6 rounded-full transition-all relative p-1"
              :class="syncStore.isAutoSyncEnabled ? 'bg-teal-500' : 'bg-zinc-800'"
            >
              <div
                class="w-4 h-4 bg-white rounded-full transition-all shadow-md"
                :class="syncStore.isAutoSyncEnabled ? 'translate-x-6' : 'translate-x-0'"
              ></div>
            </button>
          </div>

          <div
            :class="{ 'opacity-50 pointer-events-none': !syncStore.isAutoSyncEnabled }"
            class="transition-opacity"
          >
            <label class="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1"
              >Interval (Minutes)</label
            >
            <div class="relative">
              <input
                v-model="syncStore.syncInterval"
                type="number"
                class="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-teal-500/50"
              />
              <Clock class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            </div>
          </div>

          <button
            @click="saveConf"
            class="w-full py-3.5 bg-teal-500 text-zinc-950 font-bold rounded-xl shadow-lg shadow-teal-500/10 hover:bg-teal-400 active:scale-[0.98] transition-all"
          >
            Save Configuration
          </button>
        </div>
      </div>

      <!-- Manual Trigger Card -->
      <div class="glass-card p-6 bg-gradient-to-br from-white/[0.03] to-teal-500/[0.02]">
        <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
          <Zap class="w-5 h-5 text-amber-400" /> Manual Override
        </h3>
        <p class="text-sm text-zinc-500 mb-6">
          Instantly trigger a synchronization cycle across all connected devices.
        </p>

        <button
          @click="syncNow"
          :disabled="syncStore.isSyncing"
          class="w-full py-4 bg-zinc-800 border border-white/10 text-zinc-300 font-bold rounded-xl hover:bg-zinc-700 disabled:opacity-50 flex items-center justify-center gap-3 group transition-all"
        >
          <RefreshCw class="w-5 h-5" :class="{ 'animate-spin': syncStore.isSyncing }" />
          <span>{{ syncStore.isSyncing ? 'Sync in Progress...' : 'Synchronize Now' }}</span>
        </button>
      </div>
    </div>

    <!-- Logs Area -->
    <div class="lg:col-span-2 glass-card flex flex-col min-h-[500px] border-white/5">
      <div class="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <h3 class="text-xl font-bold flex items-center gap-2">
          <History class="w-5 h-5 text-teal-400" /> Sync History
        </h3>
        <span
          class="px-2 py-1 rounded-md bg-zinc-900 border border-white/10 text-[10px] text-zinc-500 font-black uppercase tracking-widest"
          >Live Logs</span
        >
      </div>

      <div class="flex-1 p-6 overflow-y-auto custom-scrollbar bg-zinc-950/20">
        <div
          v-if="syncStore.syncLogs.length === 0"
          class="h-full flex flex-col items-center justify-center text-zinc-600 space-y-3"
        >
          <Terminal class="w-12 h-12 opacity-10" />
          <p class="italic">No records found. Sync events will appear here.</p>
        </div>

        <div v-else class="space-y-4">
          <div class="max-h-[420px] overflow-y-auto space-y-4 pr-2">
            <TransitionGroup name="log">
              <div
                v-for="log in syncStore.syncLogs"
                :key="log.id"
                class="flex items-start gap-4 p-4 rounded-xl bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-all font-mono"
              >
                <div class="mt-1">
                  <CheckCircle2 v-if="log.is_success" class="w-4 h-4 text-emerald-500" />
                  <AlertCircle v-else class="w-4 h-4 text-rose-500" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-[10px] text-zinc-600 uppercase font-black tracking-widest">{{
                      new Date(log.sync_time).toLocaleString()
                    }}</span>
                    <span
                      class="text-[10px] px-1.5 py-0.5 rounded"
                      :class="
                        log.is_success
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-rose-500/10 text-rose-400'
                      "
                    >
                      {{ log.is_success ? 'Success' : 'Failed' }}
                    </span>
                  </div>
                  <p class="text-zinc-300 text-sm break-words">
                    <span v-if="log.ip" class="text-teal-500 mr-2 font-mono text-xs"
                      >[{{ log.ip }}]</span
                    >
                    {{ log.message }}
                  </p>
                </div>
              </div>
            </TransitionGroup>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted } from 'vue'
import { useSyncStore } from '../stores/sync'
import {
  Settings2,
  RefreshCw,
  Clock,
  Zap,
  History,
  CheckCircle2,
  AlertCircle,
  Terminal,
} from 'lucide-vue-next'

const syncStore = useSyncStore()
const notify =
  inject<(title: string, msg: string, type: 'success' | 'error' | 'info') => void>('notify')!

onMounted(() => {
  syncStore.fetchSettings()
  syncStore.fetchLogs()
})

const saveConf = async () => {
  try {
    await syncStore.saveSettings()
    notify('Config Saved', 'Synchronization parameters updated', 'success')
  } catch (e) {
    notify('Error', 'Failed to save configuration', 'error')
  }
}

const syncNow = async () => {
  try {
    await syncStore.syncNow()
    notify('Sync Complete', 'Manual sync cycle finished successfully', 'success')
  } catch (err: any) {
    notify('Error', 'Registration sync failure', 'error')
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.log-enter-active {
  transition: all 0.4s ease;
}
.log-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
