<template>
  <div class="double-check-chip">
    <button
      class="chip"
      :class="{ confirmed: confirmed }"
      @click="$emit('toggle')"
    >
      <v-icon size="14">
        {{ confirmed ? 'mdi-check-circle' : 'mdi-checkbox-blank-circle-outline' }}
      </v-icon>
      <span v-if="confirmed">Confirmed</span>
    </button>
    
    <button
      v-if="!confirmed"
      class="edit-btn"
      title="Edit this field"
      @click="$emit('edit')"
    >
      <v-icon size="14">mdi-pencil</v-icon>
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
  display: flex;
  align-items: center;
  gap: 4px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 500;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
  background: #fef3c7;
  color: #92400e;
}

.chip:hover {
  background: #fcd34d;
}

.chip.confirmed {
  background: #dcfce7;
  color: #166534;
}

.chip.confirmed:hover {
  background: #bbf7d0;
}

.edit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: #697386;
  transition: all 0.15s ease;
}

.edit-btn:hover {
  background: #f0f2f5;
  color: #1a1f36;
}
</style>
