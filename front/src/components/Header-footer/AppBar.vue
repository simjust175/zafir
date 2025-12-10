<template>
  <div>
    <v-app-bar
      prominent
      :collapse="collapse"
      elevate="4"
      density="compact"
      class="py-1"
      scroll-behavior="hide"
      scroll-threshold="340"
    >
      <v-icon
        v-if="router.currentRoute.value.fullPath == '/table'"
        icon="mdi-arrow-left"
        class="ml-2 zIndex"
        size="30"
        @click="pushMainRoute"
      />
      <!-- <h1
        class="ml-5 zafir-text-primary cursor-pointer"
        @click.stop="pushMainRoute"
      >
        B<span class="zafir-text-secondary">illi</span>o
      </h1> -->
      <img
        class="pl-0 ml-4 cursor-pointer"
        width="115"
        height="35"
        src="/logo.png"
        @click="pushLogoHome"
      >
      <v-spacer />

      <emails-live v-if="loginState.token" />

      <!-- <v-tooltip
        activator="#liveBanner"
        location="bottom"
      >
        Monitoring emails
      </v-tooltip> -->

      <!-- Logout/Login Button -->
      <div class="d-flex align-center justify-space-between ml-8 mr-4">
        <notification-menu v-if="loginState.token" />
        <v-btn
          :icon="themeIcon"
          @click="toggleTheme"
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
        @close="activateDialog = false"
        @confirm="logout"
      />
    </v-app-bar>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useTheme } from "vuetify";
import { useLoginStore } from "@/stores/loginState.js";
const loginState = useLoginStore();
import { useRouter } from 'vue-router';

const router = useRouter();


//CHECK IF ONLINE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
const online = computed(() => true)
const theme = useTheme();
const emit = defineEmits(['themeUpdate'])

function toggleTheme() {
  theme.toggle()
  emit('themeUpdate', theme.global.current.value.dark ? 'dark' : 'light');
}

const activateDialog = ref(false)
const pushMainRoute = () => localStorage.token ? router.push('/') : null;
const pushLogoHome = () => loginState.token?.length > 0 ? router.push('/') : router.push('/register');

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
)
// watch(
//   () => props.loggedInStat,
//   (newVal) => {
//     loggedIn.value = newVal;
//   }
// );
const logout = async () => {
  const email = localStorage.getItem('email') || loginState.userInfo?.email;
  console.log("email before logout", email);

  if (!email) {
    console.warn("No email in loginState, cannot logout");
    return;
  }

  const res = await fetch(`${import.meta.env.VITE_BASE_URL}/register/logout/${loginState.userInfo.email}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  });
  const data = await res.json();
  console.log("logout", data);
  if (data.Success) {
    // localStorage.removeItem("token");
    // localStorage.removeItem("user_email") 
    // loginState.token = false;
    loginState.logout()
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
