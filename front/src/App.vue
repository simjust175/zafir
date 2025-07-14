<template>
  <v-app
    :theme="themeSetter"
    class="d-flex flex-column justify-space-between"
    :class="{'bg-grey-lighten-5' : currentTheme === 'light'}"
  >
    <v-main >
      <!-- :class="{ 'bg-grey-lighten-3': currentTheme === 'light' }" -->
      <AppBar :logged-in-stat="loggedIn" />

      <!-- <navigation-bar
        v-if="loggedIn && isHomeRoute"
        :language="current"
      /> -->
      <navigation-bar language="en" />

      <!-- Animated overlay when loading -->
      <overlay-component :overlay-trigger="loading" v-if="loading" />

      <!-- Smooth fade transition between route views -->
      <transition
        v-else
        name="fade"
        mode="out-in"
      >
        <router-view />
      </transition>



      <!-- Footer with cleaner separation -->
      <footer>
        <footer-component class="bg-red" />
      </footer>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, reactive,  onMounted, computed } from "vue";
// import { useLocale } from "vuetify";
import FooterComponent from "@/components/Header-footer/FooterComponent.vue";
import { useRouter } from 'vue-router';
import { setLogin } from "@/stores/loginState";
import { useTheme } from "vuetify";
const loginState = setLogin()
const router = useRouter();


const loggedIn = ref(false)
const loggedInInfo = {
  user_email:localStorage.getItem("user_email"),
  token: localStorage.getItem("token"),
};

const isHomeRoute = computed(() => router.currentRoute.value.path === "/try");
async function validateToken() {
  console.log("starting to validate", loggedInInfo, "base url", import.meta.env.VITE_BASE_URL);
  const res = await fetch(`${import.meta.env.VITE_BASE_URL}/register/validateToken`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loggedInInfo),
  });
  const isTokenValid = await res.json();
  return isTokenValid.Success ? true : false;
}

const loading = ref(false);
onMounted(async () => {
  const isValid = await validateToken();
  loginState.token = isValid //set the state in the Pinia store
  if (!isValid) {
    router.push("/register")
  } else {
    loggedIn.value = true
    router.push("/")
  }
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 3000);
});


/// THEME 🌞/🌛
const themeSetter = ref('light')
const theme = useTheme()
let currentTheme = reactive(theme.global.name.value)

</script>

<style>
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
