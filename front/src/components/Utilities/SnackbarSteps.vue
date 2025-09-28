<template>
  <div>
    <!-- Regular Progress Snackbars -->
    <v-snackbar
      v-model="show"
      :color="snack.color"
      location="top right"
      multi-line
      :timeout="snack.color === 'success' && isComplete ? 6000 : 3500"
      rounded="xl"
      elevation="8"
      class="custom-snackbar"
    >
      <div class="d-flex align-center">
        <!-- Progress Circle for loading states -->
        <div
          v-if="snack.color === 'info' && !isComplete"
          class="mr-3"
        >
          <v-progress-circular
            :size="24"
            :width="3"
            color="white"
            indeterminate
          />
        </div>
        
        <!-- Success Icon -->
        <div
          v-else-if="snack.color === 'success'"
          class="mr-3"
        >
          <v-icon
            color="white"
            size="24"
          >
            mdi-check-circle
          </v-icon>
        </div>
        
        <!-- Error Icon -->
        <div
          v-else-if="snack.color === 'error'"
          class="mr-3"
        >
          <v-icon
            color="white"
            size="24"
          >
            mdi-alert-circle
          </v-icon>
        </div>
        
        <!-- Warning Icon -->
        <div
          v-else-if="snack.color === 'warning'"
          class="mr-3"
        >
          <v-icon
            color="white"
            size="24"
          >
            mdi-alert
          </v-icon>
        </div>
        
        <!-- Default Info Icon -->
        <div
          v-else
          class="mr-3"
        >
          <v-icon
            color="white"
            size="24"
          >
            mdi-information
          </v-icon>
        </div>
        
        <div class="flex-grow-1">
          <div class="font-weight-medium">
            {{ snack.message }}
          </div>
          <!-- Progress bar for loading states -->
          <v-progress-linear
            v-if="snack.color === 'info' && !isComplete"
            :model-value="progressValue"
            color="white"
            height="2"
            class="mt-2"
            rounded
            bg-opacity="0.3"
          />
        </div>
      </div>
      
      <template #actions>
        <v-btn
          icon="mdi-close"
          size="small"
          variant="text"
          color="white"
          @click="show = false"
        />
      </template>
    </v-snackbar>

    <!-- Success Completion Modal -->
    <v-dialog
      v-model="showSuccessModal"
      max-width="500"
      persistent
      transition="dialog-transition"
    >
      <v-card
        rounded="xl"
        elevation="16"
        class="text-center success-card"
      >
        <v-card-text class="pa-8">
          <!-- Animated Success Icon with SVG -->
          <div class="success-icon-container mb-6">
            <div class="success-circle">
              <svg
                class="success-svg"
                viewBox="0 0 100 100"
                width="80"
                height="80"
              >
                <!-- Animated Circle -->
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#4CAF50"
                  stroke-width="4"
                  stroke-dasharray="283"
                  stroke-dashoffset="283"
                  class="success-circle-path"
                />
                <!-- Animated Checkmark -->
                <path
                  d="M25 50 L40 65 L75 30"
                  fill="none"
                  stroke="#4CAF50"
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-dasharray="50"
                  stroke-dashoffset="50"
                  class="success-checkmark"
                />

              </svg>
            </div>
            
            <!-- Floating particles animation -->
            <div class="particles">
              <div
                v-for="i in 6"
                :key="i"
                class="particle"
                :style="`--i: ${i}`"
              />
            </div>
          </div>
          
          <!-- Success Title -->
          <h2 class="text-h4 font-weight-bold text-success mb-3">
            <v-icon
              size="28"
              color="success"
              class="mr-2"
            >
              mdi-rocket-launch
            </v-icon>
            Project Successfully Added!
          </h2>
          
          <!-- Success Message -->
          <p class="text-h6 text-grey-darken-1 mb-6">
            Your project has been created and is ready to go!
          </p>
          
          <!-- Celebration Icons -->
          <div class="celebration-icons mb-4">
            <v-icon
              color="warning"
              size="20"
              class="mx-1 celebration-icon"
              style="animation-delay: 0.1s"
            >
              mdi-star
            </v-icon>
            <v-icon
              color="info"
              size="24"
              class="mx-1 celebration-icon"
              style="animation-delay: 0.2s"
            >
              mdi-party-popper
            </v-icon>
            <v-icon
              color="success"
              size="20"
              class="mx-1 celebration-icon"
              style="animation-delay: 0.3s"
            >
              mdi-star
            </v-icon>
            <v-icon
              color="error"
              size="22"
              class="mx-1 celebration-icon"
              style="animation-delay: 0.4s"
            >
              mdi-confetti
            </v-icon>
            <v-icon
              color="warning"
              size="20"
              class="mx-1 celebration-icon"
              style="animation-delay: 0.5s"
            >
              mdi-star
            </v-icon>
          </div>
        </v-card-text>
        
        <v-card-actions class="justify-center pb-8">
          <v-btn
            color="success"
            variant="elevated"
            size="large"
            rounded="xl"
            prepend-icon="mdi-check"
            @click="closeSuccessModal"
          >
            Awesome!
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const show = ref(false)
const showSuccessModal = ref(false)
const snack = ref({ message: '', color: 'success' })
const progressValue = ref(0)
const isComplete = ref(false)
let progressInterval = null

