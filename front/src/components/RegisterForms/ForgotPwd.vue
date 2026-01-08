<template>
  <v-container class="pt-6">
    <!-- =====================
         FORM
    ====================== -->
    <v-card
      v-if="!sent"
      elevation="3"
      rounded="xl"
      class="pa-6"
    >
      <h3 class="text-h6 mb-4">Forgot your password?</h3>

      <v-text-field
        v-model="email"
        label="Email address"
        type="email"
        variant="outlined"
        prepend-inner-icon="mdi-email-outline"
      />

      <v-btn
        block
        color="primary"
        size="large"
        class="mt-4"
        :disabled="!validEmail || loading"
        :loading="loading"
        @click="sendResetLink"
      >
        Send reset link
      </v-btn>
    </v-card>

    <!-- =====================
         SUCCESS STATE
    ====================== -->
    <v-card
      v-else
      elevation="2"
      rounded="xl"
      class="pa-8 text-center success-card"
    >
      <v-icon
        size="64"
        color="primary"
        class="mb-4 pulse"
      >
        mdi-email-check-outline
      </v-icon>

      <h3 class="text-h6 mb-2">
        Check your inbox
      </h3>

      <p class="text-body-2 text-medium-emphasis mb-4">
        If an account exists for <strong>{{ maskedEmail }}</strong>,
        we’ve sent a secure password reset link.
      </p>

      <p class="text-caption mb-6">
        The link expires in 15 minutes.
      </p>

      <v-btn
        variant="text"
        color="primary"
        @click="resend"
      >
        Resend email
      </v-btn>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed } from "vue";

const email = ref("");
const sent = ref(false);
const loading = ref(false);

const validEmail = computed(() =>
  /.+@.+\..+/.test(email.value)
);

const maskedEmail = computed(() => {
  const [name, domain] = email.value.split("@");
  if (!domain) return "";
  return `${name.slice(0, 2)}***@${domain}`;
});

async function sendResetLink() {
  loading.value = true;
  console.log("triggred reset");
  
  try {
    await fetch(`${import.meta.env.VITE_BASE_URL}/register/forgot_pwd`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_email: email.value })
    });

    // Always show success (security best practice)
    sent.value = true;

  } catch {
    // still show success to avoid email enumeration
    sent.value = true;
  } finally {
    loading.value = false;
  }
}

function resend() {
  sent.value = false;
}
</script>

<style scoped>
.success-card {
  max-width: 420px;
  margin: auto;
}

.pulse {
  animation: pulse 1.8s ease-in-out infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.85;
  }
  50% {
    transform: scale(1.08);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.85;
  }
}
</style>