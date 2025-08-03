<template>
  <v-dialog
    v-model="dialog"
    scrollable
    persistent
  >
    <!-- PDF content available -->
    <v-card
      v-if="url"
      width="95%"
      class="pa-0 overflow-hidden"
      :class="cardBackground"
    >
      <v-toolbar
        flat
        dense
        :class="toolbarBackground"
      >
        <!-- Close Button -->
        <v-tooltip
          v-if="doubleCheck && !allConfirmed"
          text="Confirm all fields before closing"
        >
          <template #activator="{ props: tooltip }">
            <v-btn
              icon
              v-bind="tooltip"
              :disabled="doubleCheck && !allConfirmed"
              @click="handleClose"
            >
              <v-icon :color="iconColor">
                mdi-close
              </v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <v-btn
          v-else
          icon
          @click="handleClose"
        >
          <v-icon :color="iconColor">
            mdi-close
          </v-icon>
        </v-btn>

        <!-- Title -->
        <v-toolbar-title class="text-h6">
          PDF Preview
        </v-toolbar-title>

        <v-spacer />

        <!-- Open in New Tab Button -->
        <v-btn
          icon
          :href="pdfUrl"
          target="_blank"
          title="Open in New Tab"
          rel="noopener noreferrer"
        >
          <v-icon :color="iconColor">
            mdi-open-in-new
          </v-icon>
        </v-btn>
      </v-toolbar>

      <!-- Summary section -->
      <div :class="[summaryBackground, 'pa-4', 'text-body-2']">
        <div class="d-flex justify-space-between flex-wrap gap-8">
          <!-- Left: Supplier & Dates -->
          <div>
            <strong>Supplier:</strong> {{ fileDetails.issuer }}
            <v-chip
              v-if="doubleCheck"
              class="ml-2"
              color="success"
              label
              :variant="confirmed.issuer ? 'elevated' : 'outlined'"
              @click="toggleConfirm('issuer')"
            >
              <v-icon left>
                {{ confirmed.issuer ? 'mdi-check-circle' : 'mdi-alert' }}
              </v-icon>
              {{ confirmed.issuer ? 'Looks good' : 'Check?' }}
            </v-chip>
            <br>

            <strong>Issued:</strong> {{ formatDate(fileDetails.invoice_date) }}<br>
          </div>

          <!-- Right: Amounts -->
          <div>
            <strong>BTW percent:</strong> {{ fileDetails.btwPercent || 0 }}%
            <v-chip
              v-if="doubleCheck"
              class="ml-2"
              color="success"
              label
              :variant="confirmed.btw ? 'elevated' : 'outlined'"
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
              v-if="doubleCheck"
              class="ml-2"
              color="success"
              label
              :variant="confirmed.amount ? 'elevated' : 'outlined'"
              @click="toggleConfirm('amount')"
            >
              <v-icon left>
                {{ confirmed.amount ? 'mdi-check-circle' : 'mdi-alert' }}
              </v-icon>
              {{ confirmed.amount ? 'Looks good' : 'Check?' }}
            </v-chip>
          </div>
        </div>

        <!-- Confirm Button -->
        <div
          v-if="doubleCheck"
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

      <!-- PDF Viewer -->
      <v-card-text class="pa-0">
        <iframe
          v-if="pdfUrl"
          :src="pdfUrl"
          type="application/pdf"
          width="100%"
          style="height: 80vh; border: none;"
        />
      </v-card-text>
    </v-card>

    <!-- No PDF fallback -->
    <v-card
      v-else
      height="900"
      class="d-flex flex-column align-center justify-center px-5 py-4"
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
//import { makeVTimelineItemProps } from 'vuetify/lib/components/VTimeline/VTimelineItem.mjs'

// Props and emit
const dialog = defineModel('dialog') // replaces prop: Boolean
const props = defineProps({
  url: String,
  fileDetails: Object,
  doubleCheck: Boolean
})

const emit = defineEmits(['close', 'double-checked', 'close-double-check'])

// Themes & colors
const theme = useTheme()
const isDark = computed(() => theme.global.name.value === 'dark')
const cardBackground = computed(() => isDark.value ? 'bg-grey-darken-4' : 'bg-grey-lighten-4')
const toolbarBackground = computed(() => isDark.value ? 'bg-grey-darken-3' : 'bg-grey-lighten-3')
const summaryBackground = computed(() => isDark.value ? 'bg-grey-darken-2 text-grey-lighten-3' : 'bg-grey-lighten-3 text-grey-darken-3')
const iconColor = computed(() => isDark.value ? 'grey-lighten-1' : 'grey-darken-2')

// Close behavior
const handleClose = () => {
  if (props.doubleCheck) {
    emit('close-double-check')
    emit('close')
  }
  emit('close') // Parent should also update `dialog = false`
  dialog.value = false // close it directly for safety
}

// PDF URL
const pdfUrl = computed(() => props.url ? `${import.meta.env.VITE_BASE_URL}/file/${props.url}` : '')

// Confirmation logic
const confirmed = ref({ issuer: false, btw: false, amount: false })
const toggleConfirm = (field) => { confirmed.value[field] = !confirmed.value[field] }
const allConfirmed = computed(() => Object.values(confirmed.value).every(Boolean))

// Confirm & close
const confirmDoubleCheck = () => {
  emit('double-checked', props.fileDetails.invoice_id)
  emit('close-double-check')
  emit('close')
  dialog.value = false
}

// Format
const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  return isNaN(d) ? 'Invalid date' : d.toLocaleDateString()
}
const formattedAmount = computed(() =>
  props.fileDetails?.amount ? props.fileDetails.amount.toFixed(2) : "0.00"
)
</script>

<style scoped>
.v-chip {
  cursor: pointer;
  transition: 0.3s;
}
</style>