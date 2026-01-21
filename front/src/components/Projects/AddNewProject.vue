<template>
  <div class="add-project-wrapper">
    <transition name="view-slide" mode="out-in">
      <!-- Login View -->
      <div v-if="adding || !inTabs" key="login" class="form-view">
        <div class="form-header">
          <div class="icon-wrapper">
            <v-icon size="32" color="primary">mdi-rocket-launch-outline</v-icon>
          </div>
          <h2 class="form-title">Create New Project</h2>
          <p class="form-subtitle">Set up your project tracking in seconds</p>
        </div>

        <v-form ref="formRef" class="project-form" @submit.prevent="submitForm">
          <!-- Email Selection -->
          <div class="form-section">
            <label class="section-label">Email Account</label>
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
                :rules="[rules.required]"
                hide-details="auto"
                rounded="lg"
                required
              >
                <template #prepend-inner>
                  <v-icon size="20" color="grey-darken-1">mdi-email-outline</v-icon>
                </template>
              </v-select>
              
              <v-text-field
                v-else
                v-model="email"
                label="Email address"
                type="email"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required, rules.email]"
                class="email-input"
                hide-details="auto"
                rounded="lg"
                required
              >
                <template #prepend-inner>
                  <v-icon size="20" color="grey-darken-1">mdi-email-outline</v-icon>
                </template>
              </v-text-field>

              <v-tooltip location="top" open-delay="500">
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

          <!-- Password Field (only for new emails) -->
          <div v-if="addingNewEmail" class="form-section">
            <label class="section-label">Password</label>
            <v-text-field
              v-model="password"
              label="Email password"
              variant="outlined"
              density="comfortable"
              :append-inner-icon="pwd ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              :type="pwd ? 'password' : 'text'"
              :rules="[rules.required]"
              hide-details="auto"
              rounded="lg"
              required
              @click:append-inner="pwd = !pwd"
            >
              <template #prepend-inner>
                <v-icon size="20" color="grey-darken-1">mdi-lock-outline</v-icon>
              </template>
            </v-text-field>
          </div>

          <!-- Project Name -->
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
                <v-icon size="20" color="grey-darken-1">mdi-folder-outline</v-icon>
              </template>
            </v-text-field>
          </div>

          <!-- Action Buttons -->
          <div class="form-actions">
            <v-btn
              variant="outlined"
              size="large"
              rounded="lg"
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
              <v-icon start>mdi-rocket-launch</v-icon>
              {{ addingNewEmail ? 'Create Project' : 'Attach Project' }}
            </v-btn>
          </div>
        </v-form>
      </div>

      <!-- Initial View -->
      <div v-else key="project" class="initial-view">
        <div class="initial-icon">
          <v-icon size="80" color="primary">mdi-briefcase-plus-outline</v-icon>
        </div>
        <h2 class="initial-title">Start Your Next Project</h2>
        <p class="initial-subtitle">
          Track invoices, manage expenses, and stay organized
        </p>
        <v-btn
          color="primary"
          size="x-large"
          prepend-icon="mdi-plus"
          rounded="xl"
          elevation="2"
          class="create-btn"
          @click="adding = true"
        >
          Create Project
        </v-btn>
      </div>
    </transition>

    <SnackbarSteps ref="snackbarRef" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
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

    if (addingNewEmail.value) {
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
      email: emailToUse,
      password: pass,
      project_name: project_name.value
    }

    const endpoint = addingNewEmail.value
      ? '/invoice/newproject'
      : '/invoice/add-to-existing-email'

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
    
    // Emit the complete result from the backend
    emit('new-project-added', {
      project_name: project_name.value,
      email: emailToUse,
      ...result
    })

    emit('close')

    // Reset form
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
  padding: 32px;
  min-height: 500px;
}

/* Form View */
.form-view {
  max-width: 520px;
  margin: 0 auto;
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
}

.icon-wrapper {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%);
  border-radius: 24px;
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.25);
}

.form-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 8px;
  letter-spacing: -0.02em;
}

.form-subtitle {
  font-size: 0.9375rem;
  color: rgb(var(--v-theme-grey-600));
  margin: 0;
}

.project-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin-left: 4px;
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
  margin-top: 16px;
}

.form-actions > * {
  flex: 1;
}

.submit-btn {
  font-weight: 600;
  letter-spacing: 0.01em;
}

/* Initial View */
.initial-view {
  text-align: center;
  padding: 60px 32px;
  max-width: 500px;
  margin: 0 auto;
}

.initial-icon {
  margin-bottom: 32px;
  animation: float 3s ease-in-out infinite;
}

.initial-title {
  font-size: 2rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 12px;
  letter-spacing: -0.02em;
}

.initial-subtitle {
  font-size: 1rem;
  color: rgb(var(--v-theme-grey-600));
  margin: 0 0 40px;
  line-height: 1.6;
}

.create-btn {
  font-weight: 600;
  letter-spacing: 0.01em;
  padding: 24px 48px !important;
  font-size: 1rem;
}

/* Animations */
.view-slide-enter-active,
.view-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.view-slide-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}

.view-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.98);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Responsive */
@media (max-width: 600px) {
  .add-project-wrapper {
    padding: 24px 16px;
  }

  .form-title {
    font-size: 1.5rem;
  }

  .initial-title {
    font-size: 1.75rem;
  }

  .email-input-group {
    flex-direction: column;
  }

  .toggle-btn {
    width: 100%;
  }
}
</style>

<style>
/* Hide validation details for cleaner look */
.email-select .v-input__details,
.email-input .v-input__details {
  min-height: 0 !important;
  padding-top: 4px;
}
</style>