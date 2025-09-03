<!-- eslint-disable vue/no-mutating-props -->
<template>
  <v-card
    class="pa-4 rounded-xl"
    :class="summaryBackground"
    elevation="2"
  >
    <v-container
      fluid
      class="pa-0"
    >
      <v-row dense>
        <!-- Conflict Mode: Unknown Supplier -->
        <v-col
          v-if="mode === 'conflict' && conflictType === 'unknown-supplier'"
          cols="12"
        >
          <unknown-supplier-summary
            :issuer="editableFields.issuer"
            @save-supplier="$emit('save-supplier', $event)"
            @keep-unknown="$emit('keep-unknown')"
          />
        </v-col>

        <!-- Supplier Section -->
        <v-col
          v-if="conflictType !== 'unknown-supplier'"
          cols="6"
        >
          <div class="summary-item">
            <span class="label">Supplier:</span>

            <!-- Inline Editable Field -->
            <template v-if="currentlyEditing === 'issuer'">
              <v-text-field
                v-model="editableFields.issuer"
                variant="outlined"
                density="compact"
                hide-details
                class="max-width-200"
              />
              <v-btn
                size="small"
                color="primary"
                variant="tonal"
                icon="mdi-check"
                @click="finishEditing('issuer')"
              />
            </template>
            <template v-else>
              <span class="value">{{ fileDetails.issuer }}</span>
              <DoubleCheckChip
                v-if="mode === 'double-check'"
                :confirmed="confirmed.issuer"
                @edit="startEditing('issuer')"
                @toggle="$emit('toggle-confirm', 'issuer')"
              />
            </template>
          </div>

          <div class="summary-item">
            <span class="label">Issued:</span>
            <span class="value">{{ formatDate(fileDetails.invoice_date) }}</span>
          </div>
        </v-col>

        <!-- Amounts Section -->
        <v-col
          v-if="conflictType !== 'unknown-supplier'"
          cols="6"
        >
          <div class="summary-item">
            <span class="label">BTW Percent:</span>

            <!-- Inline Editable Field -->
            <template v-if="currentlyEditing === 'btw'">
              <v-text-field
                v-model="editableFields.btwPercent"
                variant="outlined"
                density="compact"
                hide-details
                class="max-width-100"
                type="number"
              />
              <v-btn
                size="small"
                color="primary"
                variant="tonal"
                icon="mdi-check"
                @click="finishEditing('btw')"
              />
            </template>
            <template v-else>
              <span class="value">{{ fileDetails.btwPercent || 0 }}%</span>
              <DoubleCheckChip
                v-if="mode === 'double-check'"
                :confirmed="confirmed.btw"
                @edit="startEditing('btw')"
                @toggle="$emit('toggle-confirm', 'btw')"
              />
            </template>
          </div>

          <div class="summary-item">
            <span class="label">Total (Invoice):</span>

            <!-- Inline Editable Field -->
            <template v-if="currentlyEditing === 'amount'">
              <v-text-field
                v-model="editableFields.amount"
                variant="outlined"
                density="compact"
                hide-details
                class="max-width-150"
                type="number"
              />
              <v-btn
                size="small"
                color="primary"
                variant="tonal"
                icon="mdi-check"
                @click="finishEditing('amount')"
              />
            </template>
            <template v-else>
              <span class="value">€{{ formattedAmount }}</span>
              <DoubleCheckChip
                v-if="mode === 'double-check'"
                :confirmed="confirmed.amount"
                @edit="startEditing('amount')"
                @toggle="$emit('toggle-confirm', 'amount')"
              />
            </template>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- Double-check Confirm Button -->
    <div
      v-if="mode === 'double-check'"
      class="text-right mt-6"
    >
      <v-btn
        color="primary"
        variant="flat"
        :disabled="!allConfirmed"
        class="px-5"
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
  </v-card>
</template>

<script setup>
import { computed, ref } from 'vue'
import DoubleCheckChip from './DoubleCheckChip.vue'

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

const currentlyEditing = ref(null)

function startEditing(field) {
  currentlyEditing.value = field
}

function finishEditing(field) {
  currentlyEditing.value = null
  // Emit to parent if needed
  // Example: $emit('finish-edit', field)
}

const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  return isNaN(d) ? 'Invalid date' : d.toLocaleDateString()
}

const formattedAmount = computed(() =>
  typeof props.fileDetails?.amount === 'number'
    ? props.fileDetails.amount.toFixed(2)
    : "0.00"
)
</script>

<style scoped>
.summary-item {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.label {
  font-weight: 600;
  min-width: 120px;
}

.value {
  flex: 1;
}

.max-width-100 {
  max-width: 100px;
}

.max-width-150 {
  max-width: 150px;
}

.max-width-200 {
  max-width: 200px;
}
</style>