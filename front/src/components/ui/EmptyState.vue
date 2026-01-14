<template>
  <div class="empty-state">
    <div class="empty-icon">
      <v-icon :icon="icon" :size="iconSize" :color="iconColor" />
    </div>
    <h3 class="empty-title">{{ title }}</h3>
    <p v-if="description" class="empty-description">{{ description }}</p>
    <div v-if="$slots.action" class="empty-action">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: 'mdi-inbox-outline'
  },
  iconSize: {
    type: [Number, String],
    default: 64
  },
  iconColor: {
    type: String,
    default: 'grey-400'
  },
  title: {
    type: String,
    default: 'No data found'
  },
  description: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.empty-icon {
  width: 120px;
  height: 120px;
  background: rgb(var(--v-theme-grey-100));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 8px;
}

.empty-description {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-grey-600));
  max-width: 320px;
  margin: 0 0 24px;
  line-height: 1.5;
}

.empty-action {
  margin-top: 8px;
}
</style>
