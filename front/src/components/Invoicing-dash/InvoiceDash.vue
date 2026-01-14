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

    <!-- Shared Dialog for Paid + Invoiced -->
    <invoice-dash-dialog
      :show="showInvoiceDialog"
      :dialog-type="dialogType"
      :initial-amount="originalAmount"
      :is-edit="isEditMode"
      @close="closeInvoiceDash"
      @update="updateInvoicing"
    />

    <!-- Snackbar Notification -->
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
import { invoices } from '@/stores/invoiceState.js'
import { globalFunctions } from '@/stores/globalFunctions.js'

// eslint-disable-next-line vue/require-default-prop
const props = defineProps({ 
  currentProjectId: Number, 
  expanded: Boolean, 
  addInvoicing: String,
  marginAdjustedTotal: { type: Number, default: null }
})

const invoiceStore = invoices()
const functions = globalFunctions()
const payments = computed(() => invoiceStore.payments)
const invoicing = computed(() => invoiceStore.invoicing)
// const localInvoices = ref([])

const showInvoiceDialog = ref(false)
const invoicedLoading = ref(false)
const paidLoading = ref(false)
const dialogType = ref(null)
const isEditMode = ref(false)
const originalAmount = ref('')

const snack = ref({
  show: false,
  color: 'success',
  message: ''
})


const totalPaid = computed(() => {
  const entries = payments.value.filter(p => p.project === props.currentProjectId)
  return entries.reduce((acc, curr) => acc + curr.amount, 0)
})

const baseInvoiced = computed(() => {
  const entries = invoicing.value.filter(p => p.project === props.currentProjectId)
  return entries.reduce((acc, curr) => acc + curr.amount, 0)
})

const totalInvoiced = computed(() => {
  // console.log('marginAdjustedTotal:', props.marginAdjustedTotal)
  // return props.marginAdjustedTotal != null ? props.marginAdjustedTotal : baseInvoiced.value
    return baseInvoiced.value
})

const percentPaid = computed(() => {
  const invoiced = totalInvoiced.value
  const paid = totalPaid.value
  return invoiced === 0 ? 0 : Math.round((paid / invoiced) * 100)
})

const openInvoiceDialog = (type, edit = false) => {
  dialogType.value = type
  isEditMode.value = edit

  if (edit) {
    originalAmount.value = type === 'invoiced' ? totalInvoiced.value : totalPaid.value
  } else {
    originalAmount.value = 0
  }

  showInvoiceDialog.value = true
}

const updateInvoicing = async (newAmount) => {
  const isInvoiced = dialogType.value === 'invoiced'
  const project = props.currentProjectId

  if (!project) {
    console.error("No project ID found")
    return
  }

  const endpoint = isInvoiced
    ? '/invoice/post-general/invoicing'
    : '/invoice/post-general/payments'

  const payload = { project, amount: newAmount }
  if (isInvoiced) invoicedLoading.value = true
  else paidLoading.value = true

  try {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!res.ok) throw new Error('Failed to update')

    // Optimistically push new entry into store
    const entry = {
      project,
      amount: Number(newAmount),
      project_name: '' // you can optionally pull this from local context if needed
    }

    if (isInvoiced) invoiceStore.invoicing.push(entry)
    else invoiceStore.payments.push(entry)

    snack.value = {
      show: true,
      color: 'success',
      message: isInvoiced ? 'Invoice amount added successfully' : 'Payment recorded successfully'
    }

    showInvoiceDialog.value = false
  } catch (err) {
    console.error(err)
    snack.value = {
      show: true,
      color: 'error',
      message: 'Unable to save. Please try again.'
    }
  } finally {
    setTimeout(() => {
      if (isInvoiced) invoicedLoading.value = false
      else paidLoading.value = false
    }, 1500)
  }
}

const closeInvoiceDash = ()=>{
  showInvoiceDialog.value = false;
  functions.add = null;
}
watch(()=> functions.add, (newVal)=> {if(newVal) openInvoiceDialog(newVal)})
</script>

<style scoped>
.position-relative {
  position: relative;
}
.position-absolute {
  position: absolute;
  z-index: 999 !important;
}
.top-0 {
  top: 0;
}
.right-0 {
  right: 0;
}
</style>