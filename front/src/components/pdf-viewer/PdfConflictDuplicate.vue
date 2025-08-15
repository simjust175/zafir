<template>
  <div class="d-flex flex-wrap justify-end pa-3 ga-2 sticky-action-bar">
    <v-btn
      color="success"
      rounded="lg"
      elevation="1"
      @click="$emit('keep-both')"
    >
      <v-icon left>
        mdi-content-duplicate
      </v-icon> Keep Both
    </v-btn>
    <v-btn
      color="primary"
      rounded="lg"
      elevation="1"
      @click="$emit('keep-this')"
    >
      <v-icon left>
        mdi-file-check
      </v-icon> Keep This
    </v-btn>
    <v-btn
      color="warning"
      rounded="lg"
      elevation="1"
      @click="$emit('keep-duplicate')"
    >
      <v-icon left>
        mdi-file-replace
      </v-icon> Keep Duplicate
    </v-btn>
    <v-btn
      color="error"
      rounded="lg"
      elevation="1"
      @click="$emit('keep-none')"
    >
      <v-icon left>
        mdi-delete
      </v-icon> Delete Both
    </v-btn>
  </div>
</template>
  
  <script setup>
  defineEmits(['keep-both', 'keep-this', 'keep-duplicate', 'keep-none'])
  </script>
  
  <style scoped>
  .sticky-action-bar {
    position: sticky;
    top: 0;
    background: inherit;
    z-index: 5;
    border-bottom: 1px solid var(--v-theme-surface-variant);
  }
  </style>