<template>
  <v-dialog
    v-model="dialogVisible"
    max-width="640"
    persistent
    content-class="invoice-upload-dialog"
  >
    <div class="dialog-container">
      <div class="dialog-header">
        <div class="header-left">
          <v-btn
            icon
            variant="text"
            size="small"
            @click="handleClose"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <h2 class="dialog-title">{{ dialogTitle }}</h2>
        </div>
        <div v-if="currentStep === 0" class="mode-toggle">
          <button 
            :class="['mode-btn', { active: activeMode === 'upload' }]"
            @click="activeMode = 'upload'"
          >
            <v-icon size="18">mdi-upload</v-icon>
            Upload
          </button>
          <button 
            :class="['mode-btn', { active: activeMode === 'manual' }]"
            @click="activeMode = 'manual'"
          >
            <v-icon size="18">mdi-pencil</v-icon>
            Manual
          </button>
        </div>
      </div>

      <div class="dialog-body">
        <transition name="fade-slide" mode="out-in">
          <div v-if="currentStep === 0 && activeMode === 'upload'" key="upload" class="step-upload">
            <div 
              class="dropzone"
              :class="{ 
                'dropzone-active': isDragging, 
                'dropzone-has-file': selectedFile 
              }"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
              @click="openFilePicker"
            >
              <input
                ref="fileInputRef"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                hidden
                @change="handleFileSelect"
              />

              <div v-if="!selectedFile" class="dropzone-empty">
                <div class="dropzone-icon">
                  <v-icon size="40" color="primary">mdi-cloud-upload-outline</v-icon>
                </div>
                <p class="dropzone-title">Drop files here or click to browse</p>
                <p class="dropzone-hint">PDF, JPG, PNG up to 10MB</p>
              </div>

              <div v-else class="file-preview">
                <div class="file-icon">
                  <v-icon :icon="getFileIcon(selectedFile)" size="28" color="primary" />
                </div>
                <div class="file-info">
                  <span class="file-name">{{ selectedFile.name }}</span>
                  <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
                </div>
                <v-btn
                  icon
                  variant="text"
                  size="x-small"
                  color="error"
                  @click.stop="removeFile"
                >
                  <v-icon size="18">mdi-close</v-icon>
                </v-btn>
              </div>
            </div>

            <div v-if="fileError" class="error-alert">
              <v-icon size="16" color="error">mdi-alert-circle</v-icon>
              {{ fileError }}
            </div>
          </div>

          <div v-else-if="currentStep === 0 && activeMode === 'manual'" key="manual" class="step-manual">
            <div class="form-grid">
              <div class="form-field">
                <label class="field-label">Supplier / Issuer <span class="required">*</span></label>
                <v-autocomplete
                  v-model="invoiceData.issuer"
                  :items="knownSuppliers"
                  placeholder="Select or type supplier name"
                  hide-details
                  density="compact"
                  variant="outlined"
                />
              </div>

              <div class="form-field">
                <label class="field-label">Amount <span class="required">*</span></label>
                <v-text-field
                  v-model.number="invoiceData.amount"
                  type="number"
                  placeholder="0.00"
                  prefix="€"
                  hide-details
                  density="compact"
                  variant="outlined"
                />
              </div>

              <div class="form-field">
                <label class="field-label">Project</label>
                <v-select
                  v-model="invoiceData.project"
                  :items="projects"
                  item-title="name"
                  item-value="id"
                  placeholder="Select project"
                  clearable
                  hide-details
                  density="compact"
                  variant="outlined"
                />
              </div>

              <div class="form-field vat-field">
                <label class="field-label">VAT (BTW)</label>
                <div class="vat-controls">
                  <v-switch
                    v-model="invoiceData.includesBtw"
                    label="Includes VAT"
                    color="primary"
                    hide-details
                    density="compact"
                  />
                  <v-text-field
                    v-if="invoiceData.includesBtw"
                    v-model.number="invoiceData.btwPercent"
                    type="number"
                    suffix="%"
                    hide-details
                    density="compact"
                    variant="outlined"
                    style="max-width: 100px"
                  />
                </div>
              </div>

              <div class="form-field">
                <label class="field-label">Margin</label>
                <v-text-field
                  v-model.number="invoiceData.margin"
                  type="number"
                  placeholder="0.00"
                  prefix="€"
                  hide-details
                  density="compact"
                  variant="outlined"
                />
              </div>
            </div>
          </div>

          <div v-else-if="currentStep === 1" key="processing" class="step-processing">
            <div class="processing-content">
              <div class="processing-spinner">
                <svg class="spinner-svg" viewBox="0 0 50 50">
                  <circle class="spinner-track" cx="25" cy="25" r="20" />
                  <circle class="spinner-arc" cx="25" cy="25" r="20" />
                </svg>
                <v-icon class="spinner-icon" size="24" color="primary">mdi-file-search</v-icon>
              </div>
              <h3 class="processing-title">Processing Invoice</h3>
              <p class="processing-status">{{ processingStatus }}</p>
              <div class="progress-track">
                <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
              </div>
            </div>
          </div>

          <div v-else-if="currentStep === 2" key="review" class="step-review">
            <div class="review-notice" :class="extractionWarning ? 'warning' : 'success'">
              <v-icon :icon="extractionWarning ? 'mdi-alert' : 'mdi-check-circle'" size="20" />
              <span>{{ extractionWarning || 'Data extracted successfully. Please review and confirm.' }}</span>
            </div>

            <div class="review-form">
              <div class="form-field">
                <label class="field-label">Supplier / Issuer <span class="required">*</span></label>
                <v-autocomplete
                  v-model="invoiceData.issuer"
                  :items="knownSuppliers"
                  placeholder="Company name"
                  hide-details
                  density="compact"
                  variant="outlined"
                />
              </div>

              <div class="form-row">
                <div class="form-field flex-1">
                  <label class="field-label">Amount <span class="required">*</span></label>
                  <v-text-field
                    v-model.number="invoiceData.amount"
                    type="number"
                    placeholder="0.00"
                    prefix="€"
                    hide-details
                    density="compact"
                    variant="outlined"
                  />
                </div>

                <div class="form-field flex-1">
                  <label class="field-label">Margin</label>
                  <v-text-field
                    v-model.number="invoiceData.margin"
                    type="number"
                    placeholder="0.00"
                    prefix="€"
                    hide-details
                    density="compact"
                    variant="outlined"
                  />
                </div>
              </div>

              <div class="form-field">
                <label class="field-label">Project</label>
                <v-select
                  v-model="invoiceData.project"
                  :items="projects"
                  item-title="name"
                  item-value="id"
                  placeholder="Assign to project"
                  clearable
                  hide-details
                  density="compact"
                  variant="outlined"
                />
              </div>

              <div class="form-field">
                <label class="field-label">VAT (BTW)</label>
                <div class="vat-row">
                  <v-switch
                    v-model="invoiceData.includesBtw"
                    label="Includes VAT"
                    color="primary"
                    hide-details
                    density="compact"
                  />
                  <v-text-field
                    v-if="invoiceData.includesBtw"
                    v-model.number="invoiceData.btwPercent"
                    type="number"
                    suffix="%"
                    hide-details
                    density="compact"
                    variant="outlined"
                    style="max-width: 100px"
                  />
                </div>
              </div>

              <div v-if="selectedFile" class="attached-file-info">
                <v-icon :icon="getFileIcon(selectedFile)" size="18" color="primary" />
                <span>{{ selectedFile.name }}</span>
              </div>
            </div>
          </div>

          <div v-else-if="currentStep === 3" key="confirm" class="step-confirm">
            <div class="confirm-icon">
              <v-icon size="32" color="primary">mdi-file-document-check</v-icon>
            </div>
            <h3 class="confirm-title">Confirm Invoice Details</h3>
            <p class="confirm-subtitle">Please review before saving</p>

            <div class="confirm-summary">
              <div class="summary-row">
                <span class="summary-label">Supplier</span>
                <span class="summary-value">{{ invoiceData.issuer || 'Not specified' }}</span>
              </div>
              <div class="summary-row highlight">
                <span class="summary-label">Amount</span>
                <span class="summary-value">€{{ formatAmount(invoiceData.amount) }}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Project</span>
                <span class="summary-value">{{ getProjectName(invoiceData.project) || 'Unassigned' }}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">VAT Included</span>
                <span class="summary-value">{{ invoiceData.includesBtw ? `Yes (${invoiceData.btwPercent}%)` : 'No' }}</span>
              </div>
              <div v-if="invoiceData.margin" class="summary-row">
                <span class="summary-label">Margin</span>
                <span class="summary-value">€{{ formatAmount(invoiceData.margin) }}</span>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <div class="dialog-footer">
        <v-btn
          v-if="currentStep > 0 && currentStep < 3"
          variant="text"
          @click="goBack"
        >
          <v-icon start>mdi-arrow-left</v-icon>
          Back
        </v-btn>
        <v-spacer />
        <v-btn
          v-if="currentStep === 0"
          variant="text"
          @click="handleClose"
        >
          Cancel
        </v-btn>
        <v-btn
          v-if="currentStep === 0"
          color="primary"
          :disabled="!canProceed"
          @click="handleNext"
        >
          {{ activeMode === 'upload' ? 'Process Invoice' : 'Review Details' }}
          <v-icon end>mdi-arrow-right</v-icon>
        </v-btn>
        <v-btn
          v-if="currentStep === 2"
          color="primary"
          :disabled="!canConfirm"
          @click="goToConfirm"
        >
          Confirm
          <v-icon end>mdi-check</v-icon>
        </v-btn>
        <v-btn
          v-if="currentStep === 3"
          variant="text"
          @click="currentStep = 2"
        >
          <v-icon start>mdi-pencil</v-icon>
          Edit
        </v-btn>
        <v-btn
          v-if="currentStep === 3"
          color="primary"
          :loading="saving"
          @click="saveInvoice"
        >
          <v-icon start>mdi-content-save</v-icon>
          Save Invoice
        </v-btn>
      </div>
    </div>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { invoices } from '@/stores/invoiceState'

