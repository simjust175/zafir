<template>
  <div>
    <v-app-bar
      prominent
      :collapse="collapse"
      elevate="4"
      density="compact" 
      scroll-behavior="hide"
      scroll-threshold="340"
    >
      <h1
        class="ml-5 zafir-text-primary cursor-pointer"
        @click.stop="$router.push('/')"
      >
        Z<span class="zafir-text-secondary">T</span>P
      </h1>

      <v-spacer />

      <!-- Live Email Watch Icon -->
      <v-btn
        v-if="loginState.token"
        id="liveBanner"
        variant="outlined"
        class="mr-3"
        color="error"
        rounded="xl"
        density="compact"
      >
        Live
        <span class="live-dot ml-2" />
      </v-btn>
      <!-- <v-tooltip
        activator="#liveBanner"
        location="bottom"
      >
        Monitoring emails
      </v-tooltip> -->

      <!-- Logout/Login Button -->
      <div
        class="d-flex align-center justify-space-between mx-8"
      >
        <notification-menu
          v-if="loginState.token" 
          :messages="fauxMessages"
        />
        <v-btn
          v-if="loginState.token"
          :icon="themeIcon"
          @click="theme.toggle()"
        />
        <v-btn
          v-if="loginState.token"
          icon
        >
          <v-icon
            class="no-ripple"
            @click="activateDialog = !activateDialog"
          >
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
        text="Are you sure?"
        @confirm="logout"
      />
    </v-app-bar>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useTheme } from "vuetify";
import { setLogin } from "@/stores/loginState"
const loginState = setLogin()
//import LanguageSwitch from "./LanguageSwitch.vue"
import { useRouter } from 'vue-router';

const router = useRouter();

const theme = useTheme();
// const themeIcon = {
//   light: 'mdi-weather-sunny',
//   dark: 'mdi-moon'
// }
// const icon
// function toggleTheme() {
//   theme.global.name.value = theme.global.current.value.dark ? "light" : "dark";
//   // return themeIcon[theme.global.name.value]
// }

const activateDialog = ref(false)

const themeIcon = computed(() =>
  theme.global.current.value.dark
    ? "mdi-weather-night"
    : "mdi-white-balance-sunny"
);

defineProps({
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
const fauxMessages = []
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
