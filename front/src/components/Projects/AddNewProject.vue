<template>
  <div class="create-project">
    <transition name="view-fade" mode="out-in">
      <div v-if="adding || !inTabs" key="form" class="form-view">
        <!-- Header -->
        <div class="form-header">
          <button class="close-btn" @click="inTabs ? (adding = false) : $emit('close')">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
          <div class="header-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>
              <path d="M3 9H21" stroke="currentColor" stroke-width="1.5"/>
              <path d="M7 5V3M17 5V3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <h2 class="header-title">Create Project</h2>
          <p class="header-subtitle">Set up invoice tracking for your client</p>
        </div>

        <!-- Form -->
        <v-form ref="formRef" class="project-form" @submit.prevent="submitForm">
          <!-- Project Name -->
          <div class="form-field">
            <label class="field-label">Project Name</label>
            <div class="input-wrapper">
              <span class="input-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M15 6L9 2L3 6V12L9 16L15 12V6Z" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
              <input
                v-model="project_name"
                type="text"
                class="text-input"
                placeholder="Enter project name"
                required
              />
            </div>
          </div>

          <!-- Email Section -->
          <div class="form-field">
            <div class="field-header">
              <label class="field-label">Email Connection</label>
              <span class="field-optional">Optional</span>
            </div>
            
            <div class="email-selector">
              <div v-if="!addingNewEmail && availableEmails.length > 0" class="select-wrapper">
                <span class="input-icon">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.25"/>
                    <path d="M2 6L9 10L16 6" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>
                  </svg>
                </span>
                <select v-model="selectedEmail" class="select-input">
                  <option value="">Select existing email</option>
                  <option v-for="email in availableEmails" :key="email" :value="email">
                    {{ email }}
                  </option>
                </select>
                <span class="select-arrow">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              </div>
              
              <div v-else class="input-wrapper">
                <span class="input-icon">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.25"/>
                    <path d="M2 6L9 10L16 6" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>
                  </svg>
                </span>
                <input
                  v-model="email"
                  type="email"
                  class="text-input"
                  placeholder="Email address"
                />
              </div>

              <button
                v-if="availableEmails.length > 0"
                type="button"
                class="toggle-btn"
                @click="toggleEmailMode"
              >
                <svg v-if="!addingNewEmail" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 3.75V14.25M3.75 9H14.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                <svg v-else width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M11.25 3.75L5.25 9L11.25 14.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Password (conditional) -->
          <div v-if="addingNewEmail && email" class="form-field">
            <label class="field-label">Email Password</label>
            <div class="input-wrapper">
              <span class="input-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="3" y="8" width="12" height="8" rx="2" stroke="currentColor" stroke-width="1.25"/>
                  <path d="M5.5 8V5.5C5.5 3.567 7.067 2 9 2V2C10.933 2 12.5 3.567 12.5 5.5V8" stroke="currentColor" stroke-width="1.25"/>
                </svg>
              </span>
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="text-input"
                placeholder="Email password"
              />
              <button type="button" class="visibility-btn" @click="showPassword = !showPassword">
                <svg v-if="showPassword" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M1.5 9C1.5 9 4 4 9 4C14 4 16.5 9 16.5 9C16.5 9 14 14 9 14C4 14 1.5 9 1.5 9Z" stroke="currentColor" stroke-width="1.25"/>
                  <circle cx="9" cy="9" r="2.5" stroke="currentColor" stroke-width="1.25"/>
                </svg>
                <svg v-else width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M2.5 2.5L15.5 15.5M7.5 7.758C7.03587 8.20917 6.75 8.83229 6.75 9.5C6.75 10.7426 7.75736 11.75 9 11.75C9.66771 11.75 10.2908 11.4641 10.742 11" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>
                  <path d="M4.5 5.5C2.5 7 1.5 9 1.5 9C1.5 9 4 14 9 14C10.5 14 11.8 13.5 12.8 12.8M16.5 9C16.5 9 14 4 9 4C8.2 4 7.5 4.1 6.8 4.3" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Info Card -->
          <div class="info-card" :class="{ 'with-email': hasEmailSelected }">
            <span class="info-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.25"/>
                <path d="M8 5V8.5M8 11V10.5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>
              </svg>
            </span>
            <span v-if="hasEmailSelected" class="info-text">
              Invoices sent to this email will be automatically captured and added to this project.
            </span>
            <span v-else class="info-text">
              You can manually upload invoices or use AI upload. Automatic email capture won't be available.
            </span>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <button
              type="button"
              class="btn btn-secondary"
              @click="inTabs ? (adding = false) : $emit('close')"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="isSubmitting || !project_name"
            >
              <span v-if="isSubmitting" class="btn-loader"></span>
              <span v-else>Create Project</span>
            </button>
          </div>
        </v-form>
      </div>

      <!-- Initial View -->
      <div v-else key="initial" class="initial-view">
        <div class="initial-visual">
          <div class="visual-glow"></div>
          <div class="visual-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="8" y="12" width="32" height="24" rx="3" stroke="currentColor" stroke-width="2"/>
              <path d="M8 18H40" stroke="currentColor" stroke-width="2"/>
              <rect x="14" y="24" width="20" height="3" rx="1.5" fill="currentColor" opacity="0.4"/>
              <rect x="14" y="30" width="12" height="3" rx="1.5" fill="currentColor" opacity="0.25"/>
            </svg>
          </div>
        </div>
        <h2 class="initial-title">Start a New Project</h2>
        <p class="initial-subtitle">Track invoices and payments for your client</p>
        <button class="btn btn-primary btn-large" @click="adding = true">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 3.75V14.25M3.75 9H14.25" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Create Project
        </button>
        <div class="initial-features">
          <div class="feature-tag">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M11.667 3.5L5.25 9.917L2.333 7" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Invoice tracking
          </div>
          <div class="feature-tag">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M11.667 3.5L5.25 9.917L2.333 7" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Payment management
          </div>
          <div class="feature-tag">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M11.667 3.5L5.25 9.917L2.333 7" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Email integration
          </div>
        </div>
      </div>
    </transition>

    <SnackbarSteps ref="snackbarRef" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import SnackbarSteps from '@/components/Utilities/SnackbarSteps.vue'

