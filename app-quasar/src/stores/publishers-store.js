import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'boot/api'

export const usePublishersStore = defineStore('publishers', () => {
  const publishers = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchPublishers = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/publisher')
      publishers.value = response.data
    } catch (err) {
      error.value = err.response ? err.response.data.message : 'Erro ao buscar editoras.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const registerPublisher = async (publisherData) => {
    loading.value = true
    error.value = null
    try {
      await api.post('/publisher', publisherData)
      await fetchPublishers()
    } catch (err) {
      error.value = err.response ? err.response.data.message : 'Erro ao buscar usuários.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const editPublisher = async (publisherId, publisherData) => {
    loading.value = true
    error.value = null
    try {
      await api.put(`/publisher/${publisherId}`, publisherData)
      await fetchPublishers()
    } catch (err) {
      error.value = err.response ? err.response.data.message : 'Erro ao buscar usuários.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deletePublisher = async (publisherId) => {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/publisher/${publisherId}`)
      await fetchPublishers()
    } catch (err) {
      error.value = err.response ? err.response.data.message : 'Erro ao buscar usuários.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    publishers,
    loading,
    error,
    fetchPublishers,
    registerPublisher,
    editPublisher,
    deletePublisher,
  }
})
