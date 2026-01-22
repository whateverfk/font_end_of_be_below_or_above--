import { defineStore } from 'pinia'
import { ref } from 'vue'
import { API_CONFIG } from '../../public/config'
import { apiFetch } from '@/stores/utils/apiFetch'

export interface SystemInfo {
    device_id: number
    model: string
    serial_number: string
    firmware_version: string
    mac_address: string
}

export interface StorageInfo {
    hdd_id: number
    hdd_name: string
    status: string
    hdd_type: string
    capacity: number
    free_space: number
    property: string
}

export interface OnvifUser {
    user_id: number
    username: string
    level: string
}

export interface DeviceUser {
    id: number
    user_id: number
    user_name: string
    role: string
    is_active: boolean
}

export const useDeviceDetailStore = defineStore('deviceDetail', () => {
    // State
    const systemInfo = ref<SystemInfo | null>(null)
    const storageList = ref<StorageInfo[]>([])
    const onvifUsers = ref<OnvifUser[]>([])
    const deviceUsers = ref<DeviceUser[]>([])

    const loading = ref({
        info: false,
        storage: false,
        onvif: false,
        users: false
    })

    // Actions: System Info
    async function fetchSystemInfo(id: number | string) {
        loading.value.info = true
        try {
            const data = await apiFetch(`${API_CONFIG.BASE_URL}/api/device/${id}/infor`)
            systemInfo.value = data
        } finally {
            loading.value.info = false
        }
    }

    async function syncSystemInfo(id: number | string) {
        loading.value.info = true
        try {
            const res = await apiFetch(`${API_CONFIG.BASE_URL}/api/device/${id}/infor/sync`, {
                method: 'POST'
            })
            // If sync successful, update local state from response data
            if (res.status === 'ok' && res.data) {
                systemInfo.value = {
                    device_id: Number(id),
                    ...res.data
                }
            }
        } finally {
            loading.value.info = false
        }
    }

    // Actions: Storage (Stub for now)
    async function fetchStorage(id: number | string) {
        loading.value.storage = true
        try {
            const data = await apiFetch(`${API_CONFIG.BASE_URL}/api/device/${id}/infor/storage`)
            storageList.value = data
        } finally {
            loading.value.storage = false
        }
    }

    async function syncStorage(id: number | string) {
        // Trigger sync then re-fetch
        await apiFetch(`${API_CONFIG.BASE_URL}/api/device/${id}/infor/storage`, { method: 'POST' })
        await fetchStorage(id)
    }

    // Actions: ONVIF Users (Stub for now)
    async function fetchOnvifUsers(id: number | string) {
        loading.value.onvif = true
        try {
            const data = await apiFetch(`${API_CONFIG.BASE_URL}/api/device/${id}/infor/onvif-users`)
            onvifUsers.value = data
        } finally {
            loading.value.onvif = false
        }
    }

    async function syncOnvifUsers(id: number | string) {
        await apiFetch(`${API_CONFIG.BASE_URL}/api/device/${id}/infor/onvif-users`, { method: 'POST' })
        await fetchOnvifUsers(id)
    }

    // Actions: Device Users (Stub for now)
    async function fetchDeviceUsers(id: number | string) {
        loading.value.users = true
        try {
            const data = await apiFetch(`${API_CONFIG.BASE_URL}/api/device/${id}/user`)
            deviceUsers.value = data
        } finally {
            loading.value.users = false
        }
    }

    async function syncDeviceUsers(id: number | string) {
        await apiFetch(`${API_CONFIG.BASE_URL}/api/device/${id}/user/sync`, { method: 'POST' })
        await fetchDeviceUsers(id)
    }

    return {
        systemInfo,
        storageList,
        onvifUsers,
        deviceUsers,
        loading,
        fetchSystemInfo,
        syncSystemInfo,
        fetchStorage,
        syncStorage,
        fetchOnvifUsers,
        syncOnvifUsers,
        fetchDeviceUsers,
        syncDeviceUsers
    }
})
