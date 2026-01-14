<template>
  <div class="unknown-supplier-form">
    <div class="input-row">
      <div class="input-wrapper">
        <v-autocomplete
          v-if="!addNewSupplier"
          v-model="localIssuer"
          autofocus
          :items="suppliersInDb"
          label="Select or enter supplier"
          variant="outlined"
          density="compact"
          no-data-text="Not found - click + to add new"
          hide-details 
          placeholder="Type or select supplier..."
          class="supplier-input"
        />
        <input
          v-else
          v-model="localIssuer"
          type="text"
          class="text-input"
          placeholder="Enter new supplier name..."
        >
      </div>
      <button
        class="toggle-btn"
        :title="addNewSupplier ? 'Select existing' : 'Add new supplier'"
        @click="addNewSupplier = !addNewSupplier"
      >
        <v-icon size="18">{{ addNewSupplier ? 'mdi-arrow-u-left-top' : 'mdi-plus' }}</v-icon>
      </button>
    </div>
    
    <div v-if="localIssuer" class="status-badge" :class="isNewSupplier ? 'new' : 'existing'">
      <v-icon size="14">{{ isNewSupplier ? 'mdi-plus-circle' : 'mdi-check-circle' }}</v-icon>
      {{ isNewSupplier ? 'New supplier will be added' : 'Existing supplier recognized' }}
    </div>
    
    <div class="action-buttons">
      <button
        class="btn btn-primary"
        :disabled="!localIssuer"
        @click="$emit('save-supplier', localIssuer)"
      >
        Save Supplier
      </button>
      <button class="btn btn-secondary" @click="$emit('keep-unknown')">
        Keep as Unknown
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"
import { invoices } from "@/stores/invoiceState.js"

const props = defineProps({
  issuer: String
})

defineEmits(['keep-unknown', 'save-supplier'])

const invoiceArray = invoices()

const suppliersInDb = computed(() => {
  const dbResponse = invoiceArray.dbResponse || []
  const knownSuppliers = dbResponse.filter(
    i => i?.issuer && i.issuer !== "UNKNOWN ISSUER"
  )
  return [...new Set(knownSuppliers.map(ks => ks.issuer))]
})

const isNewSupplier = computed(() => {
  return localIssuer.value && !suppliersInDb.value.includes(localIssuer.value)
})

const localIssuer = ref(props.issuer || '')
const addNewSupplier = ref(false)
</script>

<style scoped>
.unknown-supplier-form {
  padding: 0;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-wrapper {
  flex: 1;
}

.supplier-input {
  width: 100%;
}

.text-input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  font-size: 14px;
  color: #1a1f36;
  background: #fff;
  border: 1px solid #e3e8ee;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.text-input:focus {
  outline: none;
  border-color: #635bff;
  box-shadow: 0 0 0 3px rgba(99, 91, 255, 0.1);
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid #e3e8ee;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  color: #635bff;
  transition: all 0.15s ease;
}

.toggle-btn:hover {
  background: #f6f8fa;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
}

.status-badge.new {
  background: #eff6ff;
  color: #1d4ed8;
}

.status-badge.existing {
  background: #dcfce7;
  color: #166534;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
}

.btn-primary {
  background: #635bff;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #5851ea;
}

.btn-primary:disabled {
  background: #c4c9d4;
  cursor: not-allowed;
}

.btn-secondary {
  background: #fff;
  color: #1a1f36;
  border: 1px solid #e3e8ee;
}

.btn-secondary:hover {
  background: #f6f8fa;
}
</style>
