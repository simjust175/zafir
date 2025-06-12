<template>
  <login-form-2
    v-if="!forgotPassword"
    @forgot="forgotPassword = true"
  />
  <!-- <register-form v-if="!forgotPassword"/> -->
  <ForgotPwd
    v-else
    @close="forgotPassword = false"
  />
</template>

<script setup>
import ForgotPwd from "./ForgotPwd.vue"
// import LogIn from "./LogIn.vue";
import LoginForm2 from "./LoginForm2.vue";
import { ref, watch, defineEmits } from "vue";
const emit = defineEmits(["forgotActive"])

const forgotPassword = ref(false);
watch(forgotPassword , (newVal)=>{
    console.log("forgotActive", newVal);
    emit("forgotActive", newVal);
})

</script>

<style></style>