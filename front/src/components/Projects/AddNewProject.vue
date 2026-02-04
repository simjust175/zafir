<template>
  <div class="add-project-wrapper">
    <transition
      name="view-slide"
      mode="out-in"
    >
      <div
        v-if="adding || !inTabs"
        key="login"
        class="form-view"
      >
        <div class="form-header">
          <div class="icon-wrapper">
            <v-icon
              size="28"
              color="white"
            >
              mdi-rocket-launch-outline
            </v-icon>
          </div>
          <h2 class="form-title">
            Create New Project
          </h2>
          <p class="form-subtitle">
            Set up your project tracking in seconds
          </p>
        </div>

        <v-form
          ref="formRef"
          class="project-form"
          @submit.prevent="submitForm"
        >
          <div class="form-section">
            <label class="section-label">
              Email Account
              <span class="optional-label">(optional)</span>
            </label>
            <div class="email-input-group">
              <v-select
                v-if="!addingNewEmail"
                v-model="selectedEmail"
                :items="availableEmails"
                label="Select existing email"
                variant="outlined"
                density="comfortable"
                item-title="email"
                item-value="email"
                class="email-select"
                hide-details="auto"
                rounded="lg"
                clearable
              >
                <template #prepend-inner>
                  <v-icon
                    size="20"
                    color="grey-darken-1"
                  >
                    mdi-email-outline
                  </v-icon>
                </template>
              </v-select>
              
              <v-text-field
                v-else
                v-model="email"
                label="Email address"
                type="email"
                variant="outlined"
                density="comfortable"
                :rules="email ? [rules.email] : []"
                class="email-input"
                hide-details="auto"
                rounded="lg"
              >
                <template #prepend-inner>
                  <v-icon
                    size="20"
                    color="grey-darken-1"
                  >
                    mdi-email-outline
                  </v-icon>
                </template>
              </v-text-field>

              <v-tooltip
                location="top"
                open-delay="500"
              >
                <template #activator="{ props }">
                  <v-btn
                    v-if="availableEmails.length > 0"
                    :icon="!addingNewEmail ? 'mdi-plus-circle-outline' : 'mdi-arrow-left'"
                    size="large"
                    variant="outlined"
                    color="primary"
                    class="toggle-btn"
                    v-bind="props"
                    @click="toggleEmailMode"
                  />
                </template>
                <span>{{ !addingNewEmail ? 'Add new email' : 'Use existing email' }}</span>
              </v-tooltip>
            </div>
          </div>

          <div
            v-if="addingNewEmail && email"
            class="form-section"
          >
            <label class="section-label">Password</label>
            <v-text-field
              v-model="password"
              label="Email password"
              variant="outlined"
              density="comfortable"
              :append-inner-icon="pwd ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              :type="pwd ? 'password' : 'text'"
              :rules="email ? [rules.required] : []"
              hide-details="auto"
              rounded="lg"
              :required="!!email"
              @click:append-inner="pwd = !pwd"
            >
              <template #prepend-inner>
                <v-icon
                  size="20"
                  color="grey-darken-1"
                >
                  mdi-lock-outline
                </v-icon>
              </template>
            </v-text-field>
          </div>

          <!-- Email Guidance Card -->
          <div class="email-info-card">
            <div class="info-icon">
              <v-icon
                size="18"
                color="primary"
              >
                mdi-information-outline
              </v-icon>
            </div>
            <div class="info-content">
              <span
                v-if="hasEmailSelected"
                class="info-text"
              >
                <strong>With email:</strong> Invoices sent to this email will be automatically captured and added to this project.
              </span>
              <span
                v-else
                class="info-text"
              >
                <strong>Without email:</strong> You can manually upload invoices or use AI upload. Automatic email ingestion will not be available.
              </span>
            </div>
          </div>

          <div class="form-section">
            <label class="section-label">Project Name</label>
            <v-text-field
              v-model="project_name"
              label="Enter project name"
              type="text"
              variant="outlined"
              density="comfortable"
              :rules="[rules.required]"
              hide-details="auto"
              rounded="lg"
              required
            >
              <template #prepend-inner>
                <v-icon
                  size="20"
                  color="grey-darken-1"
                >
                  mdi-folder-outline
                </v-icon>
              </template>
            </v-text-field>
          </div>

          <div class="form-actions">
            <v-btn
              variant="outlined"
              size="large"
              rounded="lg"
              class="cancel-btn"
              @click="inTabs ? (adding = false) : $emit('close')"
            >
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              size="large"
              type="submit"
              rounded="lg"
              :loading="isSubmitting"
              class="submit-btn"
            >
              <v-icon
                start
                size="18"
              >
                mdi-rocket-launch
              </v-icon>
              {{ addingNewEmail ? 'Create Project' : 'Attach Project' }}
            </v-btn>
          </div>
        </v-form>
      </div>

      <div
        v-else
        key="project"
        class="initial-view"
      >
        <div class="initial-illustration">
          <div class="illustration-bg" />
          <div class="illustration-icon">
            <v-icon
              size="56"
              color="white"
            >
              mdi-briefcase-plus-outline
            </v-icon>
          </div>
        </div>
        <h2 class="initial-title">
          Start Your Next Project
        </h2>
        <p class="initial-subtitle">
          Track invoices, manage expenses, and stay organized with a new project workspace
        </p>
        <v-btn
          color="primary"
          size="x-large"
          prepend-icon="mdi-plus"
          rounded="xl"
          class="create-btn"
          @click="adding = true"
        >
          Create Project
        </v-btn>

        <div class="features-list">
          <div class="feature-chip">
            <v-icon
              size="16"
              color="success"
            >
              mdi-check-circle
            </v-icon>
            <span>Invoice tracking</span>
          </div>
          <div class="feature-chip">
            <v-icon
              size="16"
              color="success"
            >
              mdi-check-circle
            </v-icon>
            <span>Payment management</span>
          </div>
          <div class="feature-chip">
            <v-icon
              size="16"
              color="success"
            >
              mdi-check-circle
            </v-icon>
            <span>Email integration</span>
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

