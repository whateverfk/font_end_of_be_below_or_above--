import { defineStore } from 'pinia'
import { ref } from 'vue'
import { API_CONFIG } from '../config'
import { apiFetch } from '@/stores/utils/apiFetch'

export interface AlarmItem {
  id: number
  device_id: number | null
  device_ip_web: string | null
  event: string
  channel_id_in_device: string | null
  channel_name: string | null
  message: string
  created_at: string // datetime string
}

export const useAlarmStore = defineStore('alarms', () => {
  const alarms = ref<AlarmItem[]>([])
  const nextCursorTime = ref<string | null>(null)
  const nextCursorId = ref<number | null>(null)
  const hasMore = ref(true)

  // =========================
  // GET: /api/user/alarm
  // =========================
  async function fetchAlarms(isLoadMore = false) {
    // If not loading more (fresh load), reset state
    if (!isLoadMore) {
      alarms.value = []
      nextCursorTime.value = null
      nextCursorId.value = null
      hasMore.value = true
    }

    if (!hasMore.value && isLoadMore) return

    const params = new URLSearchParams()
    if (nextCursorTime.value) params.append('cursor_time', nextCursorTime.value)
    if (nextCursorId.value) params.append('cursor_id', nextCursorId.value.toString())

    // Spec: GET /api/user/alarm
    const response = await apiFetch(`${API_CONFIG.BASE_URL}/api/user/alarm?${params.toString()}`)

    if (isLoadMore) {
      alarms.value.push(...response.items)
    } else {
      alarms.value = response.items
    }

    nextCursorTime.value = response.next_cursor_time
    nextCursorId.value = response.next_cursor_id
    hasMore.value = response.has_more
  }

  // Wrapper for view usage
  async function loadMore() {
    await fetchAlarms(true)
  }

  // =========================
  // DELETE: /api/user/alarm/{id}
  // =========================
  async function deleteAlarm(id: number) {
    await apiFetch(`${API_CONFIG.BASE_URL}/api/user/alarm/${id}`, { method: 'DELETE' })
    alarms.value = alarms.value.filter(a => a.id !== id)
  }

  // =========================
  // DELETE: /api/user/alarm
  // =========================
  async function deleteAll() {
    await apiFetch(`${API_CONFIG.BASE_URL}/api/user/alarm`, { method: 'DELETE' })
    alarms.value = []
    hasMore.value = false
  }

  return {
    alarms,
    hasMore,
    fetchAlarms,
    loadMore,
    deleteAlarm,
    deleteAll
  }
})
