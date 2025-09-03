<template>
  <div class="double-check-chip d-flex align-center">
    <v-tooltip location="top">
      <template #activator="{ props }">
        <v-chip
          v-bind="props"
          :color="confirmed ? 'success' : 'warning'"
          class="chip"
          variant="tonal"
          label
          @click="$emit('toggle')"
        >
          <v-icon
            :start="confirmed"
            :icon="confirmed ? 'mdi-check-circle' : 'mdi-check-underline'"
          />
          {{ confirmed ? 'Confirmed' : '' }}
        </v-chip>
      </template>
      <span>{{ confirmed ? 'Click to unconfirm' : 'Click to confirm' }}</span>
    </v-tooltip>
  
    <v-tooltip
      v-if="!confirmed"
      location="top"
    >
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          icon
          size="small"
          variant="text"
          @click="$emit('edit')"
        >
          <v-icon icon="mdi-pencil" />
        </v-btn>
      </template>
      <span>Edit this field</span>
    </v-tooltip>
  </div>
</template>
  
  <script setup>
  defineProps({
    confirmed: Boolean
  })
  defineEmits(['toggle', 'edit'])
  </script>
  
  <style scoped>
 
  
  .chip {
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease-in-out;
  }
  
  .chip:hover {
    filter: brightness(1.1);
  }
  </style>