const props = defineProps({
  active: Boolean
})

const emit = defineEmits(['close', 'saved'])

const invoiceStore = invoices()

const dialogVisible = ref(false)
const currentStep = ref(0)
const activeMode = ref('upload')
const selectedFile = ref(null)
const fileInputRef = ref(null)
const isDragging = ref(false)
const fileError = ref('')
const processingStatus = ref('')
const progressPercent = ref(0)
const extractionWarning = ref('')
const saving = ref(false)

const invoiceData = ref({
  issuer: '',
  amount: null,
  project: null,
  includesBtw: false,
  btwPercent: 21,
  margin: null,
  pdf_file: null
})

const dialogTitle = computed(() => {
  if (currentStep.value === 0) return activeMode.value === 'upload' ? 'Upload Invoice' : 'Add Invoice'
  if (currentStep.value === 1) return 'Processing'
  if (currentStep.value === 2) return 'Review Invoice'
  if (currentStep.value === 3) return 'Confirm Invoice'
  return 'Invoice'
})

const knownSuppliers = computed(() => {
  const known = invoiceStore.dbResponse.filter(i => i.issuer && i.issuer !== 'UNKNOWN ISSUER')
  return [...new Set(known.map(i => i.issuer))]
})

const projects = computed(() => {
  const set = []
  for (const inv of invoiceStore.dbResponse) {
    if (inv.project_name && !set.some(p => p.name === inv.project_name)) {
      set.push({ name: inv.project_name, id: inv.project_id })
    }
  }
  return set
})

