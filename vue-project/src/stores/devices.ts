import { defineStore } from 'pinia'
import { ref } from 'vue'
import { API_CONFIG } from '../config'

export const useDeviceStore = defineStore('devices', () => {
    const devices = ref([
        { id: 1, ipNvr: '192.168.1.10', ipWeb: '192.168.1.100', userName: 'admin', brand: 'HIKVision', status: true },
        { id: 2, ipNvr: '192.168.1.11', ipWeb: '192.168.1.101', userName: 'admin', brand: 'HIKVision', status: false }
    ])

    // --- REAL API: FETCH ALL DEVICES ---
    /*
    async function fetchDevices() {
        const response = await fetch(`${API_CONFIG.BASE_URL}/devices`)
        devices.value = await response.json()
    }
    */

    async function addDevice(device: any) {
        // --- REAL API: POST NEW DEVICE ---
        /*
        const response = await fetch(`${API_CONFIG.BASE_URL}/devices`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(device)
        })
        const newDevice = await response.json()
        devices.value.push(newDevice)
        return newDevice
        */

        return new Promise((resolve) => {
            setTimeout(() => {
                const newDevice = { ...device, id: Date.now(), status: true }
                devices.value.push(newDevice)
                resolve(newDevice)
            }, 500)
        })
    }

    async function updateDevice(id: number | string, data: any) {
        // --- REAL API: PUT UPDATED DATA ---
        /*
        const response = await fetch(`${API_CONFIG.BASE_URL}/devices/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        const updated = await response.json()
        const idx = devices.value.findIndex(d => d.id === id)
        if (idx !== -1) devices.value[idx] = updated
        return updated
        */

        return new Promise((resolve) => {
            setTimeout(() => {
                const index = devices.value.findIndex(d => d.id === id)
                if (index !== -1) {
                    devices.value[index] = { ...devices.value[index], ...data }
                }
                resolve(devices.value[index])
            }, 300)
        })
    }

    async function deleteDevice(id: number | string) {
        // --- REAL API: DELETE ---
        /*
        await fetch(`${API_CONFIG.BASE_URL}/devices/${id}`, { method: 'DELETE' })
        */
        devices.value = devices.value.filter(d => d.id !== id)
    }

    return { devices, addDevice, updateDevice, deleteDevice }
})
