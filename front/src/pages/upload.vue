<template>
  <div class="upload-page">
    <div class="upload-container">
      <div class="page-header">
        <h1 class="page-title">AI Document Upload</h1>
        <p class="page-subtitle">Intelligent invoice processing with automatic data extraction</p>
      </div>

      <transition name="fade-slide" mode="out-in">
        <div v-if="stage === 'setup'" key="setup" class="stage-content">
          <div class="setup-panel">
            <div class="setup-section project-section">
              <div class="section-header">
                <div class="section-icon">
                  <v-icon size="20" color="primary">mdi-folder-outline</v-icon>
                </div>
                <div class="section-info">
                  <h3 class="section-title">Target Project</h3>
                  <p class="section-hint">All documents will be assigned to this project</p>
                </div>
              </div>
              <select 
                v-model="selectedProject" 
                class="project-select"
                :class="{ 'has-error': projectError }"
                :disabled="isProjectLocked"
              >
                <option :value="null" disabled>Select a project</option>
                <option 
                  v-for="proj in projects" 
                  :key="proj.id" 
                  :value="proj.id"
                >
                  {{ proj.name }}
                </option>
              </select>
              <p v-if="isProjectLocked" class="field-locked-hint">
                <v-icon size="14" color="grey">mdi-lock</v-icon>
                Project is locked during processing
              </p>
              <p v-if="projectError" class="field-error">
                <v-icon size="14" color="error">mdi-alert-circle</v-icon>
                Please select a project before uploading
              </p>
            </div>

            <div class="setup-section upload-section">
              <div class="section-header">
                <div class="section-icon">
                  <v-icon size="20" color="primary">mdi-file-document-multiple-outline</v-icon>
                </div>
                <div class="section-info">
                  <h3 class="section-title">Select Documents</h3>
                  <p class="section-hint">Upload one or more invoices for AI processing</p>
                </div>
              </div>

              <div 
                class="dropzone"
                :class="{ 
                  'dropzone-active': isDragging,
                  'dropzone-has-files': documentQueue.length > 0
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
                  multiple
                  hidden
                  @change="handleFileSelect"
                />

                <div v-if="documentQueue.length === 0" class="dropzone-empty">
                  <div class="dropzone-icon-wrapper">
                    <div class="dropzone-icon-bg"></div>
                    <v-icon size="32" color="primary">mdi-cloud-upload-outline</v-icon>
                  </div>
                  <h3 class="dropzone-title">Drop invoices here</h3>
                  <p class="dropzone-hint">or click to browse files</p>
                  <div class="file-types">
                    <span class="file-type">PDF</span>
                    <span class="file-type">JPG</span>
                    <span class="file-type">PNG</span>
                  </div>
                </div>

                <div v-else class="document-queue" @click.stop>
                  <div class="queue-header">
                    <span class="queue-count">{{ documentQueue.length }} document{{ documentQueue.length > 1 ? 's' : '' }} ready</span>
                    <button class="btn-text-small" @click.stop="clearQueue">Clear All</button>
                  </div>
                  <div class="queue-list">
                    <div 
                      v-for="(doc, idx) in documentQueue" 
                      :key="idx" 
                      class="queue-item"
                    >
                      <div class="queue-item-icon">
                        <v-icon :icon="getFileIcon(doc.file)" size="18" color="primary" />
                      </div>
                      <div class="queue-item-info">
                        <span class="queue-item-name">{{ doc.file.name }}</span>
                        <span class="queue-item-size">{{ formatFileSize(doc.file.size) }}</span>
                      </div>
                      <button class="btn-icon-small" @click.stop="removeFromQueue(idx)">
                        <v-icon size="16">mdi-close</v-icon>
                      </button>
                    </div>
                  </div>
                  <button class="btn-add-more" @click.stop="openFilePicker">
                    <v-icon size="16">mdi-plus</v-icon>
                    Add more files
                  </button>
                </div>
              </div>

              <p v-if="fileError" class="field-error">
                <v-icon size="14" color="error">mdi-alert-circle</v-icon>
                {{ fileError }}
              </p>
            </div>

            <div class="setup-actions">
              <v-btn variant="text" @click="goBack" class="btn-cancel">Cancel</v-btn>
              <v-btn 
                color="primary" 
                size="large"
                :disabled="documentQueue.length === 0"
                @click="startProcessing"
                class="btn-process"
              >
                <v-icon start size="18">mdi-brain</v-icon>
                Process {{ documentQueue.length }} Document{{ documentQueue.length > 1 ? 's' : '' }}
              </v-btn>
            </div>
          </div>
        </div>

        <div v-else-if="stage === 'processing'" key="processing" class="stage-content">
          <div class="processing-panel">
            <div class="processing-header">
              <div class="processing-info">
                <h2 class="processing-title">Processing Documents</h2>
                <p class="processing-subtitle">{{ selectedProjectName }}</p>
              </div>
              <div class="overall-progress">
                <span class="progress-text">{{ processedCount }}/{{ documentQueue.length }}</span>
                <div class="progress-ring">
                  <svg viewBox="0 0 36 36">
                    <circle class="progress-ring-bg" cx="18" cy="18" r="16" />
                    <circle 
                      class="progress-ring-fill" 
                      cx="18" cy="18" r="16"
                      :style="{ strokeDasharray: `${overallProgress} 100` }"
                    />
                  </svg>
                  <span class="progress-percent">{{ Math.round(overallProgress) }}%</span>
                </div>
              </div>
            </div>

            <div class="document-status-list">
              <div 
                v-for="(doc, idx) in documentQueue" 
                :key="idx"
                class="document-status-item"
                :class="getDocumentStatusClass(doc)"
              >
                <div class="status-indicator">
                  <div v-if="doc.status === 'pending'" class="status-pending">
                    <v-icon size="18" color="grey">mdi-clock-outline</v-icon>
                  </div>
                  <div v-else-if="doc.status === 'processing'" class="status-processing">
                    <div class="mini-spinner"></div>
                  </div>
                  <div v-else-if="doc.status === 'complete'" class="status-complete">
                    <v-icon size="18" color="success">mdi-check-circle</v-icon>
                  </div>
                  <div v-else-if="doc.status === 'attention'" class="status-attention">
                    <v-icon size="18" color="warning">mdi-alert-circle</v-icon>
                  </div>
                  <div v-else-if="doc.status === 'error'" class="status-error">
                    <v-icon size="18" color="error">mdi-close-circle</v-icon>
                  </div>
                </div>
                <div class="status-content">
                  <span class="status-filename">{{ doc.file.name }}</span>
                  <span class="status-message">{{ getStatusMessage(doc) }}</span>
                </div>
                <div v-if="doc.extractedData" class="status-preview">
                  <span v-if="doc.extractedData.amount" class="preview-amount">
                    €{{ formatAmount(doc.extractedData.amount) }}
                  </span>
                </div>
              </div>
            </div>

            <div v-if="currentlyProcessing" class="current-processing">
              <div class="current-file-info">
                <span class="current-label">Currently analyzing:</span>
                <span class="current-filename">{{ currentlyProcessing.file.name }}</span>
              </div>
              <div class="current-progress-bar">
                <div class="current-progress-fill" :style="{ width: currentProgress + '%' }"></div>
              </div>
              <span class="current-status">{{ currentStatus }}</span>
            </div>
          </div>
        </div>

        <div v-else-if="stage === 'decision'" key="decision" class="stage-content">
          <div class="decision-panel">
            <div class="decision-header">
              <div class="decision-icon success">
                <v-icon size="32" color="success">mdi-check-circle-outline</v-icon>
              </div>
              <h2 class="decision-title">Processing Complete</h2>
              <p class="decision-subtitle">{{ successCount }} document{{ successCount > 1 ? 's' : '' }} extracted successfully</p>
            </div>

            <div class="decision-summary">
              <div class="summary-card">
                <div class="summary-stat">
                  <span class="stat-value success">{{ successCount }}</span>
                  <span class="stat-label">Ready to Save</span>
                </div>
                <div v-if="attentionCount > 0" class="summary-stat">
                  <span class="stat-value warning">{{ attentionCount }}</span>
                  <span class="stat-label">Needs Review</span>
                </div>
                <div v-if="errorCount > 0" class="summary-stat">
                  <span class="stat-value error">{{ errorCount }}</span>
                  <span class="stat-label">Failed</span>
                </div>
              </div>
            </div>

            <div class="decision-options">
              <div class="option-card" @click="goToReview">
                <div class="option-icon">
                  <v-icon size="28" color="primary">mdi-file-document-edit-outline</v-icon>
                </div>
                <div class="option-content">
                  <h3 class="option-title">Review Details</h3>
                  <p class="option-description">Review and edit extracted data for each document before saving</p>
                </div>
                <v-icon size="20" color="grey">mdi-chevron-right</v-icon>
              </div>

              <div class="option-card" :class="{ disabled: successCount === 0 }" @click="saveAllImmediately">
                <div class="option-icon">
                  <v-icon size="28" color="success">mdi-content-save-all</v-icon>
                </div>
                <div class="option-content">
                  <h3 class="option-title">Save All Now</h3>
                  <p class="option-description">Save all confident extractions immediately, flag uncertain items for later</p>
                </div>
                <v-icon size="20" color="grey">mdi-chevron-right</v-icon>
              </div>
            </div>

            <div class="decision-actions">
              <v-btn variant="text" @click="startOver">
                <v-icon start>mdi-refresh</v-icon>
                Start Over
              </v-btn>
            </div>
          </div>
        </div>

        <div v-else-if="stage === 'review'" key="review" class="stage-content">
          <div class="review-panel">
            <div class="review-header">
              <div class="review-nav">
                <v-btn 
                  variant="text" 
                  size="small" 
                  :disabled="currentReviewIndex === 0"
                  @click="prevReview"
                >
                  <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <span class="review-counter">{{ currentReviewIndex + 1 }} of {{ reviewableDocuments.length }}</span>
                <v-btn 
                  variant="text" 
                  size="small" 
                  :disabled="currentReviewIndex >= reviewableDocuments.length - 1"
                  @click="nextReview"
                >
                  <v-icon>mdi-chevron-right</v-icon>
                </v-btn>
              </div>
              <div class="review-title-area">
                <h2 class="review-title">Review Document</h2>
                <span class="review-filename">{{ currentReviewDoc?.file.name }}</span>
              </div>
            </div>

            <div v-if="currentReviewDoc" class="review-form">
              <div class="review-grid">
                <div class="form-field">
                  <label class="field-label">
                    Supplier / Issuer
                    <span class="required">*</span>
                    <span v-if="currentReviewDoc.confidence?.issuer === 'low'" class="confidence-badge low">Low confidence</span>
                  </label>
                  <input
                    v-model="currentReviewDoc.extractedData.issuer"
                    type="text"
                    class="field-input"
                    :class="{ 'low-confidence': currentReviewDoc.confidence?.issuer === 'low' }"
                    placeholder="Company name"
                  />
                </div>

                <div class="form-field">
                  <label class="field-label">
                    Amount
                    <span class="required">*</span>
                    <span v-if="currentReviewDoc.confidence?.amount === 'low'" class="confidence-badge low">Low confidence</span>
                  </label>
                  <div class="input-with-prefix">
                    <span class="input-prefix">€</span>
                    <input
                      v-model.number="currentReviewDoc.extractedData.amount"
                      type="number"
                      step="0.01"
                      class="field-input has-prefix"
                      :class="{ 'low-confidence': currentReviewDoc.confidence?.amount === 'low' }"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div class="form-field">
                  <label class="field-label">
                    Invoice Number
                    <span v-if="currentReviewDoc.confidence?.invoiceNumber === 'low'" class="confidence-badge low">Low confidence</span>
                  </label>
                  <input
                    v-model="currentReviewDoc.extractedData.invoiceNumber"
                    type="text"
                    class="field-input"
                    :class="{ 'low-confidence': currentReviewDoc.confidence?.invoiceNumber === 'low' }"
                    placeholder="INV-0001"
                  />
                </div>

                <div class="form-field">
                  <label class="field-label">
                    Invoice Date
                    <span v-if="currentReviewDoc.confidence?.date === 'low'" class="confidence-badge low">Low confidence</span>
                  </label>
                  <input
                    v-model="currentReviewDoc.extractedData.date"
                    type="date"
                    class="field-input"
                    :class="{ 'low-confidence': currentReviewDoc.confidence?.date === 'low' }"
                  />
                </div>

                <div class="form-field">
                  <label class="field-label">VAT (BTW)</label>
                  <div class="vat-row">
                    <label class="toggle-label">
                      <input
                        type="checkbox"
                        v-model="currentReviewDoc.extractedData.includesBtw"
                        class="toggle-input"
                      />
                      <span class="toggle-switch"></span>
                      <span>Includes VAT</span>
                    </label>
                    <div v-if="currentReviewDoc.extractedData.includesBtw" class="vat-percent">
                      <input
                        v-model.number="currentReviewDoc.extractedData.btwPercent"
                        type="number"
                        class="field-input small"
                        placeholder="21"
                      />
                      <span class="percent-sign">%</span>
                    </div>
                  </div>
                </div>

                <div class="form-field">
                  <label class="field-label">Margin Override</label>
                  <div class="input-with-suffix">
                    <input
                      v-model.number="currentReviewDoc.extractedData.margin"
                      type="number"
                      step="0.1"
                      class="field-input has-suffix"
                      :placeholder="projectMargin ? `${projectMargin}% (from project)` : '0'"
                    />
                    <span class="input-suffix">%</span>
                  </div>
                </div>
              </div>

              <div v-if="currentReviewDoc.status === 'attention'" class="review-warning">
                <v-icon size="18" color="warning">mdi-alert</v-icon>
                <span>Some fields could not be extracted with high confidence. Please verify the data.</span>
              </div>

              <div v-if="currentReviewDoc.validationErrors?.length > 0" class="validation-errors">
                <div class="validation-error" v-for="(error, idx) in currentReviewDoc.validationErrors" :key="idx">
                  <v-icon size="16" color="error">mdi-close-circle</v-icon>
                  <span>{{ error }}</span>
                </div>
              </div>

              <div v-if="currentReviewDoc.error && !currentReviewDoc.validationErrors?.length" class="review-error">
                <v-icon size="18" color="error">mdi-alert-circle</v-icon>
                <span>{{ currentReviewDoc.error }}</span>
              </div>
            </div>

            <div class="review-actions">
              <div class="review-actions-left">
                <v-btn variant="text" @click="goToDecision">
                  <v-icon start>mdi-arrow-left</v-icon>
                  Back to Summary
                </v-btn>
              </div>
              <div class="review-actions-right">
                <v-btn 
                  v-if="currentReviewIndex < reviewableDocuments.length - 1"
                  variant="outlined"
                  @click="saveAndNext"
                  :loading="savingCurrent"
                >
                  Save & Next
                  <v-icon end>mdi-arrow-right</v-icon>
                </v-btn>
                <v-btn 
                  color="primary"
                  @click="saveCurrentAndFinish"
                  :loading="savingCurrent"
                >
                  <v-icon start>mdi-content-save</v-icon>
                  {{ currentReviewIndex < reviewableDocuments.length - 1 ? 'Save This' : 'Save & Finish' }}
                </v-btn>
              </div>
            </div>

            <div class="review-progress">
              <div 
                v-for="(doc, idx) in reviewableDocuments" 
                :key="idx"
                class="review-dot"
                :class="{ 
                  active: idx === currentReviewIndex,
                  saved: doc.saved,
                  attention: doc.status === 'attention' && !doc.saved
                }"
                @click="goToReviewIndex(idx)"
              ></div>
            </div>
          </div>
        </div>

        <div v-else-if="stage === 'complete'" key="complete" class="stage-content">
          <div class="complete-panel">
            <div class="success-animation">
              <div class="success-circle">
                <svg class="checkmark" viewBox="0 0 52 52">
                  <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                  <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                </svg>
              </div>
            </div>
            <h2 class="complete-title">All Documents Saved!</h2>
            <p class="complete-subtitle">{{ savedCount }} invoice{{ savedCount > 1 ? 's' : '' }} have been added to {{ selectedProjectName }}</p>
            
            <div class="complete-summary">
              <div class="summary-row">
                <span class="summary-label">Total Amount</span>
                <span class="summary-value">€{{ formatAmount(totalSavedAmount) }}</span>
              </div>
            </div>

            <div class="complete-actions">
              <v-btn variant="outlined" size="large" @click="startOver">
                <v-icon start>mdi-plus</v-icon>
                Upload More
              </v-btn>
              <v-btn color="primary" size="large" @click="goToInvoices">
                View Invoices
                <v-icon end>mdi-arrow-right</v-icon>
              </v-btn>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { invoices } from '@/stores/invoiceState'

