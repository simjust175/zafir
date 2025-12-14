/**
 * router/index.js
 * Auto routes + auth guard
 */

import { createRouter, createWebHistory } from 'vue-router/auto'
import { routes } from 'vue-router/auto-routes'
import { useLoginStore } from '@/stores/loginState'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

/* ============================
   AUTH GUARD
============================ */
router.beforeEach((to) => {
  const login = useLoginStore()

  const isLoggedIn = !!login.token
  const isRegisterPage = to.path === '/register'

  // ❌ Not logged in → always go to /register
  if (!isLoggedIn && !isRegisterPage) {
    return '/register'
  }

  // ❌ Logged in → block /register
  if (isLoggedIn && isRegisterPage) {
    return '/'
  }
})

/* ============================
   Vite dynamic import fix
============================ */
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