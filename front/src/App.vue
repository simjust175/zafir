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
      <AppShell>
        <OverlayComponent v-if="loading" :overlay-trigger="loading" />
        <!-- <SessionBanner v-if="!loading" /> -->
        <router-view v-if="!loading" v-slot="{ Component }">
          <component :is="Component" />
        </router-view>
      </AppShell>
    </template>

    <GlobalToast />
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from "vue"
import { useTheme } from "vuetify"
import { useRoute, useRouter } from "vue-router"
import { useLoginStore } from "@/stores/loginState.js"
import { invoices } from "@/stores/invoiceState.js"
import { setupAutoLogout } from "@/stores/loginState"
import AppShell from "@/components/layout/AppShell.vue"
import GlobalToast from "@/components/ui/GlobalToast.vue"
import OverlayComponent from "@/components/Utilities/OverlayComponent.vue"
// import SessionBanner from "@/components/Utilities/SessionBanner.vue"

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
</style>
