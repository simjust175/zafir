/**
 * router/index.js
 * Auto routes + auth guard (fixed)
 */

import { createRouter, createWebHistory } from 'vue-router/auto'
import { routes } from 'vue-router/auto-routes'
import { useLoginStore } from '@/stores/loginState'

/* ============================
   ROUTER
============================ */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

/* ============================
   PUBLIC ROUTES
============================ */
const PUBLIC_ROUTES = [
  '/register',
  '/forgot-password',
  '/reset-password',
]

/* ============================
   AUTH GUARD
============================ */
router.beforeEach((to) => {
  const login = useLoginStore()
  const isLoggedIn = !!login.token
  const isPublicRoute = PUBLIC_ROUTES.includes(to.path)

  // 🔐 Not logged in → block protected routes only
  if (!isLoggedIn && !isPublicRoute) {
    return '/register'
  }

  // 🔒 Logged in → block auth pages
  if (isLoggedIn && isPublicRoute) {
    if (to.path === '/register') {
      return '/'
    }
  }

  // 🟢 Allow navigation
  return true
})

/* ============================
   VITE DYNAMIC IMPORT FIX
============================ */
router.onError((err, to) => {
  if (
    err?.message?.includes?.('Failed to fetch dynamically imported module')
  ) {
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