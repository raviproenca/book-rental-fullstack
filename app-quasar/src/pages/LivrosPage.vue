<template>
  <TableComponent
    :columns="booksth"
    :rows="books"
    :placeholder="'Pesquisar livros'"
    area-type="books"
    >Livros</TableComponent
  >
</template>

<script setup>
import { onMounted } from 'vue'
import { useBooksStore } from 'src/stores/books-store'
import TableComponent from 'src/components/TableComponent.vue'
import { storeToRefs } from 'pinia'

const booksth = [
  { name: 'name', label: 'Nome', field: 'name' },
  { name: 'author', label: 'Autor', field: 'author' },
  { name: 'publisher', label: 'Editora', field: 'publisher', apiKey: 'publisherId' },
  { name: 'launchDate', label: 'Data de Lançamento', field: 'launchDate' },
  { name: 'totalQuantity', label: 'Estoque', field: 'totalQuantity' },
  { name: 'totalInUse', label: 'Alugados', field: 'totalInUse', form: false },
]

const bookStore = useBooksStore()
const { books } = storeToRefs(bookStore)

onMounted(async () => {
  bookStore.fetchBooks()
})
</script>
