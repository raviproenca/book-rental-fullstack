import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'boot/api'

export const useRentsStore = defineStore('rents', () => {
  const rents = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchRents = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/rent')
      rents.value = response.data
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
      await fetchRents()
    } catch (err) {
      error.value = err.response ? err.response.data.message : 'Erro ao buscar usuários.'
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
      await fetchRents()
    } catch (err) {
      error.value = err.response ? err.response.data.message : 'Erro ao buscar usuários.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteRent = async (rentId) => {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/rent/${rentId}`)
      await fetchRents()
    } catch (err) {
      error.value = err.response ? err.response.data.message : 'Erro ao buscar usuários.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    rents,
    loading,
    error,
    fetchRents,
    registerRent,
    editRent,
    deleteRent,
  }
})
