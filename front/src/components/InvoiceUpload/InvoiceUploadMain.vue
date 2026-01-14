<template>
  <v-dialog
    v-model="dialog"
    max-width="560"
    persistent
  >
    <v-card class="upload-dialog">
      <div class="dialog-header">
        <div class="header-content">
          <v-btn
            icon
            variant="text"
            size="small"
            @click="closeDialog"
          >
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <h2 class="dialog-title">
            {{ showForm ? 'Create Invoice' : 'Upload Invoice' }}
          </h2>
        </div>
        <div class="mode-switcher">
          <v-btn-toggle v-model="activeMode" mandatory density="compact" rounded="lg">
            <v-btn value="form" size="small">
              <v-icon size="18" class="mr-1">mdi-form-select</v-icon>
              Manual
            </v-btn>
            <v-btn value="upload" size="small">
              <v-icon size="18" class="mr-1">mdi-upload</v-icon>
              Upload
            </v-btn>
          </v-btn-toggle>
        </div>
      </div>

      <v-divider />

      <div class="dialog-body">
        <v-fade-transition mode="out-in">
          <div v-if="showForm" key="form" class="form-section">
            <v-form ref="formRef" v-model="valid" lazy-validation>
              <div class="form-group">
                <label class="form-label">Amount</label>
                <v-text-field
                  v-model="amount"
                  type="number"
                  placeholder="0.00"
                  prefix="€"
                  :rules="[v => !!v || 'Amount is required', v => v > 0 || 'Must be positive']"
                  hide-details="auto"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Supplier</label>
                <v-autocomplete
                  v-model="supplier"
                  :items="suppliers"
                  placeholder="Select or type supplier name"
                  clearable
                  hide-details="auto"
                >
                  <template #no-data>
                    <div class="pa-3">
                      <v-btn
                        block
                        color="primary"
                        variant="tonal"
                        prepend-icon="mdi-plus"
                        @click="supplierDialog = true"
                      >
                        Add "{{ supplier }}" as new supplier
                      </v-btn>
                    </div>
                  </template>
                </v-autocomplete>
              </div>

              <div class="form-group">
                <label class="form-label">Project</label>
                <v-select
                  v-model="project"
                  :items="projects"
                  item-title="name"
                  item-value="id"
                  placeholder="Assign to project"
                  clearable
                  hide-details="auto"
                />
              </div>

              <div class="form-row">
                <div class="form-group flex-grow-1">
                  <v-switch
                    v-model="btwIncluded"
                    label="VAT Included"
                    color="primary"
                    hide-details
                    inset
                  />
                </div>
                <v-slide-x-transition>
                  <div v-if="btwIncluded" class="form-group" style="width: 120px;">
                    <v-text-field
                      v-model="btwPercent"
                      type="number"
                      suffix="%"
                      label="VAT %"
                      hide-details
                      density="compact"
                    />
                  </div>
                </v-slide-x-transition>
              </div>
            </v-form>
          </div>

          <div v-else key="upload" class="upload-section">
            <div
              class="upload-dropzone"
              :class="{ 'dropzone-active': isDragging, 'dropzone-has-file': file }"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
              @click="triggerFileInput"
            >
              <input
                ref="fileInputRef"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                hidden
                @change="handleFileSelect"
              >
              
              <div v-if="!file" class="dropzone-content">
                <div class="dropzone-icon">
                  <v-icon icon="mdi-cloud-upload-outline" size="48" color="primary" />
                </div>
                <p class="dropzone-title">Drop files here or click to upload</p>
                <p class="dropzone-hint">Supports PDF, JPG, PNG up to 10MB</p>
              </div>

              <div v-else class="file-preview">
                <div class="file-icon">
                  <v-icon :icon="getFileIcon(file)" size="32" color="primary" />
                </div>
                <div class="file-info">
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">{{ formatFileSize(file.size) }}</span>
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

            <v-expand-transition>
              <div v-if="extractionStatus" class="extraction-status">
                <v-progress-linear
                  v-if="extractionStatus === 'processing'"
                  indeterminate
                  color="primary"
                  height="4"
                  class="mb-3"
                />
                <div class="status-content" :class="`status-${extractionStatus}`">
                  <v-icon :icon="getStatusIcon()" size="20" class="mr-2" />
                  <span>{{ getStatusMessage() }}</span>
                </div>
              </div>
            </v-expand-transition>

            <div v-if="extractedData" class="extracted-data mt-4">
              <div class="extracted-header">
                <v-icon icon="mdi-check-circle" color="success" size="18" class="mr-2" />
                <span class="extracted-title">Extracted Information</span>
              </div>
              <div class="extracted-fields">
                <div v-if="extractedData.amount" class="extracted-field">
                  <span class="field-label">Amount</span>
                  <span class="field-value">€{{ extractedData.amount }}</span>
                </div>
                <div v-if="extractedData.supplier" class="extracted-field">
                  <span class="field-label">Supplier</span>
                  <span class="field-value">{{ extractedData.supplier }}</span>
                </div>
                <div v-if="extractedData.date" class="extracted-field">
                  <span class="field-label">Date</span>
                  <span class="field-value">{{ extractedData.date }}</span>
                </div>
              </div>
            </div>
          </div>
        </v-fade-transition>
      </div>

      <v-divider />

      <div class="dialog-footer">
        <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :disabled="!canSubmit"
          :loading="loading"
          @click="submit"
        >
          {{ showForm ? 'Create Invoice' : 'Upload & Process' }}
        </v-btn>
      </div>
    </v-card>

    <v-dialog v-model="supplierDialog" max-width="360">
      <v-card class="pa-4">
        <v-card-title class="text-h6 pb-2">Add New Supplier</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newSupplier"
            label="Supplier Name"
            autofocus
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="supplierDialog = false">Cancel</v-btn>
          <v-btn color="primary" :disabled="!newSupplier" @click="addSupplier">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { invoices } from '@/stores/invoiceState'

