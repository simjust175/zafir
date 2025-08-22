<template>
  <v-app>
    <main
      class="pa-0"
    >
    <v-card color="blue">{{ db || "EMPTY 🥲😢😭" }}</v-card>
    <v-btn color="red" @click="connectToDb">TEST TEST!</v-btn>
      <!-- <v-btn icon="mdi-close" size="x-large" variant="plain" color="white" @click="router.push('/')"></v-btn> -->
      <RegisterMain />
    </main>
  </v-app>
</template>

<script setup>
import { useTheme } from 'vuetify';
import { useRouter } from 'vue-router';
import RegisterMain from '@/components/RegisterForms/RegisterMain.vue';

//test test tes 
import { ref } from "vue"
let db = ref("")
const connectToDb = async ()=> {
  const res = await fetch(`${import.meta.env.VITE_BASE_URL}/invoice/freeEmails`)
  db.value =  await res.json()
}

const router = useRouter();
const theme = useTheme();
</script>

<style></style>