const pwd = ref(true)
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

const rules = {
  required: value => !!value || 'This field is required',
  email: value => /.+@.+\..+/.test(value) || 'Please enter a valid email'
}

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
  const isValid = await formRef.value.validate()
  if (!isValid.valid) return

  isSubmitting.value = true

  try {
    const emailToUse = addingNewEmail.value ? email.value : selectedEmail.value
    const pass = addingNewEmail.value ? password.value : undefined
    const hasEmail = emailToUse && emailToUse.trim()

    // Only verify email if one is provided with a new email
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

    // Use appropriate endpoint based on whether email is provided
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
    formRef.value?.resetValidation?.()
  } catch (err) {
    console.error('[submitForm] Error:', err)
    snackbarRef.value.showSnack(err.message || 'Unexpected error', 'error')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.add-project-wrapper {
  padding: 40px 32px;
  min-height: 480px;
}

.form-view {
  max-width: 480px;
  margin: 0 auto;
}

.form-header {
  text-align: center;
  margin-bottom: 36px;
}

.icon-wrapper {
  width: 72px;
  height: 72px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, 
    rgb(var(--v-theme-primary)) 0%, 
    rgb(var(--v-theme-secondary)) 100%
  );
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.3);
}

.form-title {
  font-size: 1.625rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 8px;
  letter-spacing: -0.02em;
}

.form-subtitle {
  font-size: 0.9375rem;
  color: rgb(var(--v-theme-grey-500));
  margin: 0;
}

.project-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin-left: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.optional-label {
  font-weight: 400;
  font-size: 0.75rem;
  color: rgb(var(--v-theme-grey-500));
}

.email-info-card {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(var(--v-theme-primary), 0.06);
  border-radius: 10px;
  border: 1px solid rgba(var(--v-theme-primary), 0.12);
}

.email-info-card .info-icon {
  flex-shrink: 0;
  margin-top: 1px;
}

.email-info-card .info-content {
  flex: 1;
}

.email-info-card .info-text {
  font-size: 0.8125rem;
  line-height: 1.5;
  color: rgb(var(--v-theme-on-surface));
}

.email-info-card .info-text strong {
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}

.email-input-group {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.email-select,
.email-input {
  flex: 1;
}

.toggle-btn {
  flex-shrink: 0;
  margin-top: 0;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  padding-top: 20px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.form-actions > * {
  flex: 1;
}

.cancel-btn {
  border-color: rgba(var(--v-theme-on-surface), 0.15);
  color: rgb(var(--v-theme-grey-700));
  font-weight: 600;
  text-transform: none;
}

.submit-btn {
  font-weight: 600;
  letter-spacing: 0.01em;
  text-transform: none;
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.25);
}

.initial-view {
  text-align: center;
  padding: 48px 24px;
  max-width: 440px;
  margin: 0 auto;
}

.initial-illustration {
  position: relative;
  margin-bottom: 32px;
}

.illustration-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, 
    rgba(var(--v-theme-primary), 0.12) 0%, 
    transparent 70%
  );
  border-radius: 50%;
  animation: pulse-bg 3s ease-in-out infinite;
}

.illustration-icon {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, 
    rgb(var(--v-theme-primary)) 0%, 
    rgb(var(--v-theme-secondary)) 100%
  );
  border-radius: 28px;
  box-shadow: 0 12px 32px rgba(var(--v-theme-primary), 0.35);
  animation: float 3s ease-in-out infinite;
}

.initial-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 12px;
  letter-spacing: -0.02em;
}

.initial-subtitle {
  font-size: 1rem;
  color: rgb(var(--v-theme-grey-500));
  margin: 0 0 32px;
  line-height: 1.6;
}

.create-btn {
  font-weight: 600;
  letter-spacing: 0.01em;
  text-transform: none;
  padding: 20px 40px !important;
  font-size: 1rem;
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.3);
  margin-bottom: 32px;
}

.features-list {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.feature-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(var(--v-theme-success), 0.08);
  border-radius: 20px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgb(var(--v-theme-grey-700));
}

.view-slide-enter-active,
.view-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.view-slide-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.view-slide-leave-to {
  opacity: 0;
  transform: translateY(-16px);
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes pulse-bg {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
  50% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.3; }
}

@media (max-width: 600px) {
  .add-project-wrapper {
    padding: 28px 20px;
  }

  .form-title {
    font-size: 1.375rem;
  }

  .initial-title {
    font-size: 1.5rem;
  }

  .email-input-group {
    flex-direction: column;
  }

  .toggle-btn {
    width: 100%;
  }

  .features-list {
    flex-direction: column;
    align-items: center;
  }
}
</style>

<style>
.email-select .v-input__details,
.email-input .v-input__details {
  min-height: 0 !important;
  padding-top: 4px;
}
</style>
