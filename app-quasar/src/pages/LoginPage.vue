<template>
  <q-page class="column items-center justify-center q-pa-md background-color">
    <div class="column items-center" style="width: 100%; max-width: 500px">
      <div class="row justify-between items-center full-width q-pl-md q-pr-md">
        <h1 class="text-h4 text-white text-weight-bolder text-with-shadow">LOGIN</h1>
        <q-btn
          flat
          dense
          no-caps
          label="Esqueci minha senha"
          class="text-white text-weight-bolder text-with-shadow text-subtitle1"
        />
      </div>

      <q-card class="full-width shadow-4" style="border-radius: 30px">
        <q-form @submit="handleLogin">
          <q-card-section class="q-gutter-y-lg q-pl-xl q-pr-xl q-pt-xl">
            <q-input
              v-model="email"
              type="email"
              placeholder="Digite seu email"
              outlined
              class="input-style"
              rounded
            >
              <template v-slot:prepend>
                <q-icon name="o_mail" />
              </template>
            </q-input>

            <q-input
              v-model="password"
              type="password"
              placeholder="Digite sua senha"
              outlined
              class="input-style"
              rounded
            >
              <template v-slot:prepend>
                <q-icon name="o_lock" />
              </template>
            </q-input>
          </q-card-section>

          <q-card-actions align="center" class="q-mb-xl q-mt-sm">
            <q-btn
              label="Entrar"
              type="submit"
              no-caps
              class="text-white text-weight-bold"
              style="width: 60%; border-radius: 10px; background-color: #006670"
              size="lg"
            />
          </q-card-actions>
        </q-form>
      </q-card>

      <q-img src="/assets/images/WDA GROUP LOGO.png" class="q-mt-lg" style="width: 120px" />
    </div>
  </q-page>
</template>

<style scoped>
.input-style:deep(.q-field__control) {
  box-shadow: 1px 2px 6px rgba(0, 0, 0, 0.25);
}
</style>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth-store'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const loading = ref(false)

const quasarInstance = useQuasar()
const authStore = useAuthStore()
const router = useRouter()

const handleLogin = async () => {
  loading.value = true
  try {
    await authStore.login({
      email: email.value,
      password: password.value,
    })

    router.push('/app/usuarios')
  } catch (error) {
    quasarInstance.notify({
      color: 'negative',
      position: 'top',
      message: error.message || 'Erro ao fazer login. Tente novamente.',
      icon: 'report_problem',
    })
  } finally {
    loading.value = false
  }
}
</script>
