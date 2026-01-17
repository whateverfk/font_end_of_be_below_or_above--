<template>
  <div class="max-w-7xl mx-auto space-y-10 pb-20">
    <div class="flex items-center justify-between">
      <h2 class="text-3xl font-black text-zinc-100 flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400 border border-teal-500/20">
          <Monitor class="w-7 h-7" />
        </div>
        Device Management
      </h2>
      <button 
        @click="openAddModal"
        class="bg-teal-500 hover:bg-teal-400 text-zinc-950 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all active:scale-95"
      >
        <Plus class="w-5 h-5" />
        Add Device
      </button>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-4 gap-8">
      <!-- Stats Sidebar -->
      <div class="xl:col-span-1 space-y-6">
        <div class="glass-card p-6 flex items-center gap-4 border-white/5 relative overflow-hidden group">
          <div class="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
            <Monitor class="w-24 h-24 text-teal-500" />
          </div>
          <div class="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400 border border-teal-500/10">
            <Monitor class="w-7 h-7" />
          </div>
          <div>
            <p class="text-xs font-black uppercase tracking-widest text-zinc-500 mb-0.5">Total Devices</p>
            <p class="text-3xl font-black text-zinc-100">{{ deviceStore.devices.length }}</p>
          </div>
        </div>

        <div class="glass-card p-6 flex items-center gap-4 border-white/5 relative overflow-hidden group">
          <div class="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform text-emerald-500">
             <div class="w-24 h-24 rounded-full border-8 border-current opacity-10"></div>
          </div>
          <div class="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/10">
            <CheckCircle2 class="w-7 h-7" />
          </div>
          <div>
            <p class="text-xs font-black uppercase tracking-widest text-zinc-500 mb-0.5">Online Now</p>
            <p class="text-3xl font-black text-zinc-100">{{ deviceStore.devices.filter(d => d.status).length }}</p>
          </div>
        </div>
        
        <div class="glass-card p-8 border-white/5 bg-gradient-to-br from-teal-500/5 to-transparent">
          <h4 class="font-bold text-lg mb-4">Quick Tip</h4>
          <p class="text-sm text-zinc-500 leading-relaxed">Click on a device's IP address to view its full technical details, channel configuration, and system logs.</p>
        </div>
      </div>

      <!-- Device List Table -->
      <div class="xl:col-span-3 glass-card overflow-hidden border-white/5">
        <div class="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
          <h3 class="text-xl font-bold">Network Inventory</h3>
          <div class="flex items-center gap-3">
             <div class="relative">
               <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
               <input type="text" placeholder="Search devices..." class="bg-zinc-900 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-teal-500/30 w-64 transition-all" />
             </div>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="text-zinc-500 border-b border-white/5 bg-zinc-950/20">
                <th class="px-8 py-5 font-black uppercase tracking-widest text-[10px]">NVR Address</th>
                <th class="px-8 py-5 font-black uppercase tracking-widest text-[10px]">Web Access</th>
                <th class="px-8 py-5 font-black uppercase tracking-widest text-[10px]">Identity</th>
                <th class="px-8 py-5 font-black uppercase tracking-widest text-[10px]">Functional Status</th>
                <th class="px-8 py-5 font-black uppercase tracking-widest text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr v-for="device in deviceStore.devices" :key="device.id" class="hover:bg-teal-500/[0.02] transition-all group">
                <td class="px-8 py-5">
                  <router-link :to="`/device/${device.id}`" class="flex flex-col hover:text-teal-400 transition-colors">
                    <span class="font-mono font-bold text-zinc-200">{{ device.ipNvr }}</span>
                    <span class="text-[10px] text-zinc-500 uppercase font-black tracking-tighter">{{ device.brand }}</span>
                  </router-link>
                </td>
                <td class="px-8 py-5 font-mono text-zinc-400">{{ device.ipWeb }}</td>
                <td class="px-8 py-5">
                  <div class="flex items-center gap-2">
                    <User class="w-3.5 h-3.5 text-zinc-600" />
                    <span class="text-zinc-300 font-medium">{{ device.userName }}</span>
                  </div>
                </td>
                <td class="px-8 py-5">
                  <button 
                    @click="toggleStatus(device)"
                    class="relative w-11 h-6 transition-colors rounded-full p-1"
                    :class="device.status ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-zinc-800 border border-white/5'"
                  >
                    <div 
                      class="w-4 h-4 rounded-full transition-transform shadow-sm"
                      :class="[
                        device.status ? 'translate-x-5 bg-emerald-400 shadow-emerald-500/50' : 'translate-x-0 bg-zinc-500'
                      ]"
                    ></div>
                    <span class="absolute left-full ml-3 text-[10px] font-black uppercase tracking-widest" :class="device.status ? 'text-emerald-400' : 'text-zinc-600'">
                      {{ device.status ? 'Active' : 'Standby' }}
                    </span>
                  </button>
                </td>
                <td class="px-8 py-5 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button 
                      @click="openEditModal(device)"
                      class="p-2.5 rounded-xl hover:bg-teal-500/10 text-zinc-600 hover:text-teal-400 transition-all border border-transparent hover:border-teal-500/20"
                      title="Edit Configuration"
                    >
                      <Edit3 class="w-4.5 h-4.5" />
                    </button>
                    <button 
                      @click="handleDelete(device.id)"
                      class="p-2.5 rounded-xl hover:bg-rose-500/10 text-zinc-600 hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/20"
                      title="Purge Device"
                    >
                      <Trash2 class="w-4.5 h-4.5" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="deviceStore.devices.length === 0">
                <td colspan="5" class="px-8 py-20 text-center">
                   <div class="flex flex-col items-center gap-4 opacity-20">
                     <AlertCircle class="w-16 h-16" />
                     <p class="font-bold text-xl uppercase tracking-[0.2em]">No hardware detected</p>
                   </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Edit/Add Modal Overlay -->
    <Transition name="modal">
      <div v-if="showModal" class="fixed inset-0 z-[100] flex items-center justify-center p-6">
        <div class="absolute inset-0 bg-zinc-950/80 backdrop-blur-md" @click="closeModal"></div>
        <div class="glass-card w-full max-w-lg p-10 relative z-10 border-teal-500/20 shadow-4xl animate-in zoom-in-95 duration-200">
          <div class="flex items-center justify-between mb-8">
            <div>
              <h3 class="text-2xl font-black text-zinc-100 tracking-tight">{{ isEditMode ? 'Modify Infrastructure' : 'Register New Device' }}</h3>
              <p class="text-zinc-500 text-sm mt-1">{{ isEditMode ? 'Update existing hardware parameters and credentials.' : 'Integrate a new camera system into your network cluster.' }}</p>
            </div>
            <button @click="closeModal" class="text-zinc-600 hover:text-rose-400 transition-colors"><X class="w-8 h-8" /></button>
          </div>

          <form @submit.prevent="handleSubmit" class="grid grid-cols-2 gap-6">
            <div class="col-span-1">
              <label class="block text-[10px] font-black uppercase text-zinc-600 tracking-widest mb-2 ml-1">NVR Interface IP</label>
              <input v-model="form.ipNvr" required type="text" class="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-5 text-sm focus:outline-none focus:border-teal-500/50" placeholder="192.168.1.xxx" />
            </div>
            <div class="col-span-1">
              <label class="block text-[10px] font-black uppercase text-zinc-600 tracking-widest mb-2 ml-1">Web Management IP</label>
              <input v-model="form.ipWeb" required type="text" class="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-5 text-sm focus:outline-none focus:border-teal-500/50" placeholder="192.168.1.xxx" />
            </div>
            <div class="col-span-1">
              <label class="block text-[10px] font-black uppercase text-zinc-600 tracking-widest mb-2 ml-1">Security Username</label>
              <input v-model="form.userName" required type="text" class="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-5 text-sm focus:outline-none focus:border-teal-500/50" placeholder="admin" />
            </div>
            <div class="col-span-1">
              <label class="block text-[10px] font-black uppercase text-zinc-600 tracking-widest mb-2 ml-1">Access Token / Password</label>
              <input v-model="form.password" :required="!isEditMode" type="password" class="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-5 text-sm focus:outline-none focus:border-teal-500/50" placeholder="••••••••" />
            </div>
            <div class="col-span-2">
              <label class="block text-[10px] font-black uppercase text-zinc-600 tracking-widest mb-2 ml-1">Hardware Brand Entity</label>
              <select v-model="form.brand" class="w-full bg-zinc-950 border border-white/10 rounded-2xl py-3.5 px-5 text-sm focus:outline-none focus:border-teal-500/50 appearance-none text-zinc-300">
                <option value="HIKVision">HIKVision Corporate</option>
                <option value="Dahua">Dahua Technology</option>
                <option value="Uniview">Uniview Solutions</option>
              </select>
            </div>

            <div class="col-span-2 flex gap-4 mt-6">
              <button type="button" @click="closeModal" class="flex-1 py-4 bg-zinc-900 text-zinc-400 font-bold rounded-2xl hover:bg-zinc-800 transition-colors">Cancel</button>
              <button 
                type="submit" 
                :disabled="submitting"
                class="flex-1 py-4 bg-teal-500 text-zinc-950 font-bold rounded-2xl shadow-xl shadow-teal-500/20 hover:bg-teal-400 transition-all flex items-center justify-center gap-2"
              >
                <Loader2 v-if="submitting" class="w-5 h-5 animate-spin" />
                <span>{{ isEditMode ? 'Apply Changes' : 'Execute Registration' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, inject, computed } from 'vue'
import { useDeviceStore } from '../stores/devices'
import { 
  Monitor, Plus, Trash2, Edit3, User, CheckCircle2, 
  Search, AlertCircle, X, Loader2 
} from 'lucide-vue-next'

const deviceStore = useDeviceStore()
const notify = inject<(title: string, msg: string, type: 'success' | 'error' | 'info') => void>('notify')!

const showModal = ref(false)
const isEditMode = ref(false)
const currentEditId = ref<number | string | null>(null)
const submitting = ref(false)

const form = reactive({
  ipNvr: '',
  ipWeb: '',
  userName: '',
  password: '',
  brand: 'HIKVision'
})

const openAddModal = () => {
  isEditMode.value = false
  currentEditId.value = null
  Object.assign(form, { ipNvr: '', ipWeb: '', userName: '', password: '', brand: 'HIKVision' })
  showModal.value = true
}

const openEditModal = (device: any) => {
  isEditMode.value = true
  currentEditId.value = device.id
  Object.assign(form, { ...device, password: '' }) // Clear password for security/UI
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    if (isEditMode.value && currentEditId.value !== null) {
      const data: any = { ...form }
      if (!data.password) delete data.password
      await deviceStore.updateDevice(currentEditId.value, data)
      notify('Success', 'Infrastructure parameters updated', 'success')
    } else {
      await deviceStore.addDevice({ ...form })
      notify('Success', 'New device integrated into network', 'success')
    }
    closeModal()
  } catch (err) {
    notify('Error', 'Failed to commit changes to core', 'error')
  } finally {
    submitting.value = false
  }
}

const toggleStatus = async (device: any) => {
  const newStatus = !device.status
  await deviceStore.updateDevice(device.id, { status: newStatus })
  notify(newStatus ? 'Activated' : 'Standby', `Device hardware is now ${newStatus ? 'online' : 'paused'}`, 'info')
}

const handleDelete = async (id: number | string) => {
  if (confirm('Are you absolutely sure you want to purge this device from the network?')) {
    await deviceStore.deleteDevice(id)
    notify('Purged', 'Device removed from infrastructure registry', 'info')
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.95); }
</style>
