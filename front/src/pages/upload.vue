<template>
  <div class="upload-page">
    <div class="upload-container">
      <div class="page-header">
        <h1 class="page-title">
          Upload Invoice
        </h1>
        <p class="page-subtitle">
          Upload and process invoices with automatic data extraction
        </p>
      </div>

      <div class="steps-indicator">
        <div 
          v-for="(step, index) in steps" 
          :key="step.id"
          class="step-item"
          :class="{ 
            'step-active': currentStep === index, 
            'step-completed': currentStep > index 
          }"
        >
          <div class="step-circle">
            <v-icon
              v-if="currentStep > index"
              size="16"
            >
              mdi-check
            </v-icon>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <span class="step-label">{{ step.label }}</span>
        </div>
      </div>

      <div class="upload-card">
        <transition
          name="fade-slide"
          mode="out-in"
        >
          <div
            v-if="currentStep === 0"
            key="upload"
            class="step-content"
          >
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
                ref="fileInput"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                hidden
                @change="handleFileSelect"
              >

              <div
                v-if="!selectedFile"
                class="dropzone-empty"
              >
                <div class="dropzone-icon">
                  <v-icon
                    size="48"
                    color="primary"
                  >
                    mdi-cloud-upload-outline
                  </v-icon>
                </div>
                <h3 class="dropzone-title">
                  Drop your invoice here
                </h3>
                <p class="dropzone-hint">
                  or click to browse files
                </p>
                <div class="file-types">
                  <span class="file-type">PDF</span>
                  <span class="file-type">JPG</span>
                  <span class="file-type">PNG</span>
                </div>
                <p class="size-limit">
                  Maximum file size: 10MB
                </p>
              </div>

              <div
                v-else
                class="file-selected"
              >
                <div class="file-preview-icon">
                  <v-icon
                    :icon="getFileIcon(selectedFile)"
                    size="32"
                    color="primary"
                  />
                </div>
                <div class="file-details">
                  <span class="file-name">{{ selectedFile.name }}</span>
                  <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
                </div>
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  color="error"
                  @click.stop="removeFile"
                >
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </div>
            </div>

            <div
              v-if="fileError"
              class="error-message"
            >
              <v-icon
                size="16"
                color="error"
                class="mr-2"
              >
                mdi-alert-circle
              </v-icon>
              {{ fileError }}
            </div>

            <div class="step-actions">
              <v-btn
                variant="text"
                @click="goBack"
              >
                Cancel
              </v-btn>
              <v-btn
                color="primary"
                :disabled="!selectedFile"
                @click="processFile"
              >
                Process Invoice
                <v-icon end>
                  mdi-arrow-right
                </v-icon>
              </v-btn>
            </div>
          </div>

          <div
            v-else-if="currentStep === 1"
            key="processing"
            class="step-content processing-step"
          >
            <div class="processing-animation">
              <div class="processing-spinner">
                <svg
                  class="spinner-ring"
                  viewBox="0 0 100 100"
                >
                  <circle
                    class="spinner-track"
                    cx="50"
                    cy="50"
                    r="42"
                  />
                  <circle
                    class="spinner-progress"
                    cx="50"
                    cy="50"
                    r="42"
                  />
                </svg>
                <div class="spinner-icon">
                  <v-icon
                    size="32"
                    color="primary"
                  >
                    mdi-file-search-outline
                  </v-icon>
                </div>
              </div>
            </div>
            <h3 class="processing-title">
              Processing your invoice
            </h3>
            <p class="processing-status">
              {{ processingStatus }}
            </p>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: progressPercent + '%' }"
              />
            </div>
          </div>

          <div
            v-else-if="currentStep === 2"
            key="review"
            class="step-content review-step"
          >
            <div class="review-header">
              <div class="review-icon">
                <v-icon
                  size="24"
                  color="success"
                >
                  mdi-check-circle
                </v-icon>
              </div>
              <div>
                <h3 class="review-title">
                  Review Extracted Data
                </h3>
                <p class="review-subtitle">
                  Please verify and correct the information below
                </p>
              </div>
            </div>

            <div class="review-grid">
              <div class="form-field">
                <label class="field-label">
                  Supplier / Issuer
                  <span class="required">*</span>
                </label>
                <input
                  v-model="invoiceData.issuer"
                  type="text"
                  class="field-input"
                  placeholder="Company name"
                >
              </div>

              <div class="form-field">
                <label class="field-label">
                  Amount
                  <span class="required">*</span>
                </label>
                <div class="input-with-prefix">
                  <span class="input-prefix">€</span>
                  <input
                    v-model.number="invoiceData.amount"
                    type="number"
                    step="0.01"
                    class="field-input has-prefix"
                    placeholder="0.00"
                  >
                </div>
              </div>

              <div class="form-field">
                <label class="field-label">Project</label>
                <select
                  v-model="invoiceData.project"
                  class="field-select"
                >
                  <option :value="null">
                    Select a project
                  </option>
                  <option 
                    v-for="proj in projects" 
                    :key="proj.id" 
                    :value="proj.id"
                  >
                    {{ proj.name }}
                  </option>
                </select>
              </div>

              <div class="form-field">
                <label class="field-label">VAT (BTW)</label>
                <div class="vat-row">
                  <label class="toggle-label">
                    <input
                      v-model="invoiceData.includesBtw"
                      type="checkbox"
                      class="toggle-input"
                    >
                    <span class="toggle-switch" />
                    <span>Includes VAT</span>
                  </label>
                  <div
                    v-if="invoiceData.includesBtw"
                    class="vat-percent"
                  >
                    <input
                      v-model.number="invoiceData.btwPercent"
                      type="number"
                      class="field-input small"
                      placeholder="21"
                    >
                    <span class="percent-sign">%</span>
                  </div>
                </div>
              </div>

              <div class="form-field">
                <label class="field-label">Margin</label>
                <div class="input-with-prefix">
                  <span class="input-prefix">€</span>
                  <input
                    v-model.number="invoiceData.margin"
                    type="number"
                    step="0.01"
                    class="field-input has-prefix"
                    placeholder="0.00"
                  >
                </div>
              </div>

              <div class="form-field file-info-field">
                <label class="field-label">Attached File</label>
                <div class="attached-file">
                  <v-icon
                    :icon="getFileIcon(selectedFile)"
                    size="20"
                    color="primary"
                  />
                  <span>{{ selectedFile?.name }}</span>
                </div>
              </div>
            </div>

            <div
              v-if="extractionWarning"
              class="extraction-warning"
            >
              <v-icon
                size="18"
                color="warning"
                class="mr-2"
              >
                mdi-alert
              </v-icon>
              {{ extractionWarning }}
            </div>

            <div class="step-actions">
              <v-btn
                variant="text"
                @click="goToStep(0)"
              >
                <v-icon start>
                  mdi-arrow-left
                </v-icon>
                Back
              </v-btn>
              <v-btn
                color="primary"
                :disabled="!canConfirm"
                @click="goToStep(3)"
              >
                Confirm & Save
                <v-icon end>
                  mdi-check
                </v-icon>
              </v-btn>
            </div>
          </div>

          <div
            v-else-if="currentStep === 3"
            key="confirm"
            class="step-content confirm-step"
          >
            <div class="confirm-card">
              <h3 class="confirm-title">
                Confirm Invoice Details
              </h3>
              <p class="confirm-subtitle">
                Review the final invoice before saving
              </p>

              <div class="confirm-details">
                <div class="detail-row">
                  <span class="detail-label">Supplier</span>
                  <span class="detail-value">{{ invoiceData.issuer || 'Not specified' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Amount</span>
                  <span class="detail-value highlight">€{{ formatAmount(invoiceData.amount) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Project</span>
                  <span class="detail-value">{{ getProjectName(invoiceData.project) || 'Unassigned' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">VAT Included</span>
                  <span class="detail-value">
                    {{ invoiceData.includesBtw ? `Yes (${invoiceData.btwPercent}%)` : 'No' }}
                  </span>
                </div>
                <div
                  v-if="invoiceData.margin"
                  class="detail-row"
                >
                  <span class="detail-label">Margin</span>
                  <span class="detail-value">€{{ formatAmount(invoiceData.margin) }}</span>
                </div>
              </div>

              <div class="confirm-actions">
                <v-btn
                  variant="text"
                  @click="goToStep(2)"
                >
                  <v-icon start>
                    mdi-arrow-left
                  </v-icon>
                  Edit Details
                </v-btn>
                <v-btn
                  color="primary"
                  :loading="saving"
                  @click="saveInvoice"
                >
                  <v-icon start>
                    mdi-content-save
                  </v-icon>
                  Save Invoice
                </v-btn>
              </div>
            </div>
          </div>

          <div
            v-else-if="currentStep === 4"
            key="success"
            class="step-content success-step"
          >
            <div class="success-animation">
              <div class="success-circle">
                <svg
                  class="checkmark"
                  viewBox="0 0 52 52"
                >
                  <circle
                    class="checkmark-circle"
                    cx="26"
                    cy="26"
                    r="25"
                    fill="none"
                  />
                  <path
                    class="checkmark-check"
                    fill="none"
                    d="M14.1 27.2l7.1 7.2 16.7-16.8"
                  />
                </svg>
              </div>
            </div>
            <h3 class="success-title">
              Invoice Saved Successfully!
            </h3>
            <p class="success-subtitle">
              Your invoice has been added to the system
            </p>
            <div class="success-actions">
              <v-btn
                variant="outlined"
                @click="uploadAnother"
              >
                <v-icon start>
                  mdi-plus
                </v-icon>
                Upload Another
              </v-btn>
              <v-btn
                color="primary"
                @click="goToInvoices"
              >
                View Invoices
                <v-icon end>
                  mdi-arrow-right
                </v-icon>
              </v-btn>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { invoices } from '@/stores/invoiceState'

const router = useRouter()
const invoiceStore = invoices()

const steps = [
  { id: 'upload', label: 'Upload' },
  { id: 'processing', label: 'Processing' },
  { id: 'review', label: 'Review' },
  { id: 'confirm', label: 'Confirm' }
]

const currentStep = ref(0)
const selectedFile = ref(null)
const fileInput = ref(null)
const isDragging = ref(false)
const fileError = ref('')
const processingStatus = ref('Uploading file...')
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

const projects = computed(() => {
  const set = []
  for (const inv of invoiceStore.dbResponse) {
    if (inv.project_name && !set.some(p => p.name === inv.project_name)) {
      set.push({ name: inv.project_name, id: inv.project_id })
    }
  }
  return set
})

const canConfirm = computed(() => {
  return invoiceData.value.issuer && 
         invoiceData.value.amount && 
         invoiceData.value.amount > 0 &&
         invoiceData.value.project !== null
})

const openFilePicker = () => {
  fileInput.value?.click()
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
    fileError.value = 'Invalid file type. Please upload PDF, JPG, or PNG files.'
    return
  }
  
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    fileError.value = 'File too large. Maximum size is 10MB.'
    return
  }
  
  selectedFile.value = file
}

const removeFile = () => {
  selectedFile.value = null
  fileError.value = ''
  if (fileInput.value) fileInput.value.value = ''
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
  const sizes = ['B', 'KB', 'MB', 'GB']
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

const processFile = async () => {
  if (!selectedFile.value) return
  
  currentStep.value = 1
  progressPercent.value = 0
  processingStatus.value = 'Uploading file...'
  extractionWarning.value = ''

  const simulateProgress = () => {
    const interval = setInterval(() => {
      if (progressPercent.value < 90) {
        progressPercent.value += Math.random() * 15
      }
    }, 300)
    return () => clearInterval(interval)
  }
  
  const stopProgress = simulateProgress()

  try {
    progressPercent.value = 20
    processingStatus.value = 'Extracting text from document...'
    
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    
    const baseUrl = import.meta.env.VITE_BASE_URL
    
    progressPercent.value = 40
    processingStatus.value = 'Analyzing invoice data with AI...'
    
    let extracted = null
    
    if (baseUrl) {
      try {
        const response = await fetch(`${baseUrl}/invoice/extract`, {
          method: 'POST',
          body: formData
        })
        
        if (response.ok) {
          const data = await response.json()
          extracted = data
          progressPercent.value = 80
          processingStatus.value = 'Data extracted successfully!'
        }
      } catch (err) {
        console.warn('OCR extraction failed, manual entry required:', err)
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
      pdf_file: selectedFile.value.name
    }
    
    if (!extracted || !extracted.issuer) {
      extractionWarning.value = 'Some fields could not be extracted automatically. Please fill them in manually.'
    }
    
    stopProgress()
    
    setTimeout(() => {
      currentStep.value = 2
    }, 500)
    
  } catch (err) {
    console.error('Processing error:', err)
    stopProgress()
    extractionWarning.value = 'Processing failed. Please enter details manually.'
    currentStep.value = 2
  }
}

const goToStep = (step) => {
  currentStep.value = step
}

const goBack = () => {
  router.back()
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
    
    currentStep.value = 4
    
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { 
        title: 'Invoice Saved', 
        message: 'Invoice has been added successfully', 
        type: 'success' 
      }
    }))
    
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

const uploadAnother = () => {
  selectedFile.value = null
  invoiceData.value = {
    issuer: '',
    amount: null,
    project: null,
    includesBtw: false,
    btwPercent: 21,
    margin: null,
    pdf_file: null
  }
  extractionWarning.value = ''
  currentStep.value = 0
}

const goToInvoices = () => {
  router.push('/')
}

onMounted(() => {
  invoiceStore.getAmounts()
})
</script>

<style scoped>
.upload-page {
  min-height: 100vh;
  padding: 40px 24px;
  background: rgb(var(--v-theme-grey-50));
}

.upload-container {
  max-width: 640px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 8px;
}

.page-subtitle {
  font-size: 0.9375rem;
  color: rgb(var(--v-theme-grey-600));
  margin: 0;
}

.steps-indicator {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 32px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 24px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-grey-200));
  transition: all 0.2s ease;
}

.step-item.step-active {
  background: rgba(var(--v-theme-primary), 0.1);
  border-color: rgb(var(--v-theme-primary));
}

.step-item.step-completed {
  background: rgba(var(--v-theme-success), 0.1);
  border-color: rgb(var(--v-theme-success));
}

.step-circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgb(var(--v-theme-grey-200));
  color: rgb(var(--v-theme-grey-600));
}

.step-active .step-circle {
  background: rgb(var(--v-theme-primary));
  color: white;
}

.step-completed .step-circle {
  background: rgb(var(--v-theme-success));
  color: white;
}

.step-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgb(var(--v-theme-grey-600));
}

