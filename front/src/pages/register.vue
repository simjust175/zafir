<template>
  <v-app>
    <main
      class="pa-0"
    >
      <!-- <v-btn icon="mdi-close" size="x-large" variant="plain" color="white" @click="router.push('/')"></v-btn> -->
      <RegisterMain />
    </main>
  </v-app>
</template>

<script setup>
import { useTheme } from 'vuetify';
import { useRouter } from 'vue-router';
import RegisterMain from '@/components/RegisterForms/RegisterMain.vue';


const router = useRouter();
const theme = useTheme();
</script>

<style></style>