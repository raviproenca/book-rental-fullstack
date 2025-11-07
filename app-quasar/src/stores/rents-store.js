import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'boot/api'

export const useRentsStore = defineStore('rents', () => {
  const rents = ref([])
  const totalItems = ref(0)
  const loading = ref(false)
  const error = ref(null)

  const fetchRents = async (paginationData, searchFilter) => {
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

      const response = await api.get('/rent', { params })

      rents.value = response.data.content
      totalItems.value = response.data.totalElements

      if (response.data.totalElements === 0 && page > 0) {
        return fetchRents({ ...paginationData, page: 1 }, searchFilter)
      }
    } catch (err) {
      error.value = err.response ? err.response.data.message : 'Erro ao buscar aluguéis.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const registerRent = async (rentData) => {
    loading.value = true
    error.value = null
    try {
      await api.post('/rent', rentData)
    } catch (err) {
      error.value = err.response ? err.response.data.message : 'Erro ao registrar aluguel.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const editRent = async (rentId, rentData) => {
    loading.value = true
    error.value = null
    try {
      await api.put(`/rent/${rentId}`, rentData)
    } catch (err) {
      error.value = err.response ? err.response.data.message : 'Erro ao editar aluguel.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const confirmRent = async (rentId) => {
    loading.value = true
    error.value = null
    try {
      await api.put(`/rent/update/${rentId}`)
    } catch (err) {
      error.value = err.response ? err.response.data.message : 'Erro ao confirmar aluguel.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    rents,
    totalItems,
    loading,
    error,
    fetchRents,
    registerRent,
    editRent,
    confirmRent,
  }
})
