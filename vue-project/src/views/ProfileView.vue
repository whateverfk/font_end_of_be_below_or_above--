<template>
  <div class="max-w-4xl mx-auto space-y-10 pb-20">
    <!-- Profile Summary header -->
    <div class="flex flex-col md:flex-row items-center gap-8 bg-gradient-to-br from-teal-500/10 to-emerald-500/5 p-10 rounded-3xl border border-white/5 relative overflow-hidden">
      <div class="absolute -right-20 -bottom-20 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl"></div>
      
      <div class="relative">
        <div class="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-teal-500 to-emerald-400">
          <div class="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center text-4xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-teal-500 to-emerald-400">
            {{ auth.user?.username[0].toUpperCase() }}
          </div>
        </div>
        <div class="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-emerald-500 border-4 border-zinc-950 flex items-center justify-center shadow-lg">
          <Check class="w-4 h-4 text-zinc-950 font-bold" />
        </div>
      </div>

      <div class="text-center md:text-left">
        <h2 class="text-4xl font-black text-zinc-100 mb-1 tracking-tight">{{ auth.user?.fullName }}</h2>
        <div class="flex flex-wrap items-center justify-center md:justify-start gap-4">
          <p class="text-zinc-500 flex items-center gap-2">
            <UserIcon class="w-4 h-4" /> @{{ auth.user?.username }}
          </p>
          <div class="w-1.5 h-1.5 rounded-full bg-zinc-800"></div>
          <p class="text-teal-400/80 font-bold text-xs uppercase tracking-widest px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20">System Administrator</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
      <!-- Details Card -->
      <div class="space-y-6">
        <h3 class="text-xl font-bold flex items-center gap-3">
          <ShieldCheck class="w-6 h-6 text-teal-400" /> Account Identity
        </h3>
        
        <div class="glass-card p-6 space-y-6 border-white/5">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-[10px] font-black uppercase text-zinc-600 tracking-widest mb-1.5">User ID</p>
              <p class="text-zinc-300 font-mono text-sm">#{{ auth.user?.id }}</p>
            </div>
            <div>
              <p class="text-[10px] font-black uppercase text-zinc-600 tracking-widest mb-1.5">Access Tier</p>
              <p class="text-emerald-400 font-bold text-sm">Superuser</p>
            </div>
          </div>
          
          <div class="pt-6 border-t border-white/5">
            <p class="text-[10px] font-black uppercase text-zinc-600 tracking-widest mb-3">Permissions</p>
            <div class="flex flex-wrap gap-2">
              <span v-for="tag in ['device_mgr', 'sync_ctrl', 'audit_logs', 'user_write']" :key="tag" class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/5 text-[10px] text-zinc-400 font-mono">
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Change Password Card -->
      <div class="space-y-6">
        <h3 class="text-xl font-bold flex items-center gap-3">
          <KeyRound class="w-6 h-6 text-rose-500" /> Security Access
        </h3>
        
        <form @submit.prevent="updatePassword" class="glass-card p-8 space-y-5 border-white/5">
          <div>
            <label class="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">Current Password</label>
            <input 
              v-model="oldPassword"
              type="password" 
              class="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-rose-500/50"
              required
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">New Secure Password</label>
            <input 
              v-model="newPassword"
              type="password" 
              class="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-teal-500/50"
              required
            />
          </div>

          <button 
            type="submit" 
            :disabled="processing"
            class="w-full py-3.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl border border-white/10 flex items-center justify-center gap-3 group transition-all"
          >
            <Lock v-if="!processing" class="w-4 h-4 group-hover:text-rose-400 transition-colors" />
            <Loader2 v-else class="w-4 h-4 animate-spin" />
            <span>Update Credentials</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import { useAuthStore } from '../stores/auth'
import { 
  User as UserIcon, Check, ShieldCheck, 
  KeyRound, Lock, Loader2 
} from 'lucide-vue-next'

const auth = useAuthStore()
const notify = inject<(title: string, msg: string, type: 'success' | 'error' | 'info') => void>('notify')!

const oldPassword = ref('')
const newPassword = ref('')
const processing = ref(false)

const updatePassword = async () => {
  processing.value = true
  try {
    const res: any = await auth.updatePassword(oldPassword.value, newPassword.value)
    notify('Security Updated', res.message, 'success')
    oldPassword.value = ''
    newPassword.value = ''
  } catch (err: any) {
    notify('Error', err.message || 'Security protocol violation', 'error')
  } finally {
    processing.value = false
  }
}
</script>
