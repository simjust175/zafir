<template>
  <v-app :theme="localTheme">
    <template v-if="isAuthPage">
      <v-main class="auth-main">
        <router-view v-slot="{ Component }">
          <component :is="Component" />
        </router-view>
      </v-main>
    </template>

    <template v-else>
      <!-- PERF: AppShell lazy loaded for non-auth pages -->
      <Suspense>
        <template #default>
          <AppShell>
            <OverlayComponent v-if="loading" :overlay-trigger="loading" />
            <SessionBanner v-if="!loading" />
            <router-view v-if="!loading" v-slot="{ Component }">
              <component :is="Component" />
            </router-view>
          </AppShell>
        </template>
        <template #fallback>
          <div class="app-loading">
            <div class="loading-spinner"></div>
          </div>
        </template>
      </Suspense>
    </template>

    <!-- PERF: GlobalToast lazy loaded - not needed for initial render -->
    <Suspense>
      <GlobalToast />
    </Suspense>
  </v-app>
</template>

<script setup>
/**
 * PERFORMANCE OPTIMIZATIONS:
 * - AppShell, GlobalToast lazy loaded via defineAsyncComponent
 * - OverlayComponent and SessionBanner kept sync (needed immediately)
 * - Data fetching deferred until after initial render
 */
import { ref, computed, onMounted, nextTick, watch, defineAsyncComponent } from "vue"
import { useTheme } from "vuetify"
import { useRoute, useRouter } from "vue-router"
import { useLoginStore } from "@/stores/loginState.js"
import { invoices } from "@/stores/invoiceState.js"
import { setupAutoLogout } from "@/stores/loginState"

import OverlayComponent from "@/components/Utilities/OverlayComponent.vue"
import SessionBanner from "@/components/Utilities/SessionBanner.vue"

const AppShell = defineAsyncComponent(() => 
  import("@/components/layout/AppShell.vue")
)
const GlobalToast = defineAsyncComponent(() => 
  import("@/components/ui/GlobalToast.vue")
)

const route = useRoute()
const router = useRouter()
const theme = useTheme()
const loginState = useLoginStore()
const invoiceStore = invoices()

const loading = ref(false)
const localTheme = ref("light")

const authPages = ['/register', '/forgot-password', '/reset-password']
const isAuthPage = computed(() => authPages.includes(route.path))

watch(() => loginState.theme, (newTheme) => {
  if (newTheme) {
    localTheme.value = newTheme
  }
}, { immediate: true })

async function validateToken() {
  await nextTick()

  if (!loginState.token || !loginState.userInfo?.email) {
    return false
  }

  try {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/register/validateToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: loginState.token,
        user_email: loginState.userInfo?.email
      }),
    })
    const json = await res.json()
    return json?.Success === true
  } catch (err) {
    console.error("Token validation failed:", err)
    return false
  }
}

async function getPayments() {
  try {
    const baseUrl = import.meta.env.VITE_BASE_URL
    if (!baseUrl) return
    
    const res = await fetch(`${baseUrl}/invoice/payments`, {
      headers: { "Content-Type": "application/json" }
    })
    const json = await res.json()
    invoiceStore.setPaymentsData(
      json?.payments?.payments || [],
      json?.payments?.invoicing || []
    )
  } catch (err) {
    console.debug("Could not fetch payments - backend may not be running")
  }
}

onMounted(async () => {
  loading.value = true
  setupAutoLogout(router)

  if (loginState.isLoggedIn) {
    if (loginState.theme) {
      localTheme.value = loginState.theme
    }

    const isValid = await validateToken()
    if (!isValid) {
      window.dispatchEvent(new CustomEvent("token-warning", {
        detail: { title: "Session Expired", message: "Please re-authenticate." }
      }))
    }
  }

  await invoiceStore.getActiveEmails() 
  await getPayments()
  loading.value = false
})
</script>

<style>
.auth-main {
  min-height: 100vh;
  background: linear-gradient(135deg, rgb(var(--v-theme-grey-100)) 0%, rgb(var(--v-theme-surface)) 100%);
}

.app-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: rgb(var(--v-theme-background));
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(var(--v-theme-primary), 0.2);
  border-top-color: rgb(var(--v-theme-primary));
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