const router = useRouter()
const invoiceStore = invoices()

const stage = ref('setup')
const selectedProject = ref(null)
const projectError = ref(false)
const fileError = ref('')
const isDragging = ref(false)
const fileInput = ref(null)
const processingStarted = ref(false)

const documentQueue = ref([])
const currentlyProcessing = ref(null)
const currentProgress = ref(0)
const currentStatus = ref('')
const currentReviewIndex = ref(0)
const savingCurrent = ref(false)
const savingAll = ref(false)
const savedCount = ref(0)
const totalSavedAmount = ref(0)

const isProjectLocked = computed(() => {
  return processingStarted.value && stage.value !== 'setup'
})

const projects = computed(() => {
  const set = []
  for (const inv of invoiceStore.dbResponse) {
    if (inv.project_name && !set.some(p => p.name === inv.project_name)) {
      set.push({ name: inv.project_name, id: inv.project_id, margin: inv.margin })
    }
  }
  return set
})

const selectedProjectName = computed(() => {
  const proj = projects.value.find(p => p.id === selectedProject.value)
  return proj?.name || 'Unknown Project'
})

const projectMargin = computed(() => {
  const proj = projects.value.find(p => p.id === selectedProject.value)
  return proj?.margin || 0
})

const processedCount = computed(() => {
  return documentQueue.value.filter(d => d.status !== 'pending' && d.status !== 'processing').length
})

