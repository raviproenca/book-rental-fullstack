import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'boot/api'

const createWidgetState = () => ({
  data: [],
  loading: false,
  error: null,
})

export const useDashboardsStore = defineStore('dashboards', () => {
  const bookMoreRented = ref(createWidgetState())
  const deliveredInTimeQuantity = ref(createWidgetState())
  const deliveredWithDelayQuantity = ref(createWidgetState())
  const rentsLateQuantity = ref(createWidgetState())
  const rentsPerRenter = ref(createWidgetState())
  const rentsQuantity = ref(createWidgetState())

  const _fetchData = async (widgetRef, endpoint, params, errorMessage) => {
    widgetRef.value.loading = true
    widgetRef.value.error = null
    try {
      const response = await api.get(endpoint, { params })
      widgetRef.value.data = response.data
    } catch (err) {
      widgetRef.value.error = err.response ? err.response.data.message : errorMessage
    } finally {
      widgetRef.value.loading = false
    }
  }

  const fetchBookMoreRented = (months) =>
    _fetchData(
      bookMoreRented,
      '/dashboard/bookMoreRented',
      { numberOfMonths: months },
      'Erro ao buscar o livro mais alugado.',
    )

  const fetchDeliveredInTimeQuantity = (months) =>
    _fetchData(
      deliveredInTimeQuantity,
      '/dashboard/deliveredInTimeQuantity',
      { numberOfMonths: months },
      'Erro ao buscar aluguéis no prazo.',
    )

  const fetchDeliveredWithDelayQuantity = (months) =>
    _fetchData(
      deliveredWithDelayQuantity,
      '/dashboard/deliveredWithDelayQuantity',
      { numberOfMonths: months },
      'Erro ao buscar aluguéis com atraso.',
    )

  const fetchRentsLateQuantity = (months) =>
    _fetchData(
      rentsLateQuantity,
      '/dashboard/rentsLateQuantity',
      { numberOfMonths: months },
      'Erro ao buscar aluguéis atrasados.',
    )

  const fetchRentsPerRenter = () =>
    _fetchData(
      rentsPerRenter,
      '/dashboard/rentsPerRenter',
      null,
      'Erro ao buscar aluguéis por locatário.',
    )

  const fetchRentsQuantity = (months) =>
    _fetchData(
      rentsQuantity,
      '/dashboard/rentsQuantity',
      { numberOfMonths: months },
      'Erro ao buscar quantidade de aluguéis.',
    )

  return {
    bookMoreRented,
    deliveredInTimeQuantity,
    deliveredWithDelayQuantity,
    rentsLateQuantity,
    rentsPerRenter,
    rentsQuantity,
    fetchBookMoreRented,
    fetchDeliveredInTimeQuantity,
    fetchDeliveredWithDelayQuantity,
    fetchRentsLateQuantity,
    fetchRentsPerRenter,
    fetchRentsQuantity,
  }
})
