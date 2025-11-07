<template>
  <q-page padding class="column items-center justify-center">
    <div class="q-pa-md" style="width: 100%; max-width: 1300px">
      <h4 class="text-white text-center text-weight-bold text-with-shadow q-mt-md q-mb-lg lt-md">
        <slot></slot>
      </h4>

      <div class="row q-mb-lg q-gutter-x-md items-center q-pa-none">
        <p class="text-white text-h4 text-weight-bold text-with-shadow gt-sm q-mb-none">
          <slot></slot>
        </p>
        <q-input
          v-model="filter"
          outlined
          :placeholder="placeholder"
          bg-color="white"
          class="input-style col-grow"
          rounded
          dense
          debounce="300"
          @update:model-value="onFilterChange"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-btn round size="md" color="teal-10" icon="add" @click="openCreateModal()"></q-btn>
      </div>

      <q-table
        class="col border-radius"
        table-header-class="table-header"
        :rows="props.rows"
        :columns="visibleColumns"
        row-key="id"
        :grid="$q.screen.lt.md"
        :rows-per-page-options="[5, 10, 20]"
        v-model:pagination="pagination"
        @request="onRequest"
        :loading="props.loading"
        hide-pagination
        :binary-state-sort="true"
      >
        <template v-slot:item="props">
          <div class="q-pa-xs col-xs-12 col-sm-6">
            <q-card class="q-mb-md shadow-4 border-radius">
              <q-card-section>
                <q-list dense>
                  <q-item v-if="props.row.name">
                    <q-item-section>
                      <q-item-label caption>{{ t('common.name') }}</q-item-label>

                      <q-item-label>{{ props.row.name }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="props.row.email">
                    <q-item-section>
                      <q-item-label caption>{{ t('common.email') }}</q-item-label>

                      <q-item-label>{{ props.row.email }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="props.row.role">
                    <q-item-section>
                      <q-item-label caption>{{ t('common.role') }}</q-item-label>

                      <q-item-label>{{
                        props.row.role === 'USER'
                          ? t('common.roles.reader')
                          : t('common.roles.editor')
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="props.row.telephone">
                    <q-item-section>
                      <q-item-label caption>{{ t('common.telephone') }}</q-item-label>

                      <q-item-label>{{ props.row.telephone }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="props.row.site || props.row.site === ''">
                    <q-item-section>
                      <q-item-label caption>{{ t('common.site') }}</q-item-label>

                      <q-item-label>{{ props.row.site || 'N/A' }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="props.row.author">
                    <q-item-section>
                      <q-item-label caption>{{ t('common.author') }}</q-item-label>

                      <q-item-label>{{ props.row.author }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="props.row.publisher">
                    <q-item-section>
                      <q-item-label caption>{{ t('common.publisher') }}</q-item-label>

                      <q-item-label>{{ props.row.publisher.name }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="props.row.launchDate">
                    <q-item-section>
                      <q-item-label caption>{{ t('common.launchDate') }}</q-item-label>

                      <q-item-label>{{ formatDateToBR(props.row.launchDate) }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="props.row.totalQuantity">
                    <q-item-section>
                      <q-item-label caption>{{ t('common.totalQuantity') }}</q-item-label>

                      <q-item-label>{{ props.row.totalQuantity }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="props.row.totalInUse >= 0">
                    <q-item-section>
                      <q-item-label caption>{{ t('common.totalInUse') }}</q-item-label>

                      <q-item-label>{{ props.row.totalInUse }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="props.row.address">
                    <q-item-section>
                      <q-item-label caption>{{ t('common.address') }}</q-item-label>

                      <q-item-label>{{ props.row.address }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="props.row.cpf">
                    <q-item-section>
                      <q-item-label caption>{{ t('common.cpf') }}</q-item-label>

                      <q-item-label>{{ props.row.cpf }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="props.row.book">
                    <q-item-section>
                      <q-item-label caption>{{ t('common.book') }}</q-item-label>

                      <q-item-label>{{ props.row.book.name }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="props.row.renter">
                    <q-item-section>
                      <q-item-label caption>{{ t('common.renter') }}</q-item-label>

                      <q-item-label>{{ props.row.renter.name }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="props.row.rentDate">
                    <q-item-section>
                      <q-item-label caption>{{ t('common.rentDate') }}</q-item-label>

                      <q-item-label>{{ formatDateToBR(props.row.rentDate) }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="props.row.deadLine">
                    <q-item-section>
                      <q-item-label caption>{{ t('common.deadLine') }}</q-item-label>

                      <q-item-label>{{ formatDateToBR(props.row.deadLine) }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="props.row.rentDate">
                    <q-item-section>
                      <q-item-label caption>{{ t('common.devolutionDate') }}</q-item-label>

                      <q-item-label>{{
                        formatDateToBR(props.row.devolutionDate) || t('common.notDelivered')
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="props.row.status">
                    <q-item-section>
                      <q-item-label caption>Status</q-item-label>

                      <q-item-label>{{ translateStatus(props.row.status) }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>

              <q-separator />

              <q-card-actions align="center">
                <q-btn
                  flat
                  round
                  dense
                  icon="o_edit"
                  color="green"
                  @click="openEditModal(props.row)"
                />
                <q-btn
                  v-if="!props.row.status"
                  flat
                  round
                  dense
                  icon="o_delete"
                  color="red"
                  @click="openDeleteModal(props.row)"
                />
                <q-btn
                  v-if="props.row.status"
                  flat
                  round
                  dense
                  :style="{
                    opacity: props.row.status === 'RENTED' || props.row.status === 'LATE' ? 0.5 : 1,
                  }"
                  icon="o_check_box"
                  color="black"
                  @click="openRentModal(props.row)"
                />
              </q-card-actions>
            </q-card>
          </div>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat round dense icon="o_edit" color="green" @click="openEditModal(props.row)" />
            <q-btn
              v-if="!props.row.status"
              flat
              round
              dense
              icon="o_delete"
              color="red"
              @click="openDeleteModal(props.row)"
            />
            <q-btn
              v-if="props.row.status"
              flat
              round
              dense
              :style="{
                opacity: props.row.status === 'RENTED' || props.row.status === 'LATE' ? 0.5 : 1,
              }"
              icon="o_check_box"
              color="black"
              @click="openRentModal(props.row)"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-role="props">
          <q-td :props="props">
            {{ props.row.role === 'USER' ? t('common.roles.reader') : t('common.roles.editor') }}
          </q-td>
        </template>

        <template v-slot:body-cell-publisher="props">
          <q-td :props="props">
            {{ props.row.publisher?.name || 'N/A' }}
          </q-td>
        </template>

        <template v-slot:body-cell-book="props">
          <q-td :props="props">
            {{ props.row.book?.name || 'N/A' }}
          </q-td>
        </template>

        <template v-slot:body-cell-renter="props">
          <q-td :props="props">
            {{ props.row.renter?.name || 'N/A' }}
          </q-td>
        </template>

        <template v-slot:body-cell-launchDate="props">
          <q-td :props="props">
            {{ formatDateToBR(props.row.launchDate) }}
          </q-td>
        </template>

        <template v-slot:body-cell-rentDate="props">
          <q-td :props="props">
            {{ formatDateToBR(props.row.rentDate) }}
          </q-td>
        </template>

        <template v-slot:body-cell-deadLine="props">
          <q-td :props="props">
            {{ formatDateToBR(props.row.deadLine) || 'N/A' }}
          </q-td>
        </template>

        <template v-slot:body-cell-devolutionDate="props">
          <q-td :props="props">
            {{ formatDateToBR(props.row.devolutionDate) || t('common.notDelivered') }}
          </q-td>
        </template>

        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            {{ translateStatus(props.row.status) }}
          </q-td>
        </template>

        <template v-slot:body-cell-site="props">
          <q-td :props="props">
            {{ props.row.site ? props.row.site : 'N/A' }}
          </q-td>
        </template>

        <template v-slot:bottom>
          <div class="row justify-center" style="width: 100%">
            <q-pagination
              v-model="pagination.page"
              color="teal-10"
              :max="pagesNumber"
              :max-pages="6"
              boundary-numbers
              size="md"
              @update:model-value="callFetchData"
            />
          </div>
        </template>
      </q-table>

      <template>
        <q-dialog v-model="showModal">
          <ModalComponent
            :row="selectedRow"
            :mode="modalMode"
            :area="areaType"
            :columns="columns"
            :existingItems="props.rows"
            @close-modal="closeModal"
            @data-changed="callFetchData"
          />
        </q-dialog>
      </template>
    </div>
  </q-page>
</template>

<style scoped>
.input-style:deep(.q-field__control) {
  box-shadow: 1px 2px 6px rgba(63, 56, 56, 0.25);
}
</style>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ModalComponent from './ModalComponent.vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'

const { t } = useI18n()
const $q = useQuasar()

const props = defineProps({
  // Dados do Servidor
  rows: { type: Array, required: true },
  totalItems: { type: Number, required: true },
  loading: { type: Boolean, required: true },
  fetchData: { type: Function, required: true },

  // Funções de Ação (CRUD) da Store
  registerData: { type: Function, required: false },
  editData: { type: Function, required: false },
  deleteData: { type: Function, required: false },

  // Props de Configuração da Tabela
  columns: { type: Array, required: true },
  placeholder: { type: String, default: '' },
  areaType: { type: String, required: true },
})

// Filtro
const filter = ref('')

// Paginação
const pagination = ref({
  sortBy: 'id',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
})

// Numero de páginas
const pagesNumber = computed(() => {
  return Math.ceil(props.totalItems / pagination.value.rowsPerPage)
})

// Função para busca de dados
const callFetchData = async () => {
  try {
    await props.fetchData(pagination.value, filter.value)
    pagination.value.rowsNumber = props.totalItems
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.message || 'Não foi possível obter os dados da tabela',
    })
  }
}

// Função para ordenação
const onRequest = (requestProps) => {
  const { page, rowsPerPage, sortBy, descending } = requestProps.pagination

  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending

  callFetchData()
}

// Função para quando o usuário digitar
const onFilterChange = () => {
  pagination.value.page = 1
  callFetchData()
}

// Ações
const showModal = ref(false)
const selectedRow = ref(null)
const modalMode = ref('create')

function openCreateModal() {
  selectedRow.value = null
  modalMode.value = 'create'
  showModal.value = true
}

function openEditModal(row) {
  selectedRow.value = row
  modalMode.value = 'edit'
  showModal.value = true
}

function openDeleteModal(row) {
  selectedRow.value = row
  modalMode.value = 'delete'
  showModal.value = true
}

function openRentModal(row) {
  selectedRow.value = row
  modalMode.value = 'devolution'
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedRow.value = null
  modalMode.value = 'create'
}

function translateStatus(status) {
  switch (status) {
    case 'RENTED':
      return t('common.status.rented')
    case 'IN_TIME':
      return t('common.status.in_time')
    case 'LATE':
      return t('common.status.late')
    case 'DELIVERED_WITH_DELAY':
      return t('common.status.delivered_with_delay')
    default:
      ''
  }
}

function formatDateToBR(dateString) {
  if (!dateString) {
    return null
  }
  const parts = dateString.split('-')
  if (parts.length !== 3) return dateString
  const [year, month, day] = parts
  return `${day}/${month}/${year}`
}

const visibleColumns = computed(() => {
  return props.columns.filter((col) => col.name !== 'password')
})

onMounted(() => {
  callFetchData()
})
</script>
