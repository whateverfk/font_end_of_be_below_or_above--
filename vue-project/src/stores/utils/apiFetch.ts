import { useAuthStore } from '@/stores/auth'

function getToken() {
  return localStorage.getItem('token')
}

function handleUnauthorized() {
  const authStore = useAuthStore()
  authStore.logout()
  window.location.href = '/#/login'
}

export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = getToken()

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    if (res.status === 401) {
      handleUnauthorized()
      throw new Error('Unauthorized - Redirecting to login')
    }
    const errorText = await res.text()
    throw new Error(errorText || 'API error')
  }

  const text = await res.text()
  return text ? JSON.parse(text) : {}
}
