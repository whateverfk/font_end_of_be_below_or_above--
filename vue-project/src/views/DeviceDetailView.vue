<template>
  <div class="max-w-6xl mx-auto space-y-8 pb-20">
    <!-- Header with Back Button -->
    <div class="flex items-center gap-6">
      <router-link 
        to="/" 
        class="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-teal-400 hover:border-teal-500/30 transition-all active:scale-90"
      >
        <ArrowLeft class="w-6 h-6" />
      </router-link>
      <div>
        <div class="flex items-center gap-3">
          <h2 class="text-3xl font-black text-zinc-100 italic">{{ device?.ipNvr || 'Interface' }}</h2>
          <span class="px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20 text-[10px] font-black uppercase tracking-widest text-teal-400">
            Node {{ device?.id }}
          </span>
        </div>
        <p class="text-zinc-500 text-sm mt-1 uppercase tracking-widest font-bold opacity-60">Technical Infrastructure Detail</p>
      </div>
    </div>

    <!-- Main Content Container with Tabs -->
    <div class="glass-card min-h-[600px] flex flex-col overflow-hidden border-white/5 shadow-4xl">
      <!-- Tab Navigation -->
      <div class="flex overflow-x-auto scrollbar-hide border-b border-white/5 bg-zinc-950/20">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          class="px-8 py-5 text-sm font-bold uppercase tracking-widest transition-all relative shrink-0"
          :class="[
            activeTab === tab.id ? 'text-teal-400' : 'text-zinc-600 hover:text-zinc-300'
          ]"
        >
          <div class="flex items-center gap-2">
            <component :is="tab.icon" class="w-4 h-4" />
            {{ tab.label }}
          </div>
          <!-- Active Line -->
          <div 
            v-if="activeTab === tab.id" 
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-teal-500 to-transparent shadow-[0_-4px_12px_rgba(20,184,166,0.3)]"
          ></div>
        </button>
      </div>

      <!-- Tab Content Area -->
      <div class="flex-1 p-10 bg-gradient-to-b from-white/[0.01] to-transparent">
        <Transition name="fade-slide" mode="out-in">
          <div :key="activeTab" class="h-full">
            
            <!-- SYSTEM INFO TAB -->
            <div v-if="activeTab === 'info'" class="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div class="space-y-8">
                <h4 class="text-xl font-bold flex items-center gap-3 mb-6"><Cpu class="w-6 h-6 text-teal-400" /> Core System Metrics</h4>
                <div class="space-y-4">
                  <div v-for="item in systemMetrics" :key="item.label" class="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 group hover:border-teal-500/20 transition-all">
                    <span class="text-xs font-black uppercase tracking-widest text-zinc-500">{{ item.label }}</span>
                    <span class="font-mono text-zinc-200">{{ item.value }}</span>
                  </div>
                </div>
              </div>
              <div class="space-y-8">
                <h4 class="text-xl font-bold flex items-center gap-3 mb-6"><Activity class="w-6 h-6 text-emerald-400" /> Operational Status</h4>
                <div class="p-6 rounded-3xl bg-zinc-950/50 border border-white/5 flex flex-col items-center justify-center text-center space-y-4">
                  <div class="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                    <Zap class="w-10 h-10" />
                  </div>
                  <div>
                    <p class="text-2xl font-black">99.98% Uptime</p>
                    <p class="text-xs text-zinc-600 font-bold uppercase tracking-widest">Calculated over last 30 intervals</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- CHANNEL CONFIG TAB -->
            <div v-else-if="activeTab === 'channel'" class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div class="flex items-center justify-between">
                <h4 class="text-xl font-bold flex items-center gap-3"><Layers class="w-6 h-6 text-teal-400" /> Stream Optimization</h4>
                <div class="flex gap-2">
                  <span class="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">H.265+ Active</span>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div v-for="i in 6" :key="i" class="glass-card p-6 border-white/5 hover:border-teal-500/20 transition-all group cursor-pointer relative overflow-hidden">
                   <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><Video class="w-12 h-12" /></div>
                   <p class="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1">Source Index</p>
                   <h5 class="text-lg font-bold text-zinc-200 mb-4">Channel {{ i.toString().padStart(2, '0') }}</h5>
                   <div class="flex flex-col gap-1 text-[10px] font-mono text-zinc-500">
                     <span>RES: 3840x2160 (4K)</span>
                     <span>FPS: 30 / BIT: 8192kbps</span>
                   </div>
                </div>
              </div>
            </div>

            <!-- USERS TAB -->
            <div v-else-if="activeTab === 'users'" class="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div class="flex items-center justify-between">
                <h4 class="text-xl font-bold flex items-center gap-3"><Users class="w-6 h-6 text-teal-400" /> Administrative Access</h4>
                <button class="px-4 py-2 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-xl text-xs font-bold hover:bg-teal-500 hover:text-zinc-950 transition-all">New Privilege</button>
              </div>
              <div class="space-y-3">
                 <div v-for="u in ['SystemRoot', 'SecManager', 'AuditBot']" :key="u" class="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all">
                   <div class="flex items-center gap-4">
                     <div class="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 font-bold uppercase">{{ u[0] }}</div>
                     <div>
                       <p class="font-bold text-zinc-200">{{ u }}</p>
                       <p class="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Authorized {{ u === 'SystemRoot' ? 'Superuser' : 'Limited' }}</p>
                     </div>
                   </div>
                   <div class="flex items-center gap-6">
                      <div class="flex flex-col items-end">
                        <span class="text-[10px] text-zinc-600 font-bold uppercase italic">Last Sync</span>
                        <span class="text-xs font-mono text-zinc-400">2026-01-17 09:44</span>
                      </div>
                      <button class="text-zinc-700 hover:text-teal-400 transition-colors"><Edit3 class="w-4 h-4" /></button>
                   </div>
                 </div>
              </div>
            </div>

            <!-- LOGS TAB -->
            <div v-else-if="activeTab === 'log'" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div class="flex items-center justify-between mb-2">
                 <h4 class="text-xl font-bold flex items-center gap-3"><Terminal class="w-6 h-6 text-teal-400" /> Transaction Logs</h4>
                 <div class="flex gap-2">
                   <input type="text" placeholder="Filter log patterns..." class="bg-zinc-950 border border-white/10 rounded-xl py-2 px-4 text-xs focus:outline-none focus:border-teal-500/30 w-64" />
                 </div>
               </div>
               <div class="bg-zinc-950/50 rounded-2xl border border-white/5 p-6 font-mono text-xs space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                  <div v-for="i in 20" :key="i" class="flex gap-4 opacity-70 hover:opacity-100 transition-opacity">
                    <span class="text-zinc-600 shrink-0">[{{ new Date().toLocaleTimeString() }}]</span>
                    <span class="text-emerald-500/60 uppercase font-bold shrink-0">[INFO]</span>
                    <span class="text-zinc-400">Infrastructure node heartbeat signal received from interface {{ device?.ipNvr || '0.0.0.0' }}</span>
                  </div>
                  <div class="flex gap-4 text-rose-400 font-bold">
                    <span class="text-zinc-600 shrink-0">[{{ new Date().toLocaleTimeString() }}]</span>
                    <span class="uppercase shrink-0">[WARN]</span>
                    <span class="break-all">Security handshake threshold exceeded for external probe detected at port 443</span>
                  </div>
               </div>
            </div>

            <!-- PLACEHOLDER FOR OTHER TABS -->
            <div v-else class="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
               <component :is="tabs.find(t => t.id === activeTab)?.icon" class="w-20 h-20 text-teal-400 stroke-[1]" />
               <div>
                 <h4 class="text-2xl font-black uppercase tracking-widest text-zinc-400">{{ activeTab }} Module</h4>
                 <p class="text-sm text-zinc-600 mt-2">Integrating diagnostic specialized data components...</p>
               </div>
            </div>

          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDeviceStore } from '../stores/devices'