.step-active .step-label {
  color: rgb(var(--v-theme-primary));
}

.step-completed .step-label {
  color: rgb(var(--v-theme-success));
}

.upload-card {
  background: rgb(var(--v-theme-surface));
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.step-content {
  min-height: 320px;
  display: flex;
  flex-direction: column;
}

.dropzone {
  border: 2px dashed rgb(var(--v-theme-grey-300));
  border-radius: 16px;
  padding: 48px 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgb(var(--v-theme-grey-50));
  flex: 1;
}

.dropzone:hover,
.dropzone-active {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.04);
}

.dropzone-has-file {
  padding: 24px;
  background: rgb(var(--v-theme-surface));
  border-style: solid;
  border-color: rgb(var(--v-theme-primary));
}

.dropzone-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: rgba(var(--v-theme-primary), 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dropzone-title {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 4px;
}

.dropzone-hint {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-grey-500));
  margin: 0 0 16px;
}

.file-types {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

.file-type {
  padding: 4px 12px;
  background: rgb(var(--v-theme-grey-100));
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgb(var(--v-theme-grey-600));
}

.size-limit {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-grey-400));
  margin: 0;
}

.file-selected {
  display: flex;
  align-items: center;
  gap: 16px;
  text-align: left;
}

.file-preview-icon {
  width: 56px;
  height: 56px;
  background: rgba(var(--v-theme-primary), 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.file-size {
  font-size: 0.8125rem;
  color: rgb(var(--v-theme-grey-500));
}

.error-message {
  display: flex;
  align-items: center;
  margin-top: 16px;
  padding: 12px 16px;
  background: rgba(var(--v-theme-error), 0.1);
  border-radius: 8px;
  font-size: 0.875rem;
  color: rgb(var(--v-theme-error));
}

.step-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgb(var(--v-theme-grey-100));
}

.processing-step {
  align-items: center;
  justify-content: center;
  text-align: center;
}

.processing-animation {
  margin-bottom: 24px;
}

.processing-spinner {
  width: 120px;
  height: 120px;
  position: relative;
  margin: 0 auto;
}

.spinner-ring {
  width: 100%;
  height: 100%;
  animation: rotate 2s linear infinite;
}

.spinner-track {
  fill: none;
  stroke: rgb(var(--v-theme-grey-200));
  stroke-width: 6;
}

.spinner-progress {
  fill: none;
  stroke: rgb(var(--v-theme-primary));
  stroke-width: 6;
  stroke-linecap: round;
  stroke-dasharray: 264;
  stroke-dashoffset: 66;
  animation: dash 1.5s ease-in-out infinite;
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

@keyframes dash {
  0% { stroke-dashoffset: 264; }
  50% { stroke-dashoffset: 66; }
  100% { stroke-dashoffset: 264; }
}

.processing-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 8px;
}

.processing-status {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-grey-600));
  margin: 0 0 24px;
}

