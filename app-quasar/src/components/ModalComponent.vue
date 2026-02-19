<template>
  <q-card class="shadow-4 modal-color border-radius q-pa-md" style="width: 80%; max-width: 600px">
    <q-card-actions align="right" class="q-pa-xs">
      <q-btn
        flat
        round
        dense
        icon="close"
        color="white"
        @click="$emit('close-modal')"
        :disable="isLoading"
      />
    </q-card-actions>

    <q-form v-if="mode === 'create' || mode === 'edit'" ref="myForm" @submit.prevent="handleSubmit">
      <q-card-section class="q-gutter-y-sm">
        <div v-for="column in columns" :key="column.name">
          <div v-if="column.name !== 'actions' && column.form !== false">
            <q-item-label
              v-if="column.name !== 'totalInUse' && column.name !== 'devolutionDate'"
              style="color: #fff; font-size: medium"
              class="text-weight-bold text-subtitle1"
              caption
              >{{ column.label }}</q-item-label
            >
            <q-item-label
              v-if="column.name === 'devolutionDate' && mode !== 'create'"
              style="color: #fff; font-size: medium"
              class="text-weight-bold text-subtitle1"
              caption
              >{{ column.label }}</q-item-label
            >
            <q-select
              v-if="column.name === 'role'"
              dark
              color="amber-1"
              v-model="localRow[column.field]"
              :options="roleOptions"
              :rules="getRulesFor(column)"
              lazy-rules
              option-value="value"
              option-label="label"
              emit-value
              map-options
              dense
              rounded
            />
            <q-select
              v-else-if="column.name === 'publisher'"
              dark
              color="amber-1"
              v-model="localRow[column.field]"
              :options="publishers"
              :rules="getRulesFor(column)"
              lazy-rules
              option-value="id"
              option-label="name"
              emit-value
              map-options
              dense
              rounded
            />
            <q-select
              v-else-if="column.name === 'book'"
              dark
              color="amber-1"
              v-model="localRow[column.field]"
              :options="allowedBooks"
              :rules="getRulesFor(column)"
              lazy-rules
              option-value="id"
              option-label="name"
              emit-value
              map-options
              dense
              rounded
            />
            <q-select
              v-else-if="column.name === 'renter'"
              dark
              color="amber-1"
              v-model="localRow[column.field]"
              :options="renters"
              :rules="getRulesFor(column)"
              lazy-rules
              option-value="id"
              option-label="name"
              emit-value
              map-options
              dense
              rounded
            />
            <q-input
              v-else-if="
                column.name === 'launchDate' ||
                column.name === 'deadLine' ||
                (column.name === 'devolutionDate' && mode !== 'create')
              "
              filled
              v-model="formattedDates[column.name]"
              mask="##-##-####"
              :rules="getRulesFor(column)"
              lazy-rules
              readonly
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer calendar-icon-btn">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date mask="DD-MM-YYYY" v-model="formattedDates[column.name]">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup :label="t('common.close')" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-input
              v-else-if="column.name === 'totalQuantity'"
              type="number"
              dark
              color="amber-1"
              v-model.number="localRow[column.field]"
              :placeholder="`${t('common.enter')} ${column.label.toLowerCase()}`"
              :rules="getRulesFor(column)"
              lazy-rules
              debounce="500"
              dense
              rounded
            />
            <q-input
              v-else-if="column.name === 'cpf'"
              dark
              color="amber-1"
              v-model="localRow[column.field]"
              mask="###.###.###-##"
              unmasked-value
              :placeholder="`${t('common.enter')} ${column.label.toLowerCase()}`"
              :rules="getRulesFor(column)"
              lazy-rules
              dense
              rounded
            />
            <q-input
              v-else-if="column.name === 'telephone'"
              dark
              color="amber-1"
              v-model="localRow[column.field]"
              mask="(##) # ####-####"
              unmasked-value
              :placeholder="`${t('common.enter')} ${column.label.toLowerCase()}`"
              :rules="getRulesFor(column)"
              lazy-rules
              dense
              rounded
            />
            <q-input
              v-else-if="column.name !== 'totalInUse' && column.name !== 'devolutionDate'"
              dark
              color="amber-1"
              v-model="localRow[column.field]"
              :placeholder="`${t('common.enter')} ${column.label.toLowerCase()}`"
              :rules="getRulesFor(column)"
              lazy-rules
              debounce="500"
              dense
              rounded
            />
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          flat
          :label="t('common.cancel')"
          color="white"
          @click="$emit('close-modal')"
          :disable="isLoading"
        />
        <q-btn
          v-if="mode === 'create'"
          :label="t('common.register')"
          color="green"
          type="submit"
          :loading="isLoading"
          :disable="isLoading"
        />
        <q-btn
          v-if="mode === 'edit'"
          :label="t('common.update')"
          color="blue"
          type="submit"
          :loading="isLoading"
          :disable="isLoading"
        />
      </q-card-actions>
    </q-form>

    <div v-else-if="mode === 'delete'">
      <q-card-section>
        <div class="text-h5 text-white">{{ t('common.exclusion') }}</div>
        <div>{{ row?.name || row?.id }}</div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          flat
          :label="t('common.cancel')"
          color="white"
          @click="$emit('close-modal')"
          :disable="isLoading"
        />
        <q-btn
          :label="t('common.exclude')"
          color="negative"
          @click="remove"
          :loading="isLoading"
          :disable="isLoading"
        />
      </q-card-actions>
    </div>

    <div v-else-if="mode === 'devolution'">
      <q-card-section>
        <div class="text-h5 text-white">{{ t('common.devolution') }}</div>
        <div>{{ row?.name || row.book?.name || row?.id }}</div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          flat
          :label="t('common.cancel')"
          color="white"
          @click="$emit('close-modal')"
          :disable="isLoading"
        />
        <q-btn
          :label="t('common.confirm')"
          color="blue"
          @click="confirm"
          :loading="isLoading"
          :disable="isLoading"
        />
      </q-card-actions>
    </div>
  </q-card>