const overallProgress = computed(() => {
  const total = documentQueue.value.length
  if (total === 0) return 0
  return (processedCount.value / total) * 100
})

const successCount = computed(() => {
  return documentQueue.value.filter(d => d.status === 'complete').length
})

const attentionCount = computed(() => {
  return documentQueue.value.filter(d => d.status === 'attention').length
})

const errorCount = computed(() => {
  return documentQueue.value.filter(d => d.status === 'error').length
})

const reviewableDocuments = computed(() => {
  return documentQueue.value.filter(d => d.status === 'complete' || d.status === 'attention')
})

const currentReviewDoc = computed(() => {
  return reviewableDocuments.value[currentReviewIndex.value]
})

watch(selectedProject, () => {
  if (selectedProject.value) {
    projectError.value = false
  }
})

const openFilePicker = () => {
  fileInput.value?.click()
}

const handleFileSelect = (e) => {
  const files = Array.from(e.target.files || [])
  files.forEach(file => addToQueue(file))
  if (fileInput.value) fileInput.value.value = ''
}

const handleDrop = (e) => {
  isDragging.value = false
  const files = Array.from(e.dataTransfer?.files || [])
  files.forEach(file => addToQueue(file))
}

const addToQueue = (file) => {
  fileError.value = ''
  
  const validTypes = ['application/pdf', 'image/jpeg', 'image/png']
  if (!validTypes.includes(file.type)) {
    fileError.value = `Invalid file type: ${file.name}. Please upload PDF, JPG, or PNG.`
    return
  }
  
  const minSize = 1024
  if (file.size < minSize) {
    fileError.value = `File too small: ${file.name}. File appears to be empty or corrupted.`
    return
  }
  
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    fileError.value = `File too large: ${file.name}. Maximum size is 10MB.`
    return
  }
  
  if (documentQueue.value.some(d => d.file.name === file.name && d.file.size === file.size)) {
    fileError.value = `Duplicate file: ${file.name} is already in the queue.`
    return
  }
  
  if (documentQueue.value.length >= 20) {
    fileError.value = 'Maximum 20 files per batch. Please process current batch first.'
    return
  }
  
  documentQueue.value.push({
    file,
    status: 'pending',
    extractedData: null,
    confidence: null,
    saved: false,
    validationErrors: null,
    error: null
  })
}

