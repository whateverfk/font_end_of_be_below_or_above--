<template>
  <div class="h-full flex gap-6 overflow-hidden">
    <!-- Device Sidebar -->
    <div class="glass-card w-72 flex flex-col overflow-hidden shrink-0 border-white/5">
      <div class="p-4 border-b border-white/5 bg-white/[0.02]">
        <h3 class="font-bold text-zinc-200">Devices</h3>
      </div>
      <div class="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        <button 
          v-for="device in deviceStore.devices" 
          :key="device.id"
          @click="selectedDevice = device"
          class="w-full flex flex-col items-start p-3 rounded-lg transition-all duration-200"
          :class="[
            selectedDevice?.id === device.id 
              ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' 
              : 'hover:bg-white/5 text-zinc-400 border border-transparent'
          ]"
        >
          <div class="flex items-center gap-2 w-full">
            <Monitor class="w-4 h-4 shrink-0" />
            <span class="font-medium truncate">{{ device.ipNvr }}</span>
          </div>
          <span class="text-[10px] mt-1 opacity-60">{{ device.brand }} • Online</span>
        </button>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col overflow-hidden glass-card border-white/5">
      <div class="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <div class="flex items-center gap-4">
          <h3 class="text-xl font-bold flex items-center gap-2">
            <Calendar class="w-5 h-5 text-teal-400" />
            Archive Monitoring
          </h3>
          <div v-if="selectedDevice" class="h-6 w-px bg-white/10 mx-2"></div>
          <span v-if="selectedDevice" class="text-zinc-400 text-sm">
            Device: <span class="text-zinc-200 font-semibold">{{ selectedDevice.ipNvr }}</span>
          </span>
        </div>

        <!-- Month Navigator -->
        <div class="flex items-center gap-3 bg-zinc-900/50 p-1 rounded-xl border border-white/5">
          <button @click="prevMonth" class="p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-zinc-200 transition-colors">
            <ChevronLeft class="w-5 h-5" />
          </button>
          <span class="text-sm font-bold min-w-[120px] text-center uppercase tracking-widest text-teal-400">
            {{ monthYearLabel }}
          </span>
          <button @click="nextMonth" class="p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-zinc-200 transition-colors">
            <ChevronRight class="w-5 h-5" />
          </button>
          <button @click="showConfig = true" class="p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-teal-400 transition-colors">
            <Settings class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Archive Table -->
      <div class="flex-1 overflow-auto bg-zinc-950/20 custom-scrollbar p-6">
        <div v-if="!selectedDevice" class="h-full flex flex-col items-center justify-center text-zinc-600 space-y-4">
          <Monitor class="w-16 h-16 opacity-20" />
          <p class="italic">Please select a device from the sidebar to view archive</p>
        </div>

        <div v-else class="space-y-8">
          <div v-for="channel in channels" :key="channel" class="space-y-3">
            <div class="flex items-center gap-3 ml-1">
              <div class="w-2 h-2 rounded-full bg-teal-500"></div>
              <h4 class="font-bold text-sm tracking-tight text-zinc-400">Channel {{ channel }}</h4>
            </div>
            
            <div class="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-31 gap-1.5 auto-rows-fr">
              <div 
                v-for="day in daysInMonth" 
                :key="day"
                class="aspect-square rounded-md flex items-center justify-center text-[10px] font-bold border transition-all cursor-pointer hover:scale-110 active:scale-95 z-[1]"
                :class="getDayStatusClass(channel, day)"
                @click="openTimeRanges(channel, day)"
              >
                {{ day }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Time Range Modal (Timeline Style) -->
    <Transition name="modal">
      <div v-if="selectedDay" class="fixed inset-0 z-[100] flex items-center justify-center p-6">
        <div class="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" @click="selectedDay = null"></div>
        <div class="glass-card w-full max-w-4xl p-8 relative z-10 shadow-3xl bg-zinc-900/90 border-teal-500/20">
          <div class="flex items-center justify-between mb-8">
            <h3 class="text-2xl font-black text-zinc-100 italic">Daily Timeline Diagnostic</h3>
            <button @click="selectedDay = null" class="text-zinc-500 hover:text-rose-400"><X class="w-8 h-8" /></button>
          </div>
          
          <div class="flex items-center gap-4 mb-8 p-4 bg-white/5 rounded-2xl border border-white/5">
            <div class="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
              <Clock class="w-6 h-6" />
            </div>
            <div>
              <p class="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em]">Channel {{ selectedDay.channel }} / {{ selectedDevice?.ipNvr }}</p>
              <p class="text-xl font-bold text-zinc-200">Recording Analysis: Day {{ selectedDay.day }}, {{ monthYearLabel }}</p>
            </div>
          </div>

          <!-- 24h Timeline Ruler -->
          <div class="relative pt-10 pb-6 mb-8 px-4 bg-zinc-950/30 rounded-3xl border border-white/5">
            <!-- Ticks/Numbers -->
            <div class="absolute top-4 left-4 right-4 flex justify-between px-1">
              <span v-for="h in 24" :key="h" class="text-[8px] font-mono text-zinc-700 w-0 flex justify-center">{{ (h-1).toString().padStart(2, '0') }}</span>
              <span class="text-[8px] font-mono text-zinc-700 w-0 flex justify-center">24</span>
            </div>
            
            <!-- Timeline Track -->
            <div class="relative h-12 bg-zinc-900 rounded-xl overflow-hidden shadow-inner border border-white/5">
              <!-- Background Grid -->
              <div class="absolute inset-0 flex">
                <div v-for="h in 24" :key="h" class="flex-1 border-r border-white/5 last:border-0 h-full"></div>
              </div>

              <!-- Data Segments -->
              <div 
                v-for="range in selectedDay.ranges" 
                :key="range.label"
                class="absolute top-1.5 bottom-1.5 bg-emerald-500/80 hover:bg-emerald-400 cursor-pointer rounded-md transition-all border border-emerald-400/30 group z-10"
                :style="{ left: `${range.start}%`, width: `${range.width}%` }"
              >
                <!-- Tooltip -->
                 <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-zinc-950 text-emerald-400 text-[10px] font-black rounded-lg border border-emerald-500/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-2xl">
                   {{ range.label }}
                 </div>
              </div>
            </div>
          </div>

          <div class="space-y-4">
             <div class="flex items-center justify-between px-2">
                <span class="text-xs font-black uppercase tracking-widest text-zinc-600">Detected Segments ({{ selectedDay.ranges.length }})</span>
                <span class="text-[10px] text-zinc-500 italic">Times are in Local System Time (LST)</span>
             </div>
             <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                <div v-for="range in selectedDay.ranges" :key="range.label" class="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-emerald-500/5 hover:border-emerald-500/20 transition-all">
                  <div class="flex items-center gap-3">
                    <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span class="text-sm font-mono text-zinc-300">{{ range.label }}</span>
                  </div>
                  <button class="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                    Access Footing <Play class="w-3.5 h-3.5 group-hover:fill-current" />
                  </button>
                </div>
             </div>
          </div>

          <button 
            @click="selectedDay = null"
            class="w-full mt-10 py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-2xl transition-all border border-white/5"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </Transition>

    <!-- Config Modal -->
    <Transition name="modal">
      <div v-if="showConfig" class="fixed inset-0 z-[100] flex items-center justify-center p-6">
        <div class="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" @click="showConfig = false"></div>
        <div class="glass-card w-full max-w-sm p-8 relative z-10">
          <h3 class="text-xl font-bold mb-6">Display Settings</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Visible Channels</label>
              <input type="number" v-model="channelCount" min="1" max="16" class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-teal-500/50" />
            </div>
            <div class="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 mt-6">
              <span class="text-sm">Highlight Recording Days</span>
              <div class="w-10 h-6 bg-teal-500 rounded-full relative p-1 cursor-pointer">
                <div class="w-4 h-4 bg-white rounded-full absolute right-1"></div>
              </div>
            </div>
          </div>
          <button @click="showConfig = false" class="w-full mt-8 py-3 bg-teal-500 text-zinc-950 font-bold rounded-xl shadow-lg shadow-teal-500/20">Save Configuration</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { useDeviceStore } from '../stores/devices'
import { 
  Monitor, Calendar, ChevronLeft, ChevronRight, 
  Settings, Clock, X, Play 
} from 'lucide-vue-next'

const notify = inject<(title: string, msg: string, type: 'success' | 'error' | 'info') => void>('notify')!

interface DayRange {
  label: string
  start: number
  width: number
}

interface SelectedDay {
  channel: number
  day: number
  ranges: DayRange[]
}

const deviceStore = useDeviceStore()
const selectedDevice = ref<any>(deviceStore.devices[0] || null)
const currentDate = ref(new Date())
const showConfig = ref(false)
const selectedDay = ref<SelectedDay | null>(null)
const channelCount = ref(4)

const channels = computed(() => Array.from({ length: channelCount.value }, (_, i) => i + 1))

const daysInMonth = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  return new Date(year, month + 1, 0).getDate()
})

