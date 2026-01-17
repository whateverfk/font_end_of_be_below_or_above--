<template>
  <div class="h-full w-full">
    <AppLayout />
    <ToastProvider ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, provide } from 'vue'
import AppLayout from '../components/AppLayout.vue'
import ToastProvider from '../components/ToastProvider.vue'

const toastProvider = ref<{ addToast: (title: string, msg: string, type: string) => void } | null>(null)

// Provide toast function to all children
const handleNotify = (title: string, message: string, type: 'success' | 'error' | 'info') => {
  toastProvider.value?.addToast(title, message, type)
}

provide('notify', handleNotify)
</script>