import { 
  ArrowLeft, Cpu, Layers, Users, ShieldCheck, 
  Database, Terminal, Monitor, Activity, Zap,
  Video, Edit3, Info, Clock
} from 'lucide-vue-next'

const route = useRoute()
const deviceStore = useDeviceStore()

const device = computed(() => {
  const id = Number(route.params.id)
  return deviceStore.devices.find(d => d.id === id)
})

const activeTab = ref('info')

const tabs = [
  { id: 'info', label: 'System Info', icon: Cpu },
  { id: 'channel', label: 'Channel Config', icon: Layers },
  { id: 'users', label: 'Users & Permissions', icon: Users },
  { id: 'integration', label: 'Integration', icon: ShieldCheck },
  { id: 'storage', label: 'Storage', icon: Database },
  { id: 'log', label: 'System Logs', icon: Terminal },
]

const systemMetrics = [
  { label: 'Firmware Version', value: 'V5.7.12 build 230504' },
  { label: 'Hardware Model', value: 'DS-7616NI-I2' },
  { label: 'MAC Address', value: '70:BD:BC:4A:2F:E1' },
  { label: 'Kernel Version', value: '3.10.108-arm64-stable' },
  { label: 'Network Throughput', value: '160Mbps / 2048Mbps' },
  { label: 'Device Serial', value: 'DS-2024-XQ-PL-99128374' },
]
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
