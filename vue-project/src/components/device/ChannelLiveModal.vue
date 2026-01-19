<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
    <div class="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-6xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden relative">
      <!-- Header -->
      <div class="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-teal-500/20 flex items-center justify-center">
            <Monitor class="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <h3 class="text-xl font-black text-zinc-100 uppercase tracking-tight">
              {{ channel?.channel_name || `Channel ${channel?.channel_no}` }}
            </h3>
            <p class="text-xs text-zinc-500 font-mono">Live Stream & Configuration</p>
          </div>
        </div>
        <button @click="handleClose" class="p-2 hover:bg-white/10 rounded-xl text-zinc-400 hover:text-white transition-all">
          <X class="w-6 h-6" />
        </button>
      </div>

      <!-- Main Content Split -->
      <div class="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <!-- Live Player (Left/Top) -->
        <div class="flex-[3] bg-black relative group flex items-center justify-center p-4">
          <div class="w-full aspect-video bg-zinc-950 rounded-2xl border border-white/5 overflow-hidden relative shadow-2xl shadow-teal-500/5">
            <div class="absolute inset-0 flex flex-col items-center justify-center">
               <Loader2 v-if="loadingStream" class="w-12 h-12 animate-spin text-teal-500 mb-4" />
               <Play class="w-16 h-16 text-teal-500 mx-auto opacity-20 mb-4" />
               <p class="text-zinc-600 font-mono text-sm">
                 /api/device/{{ deviceId }}/channel/{{ channel?.id }}/live
               </p>
            </div>
            
            <!-- Controls Overlay -->
            <div class="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
               <div class="flex gap-2">
                 <button class="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors" title="Settings">
                   <Settings class="w-4 h-4" />
                 </button>
                 <button class="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors" title="Go Fullscreen">
                   <Maximize-2 class="w-4 h-4" />
                 </button>
               </div>
            </div>
          </div>
          
          <!-- Stream Stats -->
          <div class="absolute top-8 left-8 flex gap-2">
            <div class="px-3 py-1 bg-black/60 backdrop-blur rounded-full border border-white/10 text-[10px] font-black uppercase text-zinc-400 tracking-widest flex items-center gap-2">
              <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              Live
            </div>
            <div class="px-3 py-1 bg-black/60 backdrop-blur rounded-full border border-white/10 text-[10px] font-mono text-zinc-400">
              {{ channelConfig?.width }}x{{ channelConfig?.height }} @ {{ channelConfig?.max_frame_rate }}fps
            </div>
          </div>
        </div>

        <!-- Configuration Form (Right/Bottom) -->
        <div class="flex-[2] border-l border-white/10 bg-white/[0.01] flex flex-col overflow-hidden">
          <div class="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-widest text-zinc-500">Video Settings</span>
            <button 
              @click="handleSync" 
              :disabled="liveStore.loading.sync"
              class="text-[10px] font-black uppercase tracking-tight text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <RefreshCw class="w-3 h-3" :class="{'animate-spin': liveStore.loading.sync}" />
              Sync
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar" v-if="channelConfig">
            <!-- Basic Info -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Codec</label>
                <select v-model="channelConfig.video_codec" class="form-input">
                  <option v-for="c in capabilities?.video_codec" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Resolution</label>
                <select v-model="selectedResKey" class="form-input">
                   <option v-for="(r, idx) in capabilities?.resolutions" :key="idx" :value="`${r.width}x${r.height}`">
                     {{ r.width }} x {{ r.height }}
                   </option>
                </select>
              </div>
            </div>

            <!-- Bitrate & FPS -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">FPS Limit</label>
                <select v-model="channelConfig.max_frame_rate" class="form-input">
                   <option v-for="f in capabilities?.max_frame_rates" :key="f" :value="f">{{ f }} FPS</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Quality</label>
                <select v-model="channelConfig.fixed_quality" class="form-input">
                   <option v-for="q in capabilities?.fixed_quality.options" :key="q" :value="q">
                     {{ liveStore.FIXED_QUALITY_LABELS[q] || q }}
                   </option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Max Bitrate (kbps)</label>
                <input type="number" v-model="channelConfig.vbr_max" class="form-input" />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Avg Bitrate (kbps)</label>
                <input type="number" v-model="channelConfig.vbr_average" class="form-input" />
              </div>
            </div>

            <!-- Toggles -->
            <div class="space-y-4 pt-4 border-t border-white/5">
              <div class="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                 <div class="flex items-center gap-3">
                   <Shield class="w-4 h-4 text-teal-400" />
                   <span class="text-sm font-medium text-zinc-300">H.265+ Compression</span>
                 </div>
                 <button 
                  @click="channelConfig.h265_plus = !channelConfig.h265_plus"
                  class="w-10 h-5 rounded-full transition-colors relative"
                  :class="channelConfig.h265_plus ? 'bg-teal-500' : 'bg-zinc-700'"
                 >
                   <div class="absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform" :style="{ transform: channelConfig.h265_plus ? 'translateX(20px)' : 'none' }"></div>
                 </button>
              </div>

              <div class="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                 <div class="flex items-center gap-3">
                   <Construction class="w-4 h-4 text-amber-400" />
                   <span class="text-sm font-medium text-zinc-300">Motion Detection</span>
                 </div>
                 <button 
                  @click="channelConfig.motion_detection = !channelConfig.motion_detection"
                  class="w-10 h-5 rounded-full transition-colors relative"
                  :class="channelConfig.motion_detection ? 'bg-teal-500' : 'bg-zinc-700'"
                 >
                   <div class="absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform" :style="{ transform: channelConfig.motion_detection ? 'translateX(20px)' : 'none' }"></div>
                 </button>
              </div>
            </div>
          </div>

          <!-- Save Footer -->
          <div class="p-6 border-t border-white/5 bg-white/[0.02] flex justify-end">
            <button 
              @click="handleSave"
              :disabled="liveStore.loading.update"
              class="px-8 py-3 bg-teal-500 text-zinc-950 font-black uppercase text-xs tracking-widest rounded-xl hover:bg-teal-400 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Save v-if="!liveStore.loading.update" class="w-4 h-4" />
              <Loader2 v-else class="w-4 h-4 animate-spin" />
              {{ liveStore.loading.update ? 'Applying...' : 'Apply Config' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useLiveStore } from '@/stores/live'
import { X, Monitor, Play, Loader2, Settings, Maximize2, RefreshCw, Shield, Construction, Save } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  deviceId: string | number
  channel: any // Channel object
}>()

