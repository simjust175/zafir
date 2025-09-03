<template>
  <v-dialog
    v-model="dialog"
    scrollable
  >
    <div class="d-flex justify-center">
      <!-- ===================== PDF Viewer Card ===================== -->
      <v-card
        v-if="url"
        rounded="xl"
        elevation="4"
        :width="mode === 'conflict' && conflictType === 'duplicate' ? 900 : 650"
        class="pa-0 overflow-hidden"
        :class="cardBackground"
      >
        <!-- ===== Toolbar ===== -->
        <PdfDialogToolbar
          :issuer="fileDetails?.issuer"
          :pdf-url="pdfUrl"
          :icon-color="iconColor"
          :toolbar-background="toolbarBackground"
          @close="handleClose"
        />

        <!-- ===== Conflict Banner ===== -->
        <v-alert
          v-if="mode === 'conflict'"
          type="warning"
          border="start"
          prominent
          variant="tonal"
          class="rounded-lg"
        >
          <!-- <template #title>
            <span class="font-weight-bold">{{ conflictTitle }}</span>
          </template> -->
          {{ conflictMessage }}
        </v-alert>

        <!-- ===== Duplicate Action Bar ===== -->
        <PdfConflictDuplicate
          v-if="mode === 'conflict' && conflictType === 'duplicate'"
          :pdf-url="pdfUrl"
          :duplicate-pdf-url="duplicatePdfUrl"
          class="mb-3"
          @keep-both="handleDuplicate('both')"
          @keep-this="handleDuplicate('current')"
          @keep-none="handleDuplicate('none')"
        />
        <!-- Save button -->
        <div
          v-if="mode === 'conflict' && conflictType === 'duplicate'"
          class="d-flex px-4"
        >
          <v-btn
            :text="duplicateSaveBtnText"
            :color="selectedDocs.current || selectedDocs.duplicate ? 'primary' : 'error'"
            variant="flat"
            
            block
            @click="handleDuplicateSave"
          />
        </div>

        <!-- ===== Summary Section ===== -->
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
          class="mb-3"
          @save-supplier="$emit('save-supplier', $event)"
          @keep-unknown="$emit('keep-unknown')"
          @toggle-confirm="toggleConfirm"
          @finish-edit="finishEdit"
          @confirm="confirmDoubleCheck"
        />

        <!-- ===== PDF Viewer ===== -->
        <v-card-text
          class="pa-0"
          style="height: 80vh; overflow-y: auto;"
        >
          <!-- 🔥 Side-by-Side PDF Comparison with Multi-Selection -->
          <template v-if="mode === 'conflict' && conflictType === 'duplicate'">
            <v-container fluid>
              <v-row
                dense
                class="align-center mb-3"
              >
                <v-col
                  cols="12"
                  class="text-center"
                >
                  <!-- <v-chip
                    :color="selectedCount === 0 ? 'grey' : selectedCount === 1 ? 'info' : 'success'"
                    class="font-weight-medium"
                    size="large"
                    label
                  >
                    {{ selectedCount === 0 ? 'None Selected' : selectedCount === 1 ? '1 Selected' : 'Both Selected' }}
                  </v-chip> -->
                </v-col>
              </v-row>
              <v-row dense>
                <!-- Current File -->
                <v-col
                  cols="12"
                  md="6"
                >
                  <div
                    class="pdf-select-wrapper"
                    :class="{ selected: selectedDocs.current }"
                    @click="toggleSelection('current')"
                  >
                    <div class="selection-indicator">
                      <v-icon
                        :icon="selectedDocs.current ? 'mdi-check-circle' : 'mdi-checkbox-blank-circle-outline'"
                        :color="selectedDocs.current ? 'green' : 'grey'"
                        size="32"
                      />
                    </div>
                    <h4 class="section-title">
                      Current File
                    </h4>
                    <v-responsive
                      aspect-ratio="1"
                      class="pdf-frame"
                    >
                      <embed
                        :src="pdfUrl"
                        type="application/pdf"
                        class="pdf-embed"
                      >
                    </v-responsive>
                  </div>
                </v-col>

                <!-- Duplicate File -->
                <v-col
                  cols="12"
                  md="6"
                >
                  <div
                    class="pdf-select-wrapper"
                    :class="{ selected: selectedDocs.duplicate }"
                    @click="toggleSelection('duplicate')"
                  >
                    <div class="selection-indicator">
                      <v-icon
                        :icon="selectedDocs.duplicate ? 'mdi-check-circle' : 'mdi-checkbox-blank-circle-outline'"
                        :color="selectedDocs.duplicate ? 'green' : 'grey'"
                        size="32"
                      />
                    </div>
                    <h4 class="section-title">
                      Possible Duplicate
                    </h4>
                    <v-responsive
                      aspect-ratio="1.2"
                      class="pdf-frame"
                    >
                      <embed
                        :src="duplicatePdfUrl"
                        type="application/pdf"
                        class="pdf-embed"
                      >
                    </v-responsive>
                  </div>
                </v-col>
              </v-row>
            </v-container>
          </template>

          <!-- Single PDF Viewer -->
          <v-responsive
            v-else
            aspect-ratio="1.2"
            class="pdf-frame"
          >
            <embed
              :src="`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`"
              type="application/pdf"
              width="100%"
              height="100%"
              class="pdf-embed"
            >
          </v-responsive>
        </v-card-text>
      </v-card>

      <!-- ===================== No PDF Fallback ===================== -->
      <v-card
        v-else
        height="600"
        class="d-flex flex-column align-center justify-center px-5 py-6"
        :class="cardBackground"
        elevation="2"
        rounded="xl"
      >
        <v-icon
          icon="mdi-file-remove-outline"
          size="100"
          class="text-grey-lighten-1 mb-3"
        />
        <div class="text-h6 font-weight-medium mb-1">
          No PDF Available
        </div>
        <div class="text-body-2 text-medium-emphasis mb-4">
          There is no document to preview at the moment.
        </div>
        <v-btn
          variant="elevated"
          color="primary"
          @click="handleClose"
        >
          Close
        </v-btn>
      </v-card>
    </div>
  </v-dialog>
