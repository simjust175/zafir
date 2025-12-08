<template>
  <v-app
    :theme="localTheme"
    class="d-flex flex-column justify-space-between"
    :class="themeColor"
  >
    <v-main>
      <AppBar
        :logged-in-stat="loggedIn"
        @theme-update="handleThemeChange"
      />

      <navigation-bar language="en" />

      <overlay-component
        v-if="loading"
        :overlay-trigger="loading"
      />

      <router-view v-slot="{ Component }">
        <transition>
          <component :is="Component" />
        </transition>
      </router-view>

      <footer>
        <footer-component class="bottom-0 right-0 left-0" />
      </footer>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from "vue"
// import { useRouter } from "vue-router"
import { useTheme } from "vuetify"
import { useLoginStore } from "@/stores/loginState.js"
import { invoices } from "@/stores/invoiceState.js"

// const router = useRouter()
const theme = useTheme()
const loginState = useLoginStore()
const invoiceStore = invoices()

const loading = ref(false)
const localTheme = ref("light")

// -----------------------------
// VALIDATE TOKEN (non-destructive)
// -----------------------------
async function validateToken() {
  if (!loginState.token || !loginState.userName) return false;
  console.log("in App.vue/validateToken", loginState.userName, loginState.userInfo);
  
  try {
    console.log("in App.vue/validateToken", loginState.userInfo?.email);
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
    console.error("❌ Token validation failed:", err)
    return false
  }
}

// -----------------------------
// MOUNT LOGIC
// -----------------------------
onMounted(async () => {
  loading.value = true

  // Trust Pinia persistence first
  if (loginState.isLoggedIn) {
    // Apply saved theme
    if (loginState.theme) {
      localTheme.value = loginState.theme
      theme.global.name.value = loginState.theme
    }
  }

  // Validate in background
  const isValid = await validateToken()
  if (!isValid) {
    console.warn("⚠️ Token invalid — keep user logged in until explicit logout")
    // Optionally: show a banner or trigger a silent refresh
    // Do NOT call logout() here
  }

  // Fetch data
  await getPayments()
  loading.value = false
})

// -----------------------------
// FETCH PAYMENTS
// -----------------------------
async function getPayments() {
  try {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/invoice/payments`, {
      headers: { "Content-Type": "application/json" }
    })
    const json = await res.json()
    invoiceStore.setPaymentsData(
      json?.payments?.payments || [],
      json?.payments?.invoicing || []
    )
  } catch (err) {
    console.error("❌ Failed to fetch payments:", err)
  }
}

// -----------------------------
// THEME CHANGE HANDLER
// -----------------------------
function handleThemeChange(newTheme) {
  localTheme.value = newTheme;
  loginState.theme = newTheme;
  theme.change(newTheme);
}
</script>

<style>
#app{
  background-color: var(--v-theme-background);
  color: var(--v-theme-on-background);
}

.zafir-text-primary{
  color: #18578c;
}
.zafir-text-secondary{
  color: #3788bf;
}
.zafir-primary{
  background-color: #18578c;
}
.zafir-secondary{
  background-color: #3788bf;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.bounce {
  animation: bounce 0.8s infinite alternate;
}

@keyframes bounce {
  0%   { transform: translateY(0); }
  100% { transform: translateY(-8px); }
}

.overlay-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

</style>