</template>

<script setup>
import { ref, watch, computed, onMounted, reactive } from 'vue'
import { storeToRefs } from 'pinia'

import { useUsersStore } from 'src/stores/users-store'
import { usePublishersStore } from 'src/stores/publishers-store'
import { useBooksStore } from 'src/stores/books-store'
import { useRentersStore } from 'src/stores/renters-store'
import { useRentsStore } from 'src/stores/rents-store'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'

const emit = defineEmits(['close-modal', 'dataChanged'])

const { t } = useI18n()
const $q = useQuasar()

const myForm = ref(null)
const localRow = ref({})

const props = defineProps({
  row: { type: Object, default: null },
  existingItems: { type: Array, default: () => [] },
  mode: { type: String, default: 'create' },
  area: { type: String, default: '' },
  columns: { type: Array },
})

const roleOptions = [
  { value: 'USER', label: t('common.roles.reader') },
  { value: 'ADMIN', label: t('common.roles.editor') },
]

const publishersStore = usePublishersStore()
const { publishers } = storeToRefs(publishersStore)
const { fetchPublishers } = publishersStore

const booksStore = useBooksStore()
const { books } = storeToRefs(booksStore)
const { fetchBooks } = booksStore

const rentersStore = useRentersStore()
const { renters } = storeToRefs(rentersStore)
const { fetchRenters } = rentersStore

const allowedBooks = computed(() => {
  return books.value.filter((book) => book.totalQuantity > 0)
})

onMounted(async () => {
  if (props.area === 'rents') {
    const pagination = {
      page: 1,
      rowsPerPage: 1000,
      sortBy: 'name',
      descending: false,
    }
    await fetchRenters(pagination)
    await fetchBooks(pagination)
  }

  if (props.area === 'books') {
    const pagination = {
      page: 1,
      rowsPerPage: 1000,
      sortBy: 'name',
      descending: false,
    }
    await fetchPublishers(pagination)
  }
})

