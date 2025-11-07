import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'boot/api'

export const useRentersStore = defineStore('renters', () => {
  const renters = ref([])
  const totalItems = ref(0)
  const loading = ref(false)
  const error = ref(null)

  const fetchRenters = async (paginationData, searchFilter) => {
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

      const response = await api.get('/renter', { params })

      renters.value = response.data.content
      totalItems.value = response.data.totalElements

      if (response.data.totalElements === 0 && page > 0) {
        return fetchRenters({ ...paginationData, page: 1 }, searchFilter)
      }
    } catch (err) {
      error.value = err.response ? err.response.data.message : 'Erro ao buscar locatários.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const registerRenter = async (renterData) => {
    loading.value = true
    error.value = null
    try {
      await api.post('/renter', renterData)
    } catch (err) {
      error.value = err.response ? err.response.data.message : 'Erro ao registrar locatário.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const editRenter = async (renterId, renterData) => {
    loading.value = true
    error.value = null
    try {
      await api.put(`/renter/${renterId}`, renterData)
    } catch (err) {
      error.value = err.response ? err.response.data.message : 'Erro ao editar locatário.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteRenter = async (renterId) => {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/renter/${renterId}`)
    } catch (err) {
      error.value = err.response ? err.response.data.message : 'Erro ao deletar locatário.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    renters,
    totalItems,
    loading,
    error,
    fetchRenters,
    registerRenter,
    editRenter,
    deleteRenter,
  }
})
