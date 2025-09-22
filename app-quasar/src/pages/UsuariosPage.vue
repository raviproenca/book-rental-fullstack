<template>
  <TableComponent
    :columns="usersth"
    :rows="users"
    :placeholder="'Pesquisar usuários'"
    :area-type="'users'"
    >Usuários</TableComponent
  >
</template>

<script setup>
import { onMounted } from 'vue'
import { useUsersStore } from 'src/stores/users-store'
import { storeToRefs } from 'pinia'
import TableComponent from 'src/components/TableComponent.vue'

const usersth = [
  { name: 'name', label: 'Nome', field: 'name' },
  { name: 'email', label: 'Email', field: 'email' },
  { name: 'password', label: 'Senha', field: 'password' },
  { name: 'role', label: 'Permissão', field: 'role' },
]

const userStore = useUsersStore()

const { users } = storeToRefs(userStore)

onMounted(async () => {
  userStore.fetchUsers()
})
</script>
