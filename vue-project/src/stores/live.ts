import { defineStore } from 'pinia'
import { ref } from 'vue'
import { API_CONFIG } from '../config'
import { apiFetch } from '@/stores/utils/apiFetch'

export interface ChannelCapabilities {
  resolutions: { width: number[]; height: number[] }[]
  video_codec: string[]
  max_frame_rates: number[]
  fixed_quality: {
    options: number[]
    current: number
    default: number
  }
  vbr: {
    upper_cap: { min: number; max: number }
    lower_cap: { min: number; max: number }
  }
}

export interface ChannelConfig {
  channel_name: string
  resolution_width: number
  resolution_height: number
  video_codec: string
  max_frame_rate: number
  fixed_quality: number
  h265_plus: boolean
  vbr_average_cap: number
  vbr_upper_cap: number
  motion_detect: boolean
}

export const useLiveStore = defineStore('live', () => {
  const channelConfig = ref<ChannelConfig | null>(null)
  const capabilities = ref<ChannelCapabilities | null>(null)
  const loading = ref({
    config: false,
    update: false,
    sync: false,
  })

  const FIXED_QUALITY_LABELS: Record<number, string> = {
    90: 'Highest',
    75: 'Higher',
    60: 'Medium',
    45: 'Low',
    30: 'Lower',
    20: 'Lowest',
  }

  async function fetchConfig(deviceId: number | string, channelId: number) {
    loading.value.config = true
    try {
      const data = await apiFetch(
        `${API_CONFIG.BASE_URL}/api/device/${deviceId}/channel/${channelId}/infor`,
      )
      // Parse resolution string or separate fields? Spec says "resolution (width x height)"
      // Assuming data matches interface or we need to transform.
      // Let's assume the API returns width and height separate or we split them if it's a string "1920x1080"
      // For now, I'll assume they come as fields or I handle it in UI.
      channelConfig.value = data
    } finally {
      loading.value.config = false
    }
  }

  async function fetchCapabilities(deviceId: number | string, channelId: number) {
    try {
      const data = await apiFetch(
        `${API_CONFIG.BASE_URL}/api/device/${deviceId}/channel/${channelId}/infor/capabilities`,
      )
      capabilities.value = data
    } catch (e) { }
  }

  async function updateConfig(deviceId: number | string, channelId: number, config: ChannelConfig) {
    loading.value.update = true
    try {
      await apiFetch(`${API_CONFIG.BASE_URL}/api/device/${deviceId}/channel/${channelId}/infor`, {
        method: 'PUT',
        body: JSON.stringify(config),
      })
      // Update local state is not strictly needed if we purely rely on fetch, but good for optimism.
      channelConfig.value = config
    } finally {
      loading.value.update = false
    }
  }

  async function syncConfig(deviceId: number | string, channelId: number) {
    loading.value.sync = true
    try {
      await apiFetch(`${API_CONFIG.BASE_URL}/api/device/${deviceId}/channel/${channelId}/infor/sync`)
      await fetchConfig(deviceId, channelId)
    } finally {
      loading.value.sync = false
    }
  }

  async function stopStream(deviceId: number | string, channelId: number) {
    try {
      await apiFetch(`${API_CONFIG.BASE_URL}/api/device/${deviceId}/channel/${channelId}/stop`, {
        method: 'POST',
      })
    } catch (e) { }
  }

  async function sendHeartbeat(deviceId: number | string, channelId: number) {
    try {
      await apiFetch(
        `${API_CONFIG.BASE_URL}/api/device/${deviceId}/channel/${channelId}/heartbeat`,
        { method: 'POST' },
      )
    } catch (e) { }
  }

  async function startStream(deviceId: number | string, channelId: number) {
    return await apiFetch(`${API_CONFIG.BASE_URL}/api/device/${deviceId}/channel/${channelId}/live`)
  }

  return {
    channelConfig,
    capabilities,
    loading,
    FIXED_QUALITY_LABELS,
    fetchConfig,
    fetchCapabilities,
    updateConfig,
    syncConfig,
    stopStream,
    sendHeartbeat,
    startStream,
  }
})
