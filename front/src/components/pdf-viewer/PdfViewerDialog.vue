<template>
  <v-dialog v-model="dialog" max-width="750" scrollable>
    <div v-if="url" class="pdf-dialog">
      <div class="dialog-header">
        <div class="header-left">
          <button class="close-btn" @click="handleClose" title="Close">
            <v-icon size="20">mdi-close</v-icon>
          </button>
          <div class="header-title-group">
            <span class="header-title">Document Preview</span>
            <span class="header-subtitle">Invoice document</span>
          </div>
        </div>
        <div class="header-right">
          <div class="supplier-badge">
            <span class="supplier-icon">
              <v-icon size="16" color="primary">mdi-file-pdf-box</v-icon>
            </span>
            <span class="supplier-name">{{ fileDetails?.issuer || 'Unknown Supplier' }}</span>
          </div>
          <div class="header-divider" />
          <div class="header-actions">
            <a :href="pdfUrl" target="_blank" rel="noopener" class="icon-btn" title="Open in New Tab">
              <v-icon size="18">mdi-open-in-new</v-icon>
            </a>
            <a :href="pdfUrl" download class="icon-btn download" title="Download PDF">
              <v-icon size="18">mdi-download-outline</v-icon>
            </a>
          </div>
        </div>
      </div>

      <transition name="alert-slide">
        <div v-if="mode === 'conflict'" class="conflict-alert">
          <div class="alert-icon">
            <v-icon size="22" color="warning">mdi-alert-circle-outline</v-icon>
          </div>
          <div class="alert-content">
            <span class="alert-title">{{ conflictType === 'duplicate' ? 'Duplicate Detected' : 'Missing Information' }}</span>
            <span class="alert-message">{{ conflictMessage }}</span>
          </div>
        </div>
      </transition>

      <PdfSummarySection
        v-if="mode !== 'conflict' || conflictType === 'unknown-supplier'"
        :mode="mode"
        :conflict-type="conflictType"
        :file-details="fileDetails"
        :all-confirmed="allConfirmed"
        :confirmed="confirmed"
        @save-supplier="$emit('save-supplier', $event)"
        @keep-unknown="$emit('keep-unknown')"
        @toggle-confirm="toggleConfirm"
        @confirm="confirmDoubleCheck"
      />

      <div v-if="mode === 'conflict' && conflictType === 'duplicate'" class="duplicate-section">
        <div class="duplicate-header">
          <h3 class="duplicate-title">Compare Documents</h3>
          <p class="duplicate-subtitle">Select the documents you want to keep</p>
        </div>

        <div class="duplicate-grid">
          <div
            class="pdf-card"
            :class="{ selected: selectedDocs.current }"
            @click="toggleSelection('current')"
          >
            <div class="card-header">
              <div class="card-title-row">
                <span class="card-badge current">Original</span>
                <span class="card-title">Current File</span>
              </div>
              <div class="selection-indicator">
                <v-icon
                  :icon="selectedDocs.current ? 'mdi-checkbox-marked-circle' : 'mdi-checkbox-blank-circle-outline'"
                  :color="selectedDocs.current ? 'success' : 'grey-lighten-1'"
                  size="26"
                />
              </div>
            </div>
            <div class="pdf-preview">
              <embed :src="pdfUrl" type="application/pdf" width="100%" height="100%">
            </div>
          </div>
          
          <div
            class="pdf-card"
            :class="{ selected: selectedDocs.duplicate }"
            @click="toggleSelection('duplicate')"
          >
            <div class="card-header">
              <div class="card-title-row">
                <span class="card-badge duplicate">Duplicate</span>
                <span class="card-title">Similar File</span>
              </div>
              <div class="selection-indicator">
                <v-icon
                  :icon="selectedDocs.duplicate ? 'mdi-checkbox-marked-circle' : 'mdi-checkbox-blank-circle-outline'"
                  :color="selectedDocs.duplicate ? 'success' : 'grey-lighten-1'"
                  size="26"
                />
              </div>
            </div>
            <div class="pdf-preview">
              <embed :src="duplicatePdfUrl" type="application/pdf" width="100%" height="100%">
            </div>
          </div>
        </div>
        
        <div class="duplicate-actions">
          <div class="action-hint">
            <v-icon size="16" color="grey">mdi-information-outline</v-icon>
            <span>{{ actionHint }}</span>
          </div>
          <button class="btn btn-primary" :class="actionBtnClass" @click="handleDuplicateSave">
            <v-icon size="18">{{ actionBtnIcon }}</v-icon>
            {{ duplicateSaveBtnText }}
          </button>
        </div>
      </div>

      <div v-else class="pdf-viewer">
        <embed
          :src="`${pdfUrl}#toolbar=0&navpanes=0`"
          type="application/pdf"
          width="100%"
          height="100%"
        >
      </div>
    </div>

    <div v-else class="no-pdf">
      <div class="no-pdf-visual">
        <div class="visual-bg" />
        <div class="visual-icon">
          <v-icon size="48" color="grey-lighten-1">mdi-file-document-remove-outline</v-icon>
        </div>
      </div>
      <h3>No Document Available</h3>
      <p>There is no document to preview at the moment.</p>
      <button class="btn btn-primary" @click="handleClose">
        <v-icon size="18">mdi-close</v-icon>
        Close
      </button>
    </div>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import PdfSummarySection from './PdfSummarySection.vue'

