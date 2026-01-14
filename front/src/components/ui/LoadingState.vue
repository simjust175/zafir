<template>
  <div class="loading-state" :class="{ 'loading-state--inline': inline }">
    <div class="loading-content">
      <v-progress-circular
        :size="size"
        :width="width"
        color="primary"
        indeterminate
      />
      <p v-if="message" class="loading-message">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: ''
  },
  size: {
    type: [Number, String],
    default: 48
  },
  width: {
    type: [Number, String],
    default: 4
  },
  inline: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  width: 100%;
}

.loading-state--inline {
  min-height: auto;
  padding: 24px;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-message {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-grey-600));
  margin: 0;
}
</style>
