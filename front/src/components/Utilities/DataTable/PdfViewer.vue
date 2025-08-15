<template>
  <v-dialog
    v-model="dialog"
    scrollable
  >
    <v-card
      v-if="url"
      rounded="lg"
      elevation="3"
      class="pa-0"
      width="600"
      :class="cardBackground"
    >
      <!-- Toolbar -->
      <v-toolbar
        flat
        density="comfortable"
        height="56"
        :class="toolbarBackground"
      >
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          :color="iconColor"
          :disabled="mode === 'double-check' && !allConfirmed"
          @click="handleClose"
        />
        <v-toolbar-title class="text-body-1 font-weight-medium">
          PDF Preview
        </v-toolbar-title>
        <v-spacer />
        <div class="d-flex align-center text-body-2 mr-4">
          <v-icon
            size="18"
            class="mr-1"
            :color="iconColor"
          >
            mdi-file-pdf-box
          </v-icon>
          <span>{{ fileDetails?.issuer || 'Unknown Supplier' }}</span>
        </div>
        <v-btn
          icon="mdi-open-in-new"
          variant="text"
          size="small"
          :href="pdfUrl"
          target="_blank"
          rel="noopener"
          :color="iconColor"
          title="Open in New Tab"
        />
        <v-btn
          icon="mdi-download"
          variant="text"
          size="small"
          :href="pdfUrl"
          download
          :color="iconColor"
          title="Download PDF"
        />
      </v-toolbar>

      <!-- Conflict Banner -->
      <v-alert
        v-if="mode === 'conflict'"
        type="warning"
        border="start"
        prominent
        variant="tonal"
        class="mb-2"
      >
        <template #title>
          {{ conflictTitle }}
        </template>
        {{ conflictMessage }}
      </v-alert>

      <!-- Duplicate Action Bar -->
      <div
        v-if="mode === 'conflict' && conflictType === 'duplicate'"
        class="d-flex flex-wrap justify-end pa-3 ga-2 sticky-action-bar"
      >
        <v-btn
          color="success"
          rounded="lg"
          elevation="1"
          @click="keepBoth"
        >
          <v-icon left>
            mdi-content-duplicate
          </v-icon> Keep Both
        </v-btn>
      
        <v-btn
          color="warning"
          rounded="lg"
          elevation="1"
          @click="keepDuplicate"
        >
          <v-icon left>
            mdi-file-replace
          </v-icon> Keep Duplicate
        </v-btn>
        <v-btn
          color="error"
          rounded="lg"
          elevation="1"
          @click="keepNone"
        >
          <v-icon left>
            mdi-delete
          </v-icon> Delete Both
        </v-btn>
      </div>

      <!-- Summary / Edit -->
      <div
        v-if="mode !== 'conflict' || conflictType === 'unknown-supplier'"
        :class="[summaryBackground, 'pa-4', 'text-body-2']"
      >
        <div class="d-flex justify-space-between flex-wrap ga-8">
          <!-- Supplier -->
          <div>
            <strong>Supplier:</strong>
            <template v-if="mode === 'conflict' && conflictType === 'unknown-supplier'">
              <v-text-field
                v-model="editableFields.issuer"
                variant="outlined"
                density="compact"
                hide-details
                placeholder="Enter supplier name..."
                style="max-width: 250px"
              />
            </template>
            <template v-else>
              <span v-if="!editing.issuer">{{ editableFields.issuer || fileDetails.issuer }}</span>
              <v-text-field
                v-else
                v-model="editableFields.issuer"
                variant="outlined"
                density="compact"
                hide-details
                style="max-width: 250px"
                @keyup.enter="finishEdit('issuer')"
              />
            </template>

            <v-chip
              v-if="mode === 'double-check'"
              class="ml-2"
              :color="confirmed.issuer ? 'success' : 'warning'"
              label
              @click="toggleConfirm('issuer')"
            >
              <v-icon left>
                {{ confirmed.issuer ? 'mdi-check-circle' : 'mdi-alert' }}
              </v-icon>
              {{ confirmed.issuer ? 'Looks good' : 'Check?' }}
            </v-chip>
            <v-btn
              v-if="mode === 'double-check' && !confirmed.issuer"
              icon="mdi-pencil"
              size="small"
              variant="text"
              @click="editing.issuer = true"
            />

            <br>
            <strong>Issued:</strong> {{ formatDate(fileDetails.invoice_date) }}
          </div>

          <!-- Amounts -->
          <div>
            <strong>BTW percent:</strong> {{ fileDetails.btwPercent || 0 }}%
            <v-chip
              v-if="mode === 'double-check'"
              class="ml-2"
              :color="confirmed.btw ? 'success' : 'warning'"
              label
              @click="toggleConfirm('btw')"
            >
              <v-icon left>
                {{ confirmed.btw ? 'mdi-check-circle' : 'mdi-alert' }}
              </v-icon>
              {{ confirmed.btw ? 'Looks good' : 'Check?' }}
            </v-chip>
            <br>

            <strong>Total (invoice):</strong> €{{ formattedAmount }}
            <v-chip
              v-if="mode === 'double-check'"
              class="ml-2"
              :color="confirmed.amount ? 'success' : 'warning'"
              label
              @click="toggleConfirm('amount')"
            >
              <v-icon left>
                {{ confirmed.amount ? 'mdi-check-circle' : 'mdi-alert' }}
              </v-icon>
              {{ confirmed.amount ? 'Looks good' : 'Check?' }}
            </v-chip>
          </div>
        </div>

        <!-- Unknown supplier buttons -->
        <div
          v-if="mode === 'conflict' && conflictType === 'unknown-supplier'"
          class="text-right mt-4"
        >
          <v-btn
            color="primary"
            @click="saveSupplier"
          >
            Save
          </v-btn>
          <v-btn
            variant="outlined"
            class="ml-2"
            @click="keepUnknown"
          >
            Keep as Unknown
          </v-btn>
        </div>

        <!-- Double-check confirm -->
        <div
          v-if="mode === 'double-check'"
          class="text-right mt-4"
        >
          <v-btn
            color="primary"
            variant="flat"
            :disabled="!allConfirmed"
            @click="confirmDoubleCheck"
          >
            <v-icon left>
              mdi-check-bold
            </v-icon>
            Confirm & Continue
          </v-btn>
          <div
            v-if="!allConfirmed"
            class="text-caption text-error mt-1"
          >
            Confirm all fields before continuing.
          </div>
        </div>
      </div>

      <!-- PDF Viewer Area -->
      <v-card-text
        class="pa-0"
        style="height: 80vh; overflow: auto;"
      >
        <!-- Duplicate Conflict PDFs -->
        <template v-if="mode === 'conflict' && conflictType === 'duplicate'">
          <div class="d-flex flex-wrap ga-4 pa-4">
            <div style="flex: 1; min-width: 300px;">
              <h4 class="mb-2">
                Current File
              </h4>
              <v-responsive
                aspect-ratio="1.414"
                class="rounded-lg elevation-1"
              >
                <embed
                  :src="pdfUrl"
                  type="application/pdf"
                  width="100%"
                  height="100%"
                  style="border-radius: 12px; border: 1px solid var(--v-theme-surface-variant);"
                >
              </v-responsive>
            </div>
            <div style="flex: 1; min-width: 300px;">
              <h4 class="mb-2">
                Possible Duplicate
              </h4>
              <v-responsive
                aspect-ratio="1.414"
                class="rounded-lg elevation-1"
              >
                <embed
                  :src="duplicatePdfUrl"
                  type="application/pdf"
                  width="100%"
                  height="100%"
                  style="border-radius: 12px; border: 1px solid var(--v-theme-surface-variant);"
                >
              </v-responsive>
            </div>
          </div>
        </template>

        <!-- Normal / Double-check PDFs -->
        <embed
          v-else-if="pdfUrl"
          :src="`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`"
          type="application/pdf"
          width="100%"
          height="100%"
          style="border:none;display:block;"
        >
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
      <h1 class="text-center text-h1">
        ☹️
      </h1>
      <div class="text-subtitle-1 mt-2">
        No PDF available
      </div>
      <div class="text-body-2">
        There is no document to preview at the moment.
      </div>
      <v-btn
        class="mt-4"
        variant="outlined"
        color="primary"
        @click="handleClose"
      >
        Close
      </v-btn>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useTheme } from 'vuetify'

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

