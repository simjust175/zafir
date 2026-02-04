<template>
  <div class="notification-system">
    <Teleport to="body">
      <transition-group
        name="notification-list"
        tag="div"
        class="notification-container"
      >
        <div
          v-for="notification in activeNotifications"
          :key="notification.id"
          class="notification-toast"
          :class="[`notification-${notification.type}`, { 'is-progress': notification.type === 'progress' }]"
        >
          <div class="notification-content">
            <div
              class="notification-icon-wrapper"
              :class="`icon-${notification.type}`"
            >
              <div
                v-if="notification.type === 'progress'"
                class="progress-spinner"
              >
                <svg
                  class="spinner-svg"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="spinner-track"
                    cx="12"
                    cy="12"
                    r="10"
                  />
                  <circle
                    class="spinner-progress"
                    cx="12"
                    cy="12"
                    r="10"
                  />
                </svg>
              </div>
              <v-icon
                v-else-if="notification.type === 'success'"
                size="18"
              >
                mdi-check
              </v-icon>
              <v-icon
                v-else-if="notification.type === 'error'"
                size="18"
              >
                mdi-close
              </v-icon>
              <v-icon
                v-else-if="notification.type === 'warning'"
                size="18"
              >
                mdi-alert
              </v-icon>
              <v-icon
                v-else
                size="18"
              >
                mdi-information-variant
              </v-icon>
            </div>

            <div class="notification-body">
              <span class="notification-message">{{ notification.message }}</span>
              <div
                v-if="notification.type === 'progress'"
                class="progress-bar-container"
              >
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: `${notification.progress}%` }"
                  />
                </div>
              </div>
            </div>

            <button
              v-if="notification.type !== 'progress'"
              class="notification-close"
              @click="dismissNotification(notification.id)"
            >
              <v-icon size="16">
                mdi-close
              </v-icon>
            </button>
          </div>
        </div>
      </transition-group>

      <transition name="success-modal">
        <div
          v-if="showSuccessModal"
          class="success-modal-overlay"
          @click.self="closeSuccessModal"
        >
          <div class="success-modal">
            <div class="success-animation">
              <div class="success-circle">
                <svg
                  class="success-svg"
                  viewBox="0 0 52 52"
                >
                  <circle
                    class="success-circle-bg"
                    cx="26"
                    cy="26"
                    r="24"
                  />
                  <circle
                    class="success-circle-stroke"
                    cx="26"
                    cy="26"
                    r="24"
                  />
                  <path
                    class="success-check"
                    d="M14 27l8 8 16-16"
                  />
                </svg>
              </div>
              <!-- <div class="success-particles">
                <span
                  v-for="i in 8"
                  :key="i"
                  class="particle"
                  :style="`--delay: ${i * 0.1}s; --angle: ${i * 45}deg`"
                />
              </div> -->
            </div>

            <h2 class="success-title">
              Project Created!
            </h2>
            <p class="success-description">
              Your project has been set up successfully and is ready to use.
            </p>

            <button
              class="success-btn"
              @click="closeSuccessModal"
            >
              <span>Continue</span>
              <v-icon size="18">
                mdi-arrow-right
              </v-icon>
            </button>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const activeNotifications = ref([])
const showSuccessModal = ref(false)
const isComplete = ref(false)
let notificationId = 0
let progressIntervals = {}

const addNotification = (message, type) => {
  const id = ++notificationId
  const notification = reactive({
    id,
    message,
    type,
    progress: 0
  })

  activeNotifications.value.push(notification)

  if (type === 'progress') {
    progressIntervals[id] = setInterval(() => {
      notification.progress += 3
      if (notification.progress >= 100) {
        clearInterval(progressIntervals[id])
        delete progressIntervals[id]
      }
    }, 50)
  }

  return id
}

const removeNotification = (id) => {
  if (progressIntervals[id]) {
    clearInterval(progressIntervals[id])
    delete progressIntervals[id]
  }
  const index = activeNotifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    activeNotifications.value.splice(index, 1)
  }
}

const dismissNotification = (id) => {
  removeNotification(id)
}

const showSnack = (message, color = 'success') => {
  const type = color === 'progress' ? 'progress' : color
  isComplete.value = false

  activeNotifications.value.forEach(n => {
    if (progressIntervals[n.id]) {
      clearInterval(progressIntervals[n.id])
      delete progressIntervals[n.id]
    }
  })
  activeNotifications.value = []

  const id = addNotification(message, type)

  if (type === 'success' && message.toLowerCase().includes('successfully')) {
    isComplete.value = true
    showSuccessModal.value = true
  }

  return new Promise(resolve => {
    const timeout = type === 'success' && message.toLowerCase().includes('successfully') ? 6000 : 3500

    setTimeout(() => {
      removeNotification(id)
      resolve()
    }, timeout)
  })
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
  isComplete.value = false
}

