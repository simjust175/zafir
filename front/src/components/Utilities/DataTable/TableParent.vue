<template>
  <v-container
    :class="{ 'pt-0': !actionStat }"
    fluid
  >
    <!-- <v-btn
        :disabled="loading"
        icon="mdi-refresh"
        text="Refresh"
        variant="outlined"
        @click="initialize"
      /> -->
    <v-card
      class="pa-6 pt-0"
      flat
    >
      <v-data-table
        :headers="headers"
        :items="groupedInvoices"
        item-value="issuer"
        :search="search"
        :sort-by="[{ key: 'created_at', order: 'desc' }]"
        hide-default-footer
        :max-height="heightPerWindow"
        :loading="dbContents.length === 0 ? loading : null"
        loading-text="Loading... Please wait"
        @click:row="openInvoiceDialog"
      >
        <template #loading>
          <v-skeleton-loader :type="`table-row@${skeletonRows}`" />
        </template>
        <template #top>
          <v-toolbar
            class="bg-grey-lighten-5"
            flat
          >
            <v-toolbar-title class="text-capitalize text-h6 text-grey-darken-4">
              {{ projectName }}
            </v-toolbar-title>
            <v-spacer />


            <v-text-field
              v-model="search"
              density="compact"
              class="pr-4 rounded-b-pill"
              label="Search"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              hide-details
              single-line
            />

            <v-btn
              class="ms-5"
              icon="mdi-printer-outline"
              @click="printPdf"
            />
            <v-btn
              icon="mdi-download-outline"
              @click="downloadPdf"
            />
            <v-btn
              icon="mdi-send-variant-outline"
              @click="sendPdfByEmail"
            />
            <v-divider
              class="mx-2"
              inset
              vertical
            />
           <table-parent-toolbar-menu />
          </v-toolbar>
        </template>

        <!-- <template #body>
          <transition-group
            name="fade-slide"
            tag="tbody"
          >
            <tr
              v-for="group in groupedInvoices"
              :key="group.issuer"
              :class="{ 'flash-row': group.issuer === updatedIssuer }"
              @click="openInvoiceDialog($event, { item: group })"
            >
              <td>{{ group.issuer }}</td>
              <td>€{{ group.totalAmount.toFixed(2) }}</td>
              <td>{{ group.totalMargin.toFixed(2) }}%</td>
              <td>€{{ group.totalWithMargin.toFixed(2) }}</td>
              <td>
                <v-icon
                  size="22"
                  color="success"
                  class="ml-3"
                  @click.stop="sendInvoice(group)"
                >
                  mdi-send
                </v-icon>
              </td>
            </tr>
          </transition-group>
        </template> -->


        <template #item.created_at="{ item }">
          {{ new Date(item.created_at).toLocaleDateString() }}
        </template>
        <template #item.totalAmount="{ item }">
          €{{ item.totalAmount.toFixed(2) }}
        </template>
        <template #item.totalWithMargin="{ item }">
          €{{ item.totalWithMargin.toFixed(2) }}
        </template>
        <template #item.totalMargin="{ item }">
          <margin-setter
            :item="item"
            @margin-change="item.totalMargin = $event"
          />
        </template>

        <template #item.actions="{ item }">
          <v-icon
            size="22"
            color="success"
            class="ml-3"
            @click.stop="sendInvoice(item)"
          >
            mdi-send
          </v-icon>
        </template>

        <template #no-data>
          <empty-state
            class="my-12"
            @refresh="initialize()"
          />
        </template>
      </v-data-table>

    <!-- Dialog to show InvoiceDetails -->
    
    <!-- <v-card>
        <v-toolbar color="primary" dark flat>
          <v-toolbar-title>Invoice Details for {{ selectedIssuer }}</v-toolbar-title>
          <v-spacer />
          <v-btn icon @click="detailsDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text> -->
    </v-card>
    <v-banner class="bg-grey-lighten-5 text-capitalize text-subtitle-1 d-flex justify-end px-7">
      <strong class="mx-4">Total for {{ projectName }}:</strong> €{{ overallTotalWithMargin }}
    </v-banner>
    <InvoiceDetails
      :invoices="selectedInvoices"
      :active="activateInvoiceDetailDialog"
      :sending-id="sendingId"
      @close="activateInvoiceDetailDialog = false"
      @edit="editItem"
      @delete="deleteItem"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted, defineProps, defineEmits } from 'vue';
