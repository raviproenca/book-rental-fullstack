import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'boot/api'
import { useQuasar } from 'quasar'

export const useUsersStore = defineStore('users', () => {
  const users = ref([])
  const totalItems = ref(0)
  const loading = ref(false)
  const error = ref(null)
  const $q = useQuasar()

  const fetchUsers = async (paginationData, searchFilter) => {
    loading.value = true
    error.value = null
    try {
      const page = paginationData.page - 1
      const size = paginationData.rowsPerPage || 10

      let sort = null
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
      error.value = err.response ? err.response.data.message : 'Erro ao buscar usuários.'
      $q.notify({ type: 'negative', message: error.value })
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
    } catch (err) {
      error.value = err.response ? err.response.data.message : 'Erro ao buscar usuários.'
      throw err
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
