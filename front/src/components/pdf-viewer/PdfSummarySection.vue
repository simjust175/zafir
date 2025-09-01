<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div :class="[summaryBackground, 'pa-6', 'text-body-2']">
    <div class="d-flex flex-wrap justify-space-between ga-6">
      <!-- Supplier Section -->
      <div class="flex-grow-1 min-width-300">
        <strong v-if="conflictType !== 'unknown-supplier'">Supplier:</strong>

        <!-- Conflict Mode: Unknown Supplier -->
        <template v-if="mode === 'conflict' && conflictType === 'unknown-supplier'">
          <v-autocomplete
            v-if="isNewSupplier"
            v-model="editableFields.issuer"
            autofocus
            :items="suppliersInDb"
            label="Enter or choose supplier"
            variant="outlined"
            class="w-100"
            density="compact"
            no-data-text="New supplier will be added"
            hide-details
            clearable
            allow-overflow
            :menu-props="{ maxHeight: '300px' }"
            placeholder="Type supplier name or pick from list..."
          />
          <v-text-field
            v-else
            v-model="editableFields.issuer"
            autofocus
            label="Supplier"
            variant="outlined"
            class="w-100"
            density="compact"
            hide-details
          />
          <v-chip
            v-if="editableFields.issuer"
            class="mt-2"
            :color="isNewSupplier ? 'info' : 'success'"
            label
            size="small"
          >
            <v-icon left>
              {{ isNewSupplier ? 'mdi-plus-circle' : 'mdi-check-circle' }}
            </v-icon>
            {{ isNewSupplier ? 'New supplier will be added' : 'Existing supplier recognized' }}
          </v-chip>
        </template>

        <!-- Non-conflict Mode -->
        <template v-else>
          <span v-if="!editing.issuer">{{ editableFields.issuer || fileDetails.issuer }}</span>
          <v-text-field
            v-else
            v-model="editableFields.issuer"
            variant="outlined"
            density="compact"
            hide-details
            class="max-width-250"
            @keyup.enter="$emit('finish-edit', 'issuer')"
          />
        </template>

        <!-- Confirmation Chip + Edit Button -->
        <div class="mt-2 d-flex align-center">
          <v-chip
            v-if="mode === 'double-check'"
            :color="confirmed.issuer ? 'success' : 'warning'"
            label
            @click="$emit('toggle-confirm', 'issuer')"
          >
            <v-icon left>
              {{ confirmed.issuer ? 'mdi-check-circle' : 'mdi-alert' }}
            </v-icon>
            {{ confirmed.issuer ? 'Looks good' : 'Check?' }}
          </v-chip>

          <v-btn
            v-if="mode === 'double-check' && !confirmed.issuer"
            icon="mdi-pencil"
            :disabled="!editableFields.issuer.length"
            size="small"
            variant="text"
            class="ml-2"
            @click="editing.issuer = true"
          />
        </div>

        <!-- Issued Date -->
        <div
          v-if="conflictType !== 'unknown-supplier'"
          class="mt-4"
        >
          <strong>Issued:</strong> {{ formatDate(fileDetails.invoice_date) }}
        </div>
      </div>

      <!-- Amounts Section -->
      <div
        v-if="conflictType !== 'unknown-supplier'"
        class="flex-grow-1 min-width-300"
      >
        <div class="mb-2">
          <strong>BTW percent:</strong> {{ fileDetails.btwPercent || 0 }}%
          <v-chip
            v-if="mode === 'double-check'"
            :color="confirmed.btw ? 'success' : 'warning'"
            label
            class="ml-2"
            @click="$emit('toggle-confirm', 'btw')"
          >
            <v-icon left>
              {{ confirmed.btw ? 'mdi-check-circle' : 'mdi-alert' }}
            </v-icon>
            {{ confirmed.btw ? 'Looks good' : 'Check?' }}
          </v-chip>
        </div>

        <div class="mt-2">
          <strong>Total (invoice):</strong> €{{ formattedAmount }}
          <v-chip
            v-if="mode === 'double-check'"
            :color="confirmed.amount ? 'success' : 'warning'"
            label
            class="ml-2"
            @click="$emit('toggle-confirm', 'amount')"
          >
            <v-icon left>
              {{ confirmed.amount ? 'mdi-check-circle' : 'mdi-alert' }}
            </v-icon>
            {{ confirmed.amount ? 'Looks good' : 'Check?' }}
          </v-chip>
        </div>
      </div>
    </div>

    <!-- Conflict Action Buttons -->
    <div
      v-if="mode === 'conflict' && conflictType === 'unknown-supplier'"
      class="text-right mt-6"
    >
      <v-btn
        color="primary"
        @click="$emit('save-supplier', editableFields.issuer)"
      >
        Save
      </v-btn>
      <v-btn
        variant="outlined"
        class="ml-2"
        @click="$emit('keep-unknown')"
      >
        Keep as Unknown
      </v-btn>
    </div>

    <!-- Double-check Confirm Button -->
    <div
      v-if="mode === 'double-check'"
      class="text-right mt-6"
    >
      <v-btn
        color="primary"
        variant="flat"
        :disabled="!allConfirmed"
        @click="$emit('confirm')"
      >
        <v-icon left>
          mdi-check-bold
        </v-icon>
        Confirm & Continue
      </v-btn>
      <div
        v-if="!allConfirmed"
        class="text-caption text-error mt-2"
      >
        Confirm all fields before continuing.
      </div>
    </div>
  </div>
</template>

<!-- eslint-disable vue/require-default-prop -->
<script setup>
import { ref, watch, computed } from 'vue'
import { invoices } from "@/stores/invoiceState"

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

defineEmits([
  'save-supplier',
  'keep-unknown',
  'toggle-confirm',
  'finish-edit',
  'confirm'
])

const invoiceArray = invoices()

const suppliersInDb = computed(() => {
  const knownSuppliers = invoiceArray.dbResponse.filter(
    i => i.issuer && i.issuer !== "UNKNOWN ISSUER"
  )
  return [...new Set(knownSuppliers.map(ks => ks.issuer))]
})

const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  return isNaN(d) ? 'Invalid date' : d.toLocaleDateString()
}

const formattedAmount = computed(() =>
  typeof props.fileDetails?.amount === 'number'
    ? props.fileDetails.amount.toFixed(2)
    : "0.00"
)

// ✅ Use a ref for reactive state
const isNewSupplier = ref(false)

// ✅ Watch for changes and update the flag
watch(
  () => props.editableFields.issuer,
  (newVal) => {
    const trimmed = newVal?.trim()
    isNewSupplier.value = !!trimmed && !suppliersInDb.value.includes(trimmed)
  },
  { immediate: true }
)
</script>