import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'boot/api'

export const useRentersStore = defineStore('renters', () => {
  const renters = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchRenters = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/renter')
      renters.value = response.data
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
      await fetchRenters()
    } catch (err) {
      error.value = err.response ? err.response.data.message : 'Erro ao buscar usuários.'
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
      await fetchRenters()
    } catch (err) {
      error.value = err.response ? err.response.data.message : 'Erro ao buscar usuários.'
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
      await fetchRenters()
    } catch (err) {
      error.value = err.response ? err.response.data.message : 'Erro ao buscar usuários.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    renters,
    loading,
    error,
    fetchRenters,
    registerRenter,
    editRenter,
    deleteRenter,
  }
})
