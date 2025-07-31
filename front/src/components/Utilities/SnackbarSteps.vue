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
        <template #actions>
          <v-btn icon @click="show = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
      </v-snackbar>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const show = ref(false)
  const snack = ref({ message: '', color: 'success' })
  
  const showSnack = (message, color = 'success') => {
    snack.value = { message, color }
    show.value = true
    return new Promise(resolve => {
      setTimeout(() => {
        show.value = false
        resolve()
      }, 1800)
    })
  }
  
  defineExpose({ showSnack })
  </script>
  