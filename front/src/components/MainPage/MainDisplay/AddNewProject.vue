<template>
  <div class="d-flex flex-column">
    <transition
      name="slide-up"
      mode="out-in"
    >
      <v-card
        v-if="adding"
        key="login"
        class="pa-4 mt-12"
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
          <v-text-field
            v-model="email"
            label="Email"
            type="email"
            :rules="[rules.required, rules.email]"
            required
          />

          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            :rules="[rules.required]"
            required
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
              variant="text"
              @click="adding = false"
            >
              Back
            </v-btn>
            <v-btn
              append-icon="mdi-rocket-launch"
              color="primary"
              type="submit"
            >
              Start 
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
    <snack-bar
      :banner="success"
      label="New Project successfully added"
      color="success"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const adding = ref(false)
const success= ref(false)
const email = ref('')
const password = ref('')
const project_name = ref('')
const formRef = ref(null)

const rules = {
  required: value => !!value || 'Required.',
  email: value =>
    /.+@.+\..+/.test(value) || 'E-mail must be valid.',
}

const submitForm = async () => {
  const isValid = await formRef.value.validate()
  if (!isValid.valid) return

  try {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/invoice/newproject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: {email: email.value,
        password: password.value},
        project_name: { project_name: project_name.value }
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to add email')
    }

    const data = await response.json()
    adding.value = false
    console.log('Successfully added:', data)
    success.value = true
    setTimeout(()=>{
      success.value = false
    }, 2000)
    // Handle success (store token, redirect, etc.)
  } catch (error) {
    console.error('Login error:', error.message)
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