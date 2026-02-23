import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'boot/api'
import { throwApiError } from 'src/utils/api-error'

export const usePublishersStore = defineStore('publishers', () => {
  const publishers = ref([])
  const totalItems = ref(0)
  const loading = ref(false)
  const error = ref(null)

  const fetchPublishers = async (paginationData, searchFilter) => {
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
      const response = await api.get('/publisher', { params })

      publishers.value = response.data.content
      totalItems.value = response.data.totalElements

      if (response.data.totalElements === 0 && page > 0) {
        return fetchPublishers({ ...paginationData, page: 1 }, searchFilter)
      }
    } catch (err) {
      throwApiError(err, 'Erro ao buscar editoras.')
    } finally {
      loading.value = false
    }
  }

  const registerPublisher = async (publisherData) => {
    loading.value = true
    error.value = null
    try {
      await api.post('/publisher', publisherData)
    } catch (err) {
      throwApiError(err, 'Erro ao registrar editora.')
    } finally {
      loading.value = false
    }
  }

  const editPublisher = async (publisherId, publisherData) => {
    loading.value = true
    error.value = null
    try {
      await api.put(`/publisher/${publisherId}`, publisherData)
    } catch (err) {
      throwApiError(err, 'Erro ao editar editora.')
    } finally {
      loading.value = false
    }
  }

  const deletePublisher = async (publisherId) => {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/publisher/${publisherId}`)
    } catch (err) {
      throwApiError(err, 'Erro ao deletar editora.')
    } finally {
      loading.value = false
    }
  }

  return {
    publishers,
    totalItems,
    loading,
    error,
    fetchPublishers,
    registerPublisher,
    editPublisher,
    deletePublisher,
  }
})