.progress-bar {
  width: 200px;
  height: 4px;
  background: rgb(var(--v-theme-grey-200));
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: rgb(var(--v-theme-primary));
  border-radius: 2px;
  transition: width 0.3s ease;
}

.review-step {
  gap: 24px;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.review-icon {
  width: 48px;
  height: 48px;
  background: rgba(var(--v-theme-success), 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.review-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 4px;
}

.review-subtitle {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-grey-600));
  margin: 0;
}

.review-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.file-info-field {
  grid-column: 1 / -1;
}

.field-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgb(var(--v-theme-grey-700));
}

.required {
  color: rgb(var(--v-theme-error));
}

.field-input,
.field-select {
  padding: 10px 14px;
  font-size: 0.9375rem;
  border: 1px solid rgb(var(--v-theme-grey-300));
  border-radius: 8px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  transition: border-color 0.2s;
  outline: none;
}

.field-input:focus,
.field-select:focus {
  border-color: rgb(var(--v-theme-primary));
}

.field-input.small {
  width: 80px;
  padding: 8px 12px;
}

.input-with-prefix {
  position: relative;
  display: flex;
  align-items: center;
}

.input-prefix {
  position: absolute;
  left: 14px;
  font-size: 0.9375rem;
  color: rgb(var(--v-theme-grey-500));
}

