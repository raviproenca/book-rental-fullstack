<template>
  <q-card bordered class="shadow-4 bg-white q-pa-sm">
    <q-card-section class="q-gutter-y-md">
      <p
        style="border-bottom: 1px solid #ccc; padding-bottom: 7px"
        class="text-weight-bold text-grey-9"
      >
        {{ userData.name }}
      </p>

      <p
        style="border-bottom: 1px solid #ccc; padding-bottom: 7px"
        class="text-weight-bold text-grey-9"
      >
        {{ userData.email }}
      </p>

      <p
        style="border-bottom: 1px solid #ccc; padding-bottom: 7px"
        class="text-weight-bold text-grey-9"
      >
        {{ userData.role === 'ADMIN' ? 'Editor' : 'Leitor' }}
      </p>

      <div class="row justify-center q-gutter-x-sm">
        <q-btn dense flat @click="changeLang('en-US')">
          <img src="../assets/us.png" alt="us" />
        </q-btn>
        <q-btn dense flat @click="changeLang('pt-BR')">
          <img src="../assets/br.png" alt="br" />
        </q-btn>
        <q-btn dense flat @click="changeLang('es-ES')">
          <img src="../assets/es.png" alt="es" />
        </q-btn>
      </div>

      <q-btn
        @click="logout()"
        :loading="isLoggingOut"
        color="primary"
        dense
        rounded
        label="Log out"
        class="full-width"
      ></q-btn>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUsersStore } from 'src/stores/users-store'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const userString = localStorage.getItem('user')
const loginUser = ref(userString ? JSON.parse(userString) : null)

const usersStore = useUsersStore()
const { users } = storeToRefs(usersStore)

const userData = computed(() => {
  return users.value.find((user) => user.email === loginUser.value.email)
})

const { locale } = useI18n({ useScope: 'global' })

function changeLang(lang) {
  locale.value = lang
}

const router = useRouter()
const isLoggingOut = ref(false)

function logout() {
  isLoggingOut.value = true

  setTimeout(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }, 700)
}
</script>
