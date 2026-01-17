import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { API_CONFIG } from '../config'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
    const token = ref(localStorage.getItem('token'))

    async function login(username: string, password: string) {
        // --- REAL API IMPLEMENTATION (HƯỚNG DẪN KẾT NỐI API THẬT) ---
        /*
        const response = await fetch(`${API_CONFIG.BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        if (!response.ok) throw new Error('Unauthorized')
        const data = await response.json()
        token.value = data.token
        user.value = data.user
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        return data
        */

        // MOCK LOGIC (Giao diện hiện tại đang dùng cái này)
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (username === 'admin' && password === 'admin') {
                    const mockData = { id: 1, name: 'Super Admin', role: 'admin' }
                    const mockToken = 'mock-jwt-token-123'
                    user.value = mockData
                    token.value = mockToken
                    localStorage.setItem('user', JSON.stringify(mockData))
                    localStorage.setItem('token', mockToken)
                    resolve(mockData)
                } else {
                    reject(new Error('Invalid credentials'))
                }
            }, 800)
        })
    }

    function logout() {
        user.value = null
        token.value = null
        localStorage.removeItem('user')
        localStorage.removeItem('token')
    }

    async function updatePassword(oldPass: string, newPass: string) {
        // --- REAL API IMPLEMENTATION ---
        /*
        const response = await fetch(`${API_CONFIG.BASE_URL}/user/password`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token.value}`
            },
            body: JSON.stringify({ oldPass, newPass })
        })
        return await response.json()
        */

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, message: 'Password updated in mock database' })
            }, 1000)
        })
    }

    const isAuthenticated = computed(() => !!token.value)

    return { user, token, isAuthenticated, login, logout, updatePassword }
})