.field-input.has-prefix {
  padding-left: 32px;
}

.vat-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface));
}

.toggle-input {
  position: absolute;
  opacity: 0;
}

.toggle-switch {
  width: 40px;
  height: 22px;
  background: rgb(var(--v-theme-grey-300));
  border-radius: 11px;
  position: relative;
  transition: background 0.2s;
}

.toggle-switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s;
}

.toggle-input:checked + .toggle-switch {
  background: rgb(var(--v-theme-primary));
}

.toggle-input:checked + .toggle-switch::after {
  transform: translateX(18px);
}

.vat-percent {
  display: flex;
  align-items: center;
  gap: 4px;
}

.percent-sign {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-grey-600));
}

.attached-file {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgb(var(--v-theme-grey-50));
  border-radius: 8px;
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface));
}

.extraction-warning {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: rgba(var(--v-theme-warning), 0.1);
  border-radius: 8px;
  font-size: 0.875rem;
  color: rgb(var(--v-theme-warning));
}

.confirm-step {
  justify-content: center;
}

.confirm-card {
  text-align: center;
}

.confirm-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 8px;
}

.confirm-subtitle {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-grey-600));
  margin: 0 0 32px;
}

.confirm-details {
  background: rgb(var(--v-theme-grey-50));
  border-radius: 12px;
  padding: 20px 24px;
  text-align: left;
  margin-bottom: 24px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid rgb(var(--v-theme-grey-200));
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-grey-600));
}

