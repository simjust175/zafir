<template>
  <div class="login-form">
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="mb-4"
      closable
      @click:close="error = ''"
    >
      {{ error }}
    </v-alert>

    <v-form
      ref="formRef"
      v-model="valid"
      @submit.prevent="login"
    >
      <div class="form-field">
        <label class="field-label">Email</label>
        <v-text-field
          v-model="credentials.user_email"
          type="email"
          placeholder="you@company.com"
          prepend-inner-icon="mdi-email-outline"
          :rules="[v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'Enter a valid email']"
          hide-details="auto"
        />
      </div>

      <div class="form-field">
        <div class="label-row">
          <label class="field-label">Password</label>
          <a
            href="#"
            class="forgot-link"
            @click.prevent="emitForgot"
          >Forgot password?</a>
        </div>
        <v-text-field
          v-model="credentials.pwd"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Enter your password"
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          :rules="[v => !!v || 'Password is required']"
          hide-details="auto"
          @click:append-inner="showPassword = !showPassword"
        />
      </div>

      <v-btn
        type="submit"
        color="primary"
        size="large"
        block
        class="mt-6"
        :loading="loading"
        :disabled="!valid"
      >
        Sign in
      </v-btn>
    </v-form>

    <div class="divider">
      <span>or continue with</span>
    </div>

    <div class="social-buttons">
      <v-btn
        variant="outlined"
        class="social-btn"
        disabled
      >
        <v-icon
          icon="mdi-google"
          class="mr-2"
        />
        Google
      </v-btn>
      <v-btn
        variant="outlined"
        class="social-btn"
        disabled
      >
        <v-icon
          icon="mdi-microsoft"
          class="mr-2"
        />
        Microsoft
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useLoginStore } from '@/stores/loginState.js'

const emit = defineEmits(['signIn', 'forgotActive'])

const router = useRouter()
const loginState = useLoginStore()

const formRef = ref(null)
const valid = ref(false)
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const credentials = reactive({
  user_email: '',
  pwd: ''
})

const login = async () => {
  if (!valid.value) return

  loading.value = true
  error.value = ''

  try {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/register/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })

    const data = await res.json()

    if (!res.ok || !data.Success) {
      throw new Error(data.message || 'Invalid email or password')
    }

    const token = data.newToken?.newToken?.token || data.token
    const userId = data.newToken?.user_id || data.user_id
    const userName = data.newToken?.user_name;

    if (!token) {
      throw new Error('Authentication failed. Please try again.')
    }

    loginState.login({
      token,
      name: userName,
      info: { email: credentials.user_email, id: userId } // optional extra info
    });


    emit('signIn')
    router.push('/')
  } catch (err) {
    console.error('Login error:', err)
    error.value = err.message || 'Login failed. Please check your credentials.'
  } finally {
    loading.value = false
  }
}

const emitForgot = () => {
  if (!credentials.user_email) {
    error.value = 'Please enter your email first'
    return
  }
  emit('forgotActive', true)
}
</script>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;
}

.form-field {
  margin-bottom: 20px;
}

.field-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.forgot-link {
  font-size: 0.8125rem;
  color: #6366F1;
  text-decoration: none;
}

.forgot-link:hover {
  text-decoration: underline;
}

.divider {
  display: flex;
  align-items: center;
  margin: 24px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #E2E8F0;
}

.divider span {
  padding: 0 16px;
  font-size: 0.8125rem;
  color: #94A3B8;
}

.social-buttons {
  display: flex;
  gap: 12px;
}

.social-btn {
  flex: 1;
  text-transform: none;
  font-weight: 500;
}
</style>
