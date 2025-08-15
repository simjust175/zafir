<template>
  <div :class="[summaryBackground, 'pa-4', 'text-body-2']">
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
            @keyup.enter="$emit('finish-edit', 'issuer')"
          />
        </template>

        <v-chip
          v-if="mode === 'double-check'"
          class="ml-2"
          :color="confirmed.issuer ? 'success' : 'warning'"
          label
          @click="$emit('toggle-confirm', 'issuer')"
        >
          <v-icon left>{{ confirmed.issuer ? 'mdi-check-circle' : 'mdi-alert' }}</v-icon>
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
          @click="$emit('toggle-confirm', 'btw')"
        >
          <v-icon left>{{ confirmed.btw ? 'mdi-check-circle' : 'mdi-alert' }}</v-icon>
          {{ confirmed.btw ? 'Looks good' : 'Check?' }}
        </v-chip>
        <br>

        <strong>Total (invoice):</strong> €{{ formattedAmount }}
        <v-chip
          v-if="mode === 'double-check'"
          class="ml-2"
          :color="confirmed.amount ? 'success' : 'warning'"
          label
          @click="$emit('toggle-confirm', 'amount')"
        >
          <v-icon left>{{ confirmed.amount ? 'mdi-check-circle' : 'mdi-alert' }}</v-icon>
          {{ confirmed.amount ? 'Looks good' : 'Check?' }}
        </v-chip>
      </div>
    </div>

    <!-- Unknown supplier buttons -->
    <div v-if="mode === 'conflict' && conflictType === 'unknown-supplier'" class="text-right mt-4">
      <v-btn color="primary" @click="$emit('save-supplier', editableFields.issuer)">Save</v-btn>
      <v-btn variant="outlined" class="ml-2" @click="$emit('keep-unknown')">Keep as Unknown</v-btn>
    </div>

    <!-- Double-check confirm -->
    <div v-if="mode === 'double-check'" class="text-right mt-4">
      <v-btn color="primary" variant="flat" :disabled="!allConfirmed" @click="$emit('confirm')">
        <v-icon left>mdi-check-bold</v-icon>
        Confirm & Continue
      </v-btn>
      <div v-if="!allConfirmed" class="text-caption text-error mt-1">
        Confirm all fields before continuing.
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  mode: String,
  conflictType: String,
  fileDetails: Object,
  summaryBackground: String,
  allConfirmed: Boolean,
  confirmed: Object,
  editableFields: Object,
  editing: Object
})
defineEmits(['save-supplier', 'keep-unknown', 'toggle-confirm', 'finish-edit', 'confirm'])

const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  return isNaN(d) ? 'Invalid date' : d.toLocaleDateString()
}
const formattedAmount = computed(() =>
  typeof props.fileDetails?.amount === 'number' ? props.fileDetails.amount.toFixed(2) : "0.00"
)
</script>