.detail-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
}

.detail-value.highlight {
  font-size: 1rem;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
}

.confirm-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.success-step {
  align-items: center;
  justify-content: center;
  text-align: center;
}

.success-animation {
  margin-bottom: 24px;
}

.success-circle {
  width: 80px;
  height: 80px;
  margin: 0 auto;
}

.checkmark {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.checkmark-circle {
  stroke: rgb(var(--v-theme-success));
  stroke-width: 2;
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  animation: stroke-circle 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark-check {
  stroke: rgb(var(--v-theme-success));
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: stroke-check 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.6s forwards;
}

@keyframes stroke-circle {
  100% { stroke-dashoffset: 0; }
}

@keyframes stroke-check {
  100% { stroke-dashoffset: 0; }
}

.success-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 8px;
}

.success-subtitle {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-grey-600));
  margin: 0 0 32px;
}

.success-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

@media (max-width: 600px) {
  .upload-page {
    padding: 24px 16px;
  }

  .steps-indicator {
    flex-wrap: wrap;
  }

  .step-label {
    display: none;
  }

  .upload-card {
    padding: 24px 20px;
  }

  .review-grid {
    grid-template-columns: 1fr;
  }

  .confirm-actions,
  .success-actions {
    flex-direction: column;
  }
}
</style>
