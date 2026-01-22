import { defineStore } from 'pinia'
import { ref } from 'vue'
import { API_CONFIG } from '../../public/config'
import { apiFetch } from '@/stores/utils/apiFetch'

export interface LogItem {
    time: string
    majorType: string
    minorType: string
    localId: string
    userName: string
    ipAddress: string
    channelNo: string | number
}

export interface LogResponse {
    device_id: number
    total: number
    logs: LogItem[]
}

export const useDeviceLogsStore = defineStore('deviceLogs', () => {
    const logs = ref<LogItem[]>([])
    const total = ref(0)
    const loading = ref(false)

    // Filters
    const dateFrom = ref(new Date(new Date().setDate(new Date().getDate() - 1))) // Yesterday
    const dateTo = ref(new Date()) // Today
    const maxResults = ref(100)
    const majorType = ref('ALL')

    // Mappings
    const MINOR_TYPE_MAP: Record<string, string> = {
        "alarmOut": "Alarm Output",
        "alarmIn": "Alarm Input",
        "motionStart": "Start Motion Detection",
        "motionStop": "Stop Motion Detection",
        "hideStart": "Start Video Tampering",
        "hideStop": "Stop Video Tampering",
        "vcaStart": "Start VCA Alarm",
        "vcaStop": "Stop VCA Alarm",
        "remoteLogin": "Remote: Login",
        "remoteLogout": "Remote: Logout",
        "lineDetectionStart": "Line Crossing Detection Started",
        "lineDetectionStop": "Line Crossing Detection Stopped",
        "fieldDetectionStart": "Intrusion Detection Started",
        "fieldDetectionStop": "Intrusion Detection Stop",
        "audioInputExceptionStart": "Audio Input Exception Started",
        "audioInputExceptionStop": "Audio Input Exception Stop",
        "soundIntensityMutationStart": "Sudden change of Sound Intensity Detection Started",
        "soundIntensityMutationStop": "Sudden change of Sound Intensity Detection Stop",
        "runStatusInfo": "System Running State",
        "hddInfo": "HDD information",
        "ipcDisconnect": "IP Camera Disconnect",
        "videoLost": "Video Signal Loss",
        "illlegealAccess": "Illegal Login",
        "netBroken": "Network Disconnected",
        "recordError": "Record/Capture Error",
        "hdFull": "HDD Full",
        "hdError": "HDD Error",
        "ipConflict": "IP Address Conflicted",
        "videoException": "Video Signal Exception",
        "videoFormatMismatch": "Input/Output Video Standard Mismatch",
        "ipcIpConfilict": "Ip Address of IPC Conflict",
        "viAndResMismatch": "Video resolution Mismatch",
        "spareException": "Hot Spare Exception",
        "startIpcMasException": "IPC Motion Analysis Exception",
        "anrRecordException": "ANR Record Exception",
        "recordOverFLow": "Record Buffer Overflow",
        "ipcmCrash": "IPCM Abnormal Reboot",
        "poePowerException": "POE Power Exception",
        "uploadDataCsException": "Data Upload Exception",
        "dialException": "Wireless Dial-Up Exception"
    }

    function getMinorLabel(type: string): string {
        return MINOR_TYPE_MAP[type] || type
    }

    async function fetchLogs(deviceId: number | string) {
        loading.value = true
        try {
            // Format Dates to ISO string or whatever backend expects
            // Spec says: "from": str (datetime)
            const payload = {
                from: dateFrom.value.toISOString(),
                to: dateTo.value.toISOString(),
                maxResults: maxResults.value,
                majorType: majorType.value
            }

            const res = await apiFetch(`${API_CONFIG.BASE_URL}/api/logs/device/${deviceId}`, {
                method: 'POST',
                body: JSON.stringify(payload)
            }) as LogResponse

            logs.value = res.logs
            total.value = res.total
        } finally {
            loading.value = false
        }
    }

    return {
        logs,
        total,
        loading,
        dateFrom,
        dateTo,
        maxResults,
        majorType,
        fetchLogs,
        getMinorLabel
    }
})