const dialog = defineModel('dialog')

const props = defineProps({
  url: String,
  fileDetails: Object,
  mode: { type: String, default: 'normal' },
  conflictType: String,
  duplicateFileUrl: String,
  duplicateId: Number
})

const emit = defineEmits([
  'close', 'double-checked', 'close-double-check',
  'save-supplier', 'keep-unknown', 'keep-both', 'keep-this', 'keep-duplicate', 'keep-none'
])

const selectedDocs = ref({ current: false, duplicate: false })

const duplicateSaveBtnText = computed(() => {
  if (selectedDocs.value.current && selectedDocs.value.duplicate) return 'Keep Both Files'
  if (selectedDocs.value.current) return 'Keep Original Only'
  if (selectedDocs.value.duplicate) return 'Keep Duplicate Only'
  return 'Delete Both Files'
})

const actionHint = computed(() => {
  if (selectedDocs.value.current && selectedDocs.value.duplicate) return 'Both files will be preserved'
  if (selectedDocs.value.current) return 'The duplicate will be deleted'
  if (selectedDocs.value.duplicate) return 'The original will be deleted'
  return 'Both files will be permanently deleted'
})

const actionBtnClass = computed(() => {
  if (!selectedDocs.value.current && !selectedDocs.value.duplicate) return 'danger'
  return ''
})

const actionBtnIcon = computed(() => {
  if (selectedDocs.value.current && selectedDocs.value.duplicate) return 'mdi-content-duplicate'
  if (!selectedDocs.value.current && !selectedDocs.value.duplicate) return 'mdi-trash-can-outline'
  return 'mdi-check'
})

const toggleSelection = (doc) => {
  selectedDocs.value[doc] = !selectedDocs.value[doc]
}

const handleDuplicateSave = () => {
  if (selectedDocs.value.current && selectedDocs.value.duplicate) emit('keep-both')
  else if (selectedDocs.value.current) emit('keep-this')
  else if (selectedDocs.value.duplicate) emit('keep-duplicate')
  else emit('keep-none')
  dialog.value = false
}

const handleClose = () => { emit('close'); dialog.value = false }

const confirmDoubleCheck = () => {
  emit('double-checked', props.fileDetails?.invoice_id)
  emit('close-double-check')
  handleClose()
}

const pdfUrl = computed(() => props.url ? `${import.meta.env.VITE_BASE_URL}/file/${props.url}` : '')
const duplicatePdfUrl = computed(() => props.duplicateFileUrl ? `${import.meta.env.VITE_BASE_URL}/file/${props.duplicateFileUrl}` : '')

const confirmed = ref({ issuer: false, btw: false, amount: false })
const toggleConfirm = (field) => { confirmed.value[field] = !confirmed.value[field] }
const allConfirmed = computed(() => Object.values(confirmed.value).every(Boolean))

watch(() => props.fileDetails, () => {
  confirmed.value = { issuer: false, btw: false, amount: false }
}, { immediate: true })

const conflictMessage = computed(() => {
  if (props.conflictType === 'unknown-supplier') return "We couldn't detect a supplier name for this invoice."
  if (props.conflictType === 'duplicate') return "This document appears similar to another in your records."
  return ""
})
</script>

