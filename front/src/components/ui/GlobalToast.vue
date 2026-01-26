<template>
  <v-snackbar
    v-model="visible"
    :color="toast.color"
    :timeout="toast.timeout"
    location="top right"
    class="global-toast"
    rounded="lg"
    elevation="8"
  >
    <div class="d-flex align-center">
      <v-icon
        v-if="toast.icon"
        :icon="toast.icon"
        class="mr-3"
      />
      <div>
        <div
          v-if="toast.title"
          class="toast-title"
        >
          {{ toast.title }}
        </div>
        <div class="toast-message">
          {{ toast.message }}
        </div>
      </div>
    </div>
    <template #actions>
      <v-btn
        variant="text"
        size="small"
        @click="visible = false"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const visible = ref(false)
const toast = ref({
  title: '',
  message: '',
  color: 'info',
  icon: null,
  timeout: 4000
})

const iconMap = {
  success: 'mdi-check-circle',
  error: 'mdi-alert-circle',
  warning: 'mdi-alert',
  info: 'mdi-information'
}

const showToast = (event) => {
  const { title, message, type = 'info', timeout = 4000 } = event.detail || {}
  toast.value = {
    title,
    message: message || title,
    color: type,
    icon: iconMap[type] || 'mdi-information',
    timeout
  }
  visible.value = true
}

onMounted(() => {
  window.addEventListener('show-toast', showToast)
  window.addEventListener('token-warning', (e) => {
    showToast({ detail: { ...e.detail, type: 'warning' } })
  })
})

onUnmounted(() => {
  window.removeEventListener('show-toast', showToast)
})
</script>

<style scoped>
.global-toast {
  margin-top: 16px;
}

.toast-title {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 2px;
}

.toast-message {
  font-size: 0.8125rem;
  opacity: 0.9;
}
</style>
