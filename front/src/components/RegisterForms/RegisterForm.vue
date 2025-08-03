<template>
  <v-container>
    <v-form
      ref="formData"
      v-model="isFormValid"
    >
      <alert-prop
        :alert="activateAlert"
        type="error"
        :label="alertMessage || 'User name or password are incorrect'"
        :closable="true"
      />

      <register-input
        label="Enter Email"
        type="email"
        @input="credentials.user_email = $event"
      />
      <register-input
        label="Enter Name"
        type="user_name"
        @input="credentials.user_name = $event"
      />
      <register-input
        label="Enter Password"
        type="pwd"
        @input="pwd1 = $event"
      />
      <register-input
        label="Re-Enter Password"
        type="pwd2"
        :pwd1="pwd1"
        @input="pwd2 = $event"
      />

      <v-btn
        color="primary"
        block
        class="mt-4"
        append-icon="mdi-plus"
        @click.prevent="register"
        :loading="loading"
      >
        Add user
      </v-btn>
    </v-form>

    <!-- ✅ Success Snackbar -->
    <v-snackbar
      v-model="showSnackbar"
      color="success"
      timeout="3000"
      location="top"
    >
      🎉 Registration successful!
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, reactive } from "vue";

const emit = defineEmits(["close"]);

const formData = ref(null);
const isFormValid = ref(false);

const loading = ref(false)
const activateAlert = ref(false);
const alertMessage = ref("");
const showSnackbar = ref(false);

const pwd1 = ref("");
const pwd2 = ref("");

const credentials = reactive({
  user_email: "",
  user_name: "",
  pwd: ""
});

const isPasswordValid = (pwd) => /[A-Za-z]/.test(pwd);

const passwordValidator = (pwd1, pwd2) => {
  if (pwd1 === pwd2 && isPasswordValid(pwd1)) return pwd1;
  throw new Error("Invalid password: must match and include letters.");
};

const validate = async () => {
  const { valid } = await formData.value.validate();
  if (!valid) return null;
  credentials.pwd = passwordValidator(pwd1.value, pwd2.value);
  return true;
};

const register = async () => {
  loading.value= true
  const isValid = await validate();
  if (!isValid) return;

  try {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/register/post`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials)
    });

    const data = await res.json();
    if (!data.Success) {
      alertMessage.value = data.message || "Registration failed.";
      activateAlert.value = true;
      return;
    }

    showSnackbar.value = true;

    // Optional: delay before closing
    setTimeout(() => {
      emit("close");
      loading.value = false;
    }, 1000);
  } catch (err) {
    alertMessage.value = "Something went wrong during registration.";
    activateAlert.value = true;
  }
};
</script>

<style scoped>
/* Optional: better spacing for small screens */
@media (max-width: 600px) {
  .v-card {
    width: 100% !important;
  }
}
</style>