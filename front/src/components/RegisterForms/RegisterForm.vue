<template>
  <h2 class="text-center mb-3">Register</h2>
  <v-form ref="formData">
    <alert-prop :alert="activateAlert" type="error" label="User name or password are incorrect" :closable="true"/>
    <register-input label="Enter Email" type="email"  @input="credentials.user_email = $event"/>
    <register-input label="Enter password" type="pwd" @input="pwd1 = $event"/>
    <register-input label="Re-Enter password" type="pwd2" @input="pwd2 = $event" :pwd1="pwd1"/>
    <v-btn size="large" color="primary" @click.prevent="register" block> Register</v-btn>

  </v-form>
</template>

<script setup>

import { ref, reactive, defineEmits } from "vue";

const emit = defineEmits(["login"])

//Function to validate password
const isPasswordValid = (pwd) => { return /[A-Za-z]/.test(pwd) }

// Function to validate password match and strength
const passwordValidator = (pwd1, pwd2) => {
  if (pwd1 === pwd2 && isPasswordValid(pwd1)) {
    return pwd1;
  }
  throw new Error(`Invalid password!🥲😢😭`);
}

const activateAlert = ref(false) 
const formData = ref(null);
const pwd1 = ref("");
const pwd2 = ref("");
const credentials = reactive({
  user_email: "",
  pwd: ""
});


const validate = async () => {
  // const isPwdValid = passwordValidator(credentials);
  const { valid } = await formData.value.validate();
  if (!valid) return null;
   credentials.pwd = passwordValidator(pwd1.value, pwd2.value)
}

const register = async () => {
  const isFormValid = await validate();
  console.log("valid>>>>>>>>>>>>>>", isFormValid);
  //if(!isFormValid) return null
  const res = await fetch("http://localhost:3443/register/post", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(credentials)
  });
  const data = await res.json()
  console.log("sign up data:", data);
  if(!data.Success) return activateAlert.value = true
  emit("login")
  console.log(data);
}

</script>

<style></style>