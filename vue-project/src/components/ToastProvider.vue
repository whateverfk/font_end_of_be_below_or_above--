<template>
  <div class="fixed top-6 right-6 z-[100] flex flex-col gap-3 w-80">
    <TransitionGroup name="toast">
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        class="glass-card p-4 flex items-start gap-3 shadow-2xl overflow-hidden group relative"
        :class="toastClasses(toast.type)"
      >
        <div class="shrink-0 mt-0.5">
          <CheckCircle v-if="toast.type === 'success'" class="w-5 h-5 text-emerald-400" />
          <AlertCircle v-else-if="toast.type === 'error'" class="w-5 h-5 text-rose-400" />
          <Info v-else class="w-5 h-5 text-teal-400" />
        </div>
        
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-zinc-100">{{ toast.title }}</p>
          <p class="text-xs text-zinc-400 mt-0.5 line-clamp-2">{{ toast.message }}</p>
        </div>

        <button @click="removeToast(toast.id)" class="shrink-0 text-zinc-600 hover:text-zinc-300">
          <X class="w-4 h-4" />
        </button>

        <!-- Progress bar -->
        <div 
          class="absolute bottom-0 left-0 h-0.5 bg-current opacity-20 transition-all duration-[3000ms] linear"
          :style="{ width: '100%' }"
        ></div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-vue-next'

const toasts = ref([])
let toastId = 0

const addToast = (title, message, type = 'info') => {
  const id = ++toastId
  toasts.value.push({ id, title, message, type })
  setTimeout(() => removeToast(id), 3000)
}

const removeToast = (id) => {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

const toastClasses = (type) => {
  switch (type) {
    case 'success': return 'border-emerald-500/20 text-emerald-400'
    case 'error': return 'border-rose-500/20 text-rose-400'
    default: return 'border-teal-500/20 text-teal-400'
  }
}

defineExpose({ addToast })
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(30px) scale(0.9);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px) opacity(0);
}
</style>
