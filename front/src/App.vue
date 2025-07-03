<template>
  <v-app>
    <v-main class="bg-grey-lighten-3">
      <AppBar
        :language="current"
        :logged-in-stat="loggedIn"
        @update-locale="changeLocale($event)"
      />
      <navigation-bar
        v-if="loggedIn && isHomeRoute"
        :language="current"
      />
      <router-view />
      
      <footer class="bg-red">
        <footer-component />
      </footer>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
// import { useLocale } from "vuetify";
import FooterComponent from "@/components/Header-footer/FooterComponent.vue";
import { useRouter } from 'vue-router';
import { setLogin } from "@/stores/loginState"
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

const loading = ref(true);
onMounted(async () => {
  const isValid = await validateToken();
  loginState.token = isValid //set the state in the Pinia store
  if (!isValid) {
    console.log("is valid", isValid);
    router.push("/register")
  } else {
    loggedIn.value = true
    router.push("/")
  }
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 8000);
});
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

</style>