const canProceed = computed(() => {
  if (activeMode.value === 'upload') {
    return selectedFile.value !== null
  }
  return invoiceData.value.issuer && invoiceData.value.amount > 0
})

const canConfirm = computed(() => {
  return invoiceData.value.issuer && invoiceData.value.amount > 0
})

watch(() => props.active, (val) => {
  dialogVisible.value = val
  if (val) {
    resetForm()
  }
})

const resetForm = () => {
  currentStep.value = 0
  activeMode.value = 'upload'
  selectedFile.value = null
  fileError.value = ''
  processingStatus.value = ''
  progressPercent.value = 0
  extractionWarning.value = ''
  invoiceData.value = {
    issuer: '',
    amount: null,
    project: null,
    includesBtw: false,
    btwPercent: 21,
    margin: null,
    pdf_file: null
  }
}

const handleClose = () => {
  emit('close')
}

const openFilePicker = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = (e) => {
  const file = e.target.files?.[0]
  if (file) validateAndSetFile(file)
}

const handleDrop = (e) => {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) validateAndSetFile(file)
}

const validateAndSetFile = (file) => {
  fileError.value = ''
  
  const validTypes = ['application/pdf', 'image/jpeg', 'image/png']
  if (!validTypes.includes(file.type)) {
    fileError.value = 'Invalid file type. Please use PDF, JPG, or PNG.'
    return
  }
  
  if (file.size > 10 * 1024 * 1024) {
    fileError.value = 'File too large. Maximum size is 10MB.'
    return
  }
  
  selectedFile.value = file
}

