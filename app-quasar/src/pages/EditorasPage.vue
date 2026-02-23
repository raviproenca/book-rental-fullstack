<template>
  <TableComponent
    :columns="publishersth"
    :rows="publishers"
    :total-items="totalItems"
    :loading="loading"
    :fetch-data="fetchPublishers"
    :register-data="registerPublisher"
    :edit-data="editPublisher"
    :delete-data="deletePublisher"
    :placeholder="t('pages.publishers.searchPlaceholder')"
    :area-type="'publishers'"
    >{{ t('pages.publishers.title') }}</TableComponent
  >
</template>

<script setup>
import { computed } from 'vue'
import { usePublishersStore } from 'src/stores/publishers-store'
import { storeToRefs } from 'pinia'
import TableComponent from 'src/components/TableComponent.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const publishersth = computed(() => [
  { name: 'name', label: t('common.name'), field: 'name', align: 'center', sortable: true },
  { name: 'email', label: t('common.email'), field: 'email', align: 'center', sortable: true },
  { name: 'telephone', label: t('common.telephone'), field: 'telephone', align: 'center' },
  { name: 'site', label: t('common.site'), field: 'site', align: 'center', sortable: true },
  { name: 'actions', label: t('common.actions'), align: 'center' },
])

const publisherStore = usePublishersStore()
const { publishers, totalItems, loading } = storeToRefs(publisherStore)
const { fetchPublishers, registerPublisher, editPublisher, deletePublisher } = publisherStore
</script>