watch(
  () => props.row,
  (r) => {
    if (r) {
      localRow.value = { ...r }
      if (props.area === 'rents') {
        if (localRow.value.book && typeof localRow.value.book === 'object') {
          localRow.value.book = localRow.value.book.id
        }
        if (localRow.value.renter && typeof localRow.value.renter === 'object') {
          localRow.value.renter = localRow.value.renter.id
        }
      }
      if (props.area === 'books') {
        if (localRow.value.publisher && typeof localRow.value.publisher === 'object') {
          localRow.value.publisher = localRow.value.publisher.id
        }
      }
    } else {
      localRow.value = {
        name: '',
        email: '',
        password: '',
        role: null,
        telephone: '',
        site: '',
        author: '',
        publisher: null,
        launchDate: null,
        totalQuantity: 0,
        totalInUse: 0,
        address: '',
        cpf: '',
        book: null,
        renter: null,
        rentDate: null,
        deadLine: null,
        devolutionDate: null,
        status: '',
      }
    }
  },
  { immediate: true, deep: true },
)

const isValidDate = (val) => {
  const datePattern = /^\d{2}-\d{2}-\d{4}$/
  if (!datePattern.test(val)) {
    return t('rules.date.invalidFormat')
  }

  const parts = val.split('-')
  const day = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10)
  const year = parseInt(parts[2], 10)

  if (year < 1000 || year > 3000 || month === 0 || month > 12) {
    return t('rules.date.invalid')
  }

  const monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

  if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) {
    monthLength[1] = 29
  }

  if (day > 0 && day <= monthLength[month - 1]) {
    return true
  } else {
    return t('rules.date.invalid')
  }
}

const formattedDates = reactive({})
const dateFields = ['launchDate', 'deadLine', 'devolutionDate']

dateFields.forEach((field) => {
  formattedDates[field] = computed({
    get() {
      const dateValue = localRow.value[field]
      if (!dateValue || dateValue === 'Não Entregue') return ''

      const datePart = dateValue.split('T')[0]
      const [year, month, day] = datePart.split('-')

      return `${day}-${month}-${year}`
    },
    set(newValue) {
      if (!newValue || !/^\d{2}-\d{2}-\d{4}$/.test(newValue)) {
        localRow.value[field] = null
        return
      }

      const [day, month, year] = newValue.split('-')
      localRow.value[field] = `${year}-${month}-${day}`
    },
  })
})

const activeStore = computed(() => {
  switch (props.area) {
    case 'users':
      return useUsersStore()
    case 'publishers':
      return usePublishersStore()
    case 'books':
      return useBooksStore()
    case 'renters':
      return useRentersStore()
    case 'rents':
      return useRentsStore()
    default:
      return null
  }
})

const isLoading = computed(() => {
  if (!activeStore.value) return false

  const { loading } = storeToRefs(activeStore.value)
  return loading.value
})

const save = async () => {
  const payload = {}

  props.columns.forEach((column) => {
    if (
      column.field &&
      column.field !== 'devolutionDate' &&
      column.form !== false &&
      Object.prototype.hasOwnProperty.call(localRow.value, column.field)
    ) {
      const key = column.apiKey || column.field
      let value = localRow.value[column.field]

      if (column.field === 'publisher' && typeof value === 'object' && value !== null) {
        value = value.id
      }
      if (column.field === 'book' && typeof value === 'object' && value !== null) {
        value = value.id
      }
      if (column.field === 'renter' && typeof value === 'object' && value !== null) {
        value = value.id
      }
      if (column.field === 'devolutionDate' && value === 'Não Entregue') {
        value = null
      }

      payload[key] = value
    }
  })

  const store = activeStore.value
  if (!store) return console.error('Store não encontrada para a área:', props.area)

  try {
    if (props.area === 'users') await store.registerUser(payload)
    else if (props.area === 'publishers') await store.registerPublisher(payload)
    else if (props.area === 'books') await store.registerBook(payload)
    else if (props.area === 'renters') await store.registerRenter(payload)
    else if (props.area === 'rents') await store.registerRent(payload)
    else console.log('ERRO!!')

    emit('dataChanged')
    emit('close-modal')

    $q.notify({
      type: 'positive',
      message: t('common.registerSuccess'),
    })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.message || 'Não foi possível editar.',
    })
  }
}

