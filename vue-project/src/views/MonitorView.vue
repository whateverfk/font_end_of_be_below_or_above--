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
              : 'hover:bg-white/5 text-zinc-400 border border-transparent',
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
            Archive Recording
          </h3>
          <div v-if="selectedDevice" class="h-6 w-px bg-white/10 mx-2"></div>
          <span v-if="selectedDevice" class="text-zinc-400 text-sm">
            Device: <span class="text-zinc-200 font-semibold">{{ selectedDevice.ipNvr }}</span>
          </span>
        </div>

        <!-- Month Navigator -->
        <div class="flex items-center gap-3 bg-zinc-900/50 p-1 rounded-xl border border-white/5">
          <button
            @click="prevMonth"
            class="p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-zinc-200 transition-colors"
          >
            <ChevronLeft class="w-5 h-5" />
          </button>
          <span
            class="text-sm font-bold min-w-[120px] text-center uppercase tracking-widest text-teal-400"
          >
            {{ monthYearLabel }}
          </span>
          <button
            @click="nextMonth"
            class="p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-zinc-200 transition-colors"
          >
            <ChevronRight class="w-5 h-5" />
          </button>
          <button
            @click="showConfig = true"
            class="p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-teal-400 transition-colors"
          >
            <Settings class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Archive Table -->
      <div class="flex-1 overflow-auto bg-zinc-950/20 custom-scrollbar p-6">
        <div
          v-if="!selectedDevice"
          class="h-full flex flex-col items-center justify-center text-zinc-600 space-y-4"
        >
          <Monitor class="w-16 h-16 opacity-20" />
          <p class="italic">Please select a device from the sidebar to view archive</p>
        </div>

        <div v-else class="space-y-8">
          <div v-for="channelData in channels" :key="channelData.channel.id" class="space-y-3">
            <div class="flex items-center gap-3 ml-1">
              <div class="w-2 h-2 rounded-full bg-teal-500"></div>
              <h4 class="font-bold text-sm tracking-tight text-zinc-400">
                {{ channelData.channel.name || `Channel ${channelData.channel.channel_no}` }}
              </h4>
            </div>

            <div
              class="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-31 gap-1.5 auto-rows-fr"
            >
              <div
                v-for="day in daysDisplay"
                :key="day"
                class="aspect-square rounded-md flex items-center justify-center text-[10px] font-bold border transition-all cursor-pointer z-[1]"
                :class="getDayStatusClass(channelData, day)"
                @click="openTimeRanges(channelData, day)"
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
        <div
          class="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
          @click="selectedDay = null"
        ></div>
        <div
          class="glass-card w-full max-w-4xl p-8 relative z-10 shadow-3xl bg-zinc-900/90 border-teal-500/20"
        >
          <div class="flex items-center justify-between mb-8">
            <h3 class="text-2xl font-black text-zinc-100 italic">Daily Timeline Diagnostic</h3>
            <button @click="selectedDay = null" class="text-zinc-500 hover:text-rose-400">
              <X class="w-8 h-8" />
            </button>
          </div>

          <div
            class="flex items-center gap-4 mb-8 p-4 bg-white/5 rounded-2xl border border-white/5"
          >
            <div
              class="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400"
            >
              <Clock class="w-6 h-6" />
            </div>
            <div>
              <p class="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em]">
                Channel {{ selectedDay.channel }} / {{ selectedDevice?.ipNvr }}
              </p>
              <p class="text-xl font-bold text-zinc-200">
                Recording Analysis: Day {{ selectedDay.day }}, {{ monthYearLabel }}
              </p>
            </div>
          </div>

          <!-- Tab Navigation -->
          <div class="flex gap-2 mb-6 p-1 bg-zinc-950/50 rounded-xl border border-white/5">
            <button
              @click="activeModalTab = 'segments'"
              class="flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
              :class="
                activeModalTab === 'segments'
                  ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
              "
            >
              <Clock class="w-4 h-4" />
              Detected Segments ({{ selectedDay.ranges.length }})
            </button>
            <button
              @click="activeModalTab = 'timeloss'"
              class="flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
              :class="
                activeModalTab === 'timeloss'
                  ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
              "
            >
              <AlertTriangle class="w-4 h-4" />
              Time Loss ({{ timeLossData.length }})
            </button>
          </div>

          <!-- 24h Timeline Ruler -->
          <div
            class="relative pt-10 pb-6 mb-8 px-4 bg-zinc-950/30 rounded-3xl border border-white/5"
          >
            <!-- Ticks/Numbers -->
            <div class="absolute top-4 left-4 right-4 flex justify-between px-1">
              <span
                v-for="h in 24"
                :key="h"
                class="text-[8px] font-mono text-zinc-700 w-0 flex justify-center"
                >{{ (h - 1).toString().padStart(2, '0') }}</span
              >
              <span class="text-[8px] font-mono text-zinc-700 w-0 flex justify-center">24</span>
            </div>

            <!-- Timeline Track -->
            <div
              class="relative h-12 bg-zinc-900 rounded-xl overflow-hidden shadow-inner border border-white/5"
            >
              <!-- Background Grid -->
              <div class="absolute inset-0 flex">
                <div
                  v-for="h in 24"
                  :key="h"
                  class="flex-1 border-r border-white/5 last:border-0 h-full"
                ></div>
              </div>

              <!-- Data Segments -->
              <div
                v-for="range in selectedDay.ranges"
                :key="range.label"
                class="absolute top-1.5 bottom-1.5 bg-emerald-500/80 hover:bg-emerald-400 cursor-pointer rounded-md transition-all border border-emerald-400/30 group z-10"
                :style="{ left: `${range.start}%`, width: `${range.width}%` }"
              >
                <!-- Tooltip -->
                <div
                  class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-zinc-950 text-emerald-400 text-[10px] font-black rounded-lg border border-emerald-500/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-2xl"
                >
                  {{ range.label }}
                </div>
              </div>
            </div>
          </div>

          <!-- Tab Content: Detected Segments -->
          <div v-if="activeModalTab === 'segments'" class="space-y-4">
            <div class="flex items-center justify-between px-2">
              <span class="text-xs font-black uppercase tracking-widest text-zinc-600"
                >Detected Segments ({{ selectedDay.ranges.length }})</span
              >
              <span class="text-[10px] text-zinc-500 italic"
                >Times are in Local System Time (LST)</span
              >
            </div>
            <div
              class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto custom-scrollbar pr-2"
            >
              <div
                v-for="range in selectedDay.ranges"
                :key="range.label"
                class="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-emerald-500/5 hover:border-emerald-500/20 transition-all"
              >
                <div class="flex items-center gap-3">
                  <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span class="text-sm font-mono text-zinc-300">{{ range.label }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab Content: Time Loss -->
          <div v-else-if="activeModalTab === 'timeloss'" class="space-y-4">
            <div class="flex items-center justify-between px-2">
              <span class="text-xs font-black uppercase tracking-widest text-zinc-600"
                >Time Loss / Gaps ({{ timeLossData.length }})</span
              >
              <span class="text-[10px] text-zinc-500 italic"
                >Recording gaps detected</span
              >
            </div>
            
            <div v-if="timeLossData.length === 0" class="text-center py-12 bg-white/[0.02] border border-white/5 rounded-2xl border-dashed">
              <Clock class="w-12 h-12 mx-auto text-emerald-500/50 mb-4" />
              <p class="text-emerald-400 font-bold">No time loss detected!</p>
              <p class="text-xs text-zinc-500 mt-2">Recording is continuous for this day.</p>
            </div>

            <div
              v-else
              class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto custom-scrollbar pr-2"
            >
              <div
                v-for="(gap, idx) in timeLossData"
                :key="idx"
                class="flex flex-col p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 group hover:bg-amber-500/10 hover:border-amber-500/30 transition-all"
              >
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span class="text-sm font-mono text-zinc-300">{{ gap.label }}</span>
                </div>
                <div class="pl-5">
                  <span class="text-xs font-black text-amber-400 uppercase tracking-wider">Duration: {{ gap.duration }}</span>
                </div>
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
        <div
          class="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
          @click="showConfig = false"
        ></div>
        <div class="glass-card w-full max-w-sm p-8 relative z-10">
          <h3 class="text-xl font-bold mb-6">Display Settings</h3>

          <div class="space-y-4">

            <div>
              <label class="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5"
                >Start Day</label
              >
              <input
                type="number"
                v-model="configForm.start_day"
                min="1"
                max="31"
                class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-teal-500/50"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5"
                >End Day</label
              >
              <input
                type="number"
                v-model="configForm.end_day"
                min="1"
                max="31"
                class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-teal-500/50"
              />
            </div>
            <div
              class="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 mt-6"
            >
              <span class="text-sm">Reverse Order</span>
              <div
                @click="configForm.order = !configForm.order"
                class="w-10 h-6 rounded-full relative p-1 cursor-pointer transition-colors"
                :class="configForm.order ? 'bg-teal-500' : 'bg-zinc-700'"
              >
                <div
                  class="w-4 h-4 bg-white rounded-full absolute transition-transform"
                  :class="configForm.order ? 'translate-x-4' : 'translate-x-0'"
                ></div>
              </div>
            </div>
          </div>
          <button
            @click="saveConfig"
            class="w-full mt-8 py-3 bg-teal-500 text-zinc-950 font-bold rounded-xl shadow-lg shadow-teal-500/20"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted, watch } from 'vue'
