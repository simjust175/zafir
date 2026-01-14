<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <img
            src="/logo.png"
            alt="Billio"
            class="auth-logo"
            height="80"
          >
          <h1 class="auth-title">
            Welcome back
          </h1>
          <p class="auth-subtitle">
            Sign in to continue to your dashboard
          </p>
        </div>

        <LoginForm
          @sign-in="handleSignIn"
          @forgot-active="handleForgot"
        />

        <div class="auth-footer">
          <p class="auth-footer-text">
            Don't have an account?
            <a
              href="#"
              class="auth-link"
            >Contact your admin</a>
          </p>
        </div>
      </div>

      <div class="auth-features">
        <div class="feature-card">
          <div class="feature-icon">
            <v-icon
              icon="mdi-shield-check"
              size="24"
            />
          </div>
          <h3 class="feature-title">
            Secure & Encrypted
          </h3>
          <p class="feature-text">
            Your data is protected with enterprise-grade security
          </p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <v-icon
              icon="mdi-lightning-bolt"
              size="24"
            />
          </div>
          <h3 class="feature-title">
            Fast Processing
          </h3>
          <p class="feature-text">
            AI-powered invoice extraction in seconds
          </p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <v-icon
              icon="mdi-chart-line"
              size="24"
            />
          </div>
          <h3 class="feature-title">
            Smart Analytics
          </h3>
          <p class="feature-text">
            Real-time insights into your finances
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import LoginForm from './LoginForm.vue'

const emit = defineEmits(['signIn', 'forgotActive'])

const handleSignIn = () => {
  emit('signIn')
}

const handleForgot = (val) => {
  emit('forgotActive', val)
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%);
}

.auth-container {
  display: flex;
  gap: 64px;
  max-width: 1000px;
  width: 100%;
  align-items: center;
}

.auth-card {
  flex: 1;
  max-width: 420px;
  background: white;
  border-radius: 24px;
  padding: 48px 40px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.auth-logo {
  margin-bottom: 24px;
}

.auth-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0F172A;
  margin: 0 0 8px;
}

.auth-subtitle {
  font-size: 0.9375rem;
  color: #64748B;
  margin: 0;
}

.auth-footer {
  margin-top: 24px;
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #E2E8F0;
}

.auth-footer-text {
  font-size: 0.875rem;
  color: #64748B;
  margin: 0;
}

.auth-link {
  color: #6366F1;
  text-decoration: none;
  font-weight: 500;
}

.auth-link:hover {
  text-decoration: underline;
}

.auth-features {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.feature-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.feature-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.feature-title {
  font-size: 1rem;
  font-weight: 600;
  color: #0F172A;
  margin: 0 0 4px;
}

.feature-text {
  font-size: 0.875rem;
  color: #64748B;
  margin: 0;
  line-height: 1.5;
}

@media (max-width: 900px) {
  .auth-container {
    flex-direction: column;
    gap: 32px;
  }

  .auth-features {
    display: none;
  }

  .auth-card {
    max-width: 100%;
  }
}
</style>
