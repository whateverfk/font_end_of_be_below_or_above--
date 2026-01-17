<template>
  <div class="h-screen w-full flex items-center justify-center bg-zinc-950 px-6 relative overflow-hidden">
    <!-- Animated background blobs -->
    <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] animate-pulse"></div>
    <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" style="animation-delay: 1s"></div>

    <div class="glass-card w-full max-w-md p-8 relative z-10 shadow-2xl">
      <div class="flex flex-col items-center mb-8">
        <div class="w-16 h-16 rounded-2xl bg-teal-500 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(20,184,166,0.4)]">
          <Camera class="w-10 h-10 text-white" />
        </div>
        <h2 class="text-3xl font-bold tracking-tight">Welcome Back</h2>
        <p class="text-zinc-400 mt-2 text-sm">Please enter your details to sign in</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 ml-1">Username</label>
          <div class="relative group">
            <User class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-teal-400 transition-colors" />
            <input 
              v-model="username"
              type="text" 
              placeholder="admin"
              class="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all placeholder:text-zinc-700"
              required
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 ml-1">Password</label>
          <div class="relative group">
            <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-teal-400 transition-colors" />
            <input 
              v-model="password"
              :type="showPassword ? 'text' : 'password'" 
              placeholder="••••••••"
              class="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all placeholder:text-zinc-700"
              required
            />
            <button 
              type="button" 
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors"
            >
              <Eye v-if="!showPassword" class="w-5 h-5" />
              <EyeOff v-else class="w-5 h-5" />
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="w-full bg-teal-500 hover:bg-teal-400 disabled:bg-teal-800 disabled:text-zinc-400 text-zinc-950 font-bold py-3.5 rounded-xl shadow-lg shadow-teal-500/20 transform transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Loader2 v-if="loading" class="w-5 h-5 animate-spin" />
          <span>{{ loading ? 'Signing in...' : 'Sign In' }}</span>
        </button>
      </form>

      <p class="mt-8 text-center text-sm text-zinc-500">
        Don't have an account? 
        <a href="#" class="text-teal-400 hover:text-teal-300 font-medium ml-1">Contact support</a>
      </p>
    </div>
    
    <ToastProvider ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { Camera, User, Lock, Eye, EyeOff, Loader2 } from 'lucide-vue-next'
import ToastProvider from '../components/ToastProvider.vue'

const router = useRouter()
const auth = useAuthStore()
const toastRef = ref(null)

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref<string | null>(null) // Added to support the new error handling

const handleLogin = async () => {
  loading.value = true
  try {
    await auth.login(username.value, password.value)
    router.push('/')
  } catch (err: any) {
    // Falls back to simple login feedback if toast system is initializing
    (window as any).addToast?.('Access Denied', 'Invalid credentials or network timeout', 'error')
    error.value = 'Security handshake failed. Please verify credentials.'
  } finally {
    loading.value = false
  }
}
</script>
