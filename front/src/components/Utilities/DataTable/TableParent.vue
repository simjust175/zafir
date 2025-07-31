<template>
  <v-container
    :class="{ 'pt-0': expanded }"
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
      class="pa-6 pt-1"
      flat
    >
      <v-container
        class="rounded-xl pa-1 pb-3"
        fluid
      >
        <v-row dense>
          <InvoiceDash :current-project-id="project_id" />
        </v-row>
      </v-container>
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
            :class="themeColor"
            flat
          >
            <v-toolbar-title
              v-if="expanded"
              class="text-capitalize text-h6 mx-8"
            >
              {{ projectName }}
            </v-toolbar-title>
            <v-spacer v-if="expanded" />


            <v-text-field
              v-model="search"
              density="compact"
              class="pr-4 rounded-b-pill"
              :class="{'ml-3': !expanded}"
              label="Search"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              hide-details
              single-line
            />
            <download-file
              class="ms-5"
              :grouped-invoices="groupedInvoices"
              :project-name="projectName"
              :total="overallTotalWithMargin"
              :print="false"
            />
            <download-file
              :grouped-invoices="groupedInvoices"
              :project-name="projectName"
              :total="overallTotalWithMargin"
              :print="true"
            />
            <SendInvoice
              :grouped-invoices="groupedInvoices"
              :project-name="projectName"
              :current-project-id="project_id"
              :total="overallTotalWithMargin"
            />
            <v-divider
              class="mx-2"
              inset
              vertical
            />
            <table-parent-toolbar-menu
              :project="invoices"
              class="pr-1"
            />
          </v-toolbar>
        </template>

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
            @margin-update="(newMargin)=>updateMargin(item, newMargin)"
          />
        </template>

        <template #item.actions>
          <!-- tool-tip -->
          <v-icon
            size="22"
            color="primary"
            class="ml-3"
          >
            mdi-unfold-more-horizontal
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
    <v-banner
      class="text-subtitle-1 d-flex justify-end align-center px-7 text-one-line"
      :class="themeColor"
    >
      <div
        class="d-flex align-center"
        style="height: 24px;"
      >
        <strong class="mx-4 text-capitalize d-flex align-center">
          Total for {{ projectName }}:
        </strong>
        <!-- <v-progress-linear
          :model-value="percentPaid"
          height="15"
          color="green"
          class="rounded-pill my-0"
          style="width: 150px;"
        >
          <template #default>
            {{ percentPaid }}% Paid
          </template>
        </v-progress-linear> -->
      </div>
      €{{ overallTotalWithMargin }}
    </v-banner>

    <InvoiceDetails
      :invoices="selectedInvoices"
      :active="activateInvoiceDetailDialog"
      :sending-id="sendingId"
      @close="activateInvoiceDetailDialog = false"
      @edit="editItem"
      @delete="deleteItem"
    />
    <snack-bar
      :banner="SnackBarTrigger"
      :label="snackBarLabel"
      :color="snackBarColor"
      :icon="snackBarIcon"
    />
  </v-container>
</template>

<!-- eslint-disable vue/require-default-prop -->
<script setup>
import { ref, computed, watch, onMounted, defineProps, defineEmits } from 'vue';
import EmptyState from '../EmptyState.vue';
import InvoiceDash from './InvoiceDash.vue';
import SendInvoice from '@/components/DownloadSendPrint/SendInvoice.vue';
//import FAB from './FAB.vue';
import { invoices as invoiceStore } from '@/stores/invoiceState';
import socket from '@/socket.js';

const emit = defineEmits(['amountUpdate']);
const props = defineProps({
  invoices: { type: Array, default: () => [] },
  language: String,
  expanded: Boolean,
  projectName: String,
  project_id: Number,
  refreshing: Boolean
});

const invoiceArray = invoiceStore();
const search = ref('');
const activateInvoiceDetailDialog = ref(false)
const expanded = ref(props.expanded);
const heightPerWindow = computed(() => (expanded.value ? '' : 405));

const headers = computed(() => [
  { title: 'Supplier', key: 'issuer' },
  // { title: 'Total', key: 'totalAmount' },
  { title: 'Margin', key: 'totalMargin' },
  { title: 'Total + Margin', key: 'totalWithMargin' },
  { title: '', key: 'actions', sortable: false },
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

// 🍫snackBar 🍫
const SnackBarTrigger = ref(false)
const snackBarLabel = ref("")
const snackBarColor = ref("")
const snackBarIcon = ref("")
const activateSnackBar = (label, color, icon="")=> {
  snackBarLabel.value = label
  snackBarColor.value = color
  snackBarIcon.value = icon
  SnackBarTrigger.value = true
  setTimeout(()=> SnackBarTrigger.value = false, 2000)
}
onMounted(() => {
  initialize();
  socket.on('new-invoice', (invoice) => {
    dbContents.value = [invoice, ...dbContents.value];
    invoiceArray.dbResponse = [invoice, ...invoiceArray.dbResponse];
    activateSnackBar('New email detected', 'success', 'mdi-email-newsletter');
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

// 🔃 Update the margin total (before reload)
const updateMargin = (item, newMargin) => {
  dbContents.value.forEach(inv => {
    if (inv.issuer === item.issuer) {
      inv.margin = newMargin;
    }
  });
};

//THEME 
import { useTheme } from "vuetify"
const theme = useTheme();
const themeColor = computed(() =>
  theme.global.name.value === 'dark' ? 'bg-grey-darken-3' : 'bg-grey-lighten-4'
);

// 🩻 animation
const skeletonRows = computed(() => {
  const count = props.invoices?.length || 10;
  return Math.min(Math.max(count, 3), 20); // Load between 3 and 20 skeletons
});
</script>


<style>

</style>



