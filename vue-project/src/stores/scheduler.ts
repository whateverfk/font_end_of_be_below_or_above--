import { defineStore } from 'pinia'
import { ref } from 'vue'
import { API_CONFIG } from '../config'
import { apiFetch } from '@/stores/utils/apiFetch'

export interface Channel {
  device_id: number
  id: number
  channel_no: number
  name: string
  schedule_enable?: boolean
}

export interface TimeParams {
  day_start: string
  time_start: string
  day_end: string
  time_end: string
  mode: string
}

export interface RecordingModeResponse {
  device_id: number
  channel_id: number
  channel_no: number
  name: string
  schedule_enable: boolean
  default_mode: string
  timeline: TimeParams[]
}

export const useSchedulerStore = defineStore('scheduler', () => {
  const channels = ref<Channel[]>([])
  // Map channelId -> Recording Mode Data
  const channelModes = ref<Record<number, RecordingModeResponse>>({})
  const loading = ref({
    channels: false,
    mode: false,
    sync: false,
    syncAll: false,
  })

  // Mode Colors & Labels
  const MODE_CONFIG = {
    CMR: { label: 'Continuous', color: 'bg-emerald-500' },
    MOTION: { label: 'Motion', color: 'bg-amber-500' },
    ALARM: { label: 'Alarm', color: 'bg-rose-500' },
    EDR: { label: 'Motion | Alarm', color: 'bg-purple-500' },
    ALARMANDMOTION: { label: 'Motion & Alarm', color: 'bg-blue-500' },
    AllEvent: { label: 'Event', color: 'bg-cyan-500' },
  } as const

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  async function fetchChannels(deviceId: number | string) {
    loading.value.channels = true
    try {
      const data = await apiFetch(`${API_CONFIG.BASE_URL}/api/devices/${deviceId}/channels`)
      // Backend returns list of channels directly?
      // Assuming response is [ { channel_id, ... }, ... ] based on planPhase2
      console.log('[fetchChannels] raw data:', data)
      console.log('[fetchChannels] type:', typeof data)
      console.log('[fetchChannels] isArray:', Array.isArray(data))
      if (Array.isArray(data)) {
        channels.value = data.sort((a, b) => a.channel_no - b.channel_no)
      }
    } finally {
      loading.value.channels = false
    }
  }

  async function fetchRecordingMode(deviceId: number | string, channelId: number) {
    if (channelModes.value[channelId]) return // Return cached if exists? Or force refresh?
    // Let's allow force refresh logic in UI if needed, but for now simple fetch

    loading.value.mode = true
    try {
      const data = await apiFetch(
        `${API_CONFIG.BASE_URL}/api/device/${deviceId}/channel/${channelId}/infor/recording-mode`,
      )
      channelModes.value[channelId] = data
    } finally {
      loading.value.mode = false
    }
  }

  async function syncRecordingMode(deviceId: number | string, channelId: number) {
    loading.value.sync = true
    try {
      await apiFetch(
        `${API_CONFIG.BASE_URL}/api/device/${deviceId}/channel/${channelId}/infor/recording-mode/sync`,
        {
          method: 'POST',
        },
      )
      // Re-fetch to get updated data
      await fetchRecordingMode(deviceId, channelId)
    } finally {
      loading.value.sync = false
    }
  }

  async function syncAllRecordingModes(deviceId: number | string) {
    loading.value.syncAll = true
    try {
      await apiFetch(`${API_CONFIG.BASE_URL}/api/device/${deviceId}/channels/recording-mode/sync`, {
        method: 'POST',
      })
      await fetchChannels(deviceId)
    } finally {
      loading.value.syncAll = false
    }
  }

  return {
    channels,
    channelModes,
    loading,
    MODE_CONFIG,
    DAYS,
    fetchChannels,
    fetchRecordingMode,
    syncRecordingMode,
    syncAllRecordingModes,
  }
})