defineExpose({ showSnack })
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.notification-toast {
  pointer-events: auto;
  background: rgb(var(--v-theme-surface));
  border-radius: 12px;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  min-width: 320px;
  max-width: 420px;
}

.notification-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
}

.notification-icon-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-progress {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}

.icon-success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.icon-error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.icon-warning {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.icon-info {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.progress-spinner {
  width: 20px;
  height: 20px;
}

.spinner-svg {
  width: 100%;
  height: 100%;
  animation: rotate 1.4s linear infinite;
}

.spinner-track {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  opacity: 0.2;
}

.spinner-progress {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-dasharray: 63;
  stroke-dashoffset: 50;
  stroke-linecap: round;
  animation: dash 1.4s ease-in-out infinite;
}

@keyframes rotate {
  100% { transform: rotate(360deg); }
}

@keyframes dash {
  0% {
    stroke-dashoffset: 63;
  }
  50% {
    stroke-dashoffset: 16;
  }
  100% {
    stroke-dashoffset: 63;
  }
}

.notification-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 5px;
}

.notification-message {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.4;
}

.progress-bar-container {
  width: 100%;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(99, 102, 241, 0.15);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border-radius: 4px;
  transition: width 0.15s ease-out;
}

.notification-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 6px;
  color: rgb(var(--v-theme-grey-400));
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.notification-close:hover {
  background: rgb(var(--v-theme-grey-100));
  color: rgb(var(--v-theme-grey-600));
}

.notification-list-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-list-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 1, 1);
}

.notification-list-enter-from {
  opacity: 0;
  transform: translateX(40px) scale(0.95);
}

.notification-list-leave-to {
  opacity: 0;
  transform: translateX(40px) scale(0.95);
}

.notification-list-move {
  transition: transform 0.3s ease;
}

.success-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  /* backdrop-filter: blur(8px); */
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.success-modal {
  background: rgb(var(--v-theme-surface));
  border-radius: 24px;
  padding: 48px 40px;
  text-align: center;
  max-width: 400px;
  width: 100%;
  box-shadow: 
    0 24px 48px rgba(0, 0, 0, 0.12),
    0 12px 24px rgba(0, 0, 0, 0.08);
}

.success-animation {
  position: relative;
  width: 88px;
  height: 88px;
  margin: 0 auto 28px;
}

.success-circle {
  position: relative;
  z-index: 2;
}

.success-svg {
  width: 88px;
  height: 88px;
}

.success-circle-bg {
  fill: rgba(16, 185, 129, 0.1);
}

.success-circle-stroke {
  fill: none;
  stroke: #10b981;
  stroke-width: 2;
  stroke-dasharray: 151;
  stroke-dashoffset: 151;
  animation: circle-draw 0.6s ease forwards;
}

.success-check {
  fill: none;
  stroke: #10b981;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 60;
  stroke-dashoffset: 60;
  animation: check-draw 0.4s ease forwards 0.4s;
}

@keyframes circle-draw {
  to { stroke-dashoffset: 0; }
}

@keyframes check-draw {
  to { stroke-dashoffset: 0; }
}

/* .success-particles {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.particle {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  top: 50%;
  left: 50%;
  opacity: 0;
  animation: particle-burst 0.8s ease forwards;
  animation-delay: var(--delay);
} */

/* @keyframes particle-burst {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-50px);
  }
} */

.success-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 10px;
  letter-spacing: -0.02em;
}

.success-description {
  font-size: 0.9375rem;
  color: rgb(var(--v-theme-grey-500));
  margin: 0 0 32px;
  line-height: 1.5;
}

.success-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border: none;
  background: #10b981;
  color: white;
  font-size: 0.9375rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.success-btn:hover {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
}

.success-btn:active {
  transform: translateY(0);
}

.success-modal-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.success-modal-leave-active {
  transition: all 0.25s ease;
}

.success-modal-enter-from {
  opacity: 0;
}

.success-modal-leave-to {
  opacity: 0;
}

.success-modal-enter-from .success-modal,
.success-modal-leave-to .success-modal {
  transform: scale(0.95);
}

@media (max-width: 480px) {
  .notification-container {
    left: 12px;
    right: 12px;
  }

  .notification-toast {
    min-width: auto;
  }

  .success-modal {
    padding: 40px 28px;
  }
}
</style>
