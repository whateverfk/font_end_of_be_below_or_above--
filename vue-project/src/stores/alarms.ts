import { defineStore } from 'pinia'
import { ref } from 'vue'
import { API_CONFIG } from '../config'

export const useAlarmStore = defineStore('alarms', () => {
    const alarms = ref([
        { id: 1, type: 'Motion', location: 'Gate 01', time: '10:05:22 AM', date: '2024-03-20', severity: 'high' },
        { id: 2, type: 'Tamper', location: 'Storage A', time: '09:44:10 AM', date: '2024-03-20', severity: 'medium' },
        { id: 3, type: 'Connectivity', location: 'Server Node 4', time: '08:12:05 AM', date: '2024-03-20', severity: 'low' }
    ])

    async function loadMore() {
        // --- REAL API ---
        /*
        const response = await fetch(`${API_CONFIG.BASE_URL}/alarms/history?offset=${alarms.value.length}`)
        const newData = await response.json()
        alarms.value.push(...newData)
        */

        return new Promise((resolve) => {
            setTimeout(() => {
                const more = [
                    { id: Date.now(), type: 'System', location: 'Mock DB', time: '07:00:00 AM', date: '2024-03-20', severity: 'low' }
                ]
                alarms.value = [...alarms.value, ...more]
                resolve(true)
            }, 500)
        })
    }

    async function clearAll() {
        // --- REAL API ---
        /*
        await fetch(`${API_CONFIG.BASE_URL}/alarms`, { method: 'DELETE' })
        */
        alarms.value = []
    }

    return { alarms, loadMore, clearAll }
})