import { useDeviceStore } from '../stores/devices'
import { useMonitorStore, type ChannelData, type RecordDay } from '../stores/monitor'
import {
  Monitor,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Settings,
  Clock,
  X,
  Play,
  AlertTriangle,
} from 'lucide-vue-next'

const notify =
  inject<(title: string, msg: string, type: 'success' | 'error' | 'info') => void>('notify')!

const deviceStore = useDeviceStore()
const monitorStore = useMonitorStore()

const selectedDevice = ref<any>(null)
const currentDate = ref(new Date())
const showConfig = ref(false)
const selectedDay = ref<{ channel: string; day: number; ranges: any[]; rawRanges: any[] } | null>(null)
const activeModalTab = ref<'segments' | 'timeloss'>('segments')

// Config Form
const configForm = ref({
  start_day: 1,
  end_day: 31,
  order: false,
})

const monthYearLabel = computed(() => {
  const y = currentDate.value.getFullYear()
  const m = String(currentDate.value.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
})

const daysDisplay = computed(() => {
  // Determine last day of month to clamp range if needed
  const lastDayOfMonth = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    0,
  ).getDate()

  // Get config range
  let start = configForm.value.start_day
  let end = configForm.value.end_day
  const isReverse = configForm.value.order

  // Simple validation/clamping (optional, depends on if user wants forced range or intersection)
  // Spec implies strict adherence to config setting 1-21, so we just generate that range.
  // If user sets 32, it might look weird, but let's stick to config.

  const days: number[] = []
  if (start <= end) {
    for (let i = start; i <= end; i++) {
      days.push(i)
    }
  }

  if (isReverse) {
    days.reverse()
  }
  return days
})