const emit = defineEmits(['close', 'saved'])
const liveStore = useLiveStore()

const channelConfig = ref<any>(null)
const capabilities = computed(() => liveStore.capabilities)
const loadingStream = ref(false)
let heartbeatInterval: any = null

const selectedResKey = computed({
  get: () => channelConfig.value ? `${channelConfig.value.width}x${channelConfig.value.height}` : '',
  set: (val) => {
    if (!channelConfig.value || !val) return
    const [w, h] = val.split('x').map(Number)
    channelConfig.value.width = w
    channelConfig.value.height = h
  }
})

watch(() => props.isOpen, async (val) => {
  if (val && props.channel) {
    loadingStream.value = true
    await liveStore.fetchConfig(props.deviceId, props.channel.id)
    await liveStore.fetchCapabilities(props.deviceId, props.channel.id)
    
    if (liveStore.channelConfig) {
      channelConfig.value = JSON.parse(JSON.stringify(liveStore.channelConfig))
    }
    
    // Heartbeat for stream
    startHeartbeat()
    loadingStream.value = false
  } else {
    cleanup()
  }
})

function startHeartbeat() {
  stopHeartbeat()
  heartbeatInterval = setInterval(() => {
    if (props.isOpen && props.channel) {
      liveStore.sendHeartbeat(props.deviceId, props.channel.id)
    }
  }, 5000)
}

function stopHeartbeat() {
  if (heartbeatInterval) clearInterval(heartbeatInterval)
  heartbeatInterval = null
}

async function handleSync() {
  if (!props.channel) return
  await liveStore.syncConfig(props.deviceId, props.channel.id)
  if (liveStore.channelConfig) {
    channelConfig.value = JSON.parse(JSON.stringify(liveStore.channelConfig))
  }
}

async function handleSave() {
  if (!channelConfig.value || !props.channel) return
  try {
    await liveStore.updateConfig(props.deviceId, props.channel.id, channelConfig.value)
    emit('saved')
  } catch (e) { }
}

function handleClose() {
  cleanup()
  emit('close')
}

async function cleanup() {
  stopHeartbeat()
  if (props.channel) {
    try {
      await liveStore.stopStream(props.deviceId, props.channel.id)
    } catch(e){}
  }
}
</script>

<style scoped>
.form-input {
  width: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  color: #e4e4e7; /* zinc-200 */
  outline: none;
  transition: all 0.2s;
}
.form-input:focus {
  border-color: rgba(20, 184, 166, 0.5); /* teal-500/50 */
}
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}
</style>
