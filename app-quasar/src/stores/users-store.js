import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'boot/api'

export const useUsersStore = defineStore('users', () => {
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchUsers = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/user')
      users.value = response.data
    } catch (err) {
      error.value = err.response ? err.response.data.message : 'Erro ao buscar usuários.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const registerUser = async (userData) => {
    loading.value = true
    error.value = null
    try {
      await api.post('/user', userData)
      await fetchUsers()
    } catch (err) {
      error.value = err.response ? err.response.data.message : 'Erro ao buscar usuários.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const editUser = async (userId, userData) => {
    loading.value = true
    error.value = null
    try {
      await api.put(`/user/${userId}`, userData)
      await fetchUsers()
    } catch (err) {
      error.value = err.response ? err.response.data.message : 'Erro ao buscar usuários.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (userId) => {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/user/${userId}`)
      await fetchUsers()
    } catch (err) {
      error.value = err.response ? err.response.data.message : 'Erro ao buscar usuários.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    loading,
    error,
    fetchUsers,
    registerUser,
    editUser,
    deleteUser,
  }
})
