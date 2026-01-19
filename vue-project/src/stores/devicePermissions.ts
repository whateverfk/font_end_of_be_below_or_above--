import { defineStore } from 'pinia'
import { ref } from 'vue'
import { API_CONFIG } from '../config'
import { apiFetch } from '@/stores/utils/apiFetch'

export interface PermissionScope {
    global: Record<string, boolean>
    channels: Record<string, number[]>
}

export interface UserPermissions {
    local: PermissionScope
    remote: PermissionScope
}

export const useDevicePermissionsStore = defineStore('devicePermissions', () => {
    const permissions = ref<UserPermissions | null>(null)
    const loading = ref({
        fetch: false,
        update: false,
        sync: false,
        syncAll: false
    })

    const PERMISSION_LABELS: Record<string, string> = {
        upgrade: "Upgrade / Format",
        parameter_config: "Parameter Configuration",
        restart_or_shutdown: "Shutdown / Reboot",
        log_or_state_check: "Log / Status Check",
        manage_channel: "Camera Management",
        playback: "Playback",
        record: "Manual Record",
        backup: "Video Export",
        ptz_control: "PTZ Control",
        preview: "Live View",
        voice_talk: "Two-way Audio",
        alarm_out_or_upload: "Notify Surveillance Center / Trigger Alarm Output",
        control_local_out: "Video Output Control",
        transparent_channel: "Serial Port Control",
    }

    const SCOPE_PERMISSION_WHITELIST = {
        local: [
            "upgrade", "parameter_config", "restart_or_shutdown", "log_or_state_check",
            "manage_channel", "playback", "record", "backup", "ptz_control",
        ],
        remote: [
            "parameter_config", "log_or_state_check", "upgrade", "voice_talk",
            "restart_or_shutdown", "alarm_out_or_upload", "control_local_out",
            "transparent_channel", "manage_channel", "preview", "record",
            "playback", "ptz_control",
        ],
    }

    const CHANNEL_BASED_PERMISSIONS = [
        "preview", "playback", "record", "backup", "ptz_control",
    ]

    async function fetchPermissions(deviceId: number | string, userId: number) {
        loading.value.fetch = true
        try {
            const data = await apiFetch(`${API_CONFIG.BASE_URL}/api/device/${deviceId}/user/${userId}/permissions`)
            permissions.value = data
        } finally {
            loading.value.fetch = false
        }
    }

    async function syncPermissions(deviceId: number | string, userId: number) {
        loading.value.sync = true
        try {
            await apiFetch(`${API_CONFIG.BASE_URL}/api/device/${deviceId}/user/${userId}/permissions/sync`, { method: 'POST' })
            await fetchPermissions(deviceId, userId)
        } finally {
            loading.value.sync = false
        }
    }

    async function updatePermissions(deviceId: number | string, userId: number, perms: UserPermissions) {
        loading.value.update = true
        try {
            await apiFetch(`${API_CONFIG.BASE_URL}/api/device/${deviceId}/user/${userId}/permissions`, {
                method: 'PUT',
                body: JSON.stringify(perms)
            })
        } finally {
            loading.value.update = false
        }
    }

    async function syncAllUsers(deviceId: number | string) {
        loading.value.syncAll = true
        try {
            await apiFetch(`${API_CONFIG.BASE_URL}/api/device/${deviceId}/user/syncall`, { method: 'POST' })
        } finally {
            loading.value.syncAll = false
        }
    }

    return {
        permissions,
        loading,
        PERMISSION_LABELS,
        SCOPE_PERMISSION_WHITELIST,
        CHANNEL_BASED_PERMISSIONS,
        fetchPermissions,
        syncPermissions,
        updatePermissions,
        syncAllUsers
    }
})