const edit = async () => {
  const payload = {}

  props.columns.forEach((column) => {
    if (
      column.field &&
      column.form !== false &&
      Object.prototype.hasOwnProperty.call(localRow.value, column.field)
    ) {
      const key = column.apiKey || column.field
      let value = localRow.value[column.field]

      if (column.field === 'publisher' && typeof value === 'object' && value !== null) {
        value = value.id
      }
      if (column.field === 'book' && typeof value === 'object' && value !== null) {
        value = value.id
      }
      if (column.field === 'renter' && typeof value === 'object' && value !== null) {
        value = value.id
      }
      if (column.field === 'devolutionDate' && value === 'Não Entregue') {
        value = null
      }

      payload[key] = value
    }
  })

  const store = activeStore.value
  if (!store) return console.error('Store não encontrada para a área:', props.area)

  try {
    if (props.area === 'users') await store.editUser(props.row.id, payload)
    else if (props.area === 'publishers') await store.editPublisher(props.row.id, payload)
    else if (props.area === 'books') await store.editBook(props.row.id, payload)
    else if (props.area === 'renters') await store.editRenter(props.row.id, payload)
    else if (props.area === 'rents') await store.editRent(props.row.id, payload)
    else console.log('ERRO!!')

    emit('dataChanged')
    emit('close-modal')

    $q.notify({
      type: 'positive',
      message: t('common.editSuccess'),
    })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.message || 'Não foi possível editar.',
    })
  }
}

const remove = async () => {
  const store = activeStore.value
  if (!store) {
    console.error('Store não encontrada para a área:', props.area)
    return
  }

  try {
    if (props.area === 'users') await store.deleteUser(props.row.id)
    else if (props.area === 'publishers') await store.deletePublisher(props.row.id)
    else if (props.area === 'books') await store.deleteBook(props.row.id)
    else if (props.area === 'renters') await store.deleteRenter(props.row.id)
    else {
      console.log('ERRO: Área de exclusão desconhecida!')
      return
    }

    emit('dataChanged')
    emit('close-modal')

    $q.notify({
      type: 'positive',
      message: t('common.deleteSuccess'),
    })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.message || 'Não foi possível deletar.',
    })
  }
}

const confirm = async () => {
  const store = activeStore.value
  if (!store) return console.error('Store não encontrada para a área:', props.area)

  try {
    if (props.area === 'rents') await store.confirmRent(props.row.id)
    else console.log('ERRO!!')

    emit('dataChanged')
    emit('close-modal')

    $q.notify({
      type: 'positive',
      message: t('common.confirmSuccess'),
    })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.message || 'Não foi possível devolver o livro.',
    })
  }
}

const requiredRule = [(val) => (val && String(val).length > 0) || t('rules.required')]

function isUnique(value, field, items, mode, currentRow) {
  if (!value) return true

  const inputValue = typeof value === 'string' ? value.toLowerCase().trim() : value

  const isTaken = items.some((item) => {
    const itemValue = item[field]

    if (itemValue === null || itemValue === undefined) return false

    const formattedItemValue =
      typeof itemValue === 'string' ? itemValue.toLowerCase().trim() : itemValue

    if (formattedItemValue === inputValue) {
      if (mode === 'edit') {
        return item.id !== currentRow.id
      }
      return true
    }

    return false
  })

  return !isTaken || t('rules.' + field + '.unique')
}

const nameRules = computed(() => [
  (val) => val.length >= 3 || t('rules.name.min'),
  (val) => !/\d/.test(val) || t('rules.name.noNumbers'),
  (val) => isUnique(val, 'name', props.existingItems, props.mode, props.row),
])

const emailRules = computed(() => [
  (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val || '').trim()) || t('rules.email.invalid'),
  (val) => isUnique(val, 'email', props.existingItems, props.mode, props.row),
])

const passwordRules = computed(() => [
  (val) => {
    if (!val || val.length === 0) {
      return t('rules.required')
    }

    return val.length >= 8 || t('rules.password.min')
  },
])

