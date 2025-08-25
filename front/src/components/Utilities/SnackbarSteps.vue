<!-- components/SnackbarSteps.vue -->
<template>
  <div>
    <v-snackbar
      v-model="show"
      :color="snack.color"
      location="top"
      multi-line
      timeout="3500"
    >
      {{ snack.message }}
      <!-- <v-progress-linear
        :model-value="timer"
        color="grey"
        height="3"
        class="px-0 mx-0"
        rounded
      /> -->
      <template #actions>
        <v-btn
          icon
          @click="show = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>
  
  <script setup>
  import { ref, computed } from 'vue'
  
  const show = ref(false)
  const snack = ref({ message: '', color: 'success' })
  const timer = computed(()=> 1800)
  
  const showSnack = (message, color = 'success') => {
    snack.value = { message, color }
    show.value = true
    return new Promise(resolve => {
      setTimeout(() => {
        show.value = false
        resolve()
      }, timer.value)
    })
  }
  
  defineExpose({ showSnack })
  </script>
  