const props = defineProps({ active: Boolean })
const emit = defineEmits(['close'])

const invoiceArray = invoices()

const dialog = ref(false)
const activeMode = ref('form')
const valid = ref(false)
const loading = ref(false)
const formRef = ref(null)
const fileInputRef = ref(null)

const amount = ref(null)
const supplier = ref('')
const btwIncluded = ref(false)
const btwPercent = ref(21)
const project = ref(null)
const newSupplier = ref('')
const supplierDialog = ref(false)

const file = ref(null)
const isDragging = ref(false)
const extractionStatus = ref(null)
const extractedData = ref(null)
const suppliers = ref([])

const showForm = computed(() => activeMode.value === 'form')

const canSubmit = computed(() => {
  if (showForm.value) return valid.value
  return file.value !== null
})

watch(() => props.active, (val) => {
  dialog.value = val
  if (!val) resetForm()
})

watch(() => invoiceArray.dbResponse, (newVal) => {
  const known = newVal.filter(i => i.issuer && i.issuer !== "UNKNOWN ISSUER")
  suppliers.value = [...new Set(known.map(i => i.issuer))]
}, { immediate: true })

const projects = computed(() => {
  const set = []
  for (const inv of invoiceArray.dbResponse) {
    if (inv.project_name && !set.some(p => p.name === inv.project_name)) {
      set.push({ name: inv.project_name, id: inv.project_id })
    }
  }
  return set
})

const closeDialog = () => {
  emit('close')
}

const resetForm = () => {
  amount.value = null
  supplier.value = ''
  btwIncluded.value = false
  btwPercent.value = 21
  project.value = null
  file.value = null
  extractionStatus.value = null
  extractedData.value = null
  activeMode.value = 'form'
}

const addSupplier = () => {
  if (newSupplier.value && !suppliers.value.includes(newSupplier.value)) {
    suppliers.value.push(newSupplier.value)
    supplier.value = newSupplier.value
  }
  newSupplier.value = ''
  supplierDialog.value = false
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = (e) => {
  const selected = e.target.files?.[0]
  if (selected) processFile(selected)
}

const handleDrop = (e) => {
  isDragging.value = false
  const dropped = e.dataTransfer?.files?.[0]
  if (dropped) processFile(dropped)
}

const processFile = async (selectedFile) => {
  file.value = selectedFile
  extractionStatus.value = 'processing'
  extractedData.value = null

  try {
    const formData = new FormData()
    formData.append('file', selectedFile)
    
    const baseUrl = import.meta.env.VITE_BASE_URL
    if (!baseUrl) {
      extractionStatus.value = 'manual'
      return
    }
    
    const response = await fetch(`${baseUrl}/invoice/extract`, {
      method: 'POST',
      body: formData
    })
    
    if (response.ok) {
      const data = await response.json()
      extractedData.value = {
        amount: data.amount || '',
        supplier: data.issuer || '',
        date: data.date || new Date().toLocaleDateString()
      }
      extractionStatus.value = 'success'
    } else {
      extractionStatus.value = 'manual'
    }
  } catch (err) {
    console.debug('Extraction service unavailable, manual entry required:', err)
    extractionStatus.value = 'manual'
  }
}

const removeFile = () => {
  file.value = null
  extractionStatus.value = null
  extractedData.value = null
}

const getFileIcon = (f) => {
  if (f?.type === 'application/pdf') return 'mdi-file-pdf-box'
  if (f?.type?.startsWith('image/')) return 'mdi-file-image'
  return 'mdi-file-document'
}

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const getStatusIcon = () => {
  if (extractionStatus.value === 'processing') return 'mdi-loading mdi-spin'
  if (extractionStatus.value === 'success') return 'mdi-check-circle'
  if (extractionStatus.value === 'error') return 'mdi-alert-circle'
  if (extractionStatus.value === 'manual') return 'mdi-pencil'
  return ''
}

const getStatusMessage = () => {
  if (extractionStatus.value === 'processing') return 'Extracting invoice data...'
  if (extractionStatus.value === 'success') return 'Data extracted successfully'
  if (extractionStatus.value === 'error') return 'Extraction failed. Please enter the details manually.'
  if (extractionStatus.value === 'manual') return 'Please enter the invoice details manually.'
  return ''
}

const getLastInvoiceId = () => {
  const ids = invoiceArray.dbResponse.map(i => i.invoice_id || 0)
  return Math.max(0, ...ids) + 1
}

const postInvoice = async (inv) => {
  const res = await fetch(`${import.meta.env.VITE_BASE_URL}/invoice/post`, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inv)
  })
  if (!res.ok) throw new Error(`Failed: ${res.status}`)
  return await res.json()
}

