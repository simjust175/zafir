<template>
  <v-container>
    <v-form
      ref="formData"
      v-model="isFormValid"
    >
      <alert-prop
        v-if="error"
        type="error"
        :label="error"
        :closable="true"
      />

      <register-input
        label="New Password"
        type="pwd"
        @input="pwd1 = $event"
      />

      <register-input
        label="Confirm New Password"
        type="pwd2"
        :pwd1="pwd1"
        @input="pwd2 = $event"
      />

      <v-card-actions>
        <v-spacer />
        <v-btn
          color="primary"
          variant="elevated"
          :loading="loading"
          :disabled="!isFormValid"
          @click.prevent="resetPassword"
        >
          Reset Password
        </v-btn>
      </v-card-actions>
    </v-form>

    <v-snackbar
      v-model="success"
      color="success"
      timeout="3000"
      location="top"
    >
      ✅ Password reset successful. Redirecting to login…
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { onMounted } from "vue";

onMounted(() => { 
    if (!route.query.token) {
        error.value = "Invalid or expired reset link";
    }
});

const route = useRoute();
const router = useRouter();

const formData = ref(null);
const isFormValid = ref(false);

const pwd1 = ref("");
const pwd2 = ref("");

const loading = ref(false);
const error = ref("");
const success = ref(false);

const isPasswordValid = (pwd) =>
    pwd.length >= 8 && /[A-Za-z]/.test(pwd);

const resetPassword = async () => {
    error.value = "";

    if (!route.query.token) {
        error.value = "Invalid or expired reset link";
        return;
    }

    if (pwd1.value !== pwd2.value) {
        error.value = "Passwords do not match";
        return;
    }

    if (!isPasswordValid(pwd1.value)) {
        error.value = "Password must be at least 8 characters and contain letters";
        return;
    }
    console.log("passed the ifs");
    
    loading.value = true;

    try {
        console.log("in the rest fetch");

        const res = await fetch(
            `${import.meta.env.VITE_BASE_URL}/register/reset`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reset_token: route.query.token,
                    new_password: pwd1.value
                })
            }
        );

        const data = await res.json();

        if (!res.ok) {
            error.value = data?.Error || "Reset failed";
            return;
        }

        success.value = true;

        setTimeout(() => {
            router.push("/login");
        }, 2000);

    } catch {
        error.value = "Network error. Try again.";
    } finally {
        loading.value = false;
    }
};
</script>