const removeFromQueue = (index) => {
  documentQueue.value.splice(index, 1)
}

const clearQueue = () => {
  documentQueue.value = []
  fileError.value = ''
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
  return Number(amount).toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const getDocumentStatusClass = (doc) => {
  return `status-${doc.status}`
}

const getStatusMessage = (doc) => {
  switch (doc.status) {
    case 'pending': return 'Waiting...'
    case 'processing': return 'Analyzing...'
    case 'complete': return doc.extractedData?.issuer || 'Extracted'
    case 'attention': return 'Needs review'
    case 'error': return doc.error || 'Failed'
    default: return ''
  }
}

const startProcessing = async () => {
  if (!selectedProject.value) {
    projectError.value = true
    return
  }
  
  if (documentQueue.value.length === 0) return
  
  processingStarted.value = true
  stage.value = 'processing'
  
  const PARALLEL_BATCH_SIZE = 3
  
  for (let i = 0; i < documentQueue.value.length; i += PARALLEL_BATCH_SIZE) {
    const batch = documentQueue.value.slice(i, i + PARALLEL_BATCH_SIZE)
    
    batch.forEach(doc => {
      doc.status = 'processing'
    })
    
    currentlyProcessing.value = batch[0]
    currentProgress.value = 0
    currentStatus.value = `Processing ${batch.length} document${batch.length > 1 ? 's' : ''}...`
    
    await Promise.allSettled(
      batch.map(async (doc) => {
        try {
          await processDocument(doc)
        } catch (err) {
          console.error('Error processing document:', err)
          doc.status = 'error'
          doc.error = err.message
        }
      })
    )
    
    currentProgress.value = 100
  }
  
  currentlyProcessing.value = null
  stage.value = 'decision'
}

const processDocument = async (doc) => {
  const baseUrl = import.meta.env.VITE_BASE_URL
  
  let extracted = null
  let confidence = { 
    issuer: 'high', 
    amount: 'high',
    invoiceNumber: 'high',
    date: 'high'
  }
  
  if (baseUrl) {
    try {
      const formData = new FormData()
      formData.append('file', doc.file)
      
      const response = await fetch(`${baseUrl}/invoice/extract`, {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        extracted = await response.json()
        doc.uploadedFilePath = extracted.pdf_file || doc.file.name
      } else {
        throw new Error(`Server returned ${response.status}`)
      }
    } catch (err) {
      console.warn('Extraction failed for', doc.file.name, err)
      doc.error = err.message || 'Extraction failed'
    }
  }
  
  const hasIssuer = extracted?.issuer && extracted.issuer.trim().length > 2
  const hasAmount = extracted?.amount && extracted.amount > 0
  const hasInvoiceNumber = extracted?.invoiceNumber && extracted.invoiceNumber.trim().length > 0
  const hasDate = extracted?.date && extracted.date.trim().length > 0
  
  if (!hasIssuer) confidence.issuer = 'low'
  if (!hasAmount) confidence.amount = 'low'
  if (!hasInvoiceNumber) confidence.invoiceNumber = 'low'
  if (!hasDate) confidence.date = 'low'
  
  doc.extractedData = {
    issuer: extracted?.issuer?.trim() || '',
    amount: extracted?.amount || 0,
    invoiceNumber: extracted?.invoiceNumber?.trim() || '',
    date: extracted?.date || new Date().toISOString().split('T')[0],
    includesBtw: extracted?.btw || false,
    btwPercent: extracted?.btwPercent || 21,
    margin: projectMargin.value || null,
    project: selectedProject.value,
    pdf_file: doc.uploadedFilePath || extracted?.pdf_file || null
  }
  
  doc.confidence = confidence
  
  const needsAttention = !hasIssuer || !hasAmount
  
  if (extracted?.extractionFailed) {
    doc.status = 'attention'
    doc.error = extracted.message || 'AI could not extract data'
  } else if (needsAttention) {
    doc.status = 'attention'
  } else {
    doc.status = 'complete'
  }
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const goToDecision = () => {
  stage.value = 'decision'
}

const goToReview = () => {
  currentReviewIndex.value = 0
  stage.value = 'review'
}

const validateDocument = (doc) => {
  const errors = []
  const data = doc.extractedData
  
  if (!data.issuer || data.issuer.trim().length < 2) {
    errors.push('Supplier name is required (min 2 characters)')
  }
  
  const amount = parseFloat(data.amount)
  if (isNaN(amount) || amount <= 0) {
    errors.push('Amount must be a positive number')
  }
  if (amount > 1000000) {
    errors.push('Amount seems too large - please verify')
  }
  
  if (data.includesBtw) {
    const btw = parseInt(data.btwPercent)
    if (isNaN(btw) || btw < 0 || btw > 100) {
      errors.push('VAT percentage must be between 0 and 100')
    }
  }
  
  if (data.margin !== null && data.margin !== undefined) {
    const margin = parseFloat(data.margin)
    if (isNaN(margin) || margin < 0 || margin > 100) {
      errors.push('Margin must be between 0 and 100%')
    }
  }
  
  return errors
}

const saveAllImmediately = async () => {
  if (successCount.value === 0) return
  
  savingAll.value = true
  let saved = 0
  let totalAmount = 0
  let skipped = 0
  
  const baseUrl = import.meta.env.VITE_BASE_URL
  
  for (const doc of documentQueue.value) {
    if ((doc.status === 'complete' || doc.status === 'attention') && !doc.saved) {
      const validationErrors = validateDocument(doc)
      
      if (validationErrors.length > 0) {
        doc.validationErrors = validationErrors
        skipped++
        continue
      }
      
      try {
        const marginValue = doc.extractedData.margin
        const payload = {
          issuer: doc.extractedData.issuer.trim(),
          amount: parseFloat(doc.extractedData.amount),
          project: doc.extractedData.project,
          includesBtw: doc.extractedData.includesBtw,
          btwPercent: parseInt(doc.extractedData.btwPercent) || 21,
          margin: marginValue === '' || marginValue === null || marginValue === undefined ? null : parseFloat(marginValue),
          pdf_file: doc.extractedData.pdf_file
        }
        
        const response = await fetch(`${baseUrl}/invoice/post`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        
        if (response.ok) {
          doc.saved = true
          saved++
          totalAmount += payload.amount
        } else {
          const errorData = await response.json().catch(() => ({}))
          doc.error = errorData.message || `Server error: ${response.status}`
        }
      } catch (err) {
        console.error('Failed to save:', doc.file.name, err)
        doc.error = err.message || 'Network error'
      }
    }
  }
  
  await invoiceStore.getAmounts()
  
  savedCount.value = saved
  totalSavedAmount.value = totalAmount
  savingAll.value = false
  
  if (skipped > 0) {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { 
        title: 'Some documents skipped', 
        message: `${skipped} document(s) had validation errors and were not saved.`, 
        type: 'warning' 
      }
    }))
  }
  
  if (saved === 0 && skipped > 0) {
    stage.value = 'review'
    currentReviewIndex.value = 0
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { 
        title: 'No documents saved', 
        message: 'All documents have validation errors. Please review and fix them.', 
        type: 'error' 
      }
    }))
  } else {
    stage.value = 'complete'
  }
}

