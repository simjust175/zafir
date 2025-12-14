<template>
  <MainPage />
</template>

<script setup>
import MainPage from '@/components/MainPage/MainPage.vue';
import { useLoginStore } from "@/stores/loginState.js";
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter()
const login = useLoginStore()
onMounted(()=> {if(!login.token) router.push("/")})
</script>
