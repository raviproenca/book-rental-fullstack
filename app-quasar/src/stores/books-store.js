import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'boot/api'

export const useBooksStore = defineStore('books', () => {
  const books = ref([])
  const totalItems = ref(0)
  const loading = ref(false)
  const error = ref(null)

  const fetchBooks = async (paginationData, searchFilter) => {
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

      const response = await api.get('/book', { params })

      books.value = response.data.content
      totalItems.value = response.data.totalElements

      if (response.data.totalElements === 0 && page > 0) {
        return fetchBooks({ ...paginationData, page: 1 }, searchFilter)
      }
    } catch (err) {
      const message = err.response ? err.response.data.message : 'Erro ao buscar livros.'
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  const registerBook = async (bookData) => {
    loading.value = true
    error.value = null
    try {
      await api.post('/book', bookData)
    } catch (err) {
      const message = err.response ? err.response.data.message : 'Erro ao registrar livro.'
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  const editBook = async (bookId, bookData) => {
    loading.value = true
    error.value = null
    try {
      await api.put(`/book/${bookId}`, bookData)
    } catch (err) {
      const message = err.response ? err.response.data.message : 'Erro ao editar livro.'
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  const deleteBook = async (bookId) => {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/book/${bookId}`)
    } catch (err) {
      const message = err.response ? err.response.data.message : 'Erro ao deletar livro'
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  return {
    books,
    totalItems,
    loading,
    error,
    fetchBooks,
    registerBook,
    editBook,
    deleteBook,
  }
})
