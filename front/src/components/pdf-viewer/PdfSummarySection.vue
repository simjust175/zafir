<template>
  <div class="summary-section">
    <div v-if="mode === 'conflict' && conflictType === 'unknown-supplier'" class="unknown-supplier">
      <unknown-supplier-summary
        :issuer="fileDetails?.issuer"
        @save-supplier="$emit('save-supplier', $event)"
        @keep-unknown="$emit('keep-unknown')"
      />
    </div>

    <div v-else class="summary-content">
      <div class="summary-header">
        <span class="summary-title">Invoice Details</span>
        <span v-if="mode === 'double-check'" class="verification-badge">
          <v-icon size="14">mdi-shield-check-outline</v-icon>
          Verification Required
        </span>
      </div>

      <div class="summary-grid">
        <div class="summary-card">
          <div class="card-icon supplier">
            <v-icon size="20" color="primary">mdi-domain</v-icon>
          </div>
          <div class="card-content">
            <span class="card-label">Supplier</span>
            <div class="card-value-row">
              <span class="card-value">{{ fileDetails?.issuer || 'Unknown' }}</span>
              <DoubleCheckChip
                v-if="mode === 'double-check'"
                :confirmed="confirmed?.issuer"
                @edit="editItem(fileDetails, 'issuer')"
                @toggle="$emit('toggle-confirm', 'issuer')"
              />
            </div>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon date">
            <v-icon size="20" color="info">mdi-calendar-outline</v-icon>
          </div>
          <div class="card-content">
            <span class="card-label">Invoice Date</span>
            <span class="card-value">{{ formatDate(fileDetails?.invoice_date) }}</span>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon vat">
            <v-icon size="20" color="warning">mdi-percent-outline</v-icon>
          </div>
          <div class="card-content">
            <span class="card-label">VAT Rate</span>
            <div class="card-value-row">
              <span class="card-value">{{ fileDetails?.btwPercent || 0 }}%</span>
              <DoubleCheckChip
                v-if="mode === 'double-check'"
                :confirmed="confirmed?.btw"
                @edit="editItem(fileDetails, 'btwPercent')"
                @toggle="$emit('toggle-confirm', 'btw')"
              />
            </div>
          </div>
        </div>

        <div class="summary-card highlight">
          <div class="card-icon amount">
            <v-icon size="20" color="success">mdi-currency-eur</v-icon>
          </div>
          <div class="card-content">
            <span class="card-label">Total Amount</span>
            <div class="card-value-row">
              <span class="card-value large">€{{ formattedAmount }}</span>
              <DoubleCheckChip
                v-if="mode === 'double-check'"
                :confirmed="confirmed?.amount"
                @edit="editItem(fileDetails, 'amount')"
                @toggle="$emit('toggle-confirm', 'amount')"
              />
            </div>
          </div>
        </div>
      </div>

      <div v-if="mode === 'double-check'" class="confirm-section">
        <div class="confirm-progress">
          <div class="progress-info">
            <span class="progress-label">Verification Progress</span>
            <span class="progress-count">{{ confirmedCount }} of 3 verified</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${(confirmedCount / 3) * 100}%` }" />
          </div>
        </div>

        <button
          class="confirm-btn"
          :class="{ ready: allConfirmed }"
          :disabled="!allConfirmed"
          @click="$emit('confirm')"
        >
          <v-icon size="18" class="mr-2">{{ allConfirmed ? 'mdi-check-circle' : 'mdi-shield-alert-outline' }}</v-icon>
          {{ allConfirmed ? 'Confirm & Continue' : 'Verify All Fields' }}
        </button>
        
        <p v-if="!allConfirmed" class="confirm-hint">
          <v-icon size="14">mdi-information-outline</v-icon>
          Click on each field above to verify before continuing
        </p>
      </div>
    </div>

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

const confirmedCount = computed(() => {
  if (!props.confirmed) return 0
  return Object.values(props.confirmed).filter(Boolean).length
})

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
  background: linear-gradient(180deg, 
    rgba(var(--v-theme-on-surface), 0.02) 0%, 
    rgba(var(--v-theme-on-surface), 0.04) 100%
  );
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.summary-content {
  padding: 20px 24px;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.summary-title {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgb(var(--v-theme-grey-600));
}

.verification-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  color: #92400E;
  border-radius: 20px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.summary-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 14px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.summary-card:hover {
  border-color: rgba(var(--v-theme-on-surface), 0.12);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.summary-card.highlight {
  background: linear-gradient(135deg, 
    rgba(var(--v-theme-success), 0.04) 0%, 
    rgba(var(--v-theme-success), 0.08) 100%
  );
  border-color: rgba(var(--v-theme-success), 0.15);
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  flex-shrink: 0;
}

.card-icon.supplier { background: rgba(var(--v-theme-primary), 0.1); }
.card-icon.date { background: rgba(33, 150, 243, 0.1); }
.card-icon.vat { background: rgba(255, 152, 0, 0.1); }
.card-icon.amount { background: rgba(76, 175, 80, 0.12); }

.card-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.card-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgb(var(--v-theme-grey-500));
}

.card-value-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.card-value {
  font-size: 15px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.card-value.large {
  font-size: 20px;
  font-weight: 700;
  color: #16A34A;
}

.confirm-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  text-align: center;
}

.confirm-progress {
  max-width: 320px;
  margin: 0 auto 20px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 12px;
  font-weight: 500;
  color: rgb(var(--v-theme-grey-600));
}

.progress-count {
  font-size: 12px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.progress-bar {
  height: 6px;
  background: rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, rgb(var(--v-theme-primary)) 0%, #22C55E 100%);
  border-radius: 3px;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.confirm-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  padding: 0 32px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  background: rgba(var(--v-theme-on-surface), 0.1);
  color: rgb(var(--v-theme-grey-600));
}

.confirm-btn:disabled {
  cursor: not-allowed;
}

.confirm-btn.ready {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, #5851EA 100%);
  color: #fff;
  box-shadow: 0 4px 16px rgba(var(--v-theme-primary), 0.35);
}

.confirm-btn.ready:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.4);
}

.confirm-btn.ready:active {
  transform: translateY(0);
}

.confirm-hint {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  font-size: 13px;
  color: rgb(var(--v-theme-grey-500));
}

.unknown-supplier {
  padding: 24px;
}

@media (max-width: 600px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .summary-content {
    padding: 16px;
  }

  .summary-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
