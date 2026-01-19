export function decodeJwt(token: string | undefined) {
  try {
    if (!token || token.split('.').length !== 3) {
      throw new Error('Invalid JWT format')
    }

    const payload = token.split('.')[1]
    return JSON.parse(atob(payload as string))
  } catch (err) {
    console.warn('Invalid JWT token:', err)
    return null
  }
}
