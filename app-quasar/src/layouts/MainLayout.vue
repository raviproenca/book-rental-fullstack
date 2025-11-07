<template>
  <q-layout view="lHh Lpr lFf" class="background-color">
    <q-header elevated class="header-color q-py-md q-px-sm">
      <q-toolbar class="row justify-between">
        <q-btn
          dense
          size="md"
          class="q-mr-sm background-color2"
          text-color="black"
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title class="q-pl-md gt-xs text-h4 text-weight-medium text-with-shadow">
          {{ $t('header.title') }}
        </q-toolbar-title>

        <q-toolbar-title class="q-pl-md lt-sm text-h5 text-weight-medium text-with-shadow">
          {{ $t('header.title') }}
        </q-toolbar-title>

        <q-btn dense round size="lg" icon="o_person" color="white" text-color="black">
          <q-menu class="border-radius">
            <UserModalComponent />
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above class="nav-color" elevated>
      <div class="flex flex-center q-pa-md">
        <q-img src="src/assets/WDA GROUP LOGO.png" style="width: 100px" />
      </div>
      <q-list>
        <q-item
          class="q-pa-lg q-mt-sm shadow-1"
          v-for="link in translatedLinksList"
          :key="link.title"
          clickable
          :to="link.link"
        >
          <q-item-section v-if="link.icon" avatar>
            <q-icon :name="link.icon" color="white" size="md" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-white text-h6">{{ link.title }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view v-slot="{ Component }">
        <transition
          appear
          :enter-active-class="`animated ${$route.meta.transition || 'fadeIn'}`"
          leave-active-class="animated fadeOut"
          mode="out-in"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.text-with-shadow {
  text-shadow: 0px 0px 10px rgba(0, 0, 0, 0.25);
}
</style>

<script setup>
import { ref, computed } from 'vue'
import UserModalComponent from 'src/components/UserModalComponent.vue'
import { useI18n } from 'vue-i18n'

// Use a instância de i18n
const { t } = useI18n()

const linksList = [
  {
    title: 'menu.dashboard',
    icon: 'grid_view',
    link: '/app/dashboard',
  },
  {
    title: 'menu.users',
    icon: 'group',
    link: '/app/usuarios',
  },
  {
    title: 'menu.publishers',
    icon: 'import_contacts',
    link: '/app/editoras',
  },
  {
    title: 'menu.books',
    icon: 'library_books',
    link: '/app/livros',
  },
  {
    title: 'menu.renters',
    icon: 'person_add',
    link: '/app/locatarios',
  },
  {
    title: 'menu.rentals',
    icon: 'bookmark',
    link: '/app/alugueis',
  },
]

const translatedLinksList = computed(() => {
  return linksList.map((link) => {
    return {
      ...link,
      title: t(link.title),
    }
  })
})

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
