<template>
  <div class="unknown-supplier-form">
    <div class="form-header">
      <div class="header-icon">
        <v-icon size="24" color="primary">mdi-account-question-outline</v-icon>
      </div>
      <div class="header-content">
        <h3 class="header-title">Identify Supplier</h3>
        <p class="header-subtitle">Enter or select the supplier name for this invoice</p>
      </div>
    </div>

    <div class="input-section">
      <label class="input-label">Supplier Name</label>
      <div class="input-row">
        <div class="input-wrapper">
          <v-autocomplete
            v-if="!addNewSupplier"
            v-model="localIssuer"
            autofocus
            :items="suppliersInDb"
            label="Select or search supplier"
            variant="outlined"
            density="comfortable"
            no-data-text="Not found — click + to add new"
            hide-details 
            placeholder="Start typing to search..."
            class="supplier-autocomplete"
            rounded="lg"
          >
            <template #prepend-inner>
              <v-icon size="18" color="grey">mdi-magnify</v-icon>
            </template>
          </v-autocomplete>
          <input
            v-else
            v-model="localIssuer"
            type="text"
            class="text-input"
            placeholder="Enter new supplier name..."
            autofocus
          >
        </div>
        <button
          class="toggle-btn"
          :class="{ active: addNewSupplier }"
          :title="addNewSupplier ? 'Select existing supplier' : 'Add new supplier'"
          @click="addNewSupplier = !addNewSupplier"
        >
          <v-icon size="20">{{ addNewSupplier ? 'mdi-format-list-bulleted' : 'mdi-plus' }}</v-icon>
        </button>
      </div>
    </div>
    
    <transition name="status-fade">
      <div v-if="localIssuer" class="status-badge" :class="isNewSupplier ? 'new' : 'existing'">
        <span class="status-icon">
          <v-icon size="16">{{ isNewSupplier ? 'mdi-plus-circle-outline' : 'mdi-check-circle-outline' }}</v-icon>
        </span>
        <span class="status-text">{{ isNewSupplier ? 'New supplier will be created' : 'Existing supplier recognized' }}</span>
      </div>
    </transition>
    
    <div class="action-buttons">
      <button class="btn btn-secondary" @click="$emit('keep-unknown')">
        <v-icon size="18">mdi-account-off-outline</v-icon>
        Keep as Unknown
      </button>
      <button
        class="btn btn-primary"
        :disabled="!localIssuer"
        @click="$emit('save-supplier', localIssuer)"
      >
        <v-icon size="18">mdi-check</v-icon>
        Save Supplier
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
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  background: rgba(var(--v-theme-primary), 0.1);
  border-radius: 14px;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.header-title {
  font-size: 18px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
  letter-spacing: -0.02em;
}

.header-subtitle {
  font-size: 14px;
  color: rgb(var(--v-theme-grey-500));
  margin: 0;
  line-height: 1.5;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-label {
  font-size: 13px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin-left: 2px;
}

.input-row {
  display: flex;
  align-items: stretch;
  gap: 10px;
}

.input-wrapper {
  flex: 1;
}

.supplier-autocomplete {
  width: 100%;
}

.text-input {
  width: 100%;
  height: 48px;
  padding: 0 16px;
  font-size: 15px;
  color: rgb(var(--v-theme-on-surface));
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.15);
  border-radius: 12px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.text-input:focus {
  outline: none;
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.12);
}

.text-input::placeholder {
  color: rgb(var(--v-theme-grey-400));
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.15);
  background: rgb(var(--v-theme-surface));
  border-radius: 12px;
  cursor: pointer;
  color: rgb(var(--v-theme-primary));
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-btn:hover {
  background: rgba(var(--v-theme-primary), 0.08);
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.toggle-btn.active {
  background: rgba(var(--v-theme-primary), 0.1);
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 12px;
  border: 1px solid transparent;
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-badge.new {
  background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
  color: #1D4ED8;
  border-color: rgba(29, 78, 216, 0.15);
}

.status-badge.existing {
  background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%);
  color: #166534;
  border-color: rgba(22, 101, 52, 0.15);
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 8px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  padding: 0 24px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, #5851EA 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(var(--v-theme-primary), 0.4);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  background: rgba(var(--v-theme-on-surface), 0.12);
  color: rgb(var(--v-theme-grey-400));
  box-shadow: none;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.15);
}

.btn-secondary:hover {
  background: rgba(var(--v-theme-on-surface), 0.04);
  border-color: rgba(var(--v-theme-on-surface), 0.2);
}

.status-fade-enter-active,
.status-fade-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.status-fade-enter-from,
.status-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 480px) {
  .action-buttons {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
  }
}
</style>
