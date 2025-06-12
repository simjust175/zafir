<template>
    <v-empty-state image="https://cdn.vuetifyjs.com/docs/images/components/v-empty-state/teamwork.png">
      <template v-slot:title>
        <div class="text-subtitle-2 mt-8">
          Manage your masser spending
        </div>
      </template>
  
      <template v-slot:text>
        <div class="text-caption">
          Track and your incoming and masser
        </div>
      </template>
  
      <template v-slot:actions>
        <v-btn
          class="text-none"
          color="white"
          elevation="1"
          rounded="lg"
          size="small"
          text="Refresh"
          width="96"
          @click="emit('refresh')"
        ></v-btn>
  
        <v-btn
          class="text-none"
          elevation="1"
          rounded="lg"
          size="small"
          text="Add masser"
          width="96"
          @click="$router.push('/')"
        ></v-btn>
      </template>
    </v-empty-state>
  </template>

  <script setup>
  import { defineEmits } from "vue";

  const emit = defineEmits("refresh")
  

</script>