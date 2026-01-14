<template>
  <div class="summary-section">
    <!-- Unknown Supplier Mode -->
    <div v-if="mode === 'conflict' && conflictType === 'unknown-supplier'" class="unknown-supplier">
      <unknown-supplier-summary
        :issuer="fileDetails?.issuer"
        @save-supplier="$emit('save-supplier', $event)"
        @keep-unknown="$emit('keep-unknown')"
      />
    </div>

    <!-- Normal/Double-check Summary -->
    <div v-else class="summary-grid">
      <div class="summary-item">
        <span class="item-label">Supplier</span>
        <div class="item-value-row">
          <span class="item-value">{{ fileDetails?.issuer || 'Unknown' }}</span>
          <DoubleCheckChip
            v-if="mode === 'double-check'"
            :confirmed="confirmed?.issuer"
            @edit="editItem(fileDetails, 'issuer')"
            @toggle="$emit('toggle-confirm', 'issuer')"
          />
        </div>
      </div>

      <div class="summary-item">
        <span class="item-label">Invoice Date</span>
        <span class="item-value">{{ formatDate(fileDetails?.invoice_date) }}</span>
      </div>

      <div class="summary-item">
        <span class="item-label">VAT Rate</span>
        <div class="item-value-row">
          <span class="item-value">{{ fileDetails?.btwPercent || 0 }}%</span>
          <DoubleCheckChip
            v-if="mode === 'double-check'"
            :confirmed="confirmed?.btw"
            @edit="editItem(fileDetails, 'btwPercent')"
            @toggle="$emit('toggle-confirm', 'btw')"
          />
        </div>
      </div>

      <div class="summary-item">
        <span class="item-label">Total Amount</span>
        <div class="item-value-row">
          <span class="item-value amount">€{{ formattedAmount }}</span>
          <DoubleCheckChip
            v-if="mode === 'double-check'"
            :confirmed="confirmed?.amount"
            @edit="editItem(fileDetails, 'amount')"
            @toggle="$emit('toggle-confirm', 'amount')"
          />
        </div>
      </div>
    </div>

    <!-- Double-check Confirm Button -->
    <div v-if="mode === 'double-check'" class="confirm-section">
      <button
        class="btn btn-primary"
        :disabled="!allConfirmed"
        @click="$emit('confirm')"
      >
        <v-icon size="18" class="mr-2">mdi-check-bold</v-icon>
        Confirm & Continue
      </button>
      <p v-if="!allConfirmed" class="confirm-hint">
        Please confirm all fields before continuing
      </p>
    </div>

    <!-- Edit Dialog -->
    <dialog-component
      :dialog-prop="triggerDialog"
      :edited-item="editedItem"
      :original-item="{ ...editedItem }"
      :form-title="formTitle"
      @close="close"
      @save="prepareEditChanges"
    />
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import DoubleCheckChip from './DoubleCheckChip.vue'
import UnknownSupplierSummary from './UnknownSupplierSummary.vue'
import DialogComponent from '@/components/Utilities/DataTable/DialogComponent.vue'

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

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  const d = new Date(dateStr)
  return isNaN(d) ? 'N/A' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formattedAmount = computed(() =>
  typeof props.fileDetails?.amount === 'number'
    ? props.fileDetails.amount.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '0.00'
)

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
  editedIndex.value = 0
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

function prepareEditChanges({ body, id }) {
  if (props.fileDetails) {
    Object.assign(props.fileDetails, body)
  }
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
    if (!response.ok) throw new Error('Failed to save changes')
  } catch (e) {
  }
}
</script>

<style scoped>
.summary-section {
  padding: 20px;
  background: #fafbfc;
  border-bottom: 1px solid #e3e8ee;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #697386;
}

.item-value-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-value {
  font-size: 14px;
  font-weight: 500;
  color: #1a1f36;
}

.item-value.amount {
  font-size: 16px;
  font-weight: 600;
}

.confirm-section {
  margin-top: 20px;
  text-align: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 24px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
}

.btn-primary {
  background: #635bff;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #5851ea;
}

.btn-primary:disabled {
  background: #c4c9d4;
  cursor: not-allowed;
}

.confirm-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #ef4444;
}

.unknown-supplier {
  padding: 0;
}

@media (max-width: 600px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
