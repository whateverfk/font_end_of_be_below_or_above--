<template>
  <div class="max-w-4xl mx-auto space-y-6 pb-12">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-3xl font-bold text-zinc-100 flex items-center gap-3">
          <Bell class="w-8 h-8 text-rose-500" />
          Giám sát cảnh báo
        </h2>
        <p class="text-zinc-500 mt-1">Cảnh báo thời gian thực.</p>
      </div>

      <button
        @click="showClearConfirm = true"
        v-if="alarmStore.alarms.length > 0"
        class="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/20 transition-all font-semibold text-sm"
      >
        <Trash2 class="w-4 h-4" />
        Clear All Alarms
      </button>
    </div>

    <div
      v-if="alarmStore.alarms.length === 0"
      class="glass-card py-24 flex flex-col items-center justify-center text-zinc-600"
    >
      <div
        class="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-500/40"
      >
        <CheckCircle2 class="w-10 h-10" />
      </div>
      <p class="text-lg font-medium">All Good! Không có alarm nào.</p>
      <p class="text-sm mt-1">Mọi thứ hoạt động vô cùng bình thường.</p>
    </div>

    <div v-else class="space-y-3">
      <TransitionGroup name="list">
        <div
          v-for="alarm in alarmStore.alarms"
          :key="alarm.id"
          class="glass-card p-5 flex items-center gap-6 border-white/5 hover:border-teal-500/30 transition-all hover:bg-white/[0.02] group"
        >
          <div
            class="shrink-0 w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center relative overflow-hidden"
          >
            <div
              class="absolute inset-0 bg-rose-500/10 animate-pulse"
              v-if="alarm.type === 'Motion Detection'"
            ></div>
            <Zap v-if="alarm.type === 'Line Crossing'" class="w-6 h-6 text-amber-400" />
            <Activity v-else-if="alarm.type === 'Motion Detection'" class="w-6 h-6 text-rose-400" />
            <VideoOff v-else class="w-6 h-6 text-zinc-500" />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-1">
              <span class="font-bold text-zinc-200">{{ alarm.type }}</span>
              <span
                class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-zinc-800 text-zinc-500"
                >Normal Priority</span
              >
            </div>
            <p class="text-sm text-zinc-500 flex items-center gap-4">
              <span class="flex items-center gap-1.5"
                ><Monitor class="w-3.5 h-3.5" /> {{ alarm.device }}</span
              >
              <span class="flex items-center gap-1.5"
                ><Layers class="w-3.5 h-3.5" /> CH {{ alarm.channel }}</span
              >
            </p>
          </div>

          <div class="shrink-0 text-right">
            <p class="text-xs font-mono text-zinc-600 group-hover:text-zinc-400 transition-colors">
              {{ alarm.time }}
            </p>
            <button
              class="mt-2 text-[10px] font-bold uppercase tracking-widest text-teal-500 hover:text-teal-400 transition-colors px-2 py-1 rounded-md hover:bg-teal-500/5"
            >
              View Footage
            </button>
          </div>
        </div>
      </TransitionGroup>

      <div class="flex justify-center pt-8">
        <button
          @click="loadMore"
          :disabled="loading"
          class="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-zinc-300 font-bold transition-all flex items-center gap-3 disabled:opacity-50"
        >
          <Loader2 v-if="loading" class="w-5 h-5 animate-spin" />
          {{ loading ? 'Updating events...' : 'Load Older Events' }}
        </button>
      </div>
    </div>

    <!-- Confirm Modal -->
    <Transition name="modal">
      <div
        v-if="showClearConfirm"
        class="fixed inset-0 z-[100] flex items-center justify-center p-6"
      >
        <div
          class="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
          @click="showClearConfirm = false"
        ></div>
        <div
          class="glass-card w-full max-w-sm p-10 relative z-10 text-center border-rose-500/20 shadow-4xl"
        >
          <div
            class="w-20 h-20 rounded-3xl bg-rose-500/10 flex items-center justify-center mx-auto mb-6 text-rose-500 border border-rose-500/20"
          >
            <Trash2 class="w-10 h-10" />
          </div>
          <h3 class="text-2xl font-bold mb-3">Wipe History?</h3>
          <p class="text-zinc-500 text-sm leading-relaxed mb-8">
            This will permanently delete all alarm records. This action cannot be undone.
          </p>

          <div class="flex gap-4">
            <button
              @click="showClearConfirm = false"
              class="flex-1 py-3.5 bg-zinc-800 text-zinc-300 rounded-xl font-bold hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="confirmClear"
              class="flex-1 py-3.5 bg-rose-500 text-zinc-950 rounded-xl font-bold hover:bg-rose-400 transition-colors"
            >
              Delete All
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import { useAlarmStore } from '../stores/alarms'
import {
  Bell,
  Trash2,
  Trash,
  CheckCircle2,
  Zap,
  Activity,
  VideoOff,
  Monitor,
  Layers,
  Loader2,
} from 'lucide-vue-next'

const alarmStore = useAlarmStore()
const notify =
  inject<(title: string, msg: string, type: 'success' | 'error' | 'info') => void>('notify')!
const loading = ref(false)
const showClearConfirm = ref(false)

const loadMore = async () => {
  loading.value = true
  try {
    await alarmStore.loadMore()
    notify('Updated', 'Fetched older alarm events', 'info')
  } catch (err: any) {
    notify('Error', 'Failed to purge security logs', 'error')
  } finally {
    loading.value = false
  }
}

const confirmClear = async () => {
  await alarmStore.deleteAll()
  showClearConfirm.value = false
  notify('Cleared', 'All alarms have been removed', 'info')
}
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
