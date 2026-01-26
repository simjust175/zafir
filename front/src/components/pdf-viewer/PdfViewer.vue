<template>
  <v-dialog
    v-model="dialog"
    max-width="700"
    scrollable
  >
    <div
      v-if="url"
      class="pdf-viewer-dialog"
    >
      <PdfDialogToolbar
        :issuer="fileDetails?.issuer"
        :pdf-url="pdfUrl"
        :disable-close="mode === 'double-check' && !allConfirmed"
        @close="handleClose"
      />

      <transition name="alert-slide">
        <div
          v-if="mode === 'conflict'"
          class="conflict-alert"
        >
          <div class="alert-icon">
            <v-icon
              size="22"
              color="warning"
            >
              mdi-alert-circle-outline
            </v-icon>
          </div>
          <div class="alert-content">
            <span class="alert-title">{{ conflictTitle }}</span>
            <span class="alert-message">{{ conflictMessage }}</span>
          </div>
        </div>
      </transition>

      <div
        v-if="mode === 'conflict' && conflictType === 'duplicate'"
        class="duplicate-actions"
      >
        <button
          class="action-btn success"
          @click="keepBoth"
        >
          <span class="btn-icon">
            <v-icon size="18">mdi-content-duplicate</v-icon>
          </span>
          <span class="btn-text">Keep Both</span>
        </button>
        <button
          class="action-btn warning"
          @click="keepDuplicate"
        >
          <span class="btn-icon">
            <v-icon size="18">mdi-file-replace-outline</v-icon>
          </span>
          <span class="btn-text">Keep Duplicate</span>
        </button>
        <button
          class="action-btn danger"
          @click="keepNone"
        >
          <span class="btn-icon">
            <v-icon size="18">mdi-trash-can-outline</v-icon>
          </span>
          <span class="btn-text">Delete Both</span>
        </button>
      </div>

      <div
        v-if="mode !== 'conflict' || conflictType === 'unknown-supplier'"
        class="summary-panel"
      >
        <div class="summary-grid">
          <div class="summary-item">
            <div class="item-header">
              <span class="label">Supplier</span>
              <div
                v-if="mode === 'double-check'"
                class="confirm-chip"
                :class="{ confirmed: confirmed.issuer }"
                @click="toggleConfirm('issuer')"
              >
                <v-icon size="14">
                  {{ confirmed.issuer ? 'mdi-check-circle' : 'mdi-checkbox-blank-circle-outline' }}
                </v-icon>
                {{ confirmed.issuer ? 'Verified' : 'Verify' }}
              </div>
            </div>
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
                <span
                  v-if="!editing.issuer"
                  class="value-text"
                >{{ editableFields.issuer || fileDetails?.issuer }}</span>
                <input
                  v-else
                  v-model="editableFields.issuer"
                  type="text"
                  class="inline-input"
                  @keyup.enter="finishEdit('issuer')"
                >
              </template>
              <button
                v-if="mode === 'double-check' && !confirmed.issuer"
                class="edit-btn"
                @click="editing.issuer = true"
              >
                <v-icon size="14">
                  mdi-pencil-outline
                </v-icon>
              </button>
            </div>
            <span class="sub-value">
              <v-icon
                size="12"
                class="mr-1"
              >mdi-calendar-outline</v-icon>
              Issued: {{ formatDate(fileDetails?.invoice_date) }}
            </span>
          </div>

          <div class="summary-item">
            <div class="item-header">
              <span class="label">VAT Rate</span>
              <div
                v-if="mode === 'double-check'"
                class="confirm-chip"
                :class="{ confirmed: confirmed.btw }"
                @click="toggleConfirm('btw')"
              >
                <v-icon size="14">
                  {{ confirmed.btw ? 'mdi-check-circle' : 'mdi-checkbox-blank-circle-outline' }}
                </v-icon>
                {{ confirmed.btw ? 'Verified' : 'Verify' }}
              </div>
            </div>
            <span class="value-text highlight">{{ fileDetails?.btwPercent || 0 }}%</span>

            <div class="item-header mt-4">
              <span class="label">Total Amount</span>
              <div
                v-if="mode === 'double-check'"
                class="confirm-chip"
                :class="{ confirmed: confirmed.amount }"
                @click="toggleConfirm('amount')"
              >
                <v-icon size="14">
                  {{ confirmed.amount ? 'mdi-check-circle' : 'mdi-checkbox-blank-circle-outline' }}
                </v-icon>
                {{ confirmed.amount ? 'Verified' : 'Verify' }}
              </div>
            </div>
            <span class="value-text large">€{{ formattedAmount }}</span>
          </div>
        </div>

        <div
          v-if="mode === 'conflict' && conflictType === 'unknown-supplier'"
          class="unknown-actions"
        >
          <button
            class="btn btn-secondary"
            @click="keepUnknown"
          >
            <v-icon size="18">
              mdi-account-off-outline
            </v-icon>
            Keep as Unknown
          </button>
          <button
            class="btn btn-primary"
            @click="saveSupplier"
          >
            <v-icon size="18">
              mdi-check
            </v-icon>
            Save Supplier
          </button>
        </div>

        <div
          v-if="mode === 'double-check'"
          class="confirm-section"
        >
          <div class="confirm-progress">
            <span class="progress-text">{{ confirmedCount }} of 3 verified</span>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: `${(confirmedCount / 3) * 100}%` }"
              />
            </div>
          </div>
          <button
            class="btn btn-primary"
            :class="{ ready: allConfirmed }"
            :disabled="!allConfirmed"
            @click="confirmDoubleCheck"
          >
            <v-icon size="18">
              {{ allConfirmed ? 'mdi-check-circle' : 'mdi-shield-alert-outline' }}
            </v-icon>
            {{ allConfirmed ? 'Confirm & Continue' : 'Verify All Fields' }}
          </button>
        </div>
      </div>

      <div class="pdf-content">
        <template v-if="mode === 'conflict' && conflictType === 'duplicate'">
          <div class="pdf-compare">
            <div class="pdf-panel">
              <div class="panel-header">
                <span class="panel-badge current">Current</span>
                <h4>Original File</h4>
              </div>
              <embed
                :src="pdfUrl"
                type="application/pdf"
                width="100%"
                height="100%"
              >
            </div>
            <div class="pdf-panel">
              <div class="panel-header">
                <span class="panel-badge duplicate">Duplicate</span>
                <h4>Possible Duplicate</h4>
              </div>
              <embed
                :src="duplicatePdfUrl"
                type="application/pdf"
                width="100%"
                height="100%"
              >
            </div>
          </div>
        </template>
        <embed
          v-else
          :src="`${pdfUrl}#toolbar=0&navpanes=0`"
          type="application/pdf"
          width="100%"
          height="100%"
        >
      </div>
    </div>

    <div
      v-else
      class="no-pdf"
    >
      <div class="no-pdf-icon">
        <v-icon
          size="56"
          color="grey-lighten-1"
        >
          mdi-file-remove-outline
        </v-icon>
      </div>
      <h3>No PDF Available</h3>
      <p>There is no document to preview at this time.</p>
      <button
        class="btn btn-primary"
        @click="handleClose"
      >
        <v-icon size="18">
          mdi-close
        </v-icon>
        Close
      </button>
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
const confirmedCount = computed(() => Object.values(confirmed.value).filter(Boolean).length)
const finishEdit = (field) => { editing.value[field] = false; confirmed.value[field] = true }

