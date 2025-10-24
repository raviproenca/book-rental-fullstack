<template>
  <TableComponent
    :columns="rentsth"
    :rows="rents"
    :placeholder="t('pages.rents.searchPlaceholder')"
    area-type="rents"
    >{{ t('pages.rents.title') }}</TableComponent
  >
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRentsStore } from 'src/stores/rents-store'
import TableComponent from 'src/components/TableComponent.vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const rentsth = computed(() => [
  {
    name: 'book',
    label: t('common.book'),
    field: 'book',
    format: (val) => val?.name ?? '-',
    align: 'center',
    apiKey: 'bookId',
    sortable: true,
  },
  {
    name: 'renter',
    label: t('common.renter'),
    field: 'renter',
    format: (val) => val?.name ?? '-',
    align: 'center',
    apiKey: 'renterId',
    sortable: true,
  },
  {
    name: 'rentDate',
    label: t('common.rentDate'),
    field: 'rentDate',
    align: 'center',
    form: false,
    sortable: true,
  },
  {
    name: 'deadLine',
    label: t('common.deadLine'),
    field: 'deadLine',
    align: 'center',
    sortable: true,
  },
  {
    name: 'devolutionDate',
    label: t('common.devolutionDate'),
    field: 'devolutionDate',
    align: 'center',
    sortable: true,
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'center',
    form: false,
    sortable: true,
  },
  { name: 'actions', label: t('common.actions'), align: 'center' },
])

const rentStore = useRentsStore()
const { rents } = storeToRefs(rentStore)

onMounted(async () => {
  rentStore.fetchRents()
})
</script>
