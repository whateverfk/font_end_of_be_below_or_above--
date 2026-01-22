import { defineStore } from 'pinia'
import { ref } from 'vue'
import { API_CONFIG } from '../../public/config'
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

    const ERROR_MSG_LOW_PRIVILEGE = "You do not have enough privilege to perform this operation"
    const ERROR_MSG_INVALID_OPERATION = "Invalid operation"

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
        const data = {
            device_id: deviceId,
            device_user_id: userId,
            permissions: perms
        }
        try {
            const result = await apiFetch(`${API_CONFIG.BASE_URL}/api/device/${deviceId}/user/${userId}/permissions`, {
                method: 'PUT',
                body: JSON.stringify(data)
            })

            // Backend might return success: true or error: "...""
            if (result.success !== false && !result.error) {
                return {
                    success: true,
                    code: "OK",
                    message: "Permission updated successfully"
                }
            }

            if (result.error === "LOW_PRIVILEGE") {
                return {
                    success: false,
                    code: "LOW_PRIVILEGE",
                    message: ERROR_MSG_LOW_PRIVILEGE
                }
            }

            return {
                success: false,
                code: "INVALID_OPERATION",
                message: ERROR_MSG_INVALID_OPERATION
            }
        } catch (err: any) {
            return {
                success: false,
                code: "ERROR",
                message: err.message || "An unexpected error occurred"
            }
        } finally {
            loading.value.update = false
        }
    }

    async function syncAllUsers(deviceId: number | string) {
        loading.value.syncAll = true
        try {
            const url = `${API_CONFIG.BASE_URL}/api/device/${deviceId}/user/syncall`
            await apiFetch(url, { method: 'POST' })
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
