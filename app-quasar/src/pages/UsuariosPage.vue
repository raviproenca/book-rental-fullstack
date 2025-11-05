<template>
  <TableComponent
    :columns="usersth"
    :rows="users"
    :total-items="totalItems"
    :loading="loading"
    :fetch-data="fetchUsers"
    :register-user="registerUser"
    :edit-user="editUser"
    :delete-user="deleteUser"
    :placeholder="t('pages.users.searchPlaceholder')"
    :area-type="'users'"
    >{{ t('pages.users.title') }}</TableComponent
  >
</template>

<script setup>
import { computed } from 'vue'
import { useUsersStore } from 'src/stores/users-store'
import { storeToRefs } from 'pinia'
import TableComponent from 'src/components/TableComponent.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const usersth = computed(() => [
  { name: 'name', label: t('common.name'), field: 'name', align: 'center', sortable: true },
  { name: 'email', label: t('common.email'), field: 'email', align: 'center', sortable: true },
  { name: 'password', label: t('common.password'), field: 'password' },
  { name: 'role', label: t('common.role'), field: 'role', align: 'center', sortable: true },
  { name: 'actions', label: t('common.actions'), align: 'center' },
])

const userStore = useUsersStore()
const { users, totalItems, loading } = storeToRefs(userStore)
const { fetchUsers, registerUser, editUser, deleteUser } = userStore
</script>