<style scoped>
.pdf-dialog {
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

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(180deg, 
    rgb(var(--v-theme-surface)) 0%, 
    rgba(var(--v-theme-on-surface), 0.02) 100%
  );
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  background: rgb(var(--v-theme-surface));
  border-radius: 10px;
  cursor: pointer;
  color: rgb(var(--v-theme-grey-600));
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.close-btn:hover {
  background: rgba(var(--v-theme-on-surface), 0.06);
  border-color: rgba(var(--v-theme-on-surface), 0.15);
  color: rgb(var(--v-theme-on-surface));
  transform: scale(1.02);
}

.header-title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.header-title {
  font-size: 15px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  letter-spacing: -0.01em;
}

.header-subtitle {
  font-size: 12px;
  color: rgb(var(--v-theme-grey-500));
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.supplier-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px 8px 10px;
  background: rgba(var(--v-theme-primary), 0.08);
  border-radius: 10px;
  border: 1px solid rgba(var(--v-theme-primary), 0.12);
}

.supplier-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: rgba(var(--v-theme-primary), 0.12);
  border-radius: 7px;
}

.supplier-name {
  font-size: 13px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  max-width: 160px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-divider {
  width: 1px;
  height: 28px;
  background: rgba(var(--v-theme-on-surface), 0.1);
}

.header-actions {
  display: flex;
  gap: 6px;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  background: rgb(var(--v-theme-surface));
  border-radius: 10px;
  cursor: pointer;
  color: rgb(var(--v-theme-grey-600));
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.icon-btn:hover {
  background: rgba(var(--v-theme-on-surface), 0.06);
  border-color: rgba(var(--v-theme-on-surface), 0.15);
  color: rgb(var(--v-theme-on-surface));
  transform: translateY(-1px);
}

.icon-btn.download:hover {
  background: rgba(var(--v-theme-primary), 0.1);
  border-color: rgba(var(--v-theme-primary), 0.2);
  color: rgb(var(--v-theme-primary));
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

.pdf-viewer {
  height: 65vh;
  background: #F0F2F5;
}

.pdf-viewer embed {
  border: none;
  display: block;
}

.duplicate-section {
  padding: 24px;
  background: rgba(var(--v-theme-on-surface), 0.02);
}

.duplicate-header {
  text-align: center;
  margin-bottom: 20px;
}

.duplicate-title {
  font-size: 18px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 4px;
  letter-spacing: -0.02em;
}

.duplicate-subtitle {
  font-size: 14px;
  color: rgb(var(--v-theme-grey-500));
  margin: 0;
}

.duplicate-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.pdf-card {
  border: 2px solid rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgb(var(--v-theme-surface));
}

.pdf-card:hover {
  border-color: rgba(var(--v-theme-on-surface), 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.pdf-card.selected {
  border-color: #22C55E;
  box-shadow: 
    0 0 0 3px rgba(34, 197, 94, 0.15),
    0 4px 12px rgba(34, 197, 94, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: rgba(var(--v-theme-on-surface), 0.03);
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-badge {
  padding: 4px 10px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 5px;
}

.card-badge.current {
  background: rgba(var(--v-theme-primary), 0.15);
  color: rgb(var(--v-theme-primary));
}

.card-badge.duplicate {
  background: rgba(217, 119, 6, 0.15);
  color: #D97706;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.selection-indicator {
  transition: transform 0.2s ease;
}

.pdf-card:hover .selection-indicator {
  transform: scale(1.1);
}

.pdf-preview {
  height: 280px;
  background: #F0F2F5;
}

.pdf-preview embed {
  border: none;
  pointer-events: none;
}

.duplicate-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.action-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: rgb(var(--v-theme-grey-500));
}

.no-pdf {
  background: rgb(var(--v-theme-surface));
  border-radius: 16px;
  padding: 60px 40px;
  text-align: center;
}

.no-pdf-visual {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 24px;
}

.visual-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, 
    rgba(var(--v-theme-on-surface), 0.06) 0%, 
    transparent 70%
  );
  border-radius: 50%;
}

.visual-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: rgba(var(--v-theme-on-surface), 0.05);
  border-radius: 24px;
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
  padding: 0 28px;
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

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(var(--v-theme-primary), 0.4);
}

.btn-primary.danger {
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-primary.danger:hover {
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
}

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
  .duplicate-grid {
    grid-template-columns: 1fr;
  }
  
  .pdf-preview {
    height: 220px;
  }

  .header-right {
    display: none;
  }
}
</style>
