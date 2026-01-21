<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <div class="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
      <!-- Header -->
      <div class="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
        <div>
          <h3 class="text-xl font-black text-zinc-100 uppercase tracking-tight">User Permissions</h3>
          <p class="text-sm text-zinc-500 font-mono mt-1" v-if="user">User: {{ user.user_name }} </p>
        </div>
        <button @click="close" class="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors">
          <X class="w-6 h-6" />
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-hidden flex flex-col">
          <div v-if="permStore.loading.fetch" class="flex-1 flex flex-col items-center justify-center text-teal-500">
              <Loader2 class="w-10 h-10 animate-spin mb-4" />
              <span>Loading permissions...</span>
          </div>

          <div v-else-if="localPerms" class="flex-1 flex overflow-hidden">
              <!-- Scope Tabs -->
              <div class="w-48 border-r border-white/10 bg-black/20 p-2 space-y-1">
                  <button
                    v-for="scope in (['local', 'remote'] as const)"
                    :key="scope"
                    @click="activeScope = scope"
                    class="w-full text-left px-4 py-3 rounded-xl transition-all font-bold uppercase tracking-wider text-xs flex items-center justify-between"
                    :class="activeScope === scope ? 'bg-teal-500 text-zinc-950' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'"
                  >
                      {{ scope }}
                      <ChevronRight v-if="activeScope === scope" class="w-4 h-4" />
                  </button>
              </div>

              <!-- Permission Matrix -->
              <div class="flex-1 overflow-y-auto custom-scrollbar p-6">
                  <div class="grid grid-cols-1 gap-4">
                      <div
                        v-for="permKey in permStore.SCOPE_PERMISSION_WHITELIST[activeScope]"
                        :key="permKey"
                        class="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                      >
                        <div class="flex items-start justify-between">
                            <div class="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    :checked="isGlobalChecked(permKey)"
                                    @change="toggleGlobal(permKey)"
                                    class="w-5 h-5 accent-teal-500 rounded cursor-pointer"
                                >
                                <div>
                                    <p class="font-bold text-zinc-200 text-sm">{{ permStore.PERMISSION_LABELS[permKey] || permKey }}</p>
                                    <p class="text-[10px] text-zinc-500 font-mono">{{ permKey }}</p>
                                </div>
                            </div>

                            <!-- Channel Expansion -->
                            <div v-if="permStore.CHANNEL_BASED_PERMISSIONS.includes(permKey)">
                                <button
                                    @click="toggleExpand(permKey)"
                                    class="text-xs bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-zinc-300 flex items-center gap-2 transition-colors"
                                >
                                    <Settings2 class="w-3 h-3" />
                                    {{ getChannelCount(permKey) }} Channels
                                    <ChevronDown class="w-3 h-3 transition-transform" :class="{ 'rotate-180': expandedPerms.includes(permKey) }" />
                                </button>
                            </div>
                        </div>

                        <!-- Channel Selection Grid -->
                        <div v-if="expandedPerms.includes(permKey)" class="mt-4 pt-4 border-t border-white/5 pl-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                             <label v-for="channel in channels" :key="channel.id" class="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer hover:text-zinc-200">
                                 <input
                                    type="checkbox"
                                    :checked="isChannelChecked(permKey, channel.id)"
                                    @change="toggleChannel(permKey, channel.id)"
                                    class="accent-teal-500 rounded-sm"
                                 >
                                 <span class="truncate">{{ channel.channel_name || channel.channel_no }}</span>
                             </label>
                        </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-white/10 bg-white/[0.02] flex justify-between items-center">
          <button @click="handleSync" class="text-teal-500 hover:text-teal-400 text-sm font-bold flex items-center gap-2">
              <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': permStore.loading.sync }" />
              Sync from Device
          </button>
          <div class="flex gap-3">
              <button @click="close" class="px-6 py-2 rounded-xl font-bold text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors">Cancel</button>
              <button @click="save" :disabled="permStore.loading.update" class="px-6 py-2 bg-teal-500 text-zinc-950 font-bold rounded-xl hover:bg-teal-400 transition-colors disabled:opacity-50">
                  {{ permStore.loading.update ? 'Saving...' : 'Save Changes' }}
              </button>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, inject } from 'vue'