const conflictTitle = computed(() => {
  if (props.conflictType === 'unknown-supplier') return "Missing Supplier Information"
  if (props.conflictType === 'duplicate') return "Duplicate Document Detected"
  return ""
})

const conflictMessage = computed(() => {
  if (props.conflictType === 'unknown-supplier') return "We couldn't identify the supplier. Please enter the name manually."
  if (props.conflictType === 'duplicate') return "This document appears to be similar to another in your records."
  return ""
})

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  const d = new Date(dateStr)
  return isNaN(d) ? 'N/A' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
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
  background: rgb(var(--v-theme-surface));
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(var(--v-theme-on-surface), 0.05);
}

.conflict-alert {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  border-bottom: 1px solid rgba(146, 64, 14, 0.15);
}

.alert-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(146, 64, 14, 0.12);
  border-radius: 10px;
  flex-shrink: 0;
}

.alert-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.alert-title {
  font-size: 14px;
  font-weight: 700;
  color: #92400E;
}

.alert-message {
  font-size: 13px;
  color: #A16207;
}

.duplicate-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 16px 20px;
  background: rgba(var(--v-theme-on-surface), 0.02);
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
}

.action-btn.success {
  background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%);
  color: #166534;
  border-color: rgba(22, 101, 52, 0.15);
}

