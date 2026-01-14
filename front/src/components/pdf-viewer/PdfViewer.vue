<template>
  <v-dialog v-model="dialog" max-width="650" scrollable>
    <div v-if="url" class="pdf-viewer-dialog">
      <!-- Header -->
      <PdfDialogToolbar
        :issuer="fileDetails?.issuer"
        :pdf-url="pdfUrl"
        :disable-close="mode === 'double-check' && !allConfirmed"
        @close="handleClose"
      />

      <!-- Conflict Alert -->
      <div v-if="mode === 'conflict'" class="conflict-alert">
        <v-icon size="20" color="warning">mdi-alert-circle</v-icon>
        <div class="alert-content">
          <span class="alert-title">{{ conflictTitle }}</span>
          <span class="alert-message">{{ conflictMessage }}</span>
        </div>
      </div>

      <!-- Duplicate Actions -->
      <div v-if="mode === 'conflict' && conflictType === 'duplicate'" class="duplicate-actions">
        <button class="action-btn success" @click="keepBoth">
          <v-icon size="16">mdi-content-duplicate</v-icon>
          Keep Both
        </button>
        <button class="action-btn warning" @click="keepDuplicate">
          <v-icon size="16">mdi-file-replace</v-icon>
          Keep Duplicate
        </button>
        <button class="action-btn danger" @click="keepNone">
          <v-icon size="16">mdi-delete</v-icon>
          Delete Both
        </button>
      </div>

      <!-- Summary Section -->
      <div v-if="mode !== 'conflict' || conflictType === 'unknown-supplier'" class="summary-panel">
        <div class="summary-grid">
          <div class="summary-item">
            <span class="label">Supplier</span>
            <div class="value-row">
              <template v-if="mode === 'conflict' && conflictType === 'unknown-supplier'">
                <input
                  v-model="editableFields.issuer"
                  type="text"
                  class="inline-input"
                  placeholder="Enter supplier name..."
                >
              </template>
              <template v-else>
                <span v-if="!editing.issuer">{{ editableFields.issuer || fileDetails?.issuer }}</span>
                <input
                  v-else
                  v-model="editableFields.issuer"
                  type="text"
                  class="inline-input"
                  @keyup.enter="finishEdit('issuer')"
                >
              </template>
              <div v-if="mode === 'double-check'" class="confirm-chip" :class="{ confirmed: confirmed.issuer }" @click="toggleConfirm('issuer')">
                <v-icon size="14">{{ confirmed.issuer ? 'mdi-check-circle' : 'mdi-alert' }}</v-icon>
                {{ confirmed.issuer ? 'Confirmed' : 'Check' }}
              </div>
              <button v-if="mode === 'double-check' && !confirmed.issuer" class="edit-btn" @click="editing.issuer = true">
                <v-icon size="14">mdi-pencil</v-icon>
              </button>
            </div>
            <span class="sub-value">Issued: {{ formatDate(fileDetails?.invoice_date) }}</span>
          </div>

          <div class="summary-item">
            <span class="label">VAT: {{ fileDetails?.btwPercent || 0 }}%</span>
            <div class="value-row">
              <div v-if="mode === 'double-check'" class="confirm-chip" :class="{ confirmed: confirmed.btw }" @click="toggleConfirm('btw')">
                <v-icon size="14">{{ confirmed.btw ? 'mdi-check-circle' : 'mdi-alert' }}</v-icon>
                {{ confirmed.btw ? 'Confirmed' : 'Check' }}
              </div>
            </div>
            <span class="label mt-2">Total: €{{ formattedAmount }}</span>
            <div class="value-row">
              <div v-if="mode === 'double-check'" class="confirm-chip" :class="{ confirmed: confirmed.amount }" @click="toggleConfirm('amount')">
                <v-icon size="14">{{ confirmed.amount ? 'mdi-check-circle' : 'mdi-alert' }}</v-icon>
                {{ confirmed.amount ? 'Confirmed' : 'Check' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Unknown Supplier Actions -->
        <div v-if="mode === 'conflict' && conflictType === 'unknown-supplier'" class="unknown-actions">
          <button class="btn btn-primary" @click="saveSupplier">Save</button>
          <button class="btn btn-secondary" @click="keepUnknown">Keep as Unknown</button>
        </div>

        <!-- Double-check Confirm -->
        <div v-if="mode === 'double-check'" class="confirm-section">
          <button class="btn btn-primary" :disabled="!allConfirmed" @click="confirmDoubleCheck">
            <v-icon size="16">mdi-check-bold</v-icon>
            Confirm & Continue
          </button>
          <p v-if="!allConfirmed" class="confirm-hint">Confirm all fields before continuing.</p>
        </div>
      </div>

      <!-- PDF Content -->
      <div class="pdf-content">
        <template v-if="mode === 'conflict' && conflictType === 'duplicate'">
          <div class="pdf-compare">
            <div class="pdf-panel">
              <h4>Current File</h4>
              <embed :src="pdfUrl" type="application/pdf" width="100%" height="100%">
            </div>
            <div class="pdf-panel">
              <h4>Possible Duplicate</h4>
              <embed :src="duplicatePdfUrl" type="application/pdf" width="100%" height="100%">
            </div>
          </div>
        </template>
        <embed v-else :src="`${pdfUrl}#toolbar=0&navpanes=0`" type="application/pdf" width="100%" height="100%">
      </div>
    </div>

    <!-- No PDF Fallback -->
    <div v-else class="no-pdf">
      <v-icon size="64" color="grey-lighten-1">mdi-file-remove-outline</v-icon>
      <h3>No PDF Available</h3>
      <p>There is no document to preview.</p>
      <button class="btn btn-primary" @click="handleClose">Close</button>
    </div>
  </v-dialog>
</template>

<script setup>
import { computed, ref } from 'vue'
import PdfDialogToolbar from './PdfDialogToolbar.vue'

const dialog = defineModel('dialog')

const props = defineProps({
  url: String,
  fileDetails: Object,
  doubleCheck: Boolean,
  mode: { type: String, default: 'normal' },
  conflictType: String,
  duplicateFileUrl: String
})

const emit = defineEmits([
  'close', 'double-checked', 'close-double-check',
  'save-supplier', 'keep-unknown', 'keep-both', 'keep-this', 'keep-duplicate', 'keep-none'
])

const pdfUrl = computed(() => props.url ? `${import.meta.env.VITE_BASE_URL}/file/${props.url}` : '')
const duplicatePdfUrl = computed(() => props.duplicateFileUrl ? `${import.meta.env.VITE_BASE_URL}/file/${props.duplicateFileUrl}` : '')

const editableFields = ref({ issuer: props.fileDetails?.issuer || '' })
const editing = ref({ issuer: false, btw: false, amount: false })
const confirmed = ref({ issuer: false, btw: false, amount: false })
const toggleConfirm = (field) => { confirmed.value[field] = !confirmed.value[field] }
const allConfirmed = computed(() => Object.values(confirmed.value).every(Boolean))
const finishEdit = (field) => { editing.value[field] = false; confirmed.value[field] = true }

const conflictTitle = computed(() => {
  if (props.conflictType === 'unknown-supplier') return "Missing Supplier"
  if (props.conflictType === 'duplicate') return "Duplicate Detected"
  return ""
})

const conflictMessage = computed(() => {
  if (props.conflictType === 'unknown-supplier') return "Please enter the supplier name."
  if (props.conflictType === 'duplicate') return "This document seems similar to another."
  return ""
})

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  const d = new Date(dateStr)
  return isNaN(d) ? 'N/A' : d.toLocaleDateString()
}

const formattedAmount = computed(() => props.fileDetails?.amount?.toFixed(2) || "0.00")

const handleClose = () => { emit('close'); dialog.value = false }
const saveSupplier = () => emit('save-supplier', editableFields.value.issuer)
const keepUnknown = () => emit('keep-unknown')
const keepBoth = () => emit('keep-both')
const keepDuplicate = () => emit('keep-duplicate')
const keepNone = () => emit('keep-none')

const confirmDoubleCheck = () => {
  emit('double-checked', props.fileDetails?.invoice_id)
  emit('close-double-check')
  emit('close')
  dialog.value = false
}
</script>

<style scoped>
.pdf-viewer-dialog {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.conflict-alert {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fef3c7;
}

.alert-content {
  display: flex;
  flex-direction: column;
}

.alert-title {
  font-size: 13px;
  font-weight: 600;
  color: #92400e;
}

.alert-message {
  font-size: 12px;
  color: #a16207;
}

.duplicate-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fafbfc;
  border-bottom: 1px solid #e3e8ee;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn.success { background: #dcfce7; color: #166534; }
.action-btn.success:hover { background: #bbf7d0; }
.action-btn.warning { background: #fef3c7; color: #92400e; }
.action-btn.warning:hover { background: #fcd34d; }
.action-btn.danger { background: #fef2f2; color: #b91c1c; }
.action-btn.danger:hover { background: #fecaca; }

.summary-panel {
  padding: 16px;
  background: #fafbfc;
  border-bottom: 1px solid #e3e8ee;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-size: 12px;
  font-weight: 500;
  color: #697386;
}

.value-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sub-value {
  font-size: 12px;
  color: #697386;
  margin-top: 4px;
}

.inline-input {
  padding: 4px 8px;
  font-size: 13px;
  border: 1px solid #e3e8ee;
  border-radius: 4px;
}

.inline-input:focus {
  outline: none;
  border-color: #635bff;
}

.confirm-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  background: #fef3c7;
  color: #92400e;
}

.confirm-chip.confirmed {
  background: #dcfce7;
  color: #166534;
}

.edit-btn {
  padding: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #697386;
}

.edit-btn:hover {
  color: #1a1f36;
}

.unknown-actions, .confirm-section {
  margin-top: 16px;
  text-align: center;
}

.confirm-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #ef4444;
}

.pdf-content {
  height: 60vh;
  background: #f0f2f5;
}

.pdf-content embed {
  border: none;
  display: block;
}

.pdf-compare {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100%;
  gap: 8px;
  padding: 8px;
}

.pdf-panel {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.pdf-panel h4 {
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  background: #fafbfc;
  border-bottom: 1px solid #e3e8ee;
  margin: 0;
}

.pdf-panel embed {
  flex: 1;
}

.no-pdf {
  background: #fff;
  border-radius: 12px;
  padding: 60px;
  text-align: center;
}

.no-pdf h3 {
  margin-top: 16px;
  font-size: 18px;
  font-weight: 600;
  color: #1a1f36;
}

.no-pdf p {
  margin-top: 8px;
  color: #697386;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
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
  margin-left: 8px;
}

.btn-secondary:hover {
  background: #f6f8fa;
}

.mt-2 { margin-top: 8px; }
</style>
