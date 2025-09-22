import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'boot/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token'))

  const setTokenInHeaders = () => {
    if (token.value) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
    }
  }

  setTokenInHeaders()

  const login = async (credentials) => {
    try {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']

      const response = await api.post('/auth/login', credentials)

      if (response.data.token) {
        token.value = response.data.token
        localStorage.setItem('token', token.value)

        setTokenInHeaders()

        return true
      }
    } catch (error) {
      console.error('Erro no login:', error)
      if (error.response) {
        throw new Error(error.response.data?.message || 'Email ou senha inválidos.')
      }
      throw new Error('Não foi possível conectar ao servidor.')
    }
  }

  return {
    token,
    login,
  }
})
