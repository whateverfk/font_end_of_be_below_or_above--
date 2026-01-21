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

      <div v-if="error" class="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
        <div class="p-1 rounded-full bg-red-500/20">
            <X class="w-4 h-4 text-red-500" />
        </div>
        <p class="text-sm text-red-400 font-medium">{{ error }}</p>
      </div>
      </form>

      <p class="mt-8 text-center text-sm text-zinc-500">
        Don't have an account?
        <button @click="openRegisterModal" class="text-teal-400 hover:text-teal-300 font-medium ml-1 outline-none">Register Account</button>
      </p>
    </div>

    <!-- Registration Modal -->
    <div v-if="showRegisterModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div class="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
        <button @click="closeRegisterModal" class="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
          <X class="w-5 h-5" />
        </button>

        <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <User class="w-5 h-5 text-teal-500" />
            Create Account
        </h3>

        <form @submit.prevent="handleRegister" class="space-y-4">
            <div>
                <label class="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 ml-1">Username</label>
                <input
                    v-model="regUsername"
                    type="text"
                    placeholder="Choose a username"
                    class="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all text-white"
                    required
                    minlength="3"
                />
            </div>

            <div>
                <label class="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 ml-1">Password</label>
                <input
                    v-model="regPassword"
                    type="password"
                    placeholder="Choose a password (min 6 chars)"
                    class="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all text-white"
                    required
                    minlength="6"
                />
            </div>

            <div v-if="regError" class="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
                {{ regError }}
            </div>

            <button
                type="submit"
                :disabled="regLoading"
                class="w-full bg-teal-500 hover:bg-teal-400 disabled:bg-teal-800 disabled:text-zinc-400 text-zinc-950 font-bold py-3 rounded-xl shadow-lg shadow-teal-500/20 transform transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
            >
                <Loader2 v-if="regLoading" class="w-4 h-4 animate-spin" />
                <span>{{ regLoading ? 'Creating Account...' : 'Register' }}</span>
            </button>
        </form>
      </div>
    </div>

    <ToastProvider ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { Camera, User, Lock, Eye, EyeOff, Loader2, X } from 'lucide-vue-next'
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
  error.value = null
  try {
    await auth.login(username.value, password.value)
    router.push('/')
  } catch (err: any) {
    // Falls back to simple login feedback if toast system is initializing
    // (window as any).addToast?.('Access Denied', 'Invalid credentials or network timeout', 'error')
    error.value = 'Invalid username or password.'
  } finally {
    loading.value = false
  }
}

// Registration Logic
const showRegisterModal = ref(false)
const regUsername = ref('')
const regPassword = ref('')
const regLoading = ref(false)
const regError = ref<string | null>(null)

const openRegisterModal = () => {
    showRegisterModal.value = true
    regUsername.value = ''
    regPassword.value = ''
    regError.value = null
}

const closeRegisterModal = () => {
    showRegisterModal.value = false
}

const handleRegister = async () => {
    regLoading.value = true
    regError.value = null
    try {
        await auth.register(regUsername.value, regPassword.value)
        showRegisterModal.value = false // Close modal on success
        router.push('/') // Redirect to home
        // Optional: Show success toast via HomeView or global toaster if we had one here
    } catch (err: any) {
        regError.value = err.message || 'Registration failed'
    } finally {
        regLoading.value = false
    }
}
</script>
