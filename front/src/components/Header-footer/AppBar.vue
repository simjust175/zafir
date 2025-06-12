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
      <!-- <v-app-bar-nav-icon></v-app-bar-nav-icon> -->

      <!-- <v-toolbar-title>
        <v-icon @click="$router.push('/')" color="primary"
          >mdi mdi-hand-coin-outline</v-icon
        >
      </v-toolbar-title> -->

      <v-spacer />

      <div class="d-flex align-center justify-space-between mx-8">
        <!-- <language-switch @updateLocale="$emit('updateLocale', $event)"/> -->
        <v-btn
          v-if="loggedIn"
          icon
        >
          <v-icon @click="activateDialog = !activateDialog">
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
          {{ t('Login') }}
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
import store from "../../storage/index.js";
//import LanguageSwitch from "./LanguageSwitch.vue"
import { useRouter } from 'vue-router';

const router = useRouter();

const theme = useTheme();

function toggleTheme() {
  theme.global.name.value = theme.global.current.value.dark ? "light" : "dark";
}

import { useLocale } from 'vuetify'
const { t } = useLocale()

const activateDialog = ref(false)
const emit = defineEmits(["updateLocale"]);
const emitLocale = (lang) => emit("updateLocale", lang);
const themeStateIcon = computed(() =>
  theme.global.current.value.dark
    ? "mdi-weather-night"
    : "mdi-white-balance-sunny"
);

const props = defineProps({
  loggedInStat: Boolean,
});


const loggedIn = ref(store.state.loggedInStat);

watch(
  () => loggedIn,
  (newVal) => {
    loggedIn.value = newVal;
  }
);
watch(
  () => props.loggedInStat,
  (newVal) => {
    loggedIn.value = newVal;
  }
);

const logout = async () => {
  console.log("entered logout");
  const res = await fetch(`${import.meta.env.VITE_BASE_URL}/register/logout/${localStorage.getItem("user_email")}`, {
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
      store.commit("updateLoggedIn", false, "")
      loggedIn.value = false;
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
</style>