const removeFile = () => {
  selectedFile.value = null
  fileError.value = ''
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const getFileIcon = (file) => {
  if (!file) return 'mdi-file-document'
  if (file.type === 'application/pdf') return 'mdi-file-pdf-box'
  if (file.type?.startsWith('image/')) return 'mdi-file-image'
  return 'mdi-file-document'
}

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatAmount = (amount) => {
  if (!amount && amount !== 0) return '0.00'
  return Number(amount).toFixed(2)
}

const getProjectName = (projectId) => {
  const proj = projects.value.find(p => p.id === projectId)
  return proj?.name
}

const handleNext = async () => {
  if (activeMode.value === 'manual') {
    currentStep.value = 2
    return
  }
  
  currentStep.value = 1
  progressPercent.value = 0
  processingStatus.value = 'Uploading file...'
  extractionWarning.value = ''

  const simulateProgress = () => {
    const interval = setInterval(() => {
      if (progressPercent.value < 85) {
        progressPercent.value += Math.random() * 12
      }
    }, 250)
    return () => clearInterval(interval)
  }
  
  const stopProgress = simulateProgress()

  try {
    progressPercent.value = 15
    processingStatus.value = 'Extracting text...'
    
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    
    const baseUrl = import.meta.env.VITE_BASE_URL
    
    progressPercent.value = 35
    processingStatus.value = 'Analyzing with AI...'
    
    let extracted = null
    
    if (baseUrl) {
      try {
        const response = await fetch(`${baseUrl}/invoice/extract`, {
          method: 'POST',
          body: formData
        })
        
        if (response.ok) {
          extracted = await response.json()
          progressPercent.value = 85
          processingStatus.value = 'Extraction complete!'
        }
      } catch (err) {
        console.warn('OCR extraction failed:', err)
      }
    }
    
    progressPercent.value = 100
    
    invoiceData.value = {
      issuer: extracted?.issuer || '',
      amount: extracted?.amount || null,
      project: null,
      includesBtw: extracted?.btw || false,
      btwPercent: extracted?.btwPercent || 21,
      margin: null,
      pdf_file: selectedFile.value?.name || null
    }
    
    if (!extracted || extracted.extractionFailed || !extracted.issuer) {
      extractionWarning.value = 'Some fields could not be extracted. Please fill them in manually.'
    }
    
    stopProgress()
    
    setTimeout(() => {
      currentStep.value = 2
    }, 400)
    
  } catch (err) {
    console.error('Processing error:', err)
    stopProgress()
    extractionWarning.value = 'Processing failed. Please enter details manually.'
    invoiceData.value.pdf_file = selectedFile.value?.name || null
    currentStep.value = 2
  }
}

const goBack = () => {
  if (currentStep.value === 2) {
    currentStep.value = 0
  } else if (currentStep.value === 3) {
    currentStep.value = 2
  }
}

const goToConfirm = () => {
  currentStep.value = 3
}

const saveInvoice = async () => {
  if (!canConfirm.value) return
  
  saving.value = true
  
  try {
    const payload = {
      issuer: invoiceData.value.issuer,
      amount: parseFloat(invoiceData.value.amount),
      project: invoiceData.value.project,
      includesBtw: invoiceData.value.includesBtw,
      btwPercent: invoiceData.value.includesBtw ? parseInt(invoiceData.value.btwPercent) : 0,
      margin: invoiceData.value.margin ? parseFloat(invoiceData.value.margin) : null,
      pdf_file: invoiceData.value.pdf_file
    }
    
    const baseUrl = import.meta.env.VITE_BASE_URL
    const response = await fetch(`${baseUrl}/invoice/post`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    
    if (!response.ok) {
      throw new Error('Failed to save invoice')
    }
    
    await invoiceStore.getAmounts()
    
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { 
        title: 'Invoice Saved', 
        message: 'Invoice has been added successfully', 
        type: 'success' 
      }
    }))
    
    emit('saved')
    emit('close')
    
  } catch (err) {
    console.error('Save error:', err)
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { 
        title: 'Error', 
        message: 'Failed to save invoice. Please try again.', 
        type: 'error' 
      }
    }))
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.dialog-container {
  background: rgb(var(--v-theme-surface));
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgb(var(--v-theme-grey-200));
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dialog-title {
  font-size: 1.0625rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
}

.mode-toggle {
  display: flex;
  background: rgb(var(--v-theme-grey-100));
  border-radius: 8px;
  padding: 3px;
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgb(var(--v-theme-grey-600));
  cursor: pointer;
  transition: all 0.15s ease;
}

.mode-btn.active {
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-primary));
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.dialog-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  min-height: 300px;
}

