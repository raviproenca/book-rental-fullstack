import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'boot/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token'))
  const user = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))

  const setTokenInHeaders = () => {
    if (token.value) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
    }
  }

  setTokenInHeaders()

  const login = async (credentials) => {
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      delete api.defaults.headers.common['Authorization']

      const response = await api.post('/auth/login', credentials)
      // localStorage.setItem('user', JSON.stringify(credentials)) // Storing credentials is unsafe and unnecessary if we have token/user info

      if (response.data.token) {
        token.value = response.data.token
        localStorage.setItem('token', token.value)

        user.value = {
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
        }
        localStorage.setItem('userInfo', JSON.stringify(user.value))

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

  const isAdmin = () => {
    return user.value?.role === 'ADMIN'
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    token.value = null
    user.value = null
    delete api.defaults.headers.common['Authorization']
  }

  return {
    token,
    user,
    login,
    isAdmin,
    logout,
  }
})
