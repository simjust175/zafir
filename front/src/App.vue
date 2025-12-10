<template>
  <v-app :theme="localTheme" class="d-flex flex-column justify-space-between" :class="themeColor">
    <v-main>
      <AppBar :logged-in-stat="loggedIn" @theme-update="handleThemeChange" />

      <navigation-bar language="en" />

      <overlay-component v-if="loading" :overlay-trigger="loading" />
      <session-banner />
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
import { ref, onMounted, nextTick } from "vue"
import { useTheme } from "vuetify"
import { useLoginStore } from "@/stores/loginState.js"
import { invoices } from "@/stores/invoiceState.js"
import { setupAutoLogout } from "@/stores/loginState";
import { useRouter } from "vue-router";

const router = useRouter();

const theme = useTheme()
const loginState = useLoginStore()
const invoiceStore = invoices()

const loading = ref(false)
const localTheme = ref("light")

// -----------------------------
// VALIDATE TOKEN (non-destructive)
// -----------------------------
async function validateToken() {
  await nextTick();

  if (
    !loginState.token ||
    !loginState.userInfo ||
    !loginState.userInfo.email
  ) {
    return false;
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
    console.error("❌ Token validation failed:", err)
    return false
  }
}

// -----------------------------
// MOUNT LOGIC
// -----------------------------

onMounted(async () => {
  loading.value = true
  setupAutoLogout(router);
  if (loginState.isLoggedIn) {
    if (loginState.theme) {
      localTheme.value = loginState.theme
      theme.global.name.value = loginState.theme
    }

    // Only validate if user is logged in
    const isValid = await validateToken()
    if (!isValid) {
      window.dispatchEvent(new CustomEvent("token-warning", {
        detail: { title: "Session Expired", message: "Please re-authenticate." }
      }));
    }
  }

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
#app {
  background-color: var(--v-theme-background);
  color: var(--v-theme-on-background);
}

.zafir-text-primary {
  color: #18578c;
}

.zafir-text-secondary {
  color: #3788bf;
}

.zafir-primary {
  background-color: #18578c;
}

.zafir-secondary {
  background-color: #3788bf;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.bounce {
  animation: bounce 0.8s infinite alternate;
}

@keyframes bounce {
  0% {
    transform: translateY(0);
  }

  100% {
    transform: translateY(-8px);
  }
}

.overlay-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
