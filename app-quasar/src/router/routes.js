const routes = [
  {
    path: '/',
    component: () => import('layouts/LoginLayout.vue'),
    children: [
      { path: '', redirect: '/login' },
      { path: '/login', component: () => import('pages/LoginPage.vue') },
    ],
  },

  {
    path: '/app',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: 'app/usuarios' },
      { path: 'dashboard', component: () => import('pages/DashboardPage.vue') },
      { path: 'usuarios', component: () => import('pages/UsuariosPage.vue') },
      { path: 'editoras', component: () => import('pages/EditorasPage.vue') },
      { path: 'livros', component: () => import('pages/LivrosPage.vue') },
      { path: 'locatarios', component: () => import('pages/LocatariosPage.vue') },
      { path: 'alugueis', component: () => import('pages/AlugueisPage.vue') },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
