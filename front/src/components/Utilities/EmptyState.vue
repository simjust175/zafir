<template>
  <v-empty-state image="https://cdn.vuetifyjs.com/docs/images/components/v-empty-state/teamwork.png">
    <template #title>
      <div class="text-subtitle-2 mt-8">
        Manage yourinvoices
      </div>
    </template>
  
    <template #text>
      <div class="text-caption">
        Track and control your invoices and payments
      </div>
    </template>
  
    <template #actions>
      <v-btn
        class="text-none"
        color="white"
        elevation="1"
        rounded="lg"
        size="small"
        text="Refresh"
        width="96"
        @click="emit('refresh')"
      />
  
      <v-btn
        class="text-none"
        elevation="1"
        rounded="lg"
        size="small"
        text="Add project"
        width="96"
        @click="$router.push('/')"
      />
    </template>
  </v-empty-state>
</template>

  <script setup>
  import { defineEmits } from "vue";

  const emit = defineEmits("refresh")
  

</script>