const prevReview = () => {
  if (currentReviewIndex.value > 0) {
    currentReviewIndex.value--
  }
}

const nextReview = () => {
  if (currentReviewIndex.value < reviewableDocuments.value.length - 1) {
    currentReviewIndex.value++
  }
}

const goToReviewIndex = (idx) => {
  currentReviewIndex.value = idx
}

const saveCurrentDocument = async () => {
  const doc = currentReviewDoc.value
  if (!doc || doc.saved) return { success: true }
  
  const validationErrors = validateDocument(doc)
  if (validationErrors.length > 0) {
    doc.validationErrors = validationErrors
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { 
        title: 'Validation Error', 
        message: validationErrors[0], 
        type: 'error' 
      }
    }))
    return { success: false, errors: validationErrors }
  }
  
  const baseUrl = import.meta.env.VITE_BASE_URL
  
  const marginValue = doc.extractedData.margin
  const payload = {
    issuer: doc.extractedData.issuer.trim(),
    amount: parseFloat(doc.extractedData.amount),
    project: doc.extractedData.project,
    includesBtw: doc.extractedData.includesBtw,
    btwPercent: parseInt(doc.extractedData.btwPercent) || 21,
    margin: marginValue === '' || marginValue === null || marginValue === undefined ? null : parseFloat(marginValue),
    pdf_file: doc.extractedData.pdf_file
  }
  
  try {
    const response = await fetch(`${baseUrl}/invoice/post`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    
    if (response.ok) {
      doc.saved = true
      doc.validationErrors = null
      return { success: true }
    } else {
      const errorData = await response.json().catch(() => ({}))
      doc.error = errorData.message || `Server error: ${response.status}`
      return { success: false, error: doc.error }
    }
  } catch (err) {
    console.error('Failed to save document:', err)
    doc.error = err.message || 'Network error'
    return { success: false, error: doc.error }
  }
}

