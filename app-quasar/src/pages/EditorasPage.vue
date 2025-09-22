<template>
  <TableComponent
    :columns="publishersth"
    :rows="publishers"
    :placeholder="'Pesquisar editoras'"
    :area-type="'publishers'"
    >Editoras</TableComponent
  >
</template>

<script setup>
import { onMounted} from 'vue'
import { usePublishersStore } from 'src/stores/publishers-store'
import { storeToRefs } from 'pinia'
import TableComponent from 'src/components/TableComponent.vue'

const publishersth = [
  { name: 'name', label: 'Nome', field: 'name' },
  { name: 'email', label: 'Email', field: 'email' },
  { name: 'telephone', label: 'Telefone', field: 'telephone' },
  { name: 'site', label: 'Site', field: 'site' },
]

const publisherStore = usePublishersStore()
const { publishers } = storeToRefs(publisherStore)

onMounted(async () => {
  publisherStore.fetchPublishers()
})
</script>
