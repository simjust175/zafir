<template>
  <div class="d-flex flex-column align-center justify-center">
    <transition
      name="slide-up"
      mode="out-in"
    >
      <v-card
        v-if="adding || !inTabs"
        key="login"
        class="pa-4 mt-12"
        min-width="500"
        max-width="600"
        flat
      >
        <div class="d-flex flex-column align-center justify-center">
          <v-icon
            size="48"
            color="primary"
          >
            mdi-plus-circle
          </v-icon>
          <h3 class="mt-3">
            Add project
          </h3>
        </div>

        <v-form
          ref="formRef"
          class="mt-4"
          @submit.prevent="submitForm"
        >
          <div class="d-flex align-center justify-center mb-6">
            <v-select
              v-if="!addingNewEmail"
              v-model="selectedEmail"
              :items="availableEmails"
              label="Select existing email"
              item-title="email"
              item-value="email"
              class="flex-grow-1 select-email"
              :rules="[rules.required]"
              required
            />
            <v-text-field
              v-else
              v-model="email"
              label="Email"
              type="email"
              :rules="[rules.required, rules.email]"
              class="flex-grow-1 select-email"
              required
            />
            <v-tooltip
              location="top"
              open-delay="500"
              :text="!addingNewEmail ? 'Add new email' : 'Back'"
            >
              <template #activator="{ props }">
                <v-btn
                  v-if="availableEmails.length > 0"
                  variant="flat"
                  :icon="!addingNewEmail ? 'mdi-plus' : 'mdi-arrow-u-left-top'"
                  rounded="lg"
                  color="primary"
                  class="ml-2"
                  v-bind="props"
                  @click="toggleEmailMode"
                />
              </template>
            </v-tooltip>
          </div>

          <v-text-field
            v-if="addingNewEmail"
            v-model="password"
            label="Password"
            :append-inner-icon="pwd ? 'mdi-eye' : 'mdi-eye-off'"
            :type="pwd ? 'password' : 'text'"
            :rules="[rules.required]"
            required
            @click:append-inner="pwd = !pwd"
          />

          <v-text-field
            v-model="project_name"
            label="Project name"
            type="text"
            :rules="[rules.required]"
            required
          />

          <div class="d-flex justify-end mt-4 gap-2">
            <v-btn
              v-if="inTabs"
              variant="text"
              @click="adding = false"
            >
              Back
            </v-btn>
            <v-btn
              v-else
              variant="text"
              @click="$emit('close')"
            >
              Cancel
            </v-btn>
            <v-btn
              append-icon="mdi-rocket-launch"
              color="primary"
              type="submit"
            >
              {{ addingNewEmail ? 'Add New Email & Start' : 'Attach Project' }}
            </v-btn>
          </div>
        </v-form>
      </v-card>

      <v-card
        v-else
        key="project"
        class="pa-4 text-center mt-12"
        flat
      >
        <v-icon
          size="48"
          color="primary"
        >
          mdi-domain-plus
        </v-icon>
        <h3 class="mt-3">
          Add a New Project
        </h3>
        <v-btn
          color="primary"
          class="mt-4"
          prepend-icon="mdi-plus"
          @click="adding = true"
        >
          New Project
        </v-btn>
      </v-card>
    </transition>
    <SnackbarSteps ref="snackbarRef" />
    <v-snackbar
      v-model="snack.show"
      :color="snack.color"
      location="top"
      multi-line
      timeout="3500"
    >
      {{ snack.message }}
      <template #actions>
        <v-btn
          icon
          @click="snack.show = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import SnackbarSteps from '@/components/Utilities/SnackbarSteps.vue'
const snackbarRef = ref(null)

defineProps({ inTabs: Boolean })
const emit = defineEmits(['close', 'newProjectAdded'])

const pwd = ref(true)
const adding = ref(false)
const addingNewEmail = ref(false)
const selectedEmail = ref('')
const email = ref('')
const password = ref('')
const project_name = ref('')
const availableEmails = ref([])
const formRef = ref(null)

watch(availableEmails, (update)=> {if(update.length < 1) addingNewEmail.value = true})
const snack = ref({ show: false, color: 'success', message: '' })

const showSnack = (message, color = 'success') => {
  snack.value = { show: true, message, color }
  setTimeout(() => (snack.value.show = false), 2000)
}

const rules = {
  required: value => !!value || 'Required.',
  email: value => /.+@.+\..+/.test(value) || 'E-mail must be valid.'
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
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/invoice/freeEmails`, {
      headers: { 'Content-Type': 'application/json' }
    })
    const set = new Set();
    const data = await res.json()
    data.freeEmails.forEach(email => set.add(email.email_address));
    return [...set];
    //return data.freeEmails.map(email => email.email_address) || []
  } catch (err) {
    console.error(err)
    showSnack('Problems with emails: ' + err.message, 'error')
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

  try {
    const emailToUse = addingNewEmail.value ? email.value : selectedEmail.value
    const pass = addingNewEmail.value ? password.value : undefined

    if (addingNewEmail.value) {
      await snackbarRef.value.showSnack('Verifying email access...', 'info')
      await snackbarRef.value.showSnack('✅ Email verified!...', 'info')
      const { success, error } = await verifyEmail(emailToUse, pass)
      if (!success) return snackbarRef.value.showSnack(error || 'Email access failed', 'error')
    }

    await snackbarRef.value.showSnack('Checking availability...', 'info')

    const payload = {
      email: emailToUse,
      password: pass,
      project_name: project_name.value
    }

    const endpoint = addingNewEmail.value
      ? '/invoice/newproject'
      : '/invoice/add-to-existing-email'

    await snackbarRef.value.showSnack('Creating project...', 'info')

    const response = await fetch(`${import.meta.env.VITE_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const result = await response.json()

    if (!response.ok) throw new Error(result?.message || 'Failed to add project')

    await snackbarRef.value.showSnack('✅ Project successfully added!', 'success')
    emit('close')
    emit('newProjectAdded')

    // Reset
    adding.value = false
    email.value = ''
    password.value = ''
    selectedEmail.value = ''
    project_name.value = ''
    formRef.value?.resetValidation?.()
  } catch (err) {
    console.error(err)
    snackbarRef.value.showSnack('Error: ' + err.message, 'error')
  }
}
</script>

<style scoped>
.gap-2 > * + * {
  margin-left: 8px;
}
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s ease;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>
<style>
.select-email .v-input__details{
  display:none;
}

</style>