const submit = async () => {
  loading.value = true

  try {
    if (showForm.value) {
      const invoicePayload = {
        invoice_id: getLastInvoiceId(),
        issuer: supplier.value,
        amount: parseFloat(amount.value),
        btw: btwIncluded.value,
        btwPercent: btwIncluded.value ? parseInt(btwPercent.value) : 0,
        pdf_file: null,
        project: project.value
      }
      await postInvoice(invoicePayload)
    } else {
      const invoicePayload = {
        invoice_id: getLastInvoiceId(),
        issuer: extractedData.value?.supplier || 'UNKNOWN ISSUER',
        amount: parseFloat(extractedData.value?.amount || 0),
        btw: false,
        btwPercent: 0,
        pdf_file: file.value?.name,
        project: null,
        needs_review: true
      }
      await postInvoice(invoicePayload)
    }

    await invoiceArray.getAmounts()

    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { title: 'Invoice Created', message: 'Invoice has been added successfully', type: 'success' }
    }))

    closeDialog()
  } catch (err) {
    console.error('Submit error:', err)
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { title: 'Error', message: 'Failed to create invoice. Please try again.', type: 'error' }
    }))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.upload-dialog {
  overflow: hidden;
}

.dialog-header {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dialog-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.mode-switcher {
  display: flex;
  justify-content: center;
}

.dialog-body {
  padding: 24px;
  min-height: 320px;
}

.dialog-footer {
  padding: 16px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgb(var(--v-theme-grey-700));
}

.form-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.upload-section {
  display: flex;
  flex-direction: column;
}

.upload-dropzone {
  border: 2px dashed rgb(var(--v-theme-grey-300));
  border-radius: 16px;
  padding: 40px 24px;
  text-align: center;
  cursor: pointer;
  transition: all var(--billio-transition-normal);
  background: rgb(var(--v-theme-grey-50));
}

.upload-dropzone:hover,
.dropzone-active {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.04);
}

.dropzone-has-file {
  padding: 16px 20px;
  background: rgb(var(--v-theme-surface));
}

.dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dropzone-icon {
  width: 80px;
  height: 80px;
  background: rgba(var(--v-theme-primary), 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
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
  width: 48px;
  height: 48px;
  background: rgba(var(--v-theme-primary), 0.1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  text-align: left;
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

.extraction-status {
  margin-top: 16px;
  padding: 12px 16px;
  background: rgb(var(--v-theme-grey-50));
  border-radius: 10px;
}

.status-content {
  display: flex;
  align-items: center;
  font-size: 0.8125rem;
}

.status-processing {
  color: rgb(var(--v-theme-primary));
}

.status-success {
  color: rgb(var(--v-theme-success));
}

.status-error {
  color: rgb(var(--v-theme-error));
}

.extracted-data {
  padding: 16px;
  background: rgba(var(--v-theme-success), 0.08);
  border-radius: 10px;
  border: 1px solid rgba(var(--v-theme-success), 0.2);
}

.extracted-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.extracted-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgb(var(--v-theme-success));
}

.extracted-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 12px;
}

.extracted-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.field-label {
  font-size: 0.6875rem;
  font-weight: 500;
  color: rgb(var(--v-theme-grey-600));
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.field-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}
</style>
