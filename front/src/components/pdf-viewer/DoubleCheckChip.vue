<template>
  <div class="double-check-chip">
    <button
      class="chip"
      :class="{ confirmed: confirmed }"
      @click="$emit('toggle')"
    >
      <span class="chip-icon">
        <v-icon size="14">
          {{ confirmed ? 'mdi-check-circle' : 'mdi-checkbox-blank-circle-outline' }}
        </v-icon>
      </span>
      <span class="chip-label">{{ confirmed ? 'Confirmed' : 'Verify' }}</span>
    </button>
    
    <button
      v-if="!confirmed"
      class="edit-btn"
      title="Edit this field"
      @click="$emit('edit')"
    >
      <v-icon size="14">mdi-pencil-outline</v-icon>
    </button>
  </div>
</template>

<script setup>
defineProps({
  confirmed: Boolean
})
defineEmits(['toggle', 'edit'])
</script>

<style scoped>
.double-check-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 12px 0 8px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.01em;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  color: #92400E;
  box-shadow: 
    0 1px 2px rgba(146, 64, 14, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.chip:hover {
  background: linear-gradient(135deg, #FDE68A 0%, #FCD34D 100%);
  transform: translateY(-1px);
  box-shadow: 
    0 4px 8px rgba(146, 64, 14, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.chip:active {
  transform: translateY(0);
}

.chip.confirmed {
  background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
  color: #065F46;
  box-shadow: 
    0 1px 2px rgba(6, 95, 70, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.chip.confirmed:hover {
  background: linear-gradient(135deg, #A7F3D0 0%, #6EE7B7 100%);
  box-shadow: 
    0 4px 8px rgba(6, 95, 70, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.chip-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.chip-label {
  white-space: nowrap;
}

.edit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(var(--v-theme-on-surface), 0.04);
  border-radius: 8px;
  cursor: pointer;
  color: rgb(var(--v-theme-grey-500));
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.edit-btn:hover {
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
  transform: translateY(-1px);
}

.edit-btn:active {
  transform: translateY(0);
}
</style>