const snackbarRef = ref(null)

defineProps({ inTabs: Boolean })
const emit = defineEmits(['close', 'new-project-added'])

const showPassword = ref(false)
const adding = ref(false)
const addingNewEmail = ref(false)
const selectedEmail = ref('')
const email = ref('')
const password = ref('')
const project_name = ref('')
const availableEmails = ref([])
const formRef = ref(null)
const isSubmitting = ref(false)

const hasEmailSelected = computed(() => {
  const emailToCheck = addingNewEmail.value ? email.value : selectedEmail.value
  return emailToCheck && emailToCheck.trim().length > 0
})

watch(availableEmails, (update) => { 
  if (update.length < 1) addingNewEmail.value = true 
})

const toggleEmailMode = () => {
  addingNewEmail.value = !addingNewEmail.value
  email.value = ''
  password.value = ''
  selectedEmail.value = ''
}

onMounted(async () => {
  availableEmails.value = await getAvailableEmails()
})

const getAvailableEmails = async () => {
  try {
    const baseUrl = import.meta.env.VITE_BASE_URL
    if (!baseUrl) return []

    const res = await fetch(`${baseUrl}/invoice/freeEmails`, {
      headers: { 'Content-Type': 'application/json' }
    })

    if (!res.ok) {
      console.debug('Failed to fetch available emails:', res.status)
      return []
    }

    const data = await res.json()
    const freeEmails = data?.freeEmails || []

    if (!Array.isArray(freeEmails)) return []

    const set = new Set()
    freeEmails.forEach(item => {
      if (item?.email_address) set.add(item.email_address)
    })

    return [...set]
  } catch (err) {
    console.debug('Could not fetch available emails - backend may not be running')
    return []
  }
}