const saveAndNext = async () => {
  savingCurrent.value = true
  const result = await saveCurrentDocument()
  savingCurrent.value = false
  
  if (result.success) {
    nextReview()
  }
}

const saveCurrentAndFinish = async () => {
  savingCurrent.value = true
  const result = await saveCurrentDocument()
  savingCurrent.value = false
  
  if (!result.success) {
    return
  }
  
  const unsaved = reviewableDocuments.value.filter(d => !d.saved)
  
  if (unsaved.length === 0 || currentReviewIndex.value >= reviewableDocuments.value.length - 1) {
    await invoiceStore.getAmounts()
    savedCount.value = reviewableDocuments.value.filter(d => d.saved).length
    totalSavedAmount.value = reviewableDocuments.value
      .filter(d => d.saved)
      .reduce((sum, d) => sum + (parseFloat(d.extractedData.amount) || 0), 0)
    stage.value = 'complete'
  } else {
    nextReview()
  }
}

const startOver = () => {
  documentQueue.value = []
  currentReviewIndex.value = 0
  savedCount.value = 0
  totalSavedAmount.value = 0
  processingStarted.value = false
  stage.value = 'setup'
}

const goBack = () => {
  router.back()
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
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 2rem;
}

.upload-container {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 0.95rem;
  color: #64748b;
}

