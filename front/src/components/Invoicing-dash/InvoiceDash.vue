<template>
  <div class="invoice-dash">
    <InvoiceSummary
      :total-invoiced="totalInvoiced"
      :total-paid="totalPaid"
      :percent-paid="percentPaid"
      :loading-invoiced="invoicedLoading"
      :loading-paid="paidLoading"
      @open-dialog="openInvoiceDialog"
    />

    <div class="entries-container">
      <EntriesList
        title="Invoices Sent"
        type="invoicing"
        :entries="invoicingEntries"
        :loading="entriesLoading"
        @edit="editEntry('invoiced', $event)"
        @delete="deleteEntry('invoicing', $event)"
      />
      
      <EntriesList
        title="Payments Received"
        type="payments"
        :entries="paymentEntries"
        :loading="entriesLoading"
        @edit="editEntry('paid', $event)"
        @delete="deleteEntry('payments', $event)"
      />
    </div>

    <invoice-dash-dialog
      :show="showInvoiceDialog"
      :dialog-type="dialogType"
      :initial-amount="originalAmount"
      :is-edit="isEditMode"
      :edit-entry-id="editEntryId"
      @close="closeInvoiceDash"
      @update="handleUpdate"
    />

    <v-snackbar
      v-model="snack.show"
      :color="snack.color"
      location="top"
      multi-line
      timeout="3500"
    >
      {{ snack.message }}
      <template #actions>
        <v-btn
          icon
          @click="snack.show = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { computed, watch, ref } from 'vue'
import InvoiceSummary from './InvoiceSummary.vue'
import EntriesList from './EntriesList.vue'
import InvoiceDashDialog from './InvoiceDashDialog.vue'
import { invoices as useInvoiceStore } from '@/stores/invoiceState.js'
import { globalFunctions } from '@/stores/globalFunctions.js'

const props = defineProps({
  currentProjectId: Number,
  expanded: Boolean,
  marginAdjustedTotal: Number
})

const invoiceStore = useInvoiceStore()
const functions = globalFunctions()

/* -----------------------
   Local UI state
------------------------ */
const showDialog = ref(false)
const dialogType = ref(null) // 'invoicing' | 'payments'
const isEditMode = ref(false)
const editEntryId = ref(null)
const originalAmount = ref(0)

const snack = ref({
  show: false,
  color: 'success',
  message: ''
})

/* -----------------------
   SOURCE OF TRUTH (STORE)
------------------------ */
const invoicingEntries = computed(() =>
  invoiceStore.invoicing.filter(
    i => i.project === props.currentProjectId
  )
)

const paymentEntries = computed(() =>
  invoiceStore.payments.filter(
    p => p.project === props.currentProjectId
  )
)

/* -----------------------
   Derived totals
------------------------ */
const totalPaid = computed(() =>
  paymentEntries.value.reduce((sum, p) => sum + p.amount, 0)
)

const totalInvoiced = computed(() => {
  if (props.marginAdjustedTotal != null) {
    return props.marginAdjustedTotal
  }
  return invoicingEntries.value.reduce((sum, i) => sum + i.amount, 0)
})

const percentPaid = computed(() =>
  totalInvoiced.value === 0
    ? 0
    : Math.round((totalPaid.value / totalInvoiced.value) * 100)
)

/* -----------------------
   Dialog control
------------------------ */
const openDialog = (type, entry = null) => {
  dialogType.value = type
  isEditMode.value = !!entry
  editEntryId.value = entry?.id ?? null
  originalAmount.value = entry?.amount ?? 0
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  isEditMode.value = false
  editEntryId.value = null
  functions.add = null
}

/* -----------------------
   CRUD actions (store-only)
------------------------ */
const handleUpdate = async (amount) => {
  try {
    if (isEditMode.value) {
      if (dialogType.value === 'invoicing') {
        await invoiceStore.updateInvoicing(editEntryId.value, amount)
      } else {
        await invoiceStore.updatePayment(editEntryId.value, amount)
      }
    } else {
      if (dialogType.value === 'invoicing') {
        await invoiceStore.createInvoicing(props.currentProjectId, amount)
      } else {
        await invoiceStore.createPayment(props.currentProjectId, amount)
      }
    }

    snack.value = {
      show: true,
      color: 'success',
      message: 'Saved successfully'
    }
    closeDialog()
  } catch {
    snack.value = {
      show: true,
      color: 'error',
      message: 'Failed to save'
    }
  }
}

const deleteEntry = async (type, entry) => {
  try {
    if (type === 'invoicing') {
      await invoiceStore.deleteInvoicing(entry.id)
    } else {
      await invoiceStore.deletePayment(entry.id)
    }

    snack.value = {
      show: true,
      color: 'success',
      message: 'Deleted successfully'
    }
  } catch {
    snack.value = {
      show: true,
      color: 'error',
      message: 'Delete failed'
    }
  }
}

/* -----------------------
   External triggers
------------------------ */
watch(() => functions.add, (val) => {
  if (val) openDialog(val)
})
</script>

<style scoped>
.invoice-dash {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.entries-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 900px) {
  .entries-container {
    grid-template-columns: 1fr;
  }
}
</style>
