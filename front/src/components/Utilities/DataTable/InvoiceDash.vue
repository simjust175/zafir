<template>
  <v-container
    fluid
    class="pa-0"
  >
    <v-row dense>
      <v-col
        cols="12"
        md="4"
      >
        <v-card
          color="indigo-lighten-5"
          class="pa-4 rounded-xl position-relative"
          :loading="invoicedLoading"
          elevation="0"
        >
          <!-- Add Button -->
          <v-btn
            icon="mdi-plus"
            size="small"
            rounded="xl"
            density="comfortable"
            color="indigo-darken-2"
            variant="outlined"
            class="position-absolute top-0 right-0 mt-2 mr-2"
            @click="openInvoiceDialog"
          />
          <v-img
            src="../../../../public/invoice.png"
            height="50"
          />
          <div class="text-subtitle-1 text-center font-weight-medium text-grey-darken-2 mb-1 pt-1">
            Total Invoiced
          </div>
          <div class="text-h5 text-center font-weight-bold text-indigo">
            €{{ totalInvoiced }}
          </div>
        </v-card>
      </v-col>
  
      <!-- Total Paid -->
      <v-col
        cols="12"
        md="4"
      >
        <v-card
          color="green-lighten-5"
          class="pa-4 rounded-xl"
          elevation="0"
          :loading="paidLoading"
        >
          <v-btn
            icon="mdi-plus"
            size="small"
            rounded="xl"
            density="comfortable"
            color="green"
            variant="outlined"
            class="position-absolute top-0 right-0 mt-2 mr-2"
            @click="openInvoiceDialog"
          />
          <v-img
            src="../../../../public/paid.png"
            height="50"
          />
          <div class="text-subtitle-1 text-center font-weight-medium text-grey-darken-2 mb-1 pt-1">
            Total Paid
          </div>
          <div class="text-h5 text-center font-weight-bold text-green">
            €{{ totalPaid }}
          </div>
        </v-card>
      </v-col>
  
      <!-- Payment Completion -->
      <v-col
        cols="12"
        md="4"
      >
        <v-card
          color="blue-grey-lighten-5"
          class="pa-4 rounded-xl d-flex flex-column align-center"
          elevation="0"
        >
          <v-icon
            icon="mdi-percent-circle-outline"
            color="blue-grey-darken-2"
            size="50"
          />
          <div class="text-subtitle-1 font-weight-medium text-grey-darken-2 mb-1 pt-1">
            Client Payment
          </div>
          <v-progress-linear
            :model-value="percentPaid"
            height="12"
            color="blue-grey-darken-2"
            class="rounded-pill"
          />
          <div class="text-caption text-end text-blue-grey-darken-2 mt-1">
            {{ percentPaid }}%
          </div>
        </v-card>
      </v-col>
    </v-row>
  
    <!-- Optional: Add Invoice Dialog -->
    <v-dialog
      v-model="showInvoiceDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title>Add New Invoice</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newInvoiceAmount"
            label="Amount (€)"
            type="number"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="showInvoiceDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="submitInvoice"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<!-- eslint-disable vue/require-default-prop -->
<script setup>
import { computed, ref  } from 'vue';

const props = defineProps({
    dbContents: Array
});

// const totalInvoiced = ref(8000)
// const totalPaid = ref(6500)
// const percentPaid = ref(Math.round((totalPaid.value / totalInvoiced.value) * 100))

const showInvoiceDialog = ref(false)
const newInvoiceAmount = ref(null)
const invoicedLoading = ref(false)
const paidLoading = ref(false)

const openInvoiceDialog = () => {
  showInvoiceDialog.value = true
}

const submitInvoice = () => {
  if (!newInvoiceAmount.value) return
  totalInvoiced.value += parseFloat(newInvoiceAmount.value)
  percentPaid.value = Math.round((totalPaid.value / totalInvoiced.value) * 100)
  newInvoiceAmount.value = null
  showInvoiceDialog.value = false
}

//INVOICING CONTROL
const totalInvoiced = computed(() => {
  return props.dbContents.reduce((sum, inv) => {
    return sum + (inv.amount_invoiced || 0);
  }, 0).toFixed(2);
});

const totalPaid = computed(() => {
  return props.dbContents.reduce((sum, inv) => {
    return sum + (inv.amount_paid || 0);
  }, 0).toFixed(2);
});

const percentPaid = computed(() => {
  const invoiced = parseFloat(totalInvoiced.value);
  return invoiced === 0 ? 0 : Math.round((totalPaid.value / invoiced) * 100);
});

const update = async(item) => {
    const query = [{project: props.item.invoices[0].project}, {issuer: item.issuer}];
    if(localMargin.value === null) return null
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/invoice/patch/invoices?margin=${JSON.stringify(query)}`, {
        method: 'PATCH',
        headers: {'Content-Type' : 'application/json'},
        body: JSON.stringify({margin: localMargin.value})
    })
    if (!res.ok) {
      throw new Error('Failed to change margin')
    }
    loading.value = true
    setTimeout(() => {
        loading.value = false;
      }, 2000);
    const data = await res.json()
    console.log("Margin has been updated!!", data);
    
    // Reset changed flag
    // marginChangedMap.value[item.issuer] = false;
    // emit('marginUpdate', localMargin.value)
  };

</script>

<style scoped>
.position-relative {
  position: relative;
}
.position-absolute {
  position: absolute;
}
.top-0 {
  top: 0;
}
.right-0 {
  right: 0;
}
</style>