// Theme
const theme = useTheme()
const isDark = computed(() => theme.global.name.value === 'dark')
const cardBackground = computed(() => isDark.value ? 'bg-grey-darken-4' : 'bg-grey-lighten-4')
const toolbarBackground = computed(() => isDark.value ? 'bg-grey-darken-3' : 'bg-grey-lighten-3')
const summaryBackground = computed(() => isDark.value ? 'bg-grey-darken-2 text-grey-lighten-3' : 'bg-grey-lighten-3 text-grey-darken-3')
const iconColor = computed(() => isDark.value ? 'grey-lighten-1' : 'grey-darken-2')

// URLs
const pdfUrl = computed(() => props.url ? `${import.meta.env.VITE_BASE_URL}/file/${props.url}` : '')
const duplicatePdfUrl = computed(() => props.duplicateFileUrl ? `${import.meta.env.VITE_BASE_URL}/file/${props.duplicateFileUrl}` : '')

// Editable
const editableFields = ref({ issuer: props.fileDetails?.issuer || '' })
const editing = ref({ issuer: false, btw: false, amount: false })

// Double-check
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

// Conflict
const conflictTitle = computed(() => {
  if (props.conflictType === 'unknown-supplier') return "Missing Supplier Name"
  if (props.conflictType === 'duplicate') return "Duplicate Detected"
  return ""
})
const conflictMessage = computed(() => {
  if (props.conflictType === 'unknown-supplier')
    return "We couldn’t detect a supplier name for this invoice. Please enter it below or keep it as 'Unknown Supplier'."
  if (props.conflictType === 'duplicate')
    return "This document seems similar to another one in your records. Please review and decide."
  return ""
})
const saveSupplier = () => emit('save-supplier', editableFields.value.issuer)
const keepUnknown = () => emit('keep-unknown')
const keepBoth = () => emit('keep-both')
const keepThis = () => emit('keep-this')
const keepDuplicate = () => emit('keep-duplicate')
const keepNone = () => emit('keep-none')

// Helpers
const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  return isNaN(d) ? 'Invalid date' : d.toLocaleDateString()
}
const formattedAmount = computed(() =>
  props.fileDetails?.amount ? props.fileDetails.amount.toFixed(2) : "0.00"
)
const handleClose = () => { emit('close'); dialog.value = false }
</script>

<style scoped>
.v-chip { cursor: pointer; transition: 0.3s; }
embed::-webkit-scrollbar { display: none; }
.sticky-action-bar {
  position: sticky;
  top: 0;
  background: inherit;
  z-index: 5;
  border-bottom: 1px solid var(--v-theme-surface-variant);
}
</style>