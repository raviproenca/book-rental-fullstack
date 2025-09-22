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
            <q-item-label v-if="column.name !== 'totalInUse'" caption>{{
              column.label
            }}</q-item-label>
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
            <q-input
              v-else-if="column.name === 'launchDate'"
              filled
              v-model="formattedLaunchDate"
              mask="##-##-####"
              :rules="[isValidDate]"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date mask="DD-MM-YYYY" v-model="formattedLaunchDate">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Fechar" color="primary" flat />
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
              :placeholder="`Digitar ${column.label.toLowerCase()}`"
              :rules="getRulesFor(column)"
              lazy-rules
              debounce="500"
              dense
              rounded
            />
            <q-input
              v-else-if="column.name !== 'totalInUse'"
              dark
              color="amber-1"
              v-model="localRow[column.field]"
              :placeholder="`Digitar ${column.label.toLowerCase()}`"
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
          label="Cancelar"
          color="white"
          @click="$emit('close-modal')"
          :disable="isLoading"
        />
        <q-btn
          v-if="mode === 'create'"
          label="Cadastrar"
          color="green"
          type="submit"
          :loading="isLoading"
          :disable="isLoading"
        />
        <q-btn
          v-if="mode === 'edit'"
          label="Atualizar"
          color="blue"
          type="submit"
          :loading="isLoading"
          :disable="isLoading"
        />
      </q-card-actions>
    </q-form>

    <div v-else-if="mode === 'delete'">
      <q-card-section>
        <div class="text-h5">Confirma exclusão?</div>
        <div>{{ row?.name || row?.id }}</div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          flat
          label="Cancelar"
          color="white"
          @click="$emit('close-modal')"
          :disable="isLoading"
        />
        <q-btn
          label="Excluir"
          color="negative"
          @click="remove"
          :loading="isLoading"
          :disable="isLoading"
        />
      </q-card-actions>
    </div>
  </q-card>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'

import { useUsersStore } from 'src/stores/users-store'
import { usePublishersStore } from 'src/stores/publishers-store'
import { useBooksStore } from 'src/stores/books-store'
import { useRentersStore } from 'src/stores/renters-store'
import { useRentsStore } from 'src/stores/rents-store'

const emit = defineEmits(['close-modal'])

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
  { value: 'USER', label: 'Leitor' },
  { value: 'ADMIN', label: 'Editor' },
]

const publishersStore = usePublishersStore()
const { publishers } = storeToRefs(publishersStore)

onMounted(() => {
  if (props.area === 'books') {
    if (publishers.value.length === 0) {
      publishersStore.fetchPublishers()
    }
  }
})

watch(
  () => props.row,
  (r) => {
    localRow.value = r
      ? { ...r }
      : {
          name: '',
          email: '',
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
          book: '',
          renter: '',
          rentDate: null,
          devolutionDate: null,
          status: '',
        }
  },
  { immediate: true, deep: true },
)

const isValidDate = (val) => {
  const datePattern = /^\d{2}-\d{2}-\d{4}$/
  if (!datePattern.test(val)) {
    return 'O formato da data deve ser DD-MM-AAAA.'
  }

  const parts = val.split('-')
  const day = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10)
  const year = parseInt(parts[2], 10)

  if (year < 1000 || year > 3000 || month === 0 || month > 12) {
    return 'Data inválida.'
  }

  const monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

  if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) {
    monthLength[1] = 29
  }

  if (day > 0 && day <= monthLength[month - 1]) {
    return true
  } else {
    return 'Data inválida.'
  }
}

const formattedLaunchDate = computed({
  get() {
    if (!localRow.value.launchDate) return ''
    const [year, month, day] = localRow.value.launchDate.split('-')

    return `${day}-${month}-${year}`
  },
  set(newValue) {
    if (!newValue) {
      localRow.value.launchDate = null
      return
    }

    const [day, month, year] = newValue.split('-')
    localRow.value.launchDate = `${year}-${month}-${day}`
  },
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
      column.form !== false &&
      Object.prototype.hasOwnProperty.call(localRow.value, column.field)
    ) {
      const key = column.apiKey || column.field

      payload[key] = localRow.value[column.field]
    }
  })

  const store = activeStore.value
  if (!store) return console.error('Store não encontrada para a área:', props.area)

  if (props.area === 'users') await store.registerUser(payload)
  else if (props.area === 'publishers') await store.registerPublisher(payload)
  else if (props.area === 'books') await store.registerBook(payload)
  else if (props.area === 'renters') await store.registerRenter(payload)
  else if (props.area === 'rents') await store.registerRent(payload)
  else console.log('ERRO!!')

  emit('close-modal')
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

      payload[key] = localRow.value[column.field]
    }
  })

  const store = activeStore.value
  if (!store) return console.error('Store não encontrada para a área:', props.area)

  if (props.area === 'users') await store.editUser(props.row.id, payload)
  else if (props.area === 'publishers') await store.editPublisher(props.row.id, payload)
  else if (props.area === 'books') await store.editBook(props.row.id, payload)
  else if (props.area === 'renters') await store.editRenter(props.row.id, payload)
  else if (props.area === 'rents') await store.editRent(props.row.id, payload)
  else console.log('ERRO!!')

  emit('close-modal')
}

const remove = async () => {
  const store = activeStore.value
  if (!store) return console.error('Store não encontrada para a área:', props.area)

  if (props.area === 'users') await store.deleteUser(props.row.id)
  else if (props.area === 'publishers') await store.deletePublisher(props.row.id)
  else if (props.area === 'books') await store.deleteBook(props.row.id)
  else if (props.area === 'renters') await store.deleteRenter(props.row.id)
  else if (props.area === 'rents') await store.deleteRent(props.row.id)
  else console.log('ERRO!!')

  emit('close-modal')
}

const requiredRule = [(val) => (val && String(val).length > 0) || 'Este campo é obrigatório']

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

  return !isTaken
}

const nameRules = computed(() => [
  (val) => (val && val.length > 0) || 'O campo nome é obrigatório',
  (val) => val.length >= 3 || 'O nome precisa ter no mínimo 3 caracteres',
  (val) => !/\d/.test(val) || 'O nome não pode conter números',
  (val) =>
    isUnique(val, 'name', props.existingItems, props.mode, props.row) ||
    'Este nome de usuário já está em uso.',
])

const emailRules = computed(() => [
  (val) => (val && val.length > 0) || 'O campo email é obrigatório',
  (val) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val || '').trim()) || 'O formato do email é inválido',
  (val) =>
    isUnique(val, 'email', props.existingItems, props.mode, props.row) ||
    'Este email já está em uso.',
])

function getRulesFor(column) {
  switch (column.field) {
    case 'name':
      return nameRules.value
    case 'email':
      return emailRules.value
    // case 'password':
    //   return passwordRules;
    // Para todos os outros, podemos exigir que sejam preenchidos
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
    // A UI do Quasar já mostrou os erros nos campos
    console.log('Formulário inválido. Por favor, corrija os erros.')
  }
}
</script>
