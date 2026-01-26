<template>
  <div class="accept-invite-page">
    <div class="invite-container">
      <transition name="fade" mode="out-in">
        <div v-if="loading" key="loading" class="state-card">
          <v-progress-circular indeterminate color="primary" size="48" />
          <h2>Validating Invitation</h2>
          <p>Please wait while we verify your invite...</p>
        </div>

        <div v-else-if="error" key="error" class="state-card error">
          <div class="state-icon error">
            <v-icon size="32">mdi-alert-circle</v-icon>
          </div>
          <h2>Invalid Invitation</h2>
          <p>{{ error }}</p>
          <v-btn
            color="primary"
            variant="flat"
            rounded="lg"
            class="mt-6"
            to="/login"
          >
            Go to Login
          </v-btn>
        </div>

        <div v-else-if="success" key="success" class="state-card success">
          <div class="state-icon success">
            <v-icon size="32">mdi-check-circle</v-icon>
          </div>
          <h2>Account Created!</h2>
          <p>Your account has been set up successfully. You can now log in.</p>
          <v-btn
            color="primary"
            variant="flat"
            rounded="lg"
            class="mt-6"
            to="/login"
          >
            Go to Login
          </v-btn>
        </div>

        <div v-else key="form" class="form-card">
          <div class="form-header">
            <div class="logo-icon">
              <v-icon size="28" color="primary">mdi-account-plus</v-icon>
            </div>
            <h1>Create Your Account</h1>
            <p>You've been invited to join the team</p>
          </div>

          <div class="invite-info">
            <v-icon size="18" color="grey-500">mdi-email-outline</v-icon>
            <span>{{ inviteEmail }}</span>
          </div>

          <form @submit.prevent="handleSubmit" class="form-content">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input
                v-model="form.name"
                type="text"
                class="form-input"
                :class="{ error: formErrors.name }"
                placeholder="Your full name"
                @input="formErrors.name = ''"
              />
              <span v-if="formErrors.name" class="form-error">{{ formErrors.name }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">Password</label>
              <div class="password-input-wrapper">
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-input"
                  :class="{ error: formErrors.password }"
                  placeholder="Create a password"
                  @input="formErrors.password = ''"
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="showPassword = !showPassword"
                >
                  <v-icon size="18">{{ showPassword ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
                </button>
              </div>
              <span v-if="formErrors.password" class="form-error">{{ formErrors.password }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">Confirm Password</label>
              <input
                v-model="form.confirmPassword"
                type="password"
                class="form-input"
                :class="{ error: formErrors.confirmPassword }"
                placeholder="Confirm your password"
                @input="formErrors.confirmPassword = ''"
              />
              <span v-if="formErrors.confirmPassword" class="form-error">{{ formErrors.confirmPassword }}</span>
            </div>

            <button type="submit" class="submit-btn" :disabled="submitting">
              <v-progress-circular v-if="submitting" indeterminate size="18" width="2" color="white" />
              <span v-else>Create Account</span>
            </button>
          </form>

          <p class="login-link">
            Already have an account?
            <router-link to="/login">Sign in</router-link>
          </p>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const API = import.meta.env.VITE_BASE_URL

const loading = ref(true)
const error = ref('')
const success = ref(false)
const submitting = ref(false)
const showPassword = ref(false)

const inviteEmail = ref('')
const inviteName = ref('')
const token = ref('')

const form = ref({ name: '', password: '', confirmPassword: '' })
const formErrors = ref({ name: '', password: '', confirmPassword: '' })

const validateToken = async () => {
  token.value = route.query.token
  if (!token.value) {
    error.value = 'No invitation token provided'
    loading.value = false
    return
  }

  try {
    const res = await fetch(`${API}/users/validate-invite/${token.value}`)
    const data = await res.json()

    if (!data.valid) {
      error.value = data.error || 'This invitation is invalid or has expired'
    } else {
      inviteEmail.value = data.email
      inviteName.value = data.name || ''
      form.value.name = data.name || ''
    }
  } catch (err) {
    error.value = 'Failed to validate invitation. Please try again.'
  } finally {
    loading.value = false
  }
}

const validateForm = () => {
  let valid = true
  
  if (!form.value.name.trim()) {
    formErrors.value.name = 'Name is required'
    valid = false
  }
  
  if (!form.value.password) {
    formErrors.value.password = 'Password is required'
    valid = false
  } else if (form.value.password.length < 8) {
    formErrors.value.password = 'Password must be at least 8 characters'
    valid = false
  }
  
  if (form.value.password !== form.value.confirmPassword) {
    formErrors.value.confirmPassword = 'Passwords do not match'
    valid = false
  }
  
  return valid
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  submitting.value = true
  
  try {
    const res = await fetch(`${API}/users/accept-invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: token.value,
        password: form.value.password,
        name: form.value.name
      })
    })

    const data = await res.json()

    if (!res.ok || !data.success) {
      error.value = data.error || 'Failed to create account'
    } else {
      success.value = true
    }
  } catch (err) {
    error.value = 'An error occurred. Please try again.'
  } finally {
    submitting.value = false
  }
}

onMounted(validateToken)
</script>

<style scoped>
.accept-invite-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, rgb(var(--v-theme-grey-50)) 0%, rgb(var(--v-theme-grey-100)) 100%);
}

.invite-container {
  width: 100%;
  max-width: 440px;
}

.state-card,
.form-card {
  background: rgb(var(--v-theme-surface));
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.state-card {
  padding: 48px 40px;
  text-align: center;
}

.state-card h2 {
  margin: 24px 0 8px;
  font-size: 1.375rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.state-card p {
  margin: 0;
  font-size: 0.9375rem;
  color: rgb(var(--v-theme-grey-500));
  line-height: 1.5;
}

.state-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.state-icon.error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.state-icon.success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.form-card {
  padding: 40px;
}

.form-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.form-header h1 {
  margin: 0 0 8px;
  font-size: 1.5rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.form-header p {
  margin: 0;
  font-size: 0.9375rem;
  color: rgb(var(--v-theme-grey-500));
}

.invite-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgb(var(--v-theme-grey-50));
  border-radius: 10px;
  margin-bottom: 28px;
}

.invite-info span {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--v-theme-grey-700));
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
}

.form-input {
  width: 100%;
  height: 48px;
  padding: 0 16px;
  border: 1px solid rgb(var(--v-theme-grey-200));
  border-radius: 10px;
  font-size: 0.9375rem;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-input::placeholder {
  color: rgb(var(--v-theme-grey-400));
}

.form-input.error {
  border-color: #ef4444;
}

.form-error {
  font-size: 0.8125rem;
  color: #ef4444;
}

.password-input-wrapper {
  position: relative;
}

.password-input-wrapper .form-input {
  padding-right: 48px;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgb(var(--v-theme-grey-500));
  cursor: pointer;
  padding: 4px;
}

.password-toggle:hover {
  color: rgb(var(--v-theme-grey-700));
}

.submit-btn {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 10px;
  background: rgb(var(--v-theme-primary));
  color: white;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
}

.submit-btn:hover:not(:disabled) {
  background: rgb(var(--v-theme-primary-darken-1));
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-link {
  margin: 24px 0 0;
  text-align: center;
  font-size: 0.875rem;
  color: rgb(var(--v-theme-grey-500));
}

.login-link a {
  color: rgb(var(--v-theme-primary));
  font-weight: 500;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>
