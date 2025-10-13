<template>
  <TableComponent
    :columns="booksth"
    :rows="books"
    :placeholder="t('pages.books.searchPlaceholder')"
    area-type="books"
    >{{ t('pages.books.title') }}</TableComponent
  >
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useBooksStore } from 'src/stores/books-store'
import TableComponent from 'src/components/TableComponent.vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const booksth = computed(() => [
  { name: 'name', label: t('common.name'), field: 'name', align: 'center', sortable: true },
  { name: 'author', label: t('common.author'), field: 'author', align: 'center', sortable: true },
  {
    name: 'publisher',
    label: t('common.publisher'),
    field: (row) => row.publisher.name,
    apiKey: 'publisherId',
    align: 'center',
    sortable: true,
  },
  {
    name: 'launchDate',
    label: t('common.launchDate'),
    field: 'launchDate',
    align: 'center',
    sortable: true,
  },
  {
    name: 'totalQuantity',
    label: t('common.totalQuantity'),
    field: 'totalQuantity',
    align: 'center',
    sortable: true,
  },
  {
    name: 'totalInUse',
    label: t('common.totalInUse'),
    field: 'totalInUse',
    form: false,
    align: 'center',
    sortable: true,
  },
  { name: 'actions', label: t('common.actions'), align: 'center' },
])

const bookStore = useBooksStore()
const { books } = storeToRefs(bookStore)

onMounted(async () => {
  bookStore.fetchBooks()
})
</script>
