import { defineStore } from 'pinia'
import { ref } from 'vue'
import { API_CONFIG } from '../config'
import { apiFetch } from '@/stores/utils/apiFetch'

export interface SyncSetting {
    is_enabled: boolean
    interval_minutes: number
}

export interface SyncLog {
    id: number
    device_id: number | null
    ip: string | null
    sync_time: string
    is_success: boolean
    message: string
}

export const useSyncStore = defineStore('sync', () => {
    // State matching SyncSetting
    const isAutoSyncEnabled = ref(false)
    const syncInterval = ref(60)

    const syncLogs = ref<SyncLog[]>([])
    const isSyncing = ref(false)

    // =========================
    // GET: /api/sync/setting
    // =========================
    async function fetchSettings() {
        try {
            const data = await apiFetch(`${API_CONFIG.BASE_URL}/api/sync/setting`)
            isAutoSyncEnabled.value = data.is_enabled
            syncInterval.value = data.interval_minutes
        } catch (e) {
            // Default fallbacks if API fails or 404s on first run
            isAutoSyncEnabled.value = false
            syncInterval.value = 60
        }
    }

    // =========================
    // POST: /api/sync/setting
    // =========================
    async function saveSettings() {
        const payload = {
            is_enabled: isAutoSyncEnabled.value,
            interval_minutes: syncInterval.value
        }
        await apiFetch(`${API_CONFIG.BASE_URL}/api/sync/setting`, {
            method: 'POST',
            body: JSON.stringify(payload)
        })
    }

    // =========================
    // GET: /api/logs
    // =========================
    async function fetchLogs() {
        const data = await apiFetch(`${API_CONFIG.BASE_URL}/api/logs`)
        syncLogs.value = data
    }

    // =========================
    // POST: /api/sync/now
    // =========================
    async function syncNow() {
        isSyncing.value = true
        try {
            await apiFetch(`${API_CONFIG.BASE_URL}/api/sync/now`, { method: 'POST' })
            // Optionally fetch logs after a delay, but usually logs are async.
            // We'll just fetch latest logs immediately to see if any immediate feedback
            await fetchLogs()
        } finally {
            isSyncing.value = false
        }
    }

    return {
        isAutoSyncEnabled,
        syncInterval,
        syncLogs,
        isSyncing,
        fetchSettings,
        saveSettings,
        fetchLogs,
        syncNow
    }
})