.stage-content {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.setup-panel {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  padding: 2rem;
}

.setup-section {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.section-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.section-hint {
  font-size: 0.85rem;
  color: #64748b;
}

.project-select {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  color: #1e293b;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
}

.project-select:hover {
  border-color: #cbd5e1;
}

.project-select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.project-select.has-error {
  border-color: #ef4444;
}

.field-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #ef4444;
  margin-top: 0.5rem;
}

.field-locked-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 0.5rem;
}

.project-select:disabled {
  background: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
}

.dropzone {
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fafbfc;
}

.dropzone:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.dropzone-active {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.05);
}

.dropzone-has-files {
  padding: 1rem;
  cursor: default;
}

.dropzone-icon-wrapper {
  position: relative;
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
}

.dropzone-icon-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.1); opacity: 0.3; }
}

.dropzone-icon-wrapper .v-icon {
  position: relative;
  z-index: 1;
  margin-top: 16px;
}

.dropzone-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.dropzone-hint {
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: 1rem;
}

.file-types {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.file-type {
  padding: 0.25rem 0.75rem;
  background: #f1f5f9;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
}

.document-queue {
  text-align: left;
}

.queue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.queue-count {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
}

.btn-text-small {
  background: none;
  border: none;
  font-size: 0.85rem;
  color: #ef4444;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.btn-text-small:hover {
  background: rgba(239, 68, 68, 0.1);
}

.queue-list {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 0.75rem;
}

.queue-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem;
  background: white;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  border: 1px solid #e2e8f0;
}

.queue-item-icon {
  flex-shrink: 0;
}

.queue-item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.queue-item-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.queue-item-size {
  font-size: 0.75rem;
  color: #94a3b8;
}

.btn-icon-small {
  width: 24px;
  height: 24px;
  border: none;
  background: #f1f5f9;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon-small:hover {
  background: #fee2e2;
  color: #ef4444;
}

.btn-add-more {
  width: 100%;
  padding: 0.5rem;
  background: none;
  border: 1px dashed #cbd5e1;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-add-more:hover {
  border-color: #6366f1;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.05);
}

.setup-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.btn-process {
  padding: 0.875rem 2rem !important;
  font-size: 1rem !important;
  font-weight: 600 !important;
}

.processing-panel {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  padding: 2rem;
}

.processing-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.processing-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.processing-subtitle {
  font-size: 0.9rem;
  color: #64748b;
}

.overall-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: #64748b;
}

.progress-ring {
  position: relative;
  width: 48px;
  height: 48px;
}

.progress-ring svg {
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
}

.progress-ring-bg {
  fill: none;
  stroke: #e2e8f0;
  stroke-width: 3;
}

.progress-ring-fill {
  fill: none;
  stroke: #6366f1;
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dasharray 0.3s ease;
}

.progress-percent {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: #6366f1;
}

.document-status-list {
  margin-bottom: 1.5rem;
}

.document-status-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1rem;
  border-radius: 10px;
  margin-bottom: 0.5rem;
  background: #f8fafc;
  transition: all 0.2s ease;
}

