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
      <!--   <transition v-else name="fade" mode="out-in">
        <router-view />
      </transition> -->

      <footer>
        <footer-component class="bottom-0 right-0 left-0"/>
      </footer>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useTheme } from "vuetify";
import FooterComponent from "@/components/Header-footer/FooterComponent.vue";
import { setLogin } from "@/stores/loginState";

import { invoices } from "@/stores/invoiceState";
const invoiceStore = invoices()

// Vuetify theme instance
const theme = useTheme();

// Pinia store
const loginState = setLogin();

const router = useRouter();
const loggedIn = ref(false);
const loading = ref(false);
const localTheme = ref('light'); // fallback default

const themeColor = computed(() =>
  theme.global.name.value === 'dark'
    ? 'bg-grey-darken-5'
    : 'bg-grey-lighten-4'
);

const loggedInInfo = {
  user_email: localStorage.getItem("user_email"),
  token: localStorage.getItem("token"),
};

const isHomeRoute = computed(() => router.currentRoute.value.path === "/try");

async function validateToken() {
  const res = await fetch(`${import.meta.env.VITE_BASE_URL}/register/validateToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(loggedInInfo),
  });
  const isTokenValid = await res.json();
  return isTokenValid.Success;
}

//get Payment
const getPayments = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/invoice/payments`, {
      headers: { 'Content-Type': 'application/json' }
    })
    const resJson = await res.json()
    const pay = resJson.payments?.payments || []
    const inv = resJson.payments?.invoicing || []
    console.log("IN APP", pay, inv);
    
    invoiceStore.setPaymentsData(pay, inv)

  } catch (err) {
    console.error("❌ Failed to fetch payments:", err)
  }
}


onMounted(async () => {
  const isValid = await validateToken();
  loginState.token = isValid;
  if (!isValid) {
    router.push("/register");
  } else {
    loggedIn.value = true;
    router.push("/");
  }

  if (loginState.theme) {
    localTheme.value = loginState.theme;
    theme.global.name.value = loginState.theme;
  }

  await getPayments(); // 👈 Load into store

  loading.value = true;
  setTimeout(() => (loading.value = false), 3000);
})

function handleThemeChange(newTheme) {
  localTheme.value = newTheme;         // update local ref
  loginState.theme = newTheme;         // persist in store
  //theme.global.name.value = newTheme;
  theme.change(newTheme)  // apply immediately
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