import { useDevicePermissionsStore, type UserPermissions } from '@/stores/devicePermissions'
import { useSchedulerStore } from '@/stores/scheduler'
import { X, Loader2, ChevronRight, Settings2, ChevronDown, RefreshCw } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  deviceId: string | number
  user: any
}>()

const emit = defineEmits(['close', 'saved'])

const permStore = useDevicePermissionsStore()
const schedulerStore = useSchedulerStore()
const notify = inject<any>('notify')

const activeScope = ref<'local' | 'remote'>('local')
const expandedPerms = ref<string[]>([])
const localPerms = ref<UserPermissions | null>(null)
const channels = ref<any[]>([])

// Load data when opened
watch(() => props.isOpen, async (val) => {
    if (val && props.user) {
        // Fetch Permissions
        await permStore.fetchPermissions(props.deviceId, props.user.id)
        if (permStore.permissions) {
             // Deep copy to local state for editing
             localPerms.value = JSON.parse(JSON.stringify(permStore.permissions))
        }

        // Ensure channels are loaded for the list
        if (schedulerStore.channels.length === 0) {
            await schedulerStore.fetchChannels(props.deviceId)
        }
        channels.value = schedulerStore.channels
    } else {
        localPerms.value = null
        expandedPerms.value = []
    }
})

function close() {
    emit('close')
}

// Checkbox Logic
function isGlobalChecked(permKey: string) {
    if (!localPerms.value) return false
    const scope = activeScope.value
    // For PTZ control, check if any channel is selected regardless of global flag
    if (permKey === 'ptz_control') {
        const list = localPerms.value[scope].channels[permKey] || []
        return list.length > 0
    }
    return !!localPerms.value[scope].global[permKey]
}

function toggleGlobal(permKey: string) {
    if (!localPerms.value) return
    const scope = activeScope.value
    const current = isGlobalChecked(permKey)
    const next = !current
    
    // Update global state explicitly to ensure reactivity
    localPerms.value[scope].global = {
        ...localPerms.value[scope].global,
        [permKey]: next
    }

    // If it's a channel-based permission, sync all channels
    if (permStore.CHANNEL_BASED_PERMISSIONS.includes(permKey)) {
        if (!next) {
            localPerms.value[scope].channels[permKey] = []
        } else {
            // Check all channels
            localPerms.value[scope].channels[permKey] = channels.value.map(c => c.id)
        }
    }
}

function getChannelCount(permKey: string) {
    if (!localPerms.value) return 0
    const list = localPerms.value[activeScope.value].channels[permKey]
    return list ? list.length : 0
}

function toggleExpand(permKey: string) {
    if (expandedPerms.value.includes(permKey)) {
        expandedPerms.value = expandedPerms.value.filter(k => k !== permKey)
    } else {
        expandedPerms.value.push(permKey)
    }
}

function isChannelChecked(permKey: string, channelId: number) {
    if (!localPerms.value) return false
    const list = localPerms.value[activeScope.value].channels[permKey] || []
    return list.includes(channelId)
}

function toggleChannel(permKey: string, channelId: number) {
    if (!localPerms.value) return
    const scope = activeScope.value
    let list = [...(localPerms.value[scope].channels[permKey] || [])]

    if (list.includes(channelId)) {
        list = list.filter(id => id !== channelId)
    } else {
        list.push(channelId)
    }

    // Update channels list
    localPerms.value[scope].channels[permKey] = list

    // Update global checkbox explicitly to ensure reactivity
    const isNowGlobalEnabled = list.length > 0
    localPerms.value[scope].global = {
        ...localPerms.value[scope].global,
        [permKey]: isNowGlobalEnabled
    }
}

async function handleSync() {
    if (!props.user) return
    await permStore.syncPermissions(props.deviceId, props.user.id)
    if (permStore.permissions) {
        localPerms.value = JSON.parse(JSON.stringify(permStore.permissions))
    }
}

async function save() {
    if (!localPerms.value || !props.user) return
    const result = await permStore.updatePermissions(props.deviceId, props.user.id, localPerms.value)
    
    if (result.success) {
        notify?.('Success', result.message, 'success')
        emit('saved')
        close()
    } else {
        notify?.('Error', result.message, 'error')
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
</style>
