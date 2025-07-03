<template>
  <div>
    <v-app-bar
      prominent
      :collapse="collapse"
      elevate="4"
      density="compact"
      class="bg-grey-lighten-5"
      scroll-behavior="hide"
      scroll-threshold="340"
    >
      <h1 class="ml-5 zafir-text-primary cursor-pointer" @click.stop="$router.push('/')">
        Z<span class="zafir-text-secondary">T</span>P
      </h1>

      <v-spacer />

      <!-- Live Email Watch Icon -->
      <v-btn variant="outlined" class="mr-3" color="error" rounded="xl" density="compact">
        Live
        <span class="live-dot ml-2" />
      </v-btn>
      <v-tooltip activator="parent" location="bottom">Monitoring new emails</v-tooltip>

      <!-- Logout/Login Button -->
      <div class="d-flex align-center justify-space-between mx-8">
        <v-btn
          v-if="loginState.token"
          icon
        >
          <v-icon @click="activateDialog = !activateDialog" class="no-ripple">
            mdi-export
          </v-icon>
        </v-btn>
        <v-btn
          v-else
          color="primary"
          variant="outlined"
          class="mx-4 component"
          @click.stop="$router.push('/register')"
        >
          Login
        </v-btn>
      </div>

      <main-dialog
        :activate-dialog="activateDialog"
        title="Confirm Log-out"
        text="confirm_dialog"
        @confirm="logout"
      />
    </v-app-bar>
  </div>
</template>

<script setup></script>

<script setup>
import { ref, computed, watch } from "vue";
import { useTheme } from "vuetify";
import { setLogin } from "@/stores/loginState"
const loginState = setLogin()
//import LanguageSwitch from "./LanguageSwitch.vue"
import { useRouter } from 'vue-router';

const router = useRouter();

const theme = useTheme();

function toggleTheme() {
  theme.global.name.value = theme.global.current.value.dark ? "light" : "dark";
}

const activateDialog = ref(false)
const emit = defineEmits(["updateLocale"]);
const themeStateIcon = computed(() =>
  theme.global.current.value.dark
    ? "mdi-weather-night"
    : "mdi-white-balance-sunny"
);

const props = defineProps({
  loggedInStat: Boolean,
});

const loggedIn = ref()

watch(
  () => loginState.token,
  (newVal) => {
    loggedIn.value = newVal;
  }
);
// watch(
//   () => props.loggedInStat,
//   (newVal) => {
//     loggedIn.value = newVal;
//   }
// );

const logout = async () => {
  console.log("entered logout");
  const res = await fetch(`${import.meta.env.VITE_BASE_URL}/register/logout/${loginState.userName}`, {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      }
  });
  const data = await res.json();
  console.log("logout", data);
  if (data.Success) {
      localStorage.removeItem("token");
      localStorage.removeItem("user_email") 
      loginState.token = false;
      router.push("/register")
  }
}
</script>

<style scoped>
#logo {
  z-index: 1;
}

#logo-text {
  z-index: 2;
}
.live-dot {
  height: 10px;
  width: 10px;
  background-color: red;
  border-radius: 50%;
  display: inline-block;
  animation: pulse 1.5s infinite;
  z-index: 1;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.5;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
