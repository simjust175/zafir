<template>
  <v-dialog v-model="dialog" scrollable>
    <div v-if="url" class="pdf-dialog">
      <!-- Header -->
      <div class="dialog-header">
        <div class="header-left">
          <button class="close-btn" @click="handleClose">
            <v-icon size="20">mdi-close</v-icon>
          </button>
          <span class="header-title">Document Preview</span>
        </div>
        <div class="header-right">
          <span class="supplier-name">
            <v-icon size="16" class="mr-1">mdi-file-pdf-box</v-icon>
            {{ fileDetails?.issuer || 'Unknown Supplier' }}
          </span>
          <div class="header-actions">
            <a :href="pdfUrl" target="_blank" rel="noopener" class="icon-btn" title="Open in New Tab">
              <v-icon size="18">mdi-open-in-new</v-icon>
            </a>
            <a :href="pdfUrl" download class="icon-btn" title="Download PDF">
              <v-icon size="18">mdi-download</v-icon>
            </a>
          </div>
        </div>
      </div>

      <!-- Conflict Alert -->
      <div v-if="mode === 'conflict'" class="conflict-alert">
        <v-icon size="20" color="warning">mdi-alert-circle</v-icon>
        <span>{{ conflictMessage }}</span>
      </div>

      <!-- Summary Section (for non-duplicate conflicts) -->
      <PdfSummarySection
        v-if="mode !== 'conflict' || conflictType === 'unknown-supplier'"
        :mode="mode"
        :conflict-type="conflictType"
        :file-details="fileDetails"
        :all-confirmed="allConfirmed"
        :confirmed="confirmed"
        :editable-fields="editableFields"
        :editing="editing"
        @save-supplier="$emit('save-supplier', $event)"
        @keep-unknown="$emit('keep-unknown')"
        @toggle-confirm="toggleConfirm"
        @finish-edit="finishEdit"
        @confirm="confirmDoubleCheck"
      />

      <!-- Duplicate Comparison -->
      <div v-if="mode === 'conflict' && conflictType === 'duplicate'" class="duplicate-section">
        <div class="duplicate-grid">
          <div
            class="pdf-card"
            :class="{ selected: selectedDocs.current }"
            @click="toggleSelection('current')"
          >
            <div class="card-header">
              <span class="card-title">Current File</span>
              <div class="selection-indicator">
                <v-icon
                  :icon="selectedDocs.current ? 'mdi-check-circle' : 'mdi-checkbox-blank-circle-outline'"
                  :color="selectedDocs.current ? 'success' : 'grey'"
                  size="24"
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
              <span class="card-title">Possible Duplicate</span>
              <div class="selection-indicator">
                <v-icon
                  :icon="selectedDocs.duplicate ? 'mdi-check-circle' : 'mdi-checkbox-blank-circle-outline'"
                  :color="selectedDocs.duplicate ? 'success' : 'grey'"
                  size="24"
                />
              </div>
            </div>
            <div class="pdf-preview">
              <embed :src="duplicatePdfUrl" type="application/pdf" width="100%" height="100%">
            </div>
          </div>
        </div>
        
        <div class="duplicate-actions">
          <button class="btn btn-primary" @click="handleDuplicateSave">
            {{ duplicateSaveBtnText }}
          </button>
        </div>
      </div>

      <!-- Single PDF Viewer -->
      <div v-else class="pdf-viewer">
        <embed
          :src="`${pdfUrl}#toolbar=0&navpanes=0`"
          type="application/pdf"
          width="100%"
          height="100%"
        >
      </div>
    </div>

    <!-- No PDF Fallback -->
    <div v-else class="no-pdf">
      <v-icon size="64" color="grey-lighten-1">mdi-file-remove-outline</v-icon>
      <h3>No Document Available</h3>
      <p>There is no document to preview at the moment.</p>
      <button class="btn btn-primary" @click="handleClose">Close</button>
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
  if (selectedDocs.value.current) return 'Keep Current File'
  if (selectedDocs.value.duplicate) return 'Keep Duplicate File'
  return 'Delete Both Files'
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

const editableFields = ref({ issuer: props.fileDetails?.issuer || '' })
const editing = ref({ issuer: false, btw: false, amount: false })
const confirmed = ref({ issuer: false, btw: false, amount: false })
const toggleConfirm = (field) => { confirmed.value[field] = !confirmed.value[field] }
const allConfirmed = computed(() => Object.values(confirmed.value).every(Boolean))
const finishEdit = (field) => { editing.value[field] = false; confirmed.value[field] = true }

watch(() => props.fileDetails, (newVal) => {
  editableFields.value = { issuer: newVal?.issuer || '' }
  confirmed.value = { issuer: false, btw: false, amount: false }
}, { immediate: true })

const conflictMessage = computed(() => {
  if (props.conflictType === 'unknown-supplier') return "We couldn't detect a supplier name for this invoice."
  if (props.conflictType === 'duplicate') return "This document seems similar to another one in your records."
  return ""
})
</script>

<style scoped>
.pdf-dialog {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fafbfc;
  border-bottom: 1px solid #e3e8ee;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  color: #697386;
  transition: all 0.15s ease;
}

.close-btn:hover {
  background: #e3e8ee;
  color: #1a1f36;
}

.header-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1f36;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.supplier-name {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #697386;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: #697386;
  text-decoration: none;
  transition: all 0.15s ease;
}

.icon-btn:hover {
  background: #e3e8ee;
  color: #1a1f36;
}

.conflict-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: #fef3c7;
  color: #92400e;
  font-size: 14px;
}

.pdf-viewer {
  height: 70vh;
  background: #f0f2f5;
}

.pdf-viewer embed {
  border: none;
  display: block;
}

.duplicate-section {
  padding: 20px;
}

.duplicate-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.pdf-card {
  border: 2px solid #e3e8ee;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pdf-card:hover {
  border-color: #c4c9d4;
}

.pdf-card.selected {
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fafbfc;
  border-bottom: 1px solid #e3e8ee;
}

.card-title {
  font-size: 13px;
  font-weight: 600;
  color: #1a1f36;
}

.pdf-preview {
  height: 300px;
  background: #f0f2f5;
}

.pdf-preview embed {
  border: none;
}

.duplicate-actions {
  display: flex;
  justify-content: center;
}

.no-pdf {
  background: #fff;
  border-radius: 12px;
  padding: 60px 40px;
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
  font-size: 14px;
  color: #697386;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 24px;
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

.btn-primary:hover {
  background: #5851ea;
}

@media (max-width: 768px) {
  .duplicate-grid {
    grid-template-columns: 1fr;
  }
  
  .pdf-preview {
    height: 250px;
  }
}
</style>
