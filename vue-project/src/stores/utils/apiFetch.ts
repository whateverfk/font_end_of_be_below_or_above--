function getToken() {
  return localStorage.getItem('token')
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
    const errorText = await res.text()
    throw new Error(errorText || 'API error')
  }

  const text = await res.text()
  return text ? JSON.parse(text) : {}
}
