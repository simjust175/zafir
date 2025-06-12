<template>
  <v-app>
      <v-main class="bg-grey-lighten-3" >
        <AppBar :language="current" @updateLocale="changeLocale($event)" :loggedInStat="loggedIn"/>
        <navigation-bar :language="current" v-if="loggedIn && isHomeRoute"/>
        <router-view />
      
      <footer class="bg-red">
        <footer-component />
      </footer>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useLocale } from "vuetify";
import FooterComponent from "@/components/Header-footer/FooterComponent.vue";
import store from "./storage";
import { useRouter } from 'vue-router';

const router = useRouter();

const { current } = useLocale();

function changeLocale(locale) {
  console.log("current before", current.value);
  current.value = locale;
  console.log("locale", locale, "current after", current.value);
  store.commit("updateLang", locale);
}

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
  console.log("is it valid", isTokenValid.Success ? true : false);
  return isTokenValid.Success ? true : false;
}

const loading = ref(true);
onMounted(async () => {
  const isValid = await validateToken();
  if (!isValid) {
    console.log("is valid", isValid);
    router.push("/register")
  } else {
    loggedIn.value = true
    store.commit("updateLoggedIn", true, loggedInInfo.user_email)
  }
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 8000);
});
</script>
