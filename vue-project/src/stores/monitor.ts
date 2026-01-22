import { defineStore } from 'pinia'
import { ref } from 'vue'
import { API_CONFIG } from '../../public/config'
import { apiFetch } from '@/stores/utils/apiFetch'

export interface TimeRange {
    start_time: string
    end_time: string
}

export interface RecordDay {
    record_date: string
    has_record: boolean
    time_ranges: TimeRange[]
}

export interface ChannelInfo {
    id: number
    channel_no: number
    name: string
    oldest_record_date: string | null
    latest_record_date: string | null
}

export interface ChannelData {
    channel: ChannelInfo
    record_days: RecordDay[]
}

export interface MonthDataResponse {
    oldest_record_month: string | null
    channels: ChannelData[]
}

export interface MonitorSetting {
    id: number
    start_day: number
    end_day: number
    order: boolean
}

export const useMonitorStore = defineStore('monitor', () => {
    const monthData = ref<MonthDataResponse | null>(null)
    const config = ref<MonitorSetting | null>(null)

    // =========================
    // GET: /api/devices/{id}/channels/month_data/{date_str}
    // =========================
    async function fetchMonthData(deviceId: number | string, dateStr: string) {
        // dateStr format: YYYY-MM
        const response = await apiFetch(`${API_CONFIG.BASE_URL}/api/devices/${deviceId}/channels/month_data/${dateStr}`)
        monthData.value = response
        return response
    }

    // =========================
    // GET: /api/config
    // =========================
    async function fetchConfig() {
        const response = await apiFetch(`${API_CONFIG.BASE_URL}/api/config`)
        config.value = response
        return response
    }

    // =========================
    // POST: /api/config
    // =========================
    async function updateConfig(startDay: number, endDay: number, order: boolean) {
        const payload = {
            start_day: startDay,
            end_day: endDay,
            order: order
        }
        const response = await apiFetch(`${API_CONFIG.BASE_URL}/api/config`, {
            method: 'POST',
            body: JSON.stringify(payload)
        })

        // Update local state on success
        if (config.value) {
            config.value.start_day = startDay
            config.value.end_day = endDay
            config.value.order = order
        }

        return response
    }

    return {
        monthData,
        config,
        fetchMonthData,
        fetchConfig,
        updateConfig
    }
})
