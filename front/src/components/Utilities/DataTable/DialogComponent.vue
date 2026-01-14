<template>
  <v-dialog v-model="internalDialog" max-width="480">
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 class="dialog-title">{{ formTitle }}</h2>
        <button class="close-button" @click="close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="dialog-body">
        <div class="form-field">
          <label class="field-label">
            Supplier Name
            <span class="required">*</span>
          </label>
          <input
            v-model="localItem.issuer"
            type="text"
            class="text-input"
            :class="{ error: errors.issuer }"
            placeholder="Enter supplier name"
          >
          <span v-if="errors.issuer" class="error-message">{{ errors.issuer }}</span>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label class="field-label">
              Amount
              <span class="required">*</span>
            </label>
            <div class="currency-input-wrapper" :class="{ error: errors.amount }">
              <span class="currency-prefix">EUR</span>
              <input
                v-model.number="localItem.amount"
                type="number"
                step="0.01"
                min="0"
                class="amount-input"
                placeholder="0.00"
              >
            </div>
            <span v-if="errors.amount" class="error-message">{{ errors.amount }}</span>
          </div>

          <div class="form-field">
            <label class="field-label">VAT Rate</label>
            <div class="percent-input-wrapper">
              <input
                v-model.number="localItem.btwPercent"
                type="number"
                step="1"
                min="0"
                max="100"
                class="percent-input"
                placeholder="21"
              >
              <span class="percent-suffix">%</span>
            </div>
          </div>
        </div>

        <div class="form-field">
          <label class="field-label">Invoice Date</label>
          <input
            v-model="localItem.invoice_date"
            type="date"
            class="text-input"
          >
        </div>
      </div>

      <div class="dialog-footer">
        <button class="btn-secondary" @click="close">
          Cancel
        </button>
        <button class="btn-primary" @click="save">
          Save Changes
        </button>
      </div>
    </div>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  dialogProp: Boolean,
  editedItem: Object,
  originalItem: Object,
  formTitle: String,
});

const emit = defineEmits(['close', 'save']);

const internalDialog = ref(props.dialogProp);
const localItem = ref({ ...props.editedItem });
const netAmount = ref(null);
const errors = ref({});

watch(() => props.dialogProp, (val) => {
  internalDialog.value = val;
});

watch(internalDialog, (val) => {
  if (!val) emit('close');
});

watch(() => props.editedItem, (val) => {
  localItem.value = { ...val };

  if (val?.btwPercent) {
    netAmount.value = val.amount / (1 + val.btwPercent / 100);
  } else {
    netAmount.value = val?.amount || 0;
  }
});

watch(() => localItem.value.btwPercent, (newBtw, oldBtw) => {
  if (newBtw !== oldBtw && netAmount.value != null) {
    const updatedAmount = netAmount.value * (1 + (Number(newBtw) || 0) / 100);
    localItem.value.amount = Number(updatedAmount.toFixed(2));
  }
});

const normalize = (val) => {
  if (val === '' || val === null || val === undefined) return null;
  const number = Number(val);
  return isNaN(number) ? val : number;
};

const close = () => {
  errors.value = {};
  internalDialog.value = false;
};

const validate = () => {
  errors.value = {};
  
  if (!localItem.value.issuer?.trim()) {
    errors.value.issuer = 'Supplier name is required';
  }
  
  if (!localItem.value.amount || localItem.value.amount <= 0) {
    errors.value.amount = 'Amount must be greater than 0';
  }
  
  return Object.keys(errors.value).length === 0;
};

const save = () => {
  if (!validate()) return;
  
  const toEdit = localItem.value;
  const base = props.originalItem || {};
  const changes = {};

  for (const key in toEdit) {
    const normEdit = normalize(toEdit[key]);
    const normBase = normalize(base[key]);
    if (normEdit !== normBase) {
      changes[key] = toEdit[key];
    }
  }

  if (Object.keys(changes).length === 0) {
    close();
    return;
  }
  
  emit('save', { body: changes, id: toEdit?.invoice_id });
  close();
};
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

.form-field {
  margin-bottom: 20px;
}

.form-field:last-child {
  margin-bottom: 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.field-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #171717;
  margin-bottom: 8px;
}

.required {
  color: #ef4444;
  margin-left: 2px;
}

.text-input {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  font-size: 14px;
  color: #171717;
  background: #fafafa;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.text-input:focus {
  outline: none;
  border-color: #171717;
  background: #fff;
}

.text-input.error {
  border-color: #ef4444;
}

.text-input::placeholder {
  color: #999;
}

.currency-input-wrapper,
.percent-input-wrapper {
  display: flex;
  align-items: center;
  background: #fafafa;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.currency-input-wrapper:focus-within,
.percent-input-wrapper:focus-within {
  border-color: #171717;
  background: #fff;
}

.currency-input-wrapper.error {
  border-color: #ef4444;
}

.currency-prefix,
.percent-suffix {
  padding: 0 12px;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  background: #f5f5f5;
  height: 44px;
  display: flex;
  align-items: center;
}

.currency-prefix {
  border-right: 1px solid #eaeaea;
}

.percent-suffix {
  border-left: 1px solid #eaeaea;
}

.amount-input,
.percent-input {
  flex: 1;
  height: 44px;
  padding: 0 14px;
  font-size: 14px;
  color: #171717;
  border: none;
  background: transparent;
}

.amount-input:focus,
.percent-input:focus {
  outline: none;
}

.error-message {
  display: block;
  font-size: 12px;
  color: #ef4444;
  margin-top: 6px;
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
</style>