</template>

<!-- eslint-disable vue/require-prop-types -->
<!-- eslint-disable vue/require-default-prop -->
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
  duplicateFileUrl: String,
  duplicateId: Number
})
const emit = defineEmits([
  'close', 'double-checked', 'close-double-check',
  'save-supplier', 'keep-unknown', 'keep-both', 'keep-this', 'keep-duplicate', 'keep-none'
])

// ================== STATE ==================
const selectedDocs = ref({ current: false, duplicate: false })

// Dynamically update save button text based on selection
const duplicateSaveBtnText = computed(() => {
  if (selectedDocs.value.current && selectedDocs.value.duplicate) return 'Save both files'
  if (selectedDocs.value.current) return 'Save current file only'
  if (selectedDocs.value.duplicate) return 'Save duplicate file only'
  return 'Delete both files'
})

// ================== ACTIONS ==================
const toggleSelection = (doc) => {
  selectedDocs.value[doc] = !selectedDocs.value[doc]
}

const handleDuplicate = (file) => {
  if (file === 'both') {
    selectedDocs.value.current = true
    selectedDocs.value.duplicate = true
  } else if (file === 'current') {
    selectedDocs.value.current = true
    selectedDocs.value.duplicate = false
  } else if (file === 'duplicate') {
    selectedDocs.value.current = false
    selectedDocs.value.duplicate = true
  } else {
    selectedDocs.value.current = false
    selectedDocs.value.duplicate = false
  }
}

// Emit action to parent based on final choice
const handleDuplicateSave = () => {
  if (selectedDocs.value.current && selectedDocs.value.duplicate) emit('keep-both')
  else if (selectedDocs.value.current) emit('keep-this')
  else if (selectedDocs.value.duplicate) emit('keep-duplicate')
  else emit('keep-none')
  dialog.value = false
}

const handleClose = () => { emit('close'); dialog.value = false }
// const saveSupplier = (issuer) => emit('save-supplier', issuer)
// const keepUnknown = () => emit('keep-unknown')

const confirmDoubleCheck = () => {
  emit('double-checked', props.fileDetails.invoice_id)
  emit('close-double-check')
  handleClose()
}

// ================== COMPUTED STYLES ==================
const theme = useTheme()
const isDark = computed(() => theme.global.name.value === 'dark')
const cardBackground = computed(() => isDark.value ? 'bg-grey-darken-4' : 'bg-grey-lighten-4')
const toolbarBackground = computed(() => isDark.value ? 'bg-grey-darken-1' : 'bg-grey-lighten-2')
const summaryBackground = computed(() => isDark.value ? 'bg-grey-darken-2 text-grey-lighten-3' : 'bg-grey-lighten-3 text-grey-darken-3')
const iconColor = computed(() => isDark.value ? 'grey-lighten-1' : 'grey-darken-2')

const pdfUrl = computed(() => props.url ? `${import.meta.env.VITE_BASE_URL}/file/${props.url}` : '')
const duplicatePdfUrl = computed(() => props.duplicateFileUrl ? `${import.meta.env.VITE_BASE_URL}/file/${props.duplicateFileUrl}` : '')

// ================== FORM STATE ==================
const editableFields = ref({ issuer: props.fileDetails?.issuer || '' })
const editing = ref({ issuer: false, btw: false, amount: false })
const confirmed = ref({ issuer: false, btw: false, amount: false })
const toggleConfirm = (field) => { confirmed.value[field] = !confirmed.value[field] }
const allConfirmed = computed(() => Object.values(confirmed.value).every(Boolean))
const finishEdit = (field) => { editing.value[field] = false; confirmed.value[field] = true }

const conflictMessage = computed(() => {
  if (props.conflictType === 'unknown-supplier') return "We couldn’t detect a supplier name for this invoice. Please enter it below or keep it as 'Unknown Supplier'."
  if (props.conflictType === 'duplicate') return "This document seems similar to another one in your records. Please review and decide."
  return ""
})
</script>

<style scoped>
.pdf-frame {
  border: 1px solid var(--v-theme-surface-variant);
  border-radius: 16px;
  overflow: hidden;
}

.pdf-embed {
  border: none;
  width: 100%;
  height: 100%;
  display: block;
}

.section-title {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 8px;
  color: var(--v-theme-on-surface);
}

.pdf-select-wrapper {
  position: relative;
  padding: 12px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 2px solid transparent;
  background: var(--v-theme-surface);
}

.pdf-select-wrapper:hover {
  background: rgba(0, 0, 0, 0.03);
}

.pdf-select-wrapper.selected {
  border: 2px solid #4caf50;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  background: rgba(76, 175, 80, 0.05);
  transform: translateY(-3px);
}

.selection-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  padding: 4px;
}
</style>