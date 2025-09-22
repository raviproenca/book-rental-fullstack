<template>
  <TableComponent
    :columns="rentsth"
    :rows="rents"
    :placeholder="'Pesquisar aluguéis'"
    area-type="rents"
    >Aluguéis</TableComponent
  >
</template>

<script setup>
import { onMounted} from 'vue'
import { useRentsStore } from 'src/stores/rents-store'
import TableComponent from 'src/components/TableComponent.vue'
import { storeToRefs } from 'pinia'

const rentsth = [
  { name: 'name', label: 'Nome do Livro', field: 'name' },
  { name: 'renter', label: 'Locatário', field: 'renter' },
  { name: 'rentDate', label: 'Data de Locação', field: 'rentDate' },
  { name: 'devolutionDate', label: 'Data de Devolução', field: 'devolutionDate' },
  { name: 'status', label: 'Status', field: 'status' },
]

const rentStore = useRentsStore()
const { rents } = storeToRefs(rentStore)

onMounted(async () => {
  rentStore.fetchRents()
})
</script>
