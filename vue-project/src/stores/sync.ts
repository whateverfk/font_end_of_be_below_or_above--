import { defineStore } from 'pinia'
import { ref } from 'vue'
import { API_CONFIG } from '../config'

export const useSyncStore = defineStore('sync', () => {
    const isAutoSyncEnabled = ref(true)
    const syncInterval = ref(30)
    const lastSync = ref('2024-03-20 10:15:00')
    const syncLogs = ref([
        { id: 1, time: '10:15:00', status: 'Success', message: 'Registry integrity check passed' },
        { id: 2, time: '09:45:00', status: 'Success', message: 'Diff sync completed' }
    ])
    const isSyncing = ref(false)

    async function saveSettings(enabled: boolean, interval: number) {
        // --- REAL API ---
        /*
        await fetch(`${API_CONFIG.BASE_URL}/sync/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled, interval })
        })
        */
        isAutoSyncEnabled.value = enabled
        syncInterval.value = interval
    }

    async function syncNow() {
        isSyncing.value = true
        try {
            // --- REAL API ---
            /*
            const response = await fetch(`${API_CONFIG.BASE_URL}/sync/trigger`, { method: 'POST' })
            const log = await response.json()
            syncLogs.value.unshift(log)
            lastSync.value = log.time
            */

            await new Promise((resolve) => {
                setTimeout(() => {
                    const now = new Date().toLocaleTimeString()
                    syncLogs.value.unshift({ id: Date.now(), time: now, status: 'Success', message: 'Manual sync completed via Mock' })
                    lastSync.value = `2024-03-20 ${now}`
                    resolve(true)
                }, 1500)
            })
        } finally {
            isSyncing.value = false
        }
    }

    return { isAutoSyncEnabled, syncInterval, lastSync, syncLogs, isSyncing, saveSettings, syncNow }
})