const channels = computed(() => monitorStore.monthData?.channels || [])

// Watchers to fetch data
watch(
  [selectedDevice, monthYearLabel],
  async ([dev, dateStr]) => {
    if (dev && dateStr) {
      try {
        await monitorStore.fetchMonthData(dev.id, dateStr)
      } catch (e) {
        notify('Error', 'Failed to load archive data', 'error')
      }
    }
  },
  { immediate: true },
)

onMounted(async () => {
  // Init Config
  try {
    const conf = await monitorStore.fetchConfig()
    if (conf) {
      configForm.value = {
        start_day: conf.start_day,
        end_day: conf.end_day,
        order: conf.order,
      }
    }
  } catch (e) {}

  // Fetch Active Devices Only
  try {
    await deviceStore.fetchActiveDevices()
  } catch (e) {}

  // Auto select first device if available
  if (deviceStore.devices.length > 0 && !selectedDevice.value) {
    selectedDevice.value = deviceStore.devices[0]
  }
})

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const parseTimeStr = (str: string): string => {
  // Try to extract HH:mm:ss from various formats
  // Handle "YYYY-MM-DD HH:mm:ss" or "YYYY-MM-DDT...""
  let timePart = str
  if (str.includes(' ')) {
    const parts = str.split(' ')
    if (parts[1]) timePart = parts[1]
  } else if (str.includes('T')) {
    const parts = str.split('T')
    if (parts[1]) timePart = parts[1]
  }

  // Remove milliseconds if present
  if (timePart.includes('.')) {
    const parts = timePart.split('.')
    if (parts[0]) timePart = parts[0]
  }

  return timePart
}

const timeToSeconds = (str: string) => {
  const time = parseTimeStr(str)
  const [h, m, s] = time.split(':').map(Number)
  return (h || 0) * 3600 + (m || 0) * 60 + (s || 0)
}

// Logic:
// Green: Full Day (start='00:00:00', end='23:59:59')
// Red: >1 range OR 1 range but not full day
// Gray: No record
const getDayStatusClass = (channelData: ChannelData, day: number) => {
  // Find record for this day
  const dayStr = String(day).padStart(2, '0')
  const fullDate = `${monthYearLabel.value}-${dayStr}` // YYYY-MM-DD

  const record = channelData.record_days.find((r) => r.record_date === fullDate)

  if (!record || !record.has_record || !record.time_ranges.length) {
    return 'bg-zinc-900 border-white/5 text-zinc-600 pointer-events-none' // Gray/Dark
  }

  const ranges = record.time_ranges
  // Check Green Condition
  if (ranges.length === 1) {
    const r = ranges[0]!
    const startSec = timeToSeconds(r.start_time)
    const endSec = timeToSeconds(r.end_time)

    // Check if covers full day (00:00:00 to 23:59:59)
    if (startSec <= 0 && endSec >= 86399) {
      return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 hover:scale-110 active:scale-95'
    }
  }

  // Red Condition (Default if has record but not Green)
  return 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:scale-110 active:scale-95'
}

