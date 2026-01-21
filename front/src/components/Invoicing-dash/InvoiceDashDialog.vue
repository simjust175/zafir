<template>
  <v-dialog
    :model-value="show"
    max-width="400"
    persistent
    @update:model-value="handleDialogChange"
  >
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 class="dialog-title">
          {{ getDialogTitle }}
        </h2>
        <button
          class="close-button"
          @click="$emit('close')"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line
              x1="18"
              y1="6"
              x2="6"
              y2="18"
            />
            <line
              x1="6"
              y1="6"
              x2="18"
              y2="18"
            />
          </svg>
        </button>
      </div>
      
      <div class="dialog-body">
        <p class="dialog-description">
          {{ getDialogDescription }}
        </p>
        
        <div class="input-field">
          <label class="field-label">Amount</label>
          <div class="currency-input-wrapper">
            <span class="currency-prefix">EUR</span>
            <input
              v-model.number="localAmount"
              type="number"
              class="amount-input"
              placeholder="0.00"
              min="0"
              step="0.01"
              autofocus
            >
          </div>
        </div>
      </div>
      
      <div class="dialog-footer">
        <button
          class="btn-secondary"
          @click="$emit('close')"
        >
          Cancel
        </button>
        <button 
          class="btn-primary" 
          :disabled="!localAmount || localAmount <= 0"
          @click="handleSave"
        >
          {{ getButtonText }}
        </button>
      </div>
    </div>
  </v-dialog>
</template>
  
<script setup>
import { ref, watch, computed } from "vue"

const props = defineProps({
  show: Boolean,
  dialogType: String,
  initialAmount: { type: [Number, String], default: 0 },
  isEdit: Boolean,
  editEntryId: { type: [Number, String], default: null }
})

const emit = defineEmits(['close', 'update'])

const handleDialogChange = (value) => {
  if (!value) {
    emit('close')
  }
}

const localAmount = ref(Number(props.initialAmount) || 0)

const getDialogTitle = computed(() => {
  if (props.isEdit) {
    return props.dialogType === 'invoiced' ? 'Edit Invoice' : 'Edit Payment'
  }
  return props.dialogType === 'invoiced' ? 'Add Invoice' : 'Record Payment'
})

const getDialogDescription = computed(() => {
  if (props.isEdit) {
    return props.dialogType === 'invoiced' 
      ? 'Update the invoice amount.' 
      : 'Update the payment amount.'
  }
  return props.dialogType === 'invoiced' 
    ? 'Enter the invoice amount for this project.' 
    : 'Enter the payment amount received.'
})

const getButtonText = computed(() => {
  if (props.isEdit) {
    return 'Save Changes'
  }
  return props.dialogType === 'invoiced' ? 'Add Invoice' : 'Record Payment'
})

watch(() => props.initialAmount, (val) => {
  localAmount.value = Number(val) || 0
})

watch(() => props.show, (val) => {
  if (val) {
    localAmount.value = props.isEdit ? Number(props.initialAmount) || 0 : 0
  }
})

const handleSave = () => { 
  if (localAmount.value > 0) {
    emit('update', localAmount.value, props.editEntryId)
  }
}
</script>

<style scoped>
.dialog-container {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eaeaea;
}

.dialog-title {
  font-size: 17px;
  font-weight: 600;
  color: #171717;
  margin: 0;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: #999;
  transition: all 0.15s ease;
}

.close-button:hover {
  background: #f5f5f5;
  color: #171717;
}

.dialog-body {
  padding: 24px;
}

.dialog-description {
  font-size: 14px;
  color: #666;
  margin: 0 0 20px;
  line-height: 1.5;
}

.input-field {
  margin-bottom: 0;
}

.field-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #171717;
  margin-bottom: 8px;
}

.currency-input-wrapper {
  display: flex;
  align-items: center;
  background: #fafafa;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.currency-input-wrapper:focus-within {
  border-color: #171717;
  background: #fff;
}

.currency-prefix {
  padding: 0 12px;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  background: #f5f5f5;
  border-right: 1px solid #eaeaea;
  height: 44px;
  display: flex;
  align-items: center;
}

.amount-input {
  flex: 1;
  height: 44px;
  padding: 0 16px;
  font-size: 16px;
  font-weight: 500;
  color: #171717;
  border: none;
  background: transparent;
}

.amount-input:focus {
  outline: none;
}

.amount-input::placeholder {
  color: #999;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  background: #fafafa;
  border-top: 1px solid #eaeaea;
}

.btn-secondary,
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
}

.btn-secondary {
  background: #fff;
  color: #171717;
  border: 1px solid #eaeaea;
}

.btn-secondary:hover {
  background: #f5f5f5;
  border-color: #d4d4d4;
}

.btn-primary {
  background: #171717;
  color: #fff;
}

.btn-primary:hover {
  background: #000;
}

.btn-primary:disabled {
  background: #d4d4d4;
  cursor: not-allowed;
}
</style>
