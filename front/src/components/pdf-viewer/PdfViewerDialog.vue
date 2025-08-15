<template>
    <v-dialog v-model="dialog" scrollable>
      <v-card
        v-if="url"
        rounded="lg"
        elevation="3"
        class="pa-0"
        width="90%"
        :class="cardBackground"
      >
        <!-- Toolbar -->
        <PdfDialogToolbar
          :issuer="fileDetails?.issuer"
          :pdf-url="pdfUrl"
          :disable-close="mode === 'double-check' && !allConfirmed"
          :icon-color="iconColor"
          :toolbar-background="toolbarBackground"
          @close="handleClose"
        />
  
        <!-- Conflict Banner -->
        <v-alert
          v-if="mode === 'conflict'"
          type="warning"
          border="start"
          prominent
          variant="tonal"
          class="mb-2"
        >
          <template #title>{{ conflictTitle }}</template>
          {{ conflictMessage }}
        </v-alert>
  
        <!-- Duplicate Action Bar -->
        <PdfConflictDuplicate
          v-if="mode === 'conflict' && conflictType === 'duplicate'"
          :pdf-url="pdfUrl"
          :duplicate-pdf-url="duplicatePdfUrl"
          @keep-both="keepBoth"
          @keep-this="keepThis"
          @keep-duplicate="keepDuplicate"
          @keep-none="keepNone"
        />
  
        <!-- Summary Section -->
        <PdfSummarySection
          v-if="mode !== 'conflict' || conflictType === 'unknown-supplier'"
          :mode="mode"
          :conflict-type="conflictType"
          :file-details="fileDetails"
          :summary-background="summaryBackground"
          :all-confirmed="allConfirmed"
          :confirmed="confirmed"
          :editable-fields="editableFields"
          :editing="editing"
          @save-supplier="saveSupplier"
          @keep-unknown="keepUnknown"
          @toggle-confirm="toggleConfirm"
          @finish-edit="finishEdit"
          @confirm="confirmDoubleCheck"
        />
  
        <!-- PDF Viewer -->
        <v-card-text class="pa-0" style="height: 80vh; overflow: auto;">
          <template v-if="mode === 'conflict' && conflictType === 'duplicate'">
            <div class="d-flex flex-wrap ga-4 pa-4">
              <div style="flex: 1; min-width: 300px;">
                <h4 class="mb-2">Current File</h4>
                <v-responsive aspect-ratio="1.414" class="rounded-lg elevation-1">
                  <embed
                    :src="pdfUrl"
                    type="application/pdf"
                    width="100%"
                    height="100%"
                    style="border-radius: 12px; border: 1px solid var(--v-theme-surface-variant);"
                  />
                </v-responsive>
              </div>
              <div style="flex: 1; min-width: 300px;">
                <h4 class="mb-2">Possible Duplicate</h4>
                <v-responsive aspect-ratio="1.414" class="rounded-lg elevation-1">
                  <embed
                    :src="duplicatePdfUrl"
                    type="application/pdf"
                    width="100%"
                    height="100%"
                    style="border-radius: 12px; border: 1px solid var(--v-theme-surface-variant);"
                  />
                </v-responsive>
              </div>
            </div>
          </template>
  
          <embed
            v-else-if="pdfUrl"
            :src="`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`"
            type="application/pdf"
            width="100%"
            height="100%"
            style="border:none;display:block;"
          />
        </v-card-text>
      </v-card>
  
      <!-- No PDF fallback -->
      <v-card
        v-else
        height="900"
        class="d-flex flex-column align-center justify-center px-5 py-4 pt-12"
        :class="cardBackground"
        flat
      >
        <h1 class="text-center text-h1">☹️</h1>
        <div class="text-subtitle-1 mt-2">No PDF available</div>
        <div class="text-body-2">There is no document to preview at the moment.</div>
        <v-btn class="mt-4" variant="outlined" color="primary" @click="handleClose">Close</v-btn>
      </v-card>
    </v-dialog>
  </template>
  
  <script setup>
  import { computed, ref } from 'vue'
  import { useTheme } from 'vuetify'
  import PdfDialogToolbar from './PdfDialogToolbar.vue'
  import PdfSummarySection from './PdfSummarySection.vue'
  import PdfConflictDuplicate from './PdfConflictDuplicate.vue'
  
  const dialog = defineModel('dialog')
  const props = defineProps({
    url: String,
    fileDetails: Object,
    mode: { type: String, default: 'normal' },
    conflictType: String,
    duplicateFileUrl: String
  })
  const emit = defineEmits([
    'close', 'double-checked', 'close-double-check',
    'save-supplier', 'keep-unknown', 'keep-both', 'keep-this', 'keep-duplicate', 'keep-none'
  ])
  
  const theme = useTheme()
  const isDark = computed(() => theme.global.name.value === 'dark')
  const cardBackground = computed(() => isDark.value ? 'bg-grey-darken-4' : 'bg-grey-lighten-4')
  const toolbarBackground = computed(() => isDark.value ? 'bg-grey-darken-3' : 'bg-grey-lighten-3')
  const summaryBackground = computed(() => isDark.value ? 'bg-grey-darken-2 text-grey-lighten-3' : 'bg-grey-lighten-3 text-grey-darken-3')
  const iconColor = computed(() => isDark.value ? 'grey-lighten-1' : 'grey-darken-2')
  
  const pdfUrl = computed(() => props.url ? `${import.meta.env.VITE_BASE_URL}/file/${props.url}` : '')
  const duplicatePdfUrl = computed(() => props.duplicateFileUrl ? `${import.meta.env.VITE_BASE_URL}/file/${props.duplicateFileUrl}` : '')
  
  const editableFields = ref({ issuer: props.fileDetails?.issuer || '' })
  const editing = ref({ issuer: false, btw: false, amount: false })
  const confirmed = ref({ issuer: false, btw: false, amount: false })
  const toggleConfirm = (field) => { confirmed.value[field] = !confirmed.value[field] }
  const allConfirmed = computed(() => Object.values(confirmed.value).every(Boolean))
  const finishEdit = (field) => { editing.value[field] = false; confirmed.value[field] = true }
  const confirmDoubleCheck = () => {
    emit('double-checked', props.fileDetails.invoice_id)
    emit('close-double-check')
    emit('close')
    dialog.value = false
  }
  
  const conflictTitle = computed(() => {
    if (props.conflictType === 'unknown-supplier') return "Missing Supplier Name"
    if (props.conflictType === 'duplicate') return "Duplicate Detected"
    return ""
  })
  const conflictMessage = computed(() => {
    if (props.conflictType === 'unknown-supplier') return "We couldn’t detect a supplier name for this invoice. Please enter it below or keep it as 'Unknown Supplier'."
    if (props.conflictType === 'duplicate') return "This document seems similar to another one in your records. Please review and decide."
    return ""
  })
  
  const handleClose = () => { emit('close'); dialog.value = false }
  const saveSupplier = (issuer) => emit('save-supplier', issuer)
  const keepUnknown = () => emit('keep-unknown')
  const keepBoth = () => emit('keep-both')
  const keepThis = () => emit('keep-this')
  const keepDuplicate = () => emit('keep-duplicate')
  const keepNone = () => emit('keep-none')
  </script>
  
  <style scoped>
  .v-chip { cursor: pointer; transition: 0.3s; }
  embed::-webkit-scrollbar { display: none; }
  </style>