const monthYearLabel = computed(() => {
  return currentDate.value.toLocaleString('default', { month: 'long', year: 'numeric' })
})

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const getDayStatusClass = (channel: number, day: number) => {
  // Mock logic for data availability
  const hash = (channel * 31 + day) % 7
  if (hash === 0) return 'bg-rose-500/10 border-rose-500/30 text-rose-400'
  if (hash < 4) return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
  return 'bg-zinc-900 border-white/5 text-zinc-600'
}

const timeToPercent = (timeStr: string) => {
  const parts = timeStr.split(':').map(Number)
  const h = parts[0]!
  const m = parts[1]!
  return ((h * 60 + m) / 1440) * 100
}

const openTimeRanges = (channel: number, day: number) => {
  const hash = (channel * 31 + day) % 7
  if (hash === 0 || hash > 3) return // No data
  
  // Generate mock time segments with percentages
  const rawRanges = [
    { start: '00:00', end: '04:30' },
    { start: '08:15', end: '12:00' },
    { start: '13:45', end: '17:30' },
    { start: '20:00', end: '23:59' }
  ]

  const processedRanges: DayRange[] = rawRanges.map(r => {
    const s = timeToPercent(r.start)
    const e = timeToPercent(r.end)
    return {
      label: `${r.start} - ${r.end}`,
      start: s,
      width: Math.max(e - s, 0.5) // Minimum width for visibility
    }
  })

  selectedDay.value = { 
    channel, 
    day, 
    ranges: processedRanges 
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

.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-active .glass-card, .modal-leave-active .glass-card {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-enter-from { opacity: 0; }
.modal-enter-from .glass-card { transform: scale(0.9) translateY(20px); }
.modal-leave-to { opacity: 0; }
.modal-leave-to .glass-card { transform: scale(0.95); }
</style>
