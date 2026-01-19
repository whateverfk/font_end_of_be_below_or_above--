import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { API_CONFIG } from '../config'
import { decodeJwt } from '@/stores/utils/jwt'

function mapUserFromJwt(decoded: any) {
  return {
    username: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
    role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
    userId: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
    superAdminId: decoded.superAdminId,
    exp: decoded.exp,
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<any>(null)

  // ===== INIT FROM TOKEN =====
  if (token.value) {
    const decoded = decodeJwt(token.value)

    if (decoded && decoded.exp * 1000 > Date.now()) {
      user.value = mapUserFromJwt(decoded)
    } else {
      logout()
    }
  }

  // ===== LOGIN =====
  async function login(username: string, password: string) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      throw new Error('Invalid credentials')
    }

    const data = await response.json()

    token.value = data.token
    localStorage.setItem('token', data.token)

    const decoded = decodeJwt(data.token)
    user.value = mapUserFromJwt(decoded)

    return user.value
  }

  // ===== LOGOUT =====
  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  // ===== CHANGE PASSWORD =====
  async function updatePassword(oldPass: string, newPass: string) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`,
      },
      body: JSON.stringify({
        old_password: oldPass,
        new_password: newPass,
      }),
    })

    if (!response.ok) {
      throw new Error('Change password failed')
    }

    return await response.json()
  }

  // ===== COMPUTED =====
  const isAuthenticated = computed(() => {
    if (!token.value || !user.value) return false
    return user.value.exp * 1000 > Date.now()
  })

  const isSuperAdmin = computed(() => user.value?.role === 'SuperAdmin')

  return {
    token,
    user,
    isAuthenticated,
    isSuperAdmin,
    login,
    logout,
    updatePassword,
  }
})
