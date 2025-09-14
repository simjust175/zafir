<!-- eslint-disable vue/no-mutating-props -->
<template>
  <v-card
    class="pa-4"
    :class="summaryBackground"
    elevation="2"
  >
    <v-container fluid class="pa-0">
      <v-row dense>
        <!-- Conflict Mode: Unknown Supplier -->
        <v-col
          v-if="mode === 'conflict' && conflictType === 'unknown-supplier'"
          cols="12"
        >
          <unknown-supplier-summary
            :issuer="fileDetails.issuer"
            @save-supplier="$emit('save-supplier', $event)"
            @keep-unknown="$emit('keep-unknown')"
          />
        </v-col>

        <!-- Supplier Section -->
        <v-col v-if="conflictType !== 'unknown-supplier'" cols="6">
          <div class="summary-item">
            <span class="label">Supplier:</span>
            <span class="value">{{ fileDetails.issuer }}</span>

            <DoubleCheckChip
              v-if="mode === 'double-check'"
              :confirmed="confirmed.issuer"
              @edit="editItem(fileDetails, 'issuer')"
              @toggle="$emit('toggle-confirm', 'issuer')"
            />
          </div>

          <div class="summary-item">
            <span class="label">Issued:</span>
            <span class="value">{{ formatDate(fileDetails.invoice_date) }}</span>
          </div>
        </v-col>

        <!-- Amounts Section -->
        <v-col v-if="conflictType !== 'unknown-supplier'" cols="6">
          <div class="summary-item">
            <span class="label">BTW Percent:</span>
            <span class="value">{{ fileDetails.btwPercent || 0 }}%</span>

            <DoubleCheckChip
              v-if="mode === 'double-check'"
              :confirmed="confirmed.btw"
              @edit="editItem(fileDetails, 'btwPercent')"
              @toggle="$emit('toggle-confirm', 'btw')"
            />
          </div>

          <div class="summary-item">
            <span class="label">Total (Invoice):</span>
            <span class="value">€{{ formattedAmount }}</span>

            <DoubleCheckChip
              v-if="mode === 'double-check'"
              :confirmed="confirmed.amount"
              @edit="editItem(fileDetails, 'amount')"
              @toggle="$emit('toggle-confirm', 'amount')"
            />
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- Edit Dialog -->
    <dialog-component
      :dialog-prop="triggerDialog"
      :edited-item="editedItem"
      :original-item="{ ...editedItem }"
      :form-title="formTitle"
      @close="close"
      @save="prepareEditChanges"
    />

    <!-- Double-check Confirm Button -->
    <div v-if="mode === 'double-check'" class="text-right mt-6">
      <v-btn
        color="primary"
        variant="flat"
        :disabled="!allConfirmed"
        class="px-5"
        @click="$emit('confirm')"
      >
        <v-icon left>mdi-check-bold</v-icon>
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
import { ref, computed, nextTick } from 'vue'
import DoubleCheckChip from './DoubleCheckChip.vue'
// import DialogComponent from './DialogComponent.vue'

const props = defineProps({
  mode: String,
  conflictType: String,
  fileDetails: Object,
  summaryBackground: String,
  allConfirmed: Boolean,
  confirmed: Object
})

defineEmits([
  'save-supplier',
  'keep-unknown',
  'toggle-confirm',
  'confirm'
])

// ======= Formatting =======
const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  return isNaN(d) ? 'Invalid date' : d.toLocaleDateString()
}

const formattedAmount = computed(() =>
  typeof props.fileDetails?.amount === 'number'
    ? props.fileDetails.amount.toFixed(2)
    : '0.00'
)

// ======= Dialog State =======
const triggerDialog = ref(false)
const editedItem = ref({})
const editedIndex = ref(-1)

const defaultItem = {
  issuer: '',
  amount: 0,
  created_at: '',
  includesBtw: false,
  btwPercent: null,
  margin: 0
}

const formTitle = computed(() =>
  editedIndex.value === -1 ? 'New Item' : 'Edit Item'
)

function editItem(item, field) {
  editedIndex.value = 0 // we only edit the single fileDetails
  editedItem.value = { ...item, field }
  triggerDialog.value = true
}

function close() {
  triggerDialog.value = false
  nextTick(() => {
    editedItem.value = { ...defaultItem }
    editedIndex.value = -1
  })
}

// ======= Save Changes =======
function prepareEditChanges({ body, id }) {
  console.log('prepareEditChanges', body, id)

  // Apply field change locally to fileDetails
  Object.assign(props.fileDetails, body)

  // Optionally: call API to persist
  patchChanges({ id, body })
  
  close()
}

async function patchChanges({ id, body }) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_URL}/invoice/patch/invoices?id=${id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    )
    if (!response.ok) throw new Error('Failed to patch invoice')
    console.log('✅ Patched successfully')
  } catch (e) {
    console.error('❌ Patch error', e.message)
  }
}
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
</style>