const verifyEmail = async (email, password) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/email/verify-email-access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    return await res.json()
  } catch (error) {
    console.error('Email verification error:', error)
    return { success: false, error: 'Network error during email verification' }
  }
}

const submitForm = async () => {
  if (!project_name.value) return
  
  isSubmitting.value = true

  try {
    const emailToUse = addingNewEmail.value ? email.value : selectedEmail.value
    const pass = addingNewEmail.value ? password.value : undefined
    const hasEmail = emailToUse && emailToUse.trim()

    if (addingNewEmail.value && hasEmail) {
      await snackbarRef.value.showSnack('Verifying email access...', 'progress')

      const verify = await verifyEmail(emailToUse, pass)

      if (!verify.success) {
        return snackbarRef.value.showSnack(
          verify.error || 'Email access failed',
          'error'
        )
      }

      await snackbarRef.value.showSnack('Email verified!', 'progress')
    }

    await snackbarRef.value.showSnack('Creating project...', 'progress')

    const payload = {
      email: hasEmail ? emailToUse : null,
      password: hasEmail ? pass : null,
      project_name: project_name.value
    }

    let endpoint = '/invoice/newproject'
    if (!hasEmail) {
      endpoint = '/invoice/newproject-no-email'
    } else if (!addingNewEmail.value) {
      endpoint = '/invoice/add-to-existing-email'
    }

    const url = `${import.meta.env.VITE_BASE_URL}${endpoint}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const rawText = await response.text()
    const result = JSON.parse(rawText)

    if (!response.ok) {
      throw new Error(result?.message || 'Failed to add project')
    }

    await snackbarRef.value.showSnack('Project created successfully!', 'success')
    
    emit('new-project-added', {
      project_name: project_name.value,
      email: emailToUse || null,
      ...result
    })

    emit('close')

    adding.value = false
    email.value = ''
    password.value = ''
    selectedEmail.value = ''
    project_name.value = ''
  } catch (err) {
    console.error('[submitForm] Error:', err)
    snackbarRef.value.showSnack(err.message || 'Unexpected error', 'error')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.create-project {
  padding: 32px;
}

/* Form View */
.form-view {
  max-width: 100%;
}

.form-header {
  position: relative;
  text-align: center;
  margin-bottom: 32px;
}

.close-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  border-radius: 10px;
  color: rgb(var(--v-theme-grey-400));
  cursor: pointer;
  transition: all 0.15s ease;
}

.close-btn:hover {
  background: rgba(var(--v-theme-on-surface), 0.06);
  color: rgb(var(--v-theme-on-surface));
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, 
    rgba(var(--v-theme-primary), 0.15) 0%, 
    rgba(var(--v-theme-primary), 0.08) 100%
  );
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
  border-radius: 16px;
  color: rgb(var(--v-theme-primary));
}

.header-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 6px;
  letter-spacing: -0.02em;
}

.header-subtitle {
  font-size: 0.9375rem;
  color: rgb(var(--v-theme-grey-500));
  margin: 0;
}

/* Form */
.project-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.field-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.field-optional {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgb(var(--v-theme-grey-400));
}

.input-wrapper,
.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  display: flex;
  color: rgb(var(--v-theme-grey-400));
  pointer-events: none;
  z-index: 1;
}

.text-input,
.select-input {
  width: 100%;
  padding: 14px 14px 14px 44px;
  background: rgba(var(--v-theme-on-surface), 0.03);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 12px;
  font-size: 0.9375rem;
  color: rgb(var(--v-theme-on-surface));
  transition: all 0.15s ease;
}

.text-input::placeholder {
  color: rgb(var(--v-theme-grey-400));
}

.text-input:focus,
.select-input:focus {
  outline: none;
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.03);
  box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.1);
}

.select-input {
  appearance: none;
  cursor: pointer;
  padding-right: 44px;
}

.select-arrow {
  position: absolute;
  right: 14px;
  display: flex;
  color: rgb(var(--v-theme-grey-400));
  pointer-events: none;
}

.visibility-btn {
  position: absolute;
  right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: rgb(var(--v-theme-grey-400));
  cursor: pointer;
  transition: all 0.15s ease;
}

.visibility-btn:hover {
  background: rgba(var(--v-theme-on-surface), 0.06);
  color: rgb(var(--v-theme-on-surface));
}

/* Email Selector */
.email-selector {
  display: flex;
  gap: 10px;
}

.email-selector .input-wrapper,
.email-selector .select-wrapper {
  flex: 1;
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(var(--v-theme-primary), 0.08);
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
  border-radius: 12px;
  color: rgb(var(--v-theme-primary));
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.toggle-btn:hover {
  background: rgba(var(--v-theme-primary), 0.15);
}

/* Info Card */
.info-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(var(--v-theme-on-surface), 0.03);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 12px;
}

.info-card.with-email {
  background: rgba(16, 185, 129, 0.06);
  border-color: rgba(16, 185, 129, 0.15);
}

.info-card.with-email .info-icon {
  color: #10B981;
}

.info-icon {
  flex-shrink: 0;
  color: rgb(var(--v-theme-grey-400));
  margin-top: 1px;
}

.info-text {
  font-size: 0.8125rem;
  line-height: 1.5;
  color: rgb(var(--v-theme-grey-600));
}

/* Actions */
.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  padding-top: 24px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  flex: 1;
}

.btn-secondary {
  background: rgba(var(--v-theme-on-surface), 0.06);
  color: rgb(var(--v-theme-grey-600));
}

.btn-secondary:hover {
  background: rgba(var(--v-theme-on-surface), 0.1);
}

.btn-primary {
  background: linear-gradient(135deg, 
    rgb(var(--v-theme-primary)) 0%, 
    color-mix(in srgb, rgb(var(--v-theme-primary)) 85%, black) 100%
  );
  color: white;
  box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.25);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.35);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-large {
  padding: 16px 32px;
  font-size: 1rem;
}

.btn-loader {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Initial View */
.initial-view {
  text-align: center;
  padding: 40px 24px;
}

.initial-visual {
  position: relative;
  margin-bottom: 28px;
}

.visual-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 140px;
  height: 140px;
  background: radial-gradient(circle, 
    rgba(var(--v-theme-primary), 0.15) 0%, 
    transparent 70%
  );
  border-radius: 50%;
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
  50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.4; }
}

.visual-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  margin: 0 auto;
  background: linear-gradient(135deg, 
    rgba(var(--v-theme-primary), 0.12) 0%, 
    rgba(var(--v-theme-primary), 0.06) 100%
  );
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
  border-radius: 24px;
  color: rgb(var(--v-theme-primary));
}

.initial-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 8px;
  letter-spacing: -0.02em;
}

.initial-subtitle {
  font-size: 0.9375rem;
  color: rgb(var(--v-theme-grey-500));
  margin: 0 0 28px;
}

.initial-features {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 32px;
  flex-wrap: wrap;
}

.feature-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(16, 185, 129, 0.08);
  border-radius: 20px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgb(var(--v-theme-grey-600));
}

.feature-tag svg {
  color: #10B981;
}

/* Animations */
.view-fade-enter-active,
.view-fade-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.view-fade-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.view-fade-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

/* Responsive */
@media (max-width: 480px) {
  .create-project {
    padding: 24px 20px;
  }

  .initial-features {
    flex-direction: column;
    align-items: center;
  }

  .form-actions {
    flex-direction: column-reverse;
  }
}
</style>