const showSnack = (message, color = 'success') => {
  snack.value = { message, color }
  show.value = true
  isComplete.value = false

  if (color === 'info') {
    progressValue.value = 0
    progressInterval = setInterval(() => {
      progressValue.value += 2
      if (progressValue.value >= 100) {
        clearInterval(progressInterval)
        progressValue.value = 100
      }
    }, 50)
  }

  // ⏱ Trigger modal early if it's a success
  if (color === 'success' && message.includes('successfully')) {
    isComplete.value = true
    showSuccessModal.value = true
  }

  return new Promise(resolve => {
    const timeout = color === 'success' && message.includes('successfully') ? 6000 : 3500

    setTimeout(() => {
      show.value = false
      if (progressInterval) {
        clearInterval(progressInterval)
        progressInterval = null
      }
      resolve()
    }, timeout)
  })
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
  isComplete.value = false
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
}

defineExpose({ showSnack })
</script>

<style scoped>
/* Custom Snackbar Styling */
/* .custom-snackbar {
  backdrop-filter: blur(10px);
} */

/* Success Modal Styling */
.success-card {
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
  border: 2px solid #e8f2ff;
}

/* Success Icon Container */
.success-icon-container {
  position: relative;
  display: inline-block;
}

.success-circle {
  position: relative;
  z-index: 2;
}

/* SVG Animations */
.success-svg {
  transform: none;
  filter: drop-shadow(0 4px 8px rgba(76, 175, 80, 0.3));
}

.success-circle-path {
  animation: drawCircle 1s ease-in-out forwards;
}

.success-checkmark {
  animation: drawCheckmark 0.5s ease-in-out 1s forwards;
}

@keyframes drawCircle {
  0% {
    stroke-dashoffset: 283;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes drawCheckmark {
  0% {
    stroke-dashoffset: 50;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

/* Floating Particles */
.particles {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: linear-gradient(45deg, #4CAF50, #81C784);
  border-radius: 50%;
  animation: float 3s ease-in-out infinite;
  animation-delay: calc(var(--i) * 0.2s);
}

.particle:nth-child(1) { top: 10%; left: 20%; }
.particle:nth-child(2) { top: 20%; right: 10%; }
.particle:nth-child(3) { bottom: 20%; left: 10%; }
.particle:nth-child(4) { bottom: 10%; right: 20%; }
.particle:nth-child(5) { top: 50%; left: 5%; }
.particle:nth-child(6) { top: 50%; right: 5%; }

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-20px) scale(1.2);
    opacity: 1;
  }
}

/* Celebration Icons Animation */
.celebration-icons {
  animation: fadeInUp 0.8s ease-out 1.5s both;
}

.celebration-icon {
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-8px);
  }
  60% {
    transform: translateY(-4px);
  }
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Dialog Transition Enhancement */
:deep(.v-dialog-transition-enter-active),
:deep(.v-dialog-transition-leave-active) {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

:deep(.v-dialog-transition-enter-from) {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

:deep(.v-dialog-transition-leave-to) {
  opacity: 0;
  transform: scale(1.05) translateY(-20px);
}

/* Enhanced Snackbar Positioning */
:deep(.v-snackbar) {
  margin: 16px;
}

:deep(.v-snackbar__wrapper) {
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Color Theme Enhancements */
:deep(.v-snackbar.v-theme--light.text-info) {
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%) !important;
}

:deep(.v-snackbar.v-theme--light.text-success) {
  background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%) !important;
}

:deep(.v-snackbar.v-theme--light.text-error) {
  background: linear-gradient(135deg, #F44336 0%, #D32F2F 100%) !important;
}

:deep(.v-snackbar.v-theme--light.text-warning) {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%) !important;
}
</style>