const openTimeRanges = (channelData: ChannelData, day: number) => {
  const dayStr = String(day).padStart(2, '0')
  const fullDate = `${monthYearLabel.value}-${dayStr}`
  const record = channelData.record_days.find((r) => r.record_date === fullDate)

  if (!record || !record.has_record) return

  // Sort ranges by start time
  const sortedRanges = [...record.time_ranges].sort((a, b) => {
    return a.start_time.localeCompare(b.start_time)
  })

  // Transform ranges for UI (timeline width %)
  const processedRanges = sortedRanges.map((r) => {
    const startSec = timeToSeconds(r.start_time)
    const endSec = timeToSeconds(r.end_time)
    const totalSec = 86400 // 24h

    const startPct = (startSec / totalSec) * 100
    const endPct = (endSec / totalSec) * 100

    return {
      // Display only HH:mm:ss
      label: `${parseTimeStr(r.start_time)} - ${parseTimeStr(r.end_time)}`,
      start: startPct,
      width: Math.max(endPct - startPct, 0.5),
    }
  })

  selectedDay.value = {
    channel: channelData.channel.name || `CH ${channelData.channel.channel_no}`,
    day: day,
    ranges: processedRanges,
    rawRanges: sortedRanges,
  }
  
  // Reset tab to segments when opening modal
  activeModalTab.value = 'segments'
}

// Compute time loss (gaps between segments)
const timeLossData = computed(() => {
  if (!selectedDay.value || !selectedDay.value.rawRanges) {
    return []
  }

  const ranges = selectedDay.value.rawRanges
  const gaps: any[] = []

  // Helper to format duration
  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    
    const parts = []
    if (h > 0) parts.push(`${h}h`)
    if (m > 0) parts.push(`${m}m`)
    if (s > 0) parts.push(`${s}s`)
    
    return parts.length > 0 ? parts.join(' ') : '0s'
  }

  // Check gap from start of day (00:00:00) to first segment
  if (ranges.length > 0) {
    const firstStart = timeToSeconds(ranges[0]!.start_time)
    if (firstStart > 0) {
      gaps.push({
        label: `00:00:00 - ${parseTimeStr(ranges[0]!.start_time)}`,
        duration: formatDuration(firstStart),
        durationSec: firstStart,
      })
    }
  }

  // Check gaps between consecutive segments
  for (let i = 0; i < ranges.length - 1; i++) {
    const currentEnd = timeToSeconds(ranges[i]!.end_time)
    const nextStart = timeToSeconds(ranges[i + 1]!.start_time)
    
    if (nextStart > currentEnd) {
      const gapDuration = nextStart - currentEnd
      gaps.push({
        label: `${parseTimeStr(ranges[i]!.end_time)} - ${parseTimeStr(ranges[i + 1]!.start_time)}`,
        duration: formatDuration(gapDuration),
        durationSec: gapDuration,
      })
    }
  }

  // Check gap from last segment to end of day (23:59:59 = 86399 seconds)
  if (ranges.length > 0) {
    const lastEnd = timeToSeconds(ranges[ranges.length - 1]!.end_time)
    const dayEnd = 86399 // 23:59:59
    
    if (lastEnd < dayEnd) {
      const gapDuration = dayEnd - lastEnd
      gaps.push({
        label: `${parseTimeStr(ranges[ranges.length - 1]!.end_time)} - 23:59:59`,
        duration: formatDuration(gapDuration),
        durationSec: gapDuration,
      })
    }
  }

  return gaps
})

const saveConfig = async () => {
  if (configForm.value.start_day > configForm.value.end_day) {
    notify('Validation Error', 'Start Day must be <= End Day', 'error')
    return
  }

  try {
    await monitorStore.updateConfig(
      configForm.value.start_day,
      configForm.value.end_day,
      configForm.value.order,
    )
    notify('Saved', 'Monitor configuration updated', 'success')
    showConfig.value = false
  } catch (e) {
    notify('Error', 'Failed to save configuration', 'error')
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

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-active .glass-card,
.modal-leave-active .glass-card {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-enter-from {
  opacity: 0;
}
.modal-enter-from .glass-card {
  transform: scale(0.9) translateY(20px);
}
.modal-leave-to {
  opacity: 0;
}
.modal-leave-to .glass-card {
  transform: scale(0.95);
}
</style>
