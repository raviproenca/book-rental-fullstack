import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'boot/api'

export const useUsersStore = defineStore('users', () => {
  const users = ref([])
  const totalItems = ref(0)
  const loading = ref(false)
  const error = ref(null)

  const fetchUsers = async (paginationData, searchFilter) => {
    loading.value = true
    error.value = null
    try {
      const page = paginationData.page - 1
      const size = paginationData.rowsPerPage || 10

      let sort = 'id,desc'
      if (paginationData.sortBy) {
        sort = `${paginationData.sortBy},${paginationData.descending ? 'desc' : 'asc'}`
      }

      const params = {
        page: page,
        size: size,
        sort: sort,
        search: searchFilter || undefined,
      }

      const response = await api.get('/user', { params })

      users.value = response.data.content
      totalItems.value = response.data.totalElements

      if (response.data.totalElements === 0 && page > 0) {
        return fetchUsers({ ...paginationData, page: 1 }, searchFilter)
      }
    } catch (err) {
      const message = err.response ? err.response.data.message : 'Erro ao buscar usuários.'
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  const registerUser = async (userData) => {
    loading.value = true
    error.value = null
    try {
      await api.post('/user', userData)
    } catch (err) {
      const message = err.response ? err.response.data.message : 'Erro ao registrar usuários.'
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  const editUser = async (userId, userData) => {
    loading.value = true
    error.value = null
    try {
      await api.put(`/user/${userId}`, userData)
    } catch (err) {
      const message = err.response ? err.response.data.message : 'Erro ao editar usuários.'
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (userId) => {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/user/${userId}`)
    } catch (err) {
      const message = err.response ? err.response.data.message : 'Erro ao deletar usuários.'
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    totalItems,
    loading,
    error,
    fetchUsers,
    registerUser,
    editUser,
    deleteUser,
  }
})