const siteRules = computed(() => {
  return [
    (val) => {
      if (!val) {
        return true
      }

      return (
        /^https:\/\/[^\s$.?#].[^\s]*$/.test(String(val || '').trim()) ||
        t('rules.site.invalidFormat')
      )
    },
  ]
})

const telephoneRules = computed(() => [
  (val) => val.length >= 11 || t('rules.telephone.invalid'),
  (val) => val.length <= 16 || t('rules.telephone.invalid'),
  (val) => /^\d+$/.test(val) || t('rules.telephone.invalid'),
])

const authorRules = computed(() => [
  (val) => val.length >= 3 || t('rules.name.min'),
  (val) => !/\d/.test(val) || t('rules.name.noNumbers'),
])

const totalQuantityRules = computed(() => [(val) => val > 0 || t('rules.quantity.min')])

const addressRules = computed(() => [(val) => val.length > 3 || t('rules.address.min')])

const cpfRules = computed(() => [
  (val) => val.length >= 11 || t('rules.cpf.invalid'),
  (val) => /^\d+$/.test(val) || t('rules.cpf.invalid'),
])

const deadLineRules = computed(() => [
  (val) => {
    const formatValidation = isValidDate(val)
    if (formatValidation !== true) {
      return formatValidation
    }

    const parts = val.split('-')
    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const year = parseInt(parts[2], 10)
    const selectedDate = new Date(year, month, day)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
      if (props.mode === 'edit') {
        // Validation: Deadline cannot be before Rent Date
        if (localRow.value.rentDate) {
          const rentDateParts = localRow.value.rentDate.split('-')
          // rentDate format from backend is typically YYYY-MM-DD
          const rYear = parseInt(rentDateParts[0], 10)
          const rMonth = parseInt(rentDateParts[1], 10) - 1
          const rDay = parseInt(rentDateParts[2], 10)
          const rentDate = new Date(rYear, rMonth, rDay)
          rentDate.setHours(0, 0, 0, 0)

          if (selectedDate < rentDate) {
            return t('rules.date.deadLineBeforeRentDate')
          }
        }
        return true
      }
      return t('rules.date.pastDeadline')
    }

    return true
  },
])

const launchDateRules = computed(() => [
  (val) => {
    const formatValidation = isValidDate(val)
    if (formatValidation !== true) {
      return formatValidation
    }

    const parts = val.split('-')
    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const year = parseInt(parts[2], 10)
    const selectedDate = new Date(year, month, day)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate > today) {
      return t('rules.date.futureLaunch')
    }

    return true
  },
])

const devolutionDateRules = computed(() => {
  return [
    (val) => {
      if (!val) {
        return true
      }

      const formatValidation = isValidDate(val)
      if (formatValidation !== true) {
        return formatValidation
      }

      const parts = val.split('-')
      const day = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10) - 1
      const year = parseInt(parts[2], 10)
      const selectedDate = new Date(year, month, day)

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (selectedDate < today) {
        if (props.mode === 'edit') {
          // Validation: Devolution Date cannot be before Rent Date
          if (localRow.value.rentDate) {
            const rentDateParts = localRow.value.rentDate.split('-')
            const rYear = parseInt(rentDateParts[0], 10)
            const rMonth = parseInt(rentDateParts[1], 10) - 1
            const rDay = parseInt(rentDateParts[2], 10)
            const rentDate = new Date(rYear, rMonth, rDay)
            rentDate.setHours(0, 0, 0, 0)

            if (selectedDate < rentDate) {
              return t('rules.date.devolutionDateBeforeRentDate')
            }
          }
          return true
        }
        return t('rules.date.pastDeadline')
      }

      return true
    },
  ]
})

function getRulesFor(column) {
  switch (column.field) {
    case 'name':
      return nameRules.value
    case 'email':
      return emailRules.value
    case 'password':
      return passwordRules.value
    case 'site':
      return siteRules.value
    case 'telephone':
      return telephoneRules.value
    case 'author':
      return authorRules.value
    case 'totalQuantity':
      return totalQuantityRules.value
    case 'address':
      return addressRules.value
    case 'cpf':
      return cpfRules.value
    case 'launchDate':
      return launchDateRules.value
    case 'deadLine':
      return deadLineRules.value
    case 'devolutionDate':
      return devolutionDateRules.value
    default:
      return requiredRule
  }
}

const handleSubmit = async () => {
  const success = await myForm.value.validate()

  if (success) {
    if (props.mode === 'create') {
      await save()
    } else if (props.mode === 'edit') {
      await edit()
    }
  } else {
    console.log('Formulário inválido. Por favor, corrija os erros.')
  }
}
</script>

<style scoped>
.calendar-icon-btn {
  transition: all 0.3s ease;
  border-radius: 50%;
  padding: 4px;
}

.calendar-icon-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
}
</style>