.document-status-item.status-processing {
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.document-status-item.status-complete {
  background: rgba(34, 197, 94, 0.08);
}

.document-status-item.status-attention {
  background: rgba(245, 158, 11, 0.08);
}

.document-status-item.status-error {
  background: rgba(239, 68, 68, 0.08);
}

.status-indicator {
  flex-shrink: 0;
  width: 24px;
  display: flex;
  justify-content: center;
}

.mini-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.status-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.status-filename {
  font-size: 0.9rem;
  font-weight: 500;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-message {
  font-size: 0.8rem;
  color: #64748b;
}

.status-preview {
  flex-shrink: 0;
}

.preview-amount {
  font-size: 0.9rem;
  font-weight: 600;
  color: #22c55e;
}

.current-processing {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 12px;
  padding: 1.25rem;
}

.current-file-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.current-label {
  font-size: 0.85rem;
  color: #64748b;
}

.current-filename {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
}

.current-progress-bar {
  height: 6px;
  background: rgba(99, 102, 241, 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.current-progress-fill {
  height: 100%;
  background: #6366f1;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.current-status {
  font-size: 0.85rem;
  color: #6366f1;
  font-weight: 500;
}

.decision-panel {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  padding: 2.5rem;
  text-align: center;
}

.decision-header {
  margin-bottom: 2rem;
}

.decision-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.decision-icon.success {
  background: rgba(34, 197, 94, 0.1);
}

.decision-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.decision-subtitle {
  font-size: 1rem;
  color: #64748b;
}

.decision-summary {
  margin-bottom: 2rem;
}

.summary-card {
  display: flex;
  justify-content: center;
  gap: 3rem;
  padding: 1.25rem;
  background: #f8fafc;
  border-radius: 12px;
}

.summary-stat {
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  display: block;
}

.stat-value.success { color: #22c55e; }
.stat-value.warning { color: #f59e0b; }
.stat-value.error { color: #ef4444; }

.stat-label {
  font-size: 0.85rem;
  color: #64748b;
}

.decision-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.option-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: #fafbfc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.option-card:hover {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.02);
}

.option-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.option-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.option-content {
  flex: 1;
}

.option-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.option-description {
  font-size: 0.85rem;
  color: #64748b;
}

.review-panel {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  padding: 2rem;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.review-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.review-counter {
  font-size: 0.9rem;
  font-weight: 500;
  color: #64748b;
  min-width: 60px;
  text-align: center;
}

.review-title-area {
  text-align: right;
}

.review-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.125rem;
}

.review-filename {
  font-size: 0.85rem;
  color: #64748b;
}

.review-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
}

.field-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #475569;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.required {
  color: #ef4444;
}

.confidence-badge {
  font-size: 0.7rem;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  font-weight: 600;
}

.confidence-badge.low {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.field-input {
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #1e293b;
  transition: all 0.2s ease;
}

.field-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.field-input.low-confidence {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.05);
}

.field-input.has-prefix {
  padding-left: 2rem;
}

.field-input.has-suffix {
  padding-right: 2.5rem;
}

.field-input.small {
  width: 80px;
  padding: 0.5rem 0.75rem;
}

.input-with-prefix,
.input-with-suffix {
  position: relative;
}

.input-prefix {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-weight: 500;
}

.input-suffix {
  position: absolute;
  right: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-weight: 500;
}

.vat-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #475569;
}

.toggle-input {
  display: none;
}

.toggle-switch {
  width: 40px;
  height: 22px;
  background: #e2e8f0;
  border-radius: 11px;
  position: relative;
  transition: background 0.2s ease;
}

.toggle-switch::after {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: transform 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.toggle-input:checked + .toggle-switch {
  background: #6366f1;
}

.toggle-input:checked + .toggle-switch::after {
  transform: translateX(18px);
}

.vat-percent {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.percent-sign {
  font-size: 0.9rem;
  color: #64748b;
}

.review-warning {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(245, 158, 11, 0.08);
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  color: #92400e;
}

.validation-errors {
  margin-bottom: 1.5rem;
}

.validation-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.08);
  border-radius: 6px;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #dc2626;
}

.review-error {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.08);
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  color: #dc2626;
}

.review-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.review-actions-right {
  display: flex;
  gap: 0.75rem;
}

.review-progress {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.review-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.review-dot:hover {
  background: #cbd5e1;
}

.review-dot.active {
  background: #6366f1;
  transform: scale(1.2);
}

.review-dot.saved {
  background: #22c55e;
}

.review-dot.attention {
  background: #f59e0b;
}

.complete-panel {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  padding: 3rem;
  text-align: center;
}

.success-animation {
  margin-bottom: 1.5rem;
}

.success-circle {
  width: 80px;
  height: 80px;
  margin: 0 auto;
}

.checkmark {
  width: 100%;
  height: 100%;
}

.checkmark-circle {
  stroke: #22c55e;
  stroke-width: 2;
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark-check {
  stroke: #22c55e;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.4s forwards;
}

@keyframes stroke {
  100% { stroke-dashoffset: 0; }
}

.complete-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.complete-subtitle {
  font-size: 1rem;
  color: #64748b;
  margin-bottom: 2rem;
}

.complete-summary {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 2rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  font-size: 0.95rem;
  color: #64748b;
}

.summary-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #22c55e;
}

.complete-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.decision-actions {
  padding-top: 1rem;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

@media (max-width: 640px) {
  .upload-page {
    padding: 1rem;
  }
  
  .setup-panel,
  .processing-panel,
  .decision-panel,
  .review-panel,
  .complete-panel {
    padding: 1.5rem;
  }
  
  .review-grid {
    grid-template-columns: 1fr;
  }
  
  .summary-card {
    flex-direction: column;
    gap: 1rem;
  }
  
  .processing-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>
