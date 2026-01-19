import { defineStore } from 'pinia'
import { ref } from 'vue'
import { API_CONFIG } from '../config'
import { apiFetch } from '@/stores/utils/apiFetch'

export const useDeviceStore = defineStore('devices', () => {
  const devices = ref<any[]>([])

  // =========================
  // MAP API -> FRONTEND MODEL
  // =========================
  function mapDeviceFromApi(d: any) {
    return {
      id: d.id,
      ipWeb: d.ip_web,
      ipNvr: d.ip_nvr,
      username: d.username,
      brand: d.brand,
      status: d.is_checked,
    }
  }

  // =========================
  // GET: /api/devices
  // =========================
  async function fetchDevices() {
    const response = await apiFetch(`${API_CONFIG.BASE_URL}/api/devices`)
    devices.value = response.map(mapDeviceFromApi)
  }

  // =========================
  // GET: /api/devices/active
  // =========================
  async function fetchActiveDevices() {
    const response = await apiFetch(`${API_CONFIG.BASE_URL}/api/devices/active`)
    devices.value = response.map(mapDeviceFromApi)
  }

  // =========================
  // POST: /api/devices/test-connection
  // =========================
  async function testConnection(data: any) {
    const payload = {
      ip_web: data.ipWeb,
      username: data.username,
      password: data.password,
      brand: data.brand,
    }
    return await apiFetch(`${API_CONFIG.BASE_URL}/api/devices/test-connection`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  // =========================
  // POST: /api/devices
  // =========================
  async function addDevice(device: any) {
    const payload = {
      ip_web: device.ipWeb,
      ip_nvr: device.ipNvr,
      username: device.username,
      password: device.password,
      brand: device.brand,
      is_checked: device.status ?? true,
    }

    const response = await apiFetch(`${API_CONFIG.BASE_URL}/api/devices`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    await fetchDevices()
    return response
  }

  // =========================
  // PUT: /api/devices/{id}
  // =========================
  async function updateDevice(id: number | string, data: any) {
    const index = devices.value.findIndex((d) => d.id == id)
    const original = index !== -1 ? { ...devices.value[index] } : null

    // Optimistic Update
    if (index !== -1 && original) {
      devices.value[index] = {
        ...original,
        ...data, // This assumes data keys match frontend model (ipWeb etc). 
        // Note: 'status' is correct. 'ipWeb' etc are correct.
      }
    }

    // Payload construction
    const existing = original
    const payload: any = {}

    // We need to use 'existing' values if 'data' is partial.
    // However, since we did optimistic update, devices.value[index] is already merged.
    // But safely constructing payload from 'data' + 'existing' is better.

    payload.ip_web = data.ipWeb ?? existing?.ipWeb
    payload.ip_nvr = data.ipNvr ?? existing?.ipNvr
    payload.username = data.username ?? existing?.username
    payload.brand = data.brand ?? existing?.brand

    if (data.status !== undefined) payload.is_checked = data.status
    else payload.is_checked = existing?.status

    if (data.password) payload.password = data.password

    try {
      await apiFetch(`${API_CONFIG.BASE_URL}/api/devices/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
      // Ensure consistency but don't block UI
      fetchDevices()
    } catch (error) {
      // Revert
      if (index !== -1 && original) {
        devices.value[index] = original
      }
      throw error
    }
  }

  // =========================
  // DELETE: /api/devices/{id}
  // =========================
  async function deleteDevice(id: number | string) {
    await apiFetch(`${API_CONFIG.BASE_URL}/api/devices/${id}`, { method: 'DELETE' })
    await fetchDevices()
  }

  return {
    devices,
    fetchDevices,
    fetchActiveDevices,
    testConnection,
    addDevice,
    updateDevice,
    deleteDevice,
  }
})
