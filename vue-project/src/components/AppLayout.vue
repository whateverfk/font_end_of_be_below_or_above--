<template>
  <div class="flex h-screen w-full overflow-hidden bg-zinc-950 text-zinc-100">
    <!-- Sidebar -->
    <aside
      class="glass w-64 flex-shrink-0 flex flex-col border-r border-white/10 transition-all duration-300"
      :class="{ 'w-20': isCollapsed }"
    >
      <div class="p-6 flex items-center gap-3 overflow-hidden">
        <div class="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center shrink-0">
          <Camera class="w-5 h-5 text-white" />
        </div>
        <span v-if="!isCollapsed" class="font-bold text-xl tracking-tight">VisionPro</span>
      </div>

      <nav class="flex-1 px-3 space-y-1 mt-6">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group"
          :class="[
            $route.path === item.path
              ? 'bg-teal-500/10 text-teal-400'
              : 'hover:bg-white/5 text-zinc-400 hover:text-zinc-100',
          ]"
        >
          <component :is="item.icon" class="w-5 h-5 shrink-0" />
          <span v-if="!isCollapsed" class="font-medium whitespace-nowrap">{{ item.name }}</span>
          <div
            v-if="$route.path === item.path"
            class="ml-auto w-1.5 h-1.5 rounded-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]"
          ></div>
        </router-link>
      </nav>

      <div class="p-4 border-t border-white/5 space-y-2">
        <button
          @click="isCollapsed = !isCollapsed"
          class="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 text-zinc-400 transition-colors"
        >
          <Menu v-if="isCollapsed" class="w-5 h-5" />
          <ChevronLeft v-else class="w-5 h-5" />
          <span v-if="!isCollapsed">Collapse</span>
        </button>

        <button
          @click="handleLogout"
          class="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 transition-colors"
        >
          <LogOut class="w-5 h-5" />
          <span v-if="!isCollapsed">Sign Out</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col overflow-hidden relative">
      <!-- Top Header -->
      <header
        class="h-16 flex items-center justify-between px-8 border-b border-white/5 bg-zinc-950/50 backdrop-blur-md z-10"
      >
        <h1 class="text-lg font-semibold text-zinc-200">{{ currentRouteName }}</h1>

        <div class="flex items-center gap-4">
          <div class="flex flex-col items-end mr-2">
            <span class="text-sm font-medium">{{ auth.user?.username }}</span>
            <span class="text-xs text-zinc-500">{{ auth.user?.role || 'guest' }}</span>
          </div>
          <div
            class="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center font-bold text-zinc-950"
          >
            {{ auth.user?.username.toUpperCase() }}
          </div>
        </div>
      </header>

      <!-- Scrollable body -->
      <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import {
  Camera,
  LayoutDashboard,
  Bell,
  RefreshCw,
  User,
  LogOut,
  ChevronLeft,
  Menu,
  Monitor,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const isCollapsed = ref(false)

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Monitoring', path: '/monitor', icon: Monitor },
  { name: 'Alarms', path: '/alarms', icon: Bell },
  { name: 'Sync Settings', path: '/sync', icon: RefreshCw },
  { name: 'User Profile', path: '/profile', icon: User },
]

const currentRouteName = computed(() => {
  const item = navItems.find((i) => i.path === route.path)
  return item ? item.name : 'View'
})

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
