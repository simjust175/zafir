/**
 * router/index.js
 * Vue Router with file-based routing and auth guard
 */

import { createRouter, createWebHistory } from 'vue-router/auto'
import { routes } from 'vue-router/auto-routes'
import { useLoginStore } from '@/stores/loginState'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

const PUBLIC_ROUTES = [
  '/register',
  '/forgot-password',
  '/reset-password',
]

const DEV_MODE = import.meta.env.DEV

router.beforeEach((to) => {
  const login = useLoginStore()
  const isLoggedIn = !!login.token
  const isPublicRoute = PUBLIC_ROUTES.includes(to.path)

  if (DEV_MODE) {
    return true
  }

  if (!isLoggedIn && !isPublicRoute) {
    return '/register'
  }

  if (isLoggedIn && to.path === '/register') {
    return '/'
  }

  return true
})

router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (!localStorage.getItem('vuetify:dynamic-reload')) {
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    } else {
      console.error(err)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