import EmptyState from '../EmptyState.vue';
import { invoices as invoiceStore } from '@/stores/invoiceState';
import socket from '@/socket.js';

const emit = defineEmits(['amountUpdate']);
const props = defineProps({
  invoices: { type: Array, default: () => [] },
  language: String,
  actionStat: Boolean,
  projectName: String,
  refreshing: Boolean
});

const invoiceArray = invoiceStore();
const search = ref('');
const activateInvoiceDetailDialog = ref(false)
const actionStat = ref(props.actionStat);
const heightPerWindow = computed(() => (actionStat.value ? '' : 405));

const headers = computed(() => [
  { title: 'Supplier', key: 'issuer' },
  // { title: 'Total', key: 'totalAmount' },
  { title: 'Margin', key: 'totalMargin' },
  { title: 'Total + Margin', key: 'totalWithMargin' },
  // { title: '', key: 'actions', sortable: false },
]);

const dbContents = ref([]);
const loading = ref(true);
const sendingId = ref(null);

const groupedInvoices = computed(() => {
  const groups = {};
  dbContents.value.forEach(inv => {
    const issuer = inv.issuer || 'Unknown';
    if (!groups[issuer]) groups[issuer] = [];
    groups[issuer].push(inv);
  });

  return Object.keys(groups).map(issuer => {
    const invoices = groups[issuer];
    const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
    const totalMargin = invoices.reduce((sum, inv) => sum + Number(inv.margin || 0), 0);
    return {
      issuer,
      invoices,
      totalAmount,
      totalMargin,
      totalWithMargin: totalAmount + (totalAmount * (totalMargin/100)),
      marginChanged: false
    };
  });
});

// Dialog state and selected data
const detailsDialog = ref(false);
const selectedInvoices = ref([]);
const selectedIssuer = ref('');

const openInvoiceDialog = (event, group) => {
  activateInvoiceDetailDialog.value = !activateInvoiceDetailDialog.value  
  if (!group || !group.item) return;
  selectedInvoices.value = group.item.invoices;
  selectedIssuer.value = group.item.issuer;
  detailsDialog.value = true;
};

onMounted(() => {
  initialize();
  socket.on('new-invoice', (invoice) => {
    dbContents.value = [invoice, ...dbContents.value];
    invoiceArray.dbResponse = [invoice, ...invoiceArray.dbResponse];
  });
});

const initialize = () => {
  loading.value = true;
  setTimeout(() => {
    dbContents.value = [...props.invoices];
    emit('amountUpdate');
    loading.value = false;
  }, 500);
};


watch(
  () => props.invoices,
  () => initialize(),
  { immediate: true }
);

watch(()=> props.refreshing, ()=> initialize())


const sendInvoice = async (item) => {
  sendingId.value = item.id;
  await new Promise((resolve) => setTimeout(resolve, 1000));
  sendingId.value = null;
};

//animation !!
const updatedIssuer = ref(null);

socket.on('new-invoice', (invoice) => {
  updatedIssuer.value = invoice.issuer;
  dbContents.value = [invoice, ...dbContents.value];
  invoiceArray.dbResponse = [invoice, ...invoiceArray.dbResponse];

  setTimeout(() => {
    updatedIssuer.value = null;
  }, 1500); // Remove highlight after 1.5s
});
//Grand total per project 
const overallTotalWithMargin = computed(() => {
  return groupedInvoices.value.reduce((sum, group) => {
    return sum + group.totalWithMargin;
  }, 0).toFixed(2);
});
// 🩻 animation
const skeletonRows = computed(() => {
  const count = props.invoices?.length || 10;
  return Math.min(Math.max(count, 3), 20); // Load between 3 and 20 skeletons
});


</script>


<style scoped>
/* .v-field__field{
  height: 10px !important;
  background: red !important;
} */
hr.v-divider{
  background: red !important;
}
.v-input__details{
  color: rgb(121, 121, 230) !important;
  padding-inline: 0 !important;
}
</style>