.action-btn.success .btn-icon { background: rgba(22, 163, 74, 0.15); }

.action-btn.success:hover {
  background: linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.15);
}

.action-btn.warning {
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  color: #92400E;
  border-color: rgba(146, 64, 14, 0.15);
}

.action-btn.warning .btn-icon { background: rgba(217, 119, 6, 0.15); }

.action-btn.warning:hover {
  background: linear-gradient(135deg, #FDE68A 0%, #FCD34D 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(217, 119, 6, 0.15);
}

.action-btn.danger {
  background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%);
  color: #B91C1C;
  border-color: rgba(185, 28, 28, 0.15);
}

.action-btn.danger .btn-icon { background: rgba(220, 38, 38, 0.12); }

.action-btn.danger:hover {
  background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15);
}

.summary-panel {
  padding: 20px 24px;
  background: rgba(var(--v-theme-on-surface), 0.02);
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgb(var(--v-theme-grey-500));
}

.value-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.value-text {
  font-size: 15px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.value-text.highlight {
  color: rgb(var(--v-theme-primary));
}

.value-text.large {
  font-size: 22px;
  font-weight: 700;
  color: #16A34A;
}

.sub-value {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: rgb(var(--v-theme-grey-500));
  margin-top: 4px;
}

.inline-input {
  flex: 1;
  padding: 10px 14px;
  font-size: 14px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.15);
  border-radius: 10px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  transition: all 0.2s ease;
}

.inline-input:focus {
  outline: none;
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.1);
}

.confirm-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  color: #92400E;
}

.confirm-chip:hover {
  transform: scale(1.02);
}

.confirm-chip.confirmed {
  background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
  color: #065F46;
}

.edit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  background: rgba(var(--v-theme-on-surface), 0.06);
  border-radius: 7px;
  cursor: pointer;
  color: rgb(var(--v-theme-grey-600));
  transition: all 0.2s ease;
}

.edit-btn:hover {
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
}

.unknown-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.confirm-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  text-align: center;
}

.confirm-progress {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}

.progress-text {
  font-size: 13px;
  font-weight: 500;
  color: rgb(var(--v-theme-grey-600));
}

.progress-bar {
  width: 120px;
  height: 6px;
  background: rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, rgb(var(--v-theme-primary)) 0%, #22C55E 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.pdf-content {
  height: 55vh;
  background: #F0F2F5;
}

.pdf-content embed {
  border: none;
  display: block;
}

.pdf-compare {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100%;
  gap: 12px;
  padding: 12px;
}

.pdf-panel {
  display: flex;
  flex-direction: column;
  background: rgb(var(--v-theme-surface));
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(var(--v-theme-on-surface), 0.03);
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.panel-header h4 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.panel-badge {
  padding: 3px 8px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 4px;
}

.panel-badge.current {
  background: rgba(var(--v-theme-primary), 0.15);
  color: rgb(var(--v-theme-primary));
}

.panel-badge.duplicate {
  background: rgba(217, 119, 6, 0.15);
  color: #D97706;
}

.pdf-panel embed {
  flex: 1;
}

.no-pdf {
  background: rgb(var(--v-theme-surface));
  border-radius: 16px;
  padding: 60px 40px;
  text-align: center;
}

.no-pdf-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  margin: 0 auto 20px;
  background: rgba(var(--v-theme-on-surface), 0.05);
  border-radius: 22px;
}

.no-pdf h3 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  letter-spacing: -0.02em;
}

.no-pdf p {
  margin: 0 0 24px;
  font-size: 14px;
  color: rgb(var(--v-theme-grey-500));
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
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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

.btn-primary:disabled {
  background: rgba(var(--v-theme-on-surface), 0.12);
  color: rgb(var(--v-theme-grey-400));
  box-shadow: none;
  cursor: not-allowed;
}

.btn-primary.ready {
  background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.btn-secondary {
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.15);
}

.btn-secondary:hover {
  background: rgba(var(--v-theme-on-surface), 0.04);
}

.mt-4 { margin-top: 16px; }

.alert-slide-enter-active,
.alert-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.alert-slide-enter-from,
.alert-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .pdf-compare {
    grid-template-columns: 1fr;
  }

  .duplicate-actions {
    flex-direction: column;
    gap: 8px;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