.dialog-footer {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid rgb(var(--v-theme-grey-200));
  gap: 12px;
}

.dropzone {
  border: 2px dashed rgb(var(--v-theme-grey-300));
  border-radius: 12px;
  padding: 40px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgb(var(--v-theme-grey-50));
}

.dropzone:hover,
.dropzone-active {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.04);
}

.dropzone-has-file {
  padding: 16px 20px;
  background: rgb(var(--v-theme-surface));
  border-style: solid;
  border-color: rgb(var(--v-theme-primary));
}

.dropzone-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  background: rgba(var(--v-theme-primary), 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dropzone-title {
  font-size: 0.9375rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 4px;
}

.dropzone-hint {
  font-size: 0.8125rem;
  color: rgb(var(--v-theme-grey-500));
  margin: 0;
}

.file-preview {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-icon {
  width: 44px;
  height: 44px;
  background: rgba(var(--v-theme-primary), 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-info {
  flex: 1;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.file-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
}

.file-size {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-grey-500));
}

.error-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 14px;
  background: rgba(var(--v-theme-error), 0.1);
  border-radius: 8px;
  font-size: 0.8125rem;
  color: rgb(var(--v-theme-error));
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgb(var(--v-theme-grey-700));
}

.required {
  color: rgb(var(--v-theme-error));
}

.vat-controls,
.vat-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.step-processing {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 280px;
}

.processing-content {
  text-align: center;
}

.processing-spinner {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  position: relative;
}

.spinner-svg {
  width: 100%;
  height: 100%;
  animation: rotate 1.5s linear infinite;
}

.spinner-track {
  fill: none;
  stroke: rgb(var(--v-theme-grey-200));
  stroke-width: 4;
}

.spinner-arc {
  fill: none;
  stroke: rgb(var(--v-theme-primary));
  stroke-width: 4;
  stroke-linecap: round;
  stroke-dasharray: 100;
  stroke-dashoffset: 75;
}

.spinner-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

@keyframes rotate {
  100% { transform: rotate(360deg); }
}

.processing-title {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 6px;
}

.processing-status {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-grey-600));
  margin: 0 0 16px;
}

.progress-track {
  width: 160px;
  height: 4px;
  background: rgb(var(--v-theme-grey-200));
  border-radius: 2px;
  margin: 0 auto;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: rgb(var(--v-theme-primary));
  transition: width 0.25s ease;
}

.review-notice {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.875rem;
  margin-bottom: 20px;
}

.review-notice.success {
  background: rgba(var(--v-theme-success), 0.1);
  color: rgb(var(--v-theme-success));
}

.review-notice.warning {
  background: rgba(var(--v-theme-warning), 0.1);
  color: rgb(var(--v-theme-warning));
}

.review-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.flex-1 {
  flex: 1;
}

.attached-file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgb(var(--v-theme-grey-50));
  border-radius: 8px;
  font-size: 0.8125rem;
  color: rgb(var(--v-theme-grey-700));
}

.step-confirm {
  text-align: center;
  padding: 10px 0;
}

.confirm-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  background: rgba(var(--v-theme-primary), 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 4px;
}

.confirm-subtitle {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-grey-600));
  margin: 0 0 24px;
}

.confirm-summary {
  background: rgb(var(--v-theme-grey-50));
  border-radius: 12px;
  padding: 16px 20px;
  text-align: left;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgb(var(--v-theme-grey-200));
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-row.highlight .summary-value {
  font-size: 1rem;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
}

.summary-label {
  font-size: 0.8125rem;
  color: rgb(var(--v-theme-grey-600));
}

.summary-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(16px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}
</style>
