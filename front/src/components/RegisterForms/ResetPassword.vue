<template>
  <v-card class="pa-4 bg-red">
    <reset-password-form />
  </v-card>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const password = ref("");
const confirm = ref("");
const error = ref("");
const loading = ref(false);

// Guard: token must exist
onMounted(() => {
  if (!route.query.token) {
    error.value = "Invalid or missing reset link";
  }
});

async function submit() {
  error.value = "";

  if (!route.query.token) {
    error.value = "Invalid or missing reset link";
    return;
  }

  if (password.value.length < 8) {
    error.value = "Password must be at least 8 characters";
    return;
  }

  if (password.value !== confirm.value) {
    error.value = "Passwords do not match";
    return;
  }

  loading.value = true;

  try {
    const res = await fetch(
      `${import.meta.env.VITE_BASE_URL}/register/reset`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reset_token: route.query.token,
          new_password: password.value
        })
      }
    );

    const data = await res.json();

    if (!res.ok) {
      error.value = data?.Error || "Reset link expired or invalid";
      return;
    }

    // Success → redirect to login
    router.push("/login");

  } catch (err) {
    error.value = "Network error. Please try again.";
  } finally {
    loading.value = false;
  }
}
</script>