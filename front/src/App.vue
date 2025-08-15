<template>
  <v-app
    :theme="localTheme"
    class="d-flex flex-column justify-space-between"
    :class="themeColor"
  >
    <v-main>
      <AppBar :logged-in-stat="loggedIn" @theme-update="handleThemeChange" />

      <navigation-bar language="en" />

      <overlay-component v-if="loading" :overlay-trigger="loading" />

      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
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
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useTheme } from "vuetify";
// import FooterComponent from "@/components/Header-footer/FooterComponent.vue";
import { setLogin } from "@/stores/loginState";
import { invoices } from "@/stores/invoiceState";
import useAuth from "@/composables/useAuth";

const theme = useTheme();
const router = useRouter();
const loginState = setLogin();
const invoiceStore = invoices();

const loggedIn = ref(false);
const loading = ref(false);
const localTheme = ref("light");

const themeColor = computed(() =>
  theme.global.name.value === "dark"
    ? "bg-grey-darken-5"
    : "bg-grey-lighten-4"
);


onMounted(async () => {
  const { validateToken, getPayments } = useAuth();
  const isValid = await validateToken();
  console.log("Is token valid?", isValid);
 const currentPath = router.currentRoute.value.fullPath;
  if (currentPath === "/register") {
    if(isValid) return router.push('/')
    return;
  };
  
  if (!isValid) {
    router.push("/register");
    return;
  }

  loggedIn.value = true;
  loginState.token = localStorage.getItem("token");

  if (loginState.theme) {
    localTheme.value = loginState.theme;
    theme.global.name.value = loginState.theme;
  }

  loading.value = true;
  await getPayments(invoiceStore);
  loading.value = false;
});

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