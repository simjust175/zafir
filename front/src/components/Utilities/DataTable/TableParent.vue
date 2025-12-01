<template>
  <v-container
    :class="{ 'pt-0': expanded }"
    fluid
  >
    <v-card
      class="pa-6 pt-1"
      flat
    >
      <v-container
        class="rounded-xl pa-1 pb-3"
        fluid
      >
        <v-row
          v-if="expanded"
          dense
        >
          <invoice-dash
            :current-project-id="project_id"
            :expanded="expanded"
          />
        </v-row>
      </v-container>
      <v-data-table
        hover
        scrollable="y"
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

        <template
          v-if="expanded"
          #top
        >
          <v-toolbar
            :class="themeColor"
            rounded="xl"
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
              :class="{ 'ml-3': !expanded }"
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
              :payments="invoiceArray.payments.filter(p => p.project === project_id)"
              :double-checked="invoiceArray.dbResponse.filter(i=> i.project === project_id).every(p => p.double_checked !== null )"
              :print="false"
            />
            <download-file
              :grouped-invoices="groupedInvoices"
              :project-name="projectName"
              :payments="invoiceArray.payments.filter(p => p.project === project_id)"
              :double-checked="invoiceArray.dbResponse.filter(i=> i.project === project_id).every(p => p.double_checked !== null )"
              :total="overallTotalWithMargin"
              :print="true"
            />
            <SendInvoice
              :grouped-invoices="groupedInvoices"
              :project-name="projectName"
              :current-project-id="project_id"
              :payments="invoiceArray.payments.filter(p => p.project === project_id)"
              :double-checked="invoiceArray.dbResponse.filter(i=> i.project === project_id).every(p => p.double_checked !== null )"
              :total="overallTotalWithMargin"
              @refresh-data="refreshComputedData"
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
          €{{ (item.totalAmount ?? 0).toFixed(2) }}
        </template>

        <template #item.totalWithMargin="{ item }">
          €{{ (item.totalWithMargin ?? 0).toFixed(2) }}
        </template>

        <template #item.totalMargin="{ item }">
          <margin-setter
            :item="item"
            @margin-update="(newMargin) => updateMargin(item, newMargin)"
          />
        </template>

        <template #item.actions>
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
    </v-card>

    <!-- Total Banner -->
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
      </div>
      €{{ overallTotalWithMargin }}
    </v-banner>

    <!-- Dialogs & Notifications -->
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

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { invoices as invoiceStore } from '@/stores/invoiceState.js';
import socket from '@/socket.js';

import InvoiceDash from "@/components/Invoicing-dash/InvoiceDash.vue"

const emit = defineEmits(['amountUpdate']);
const props = defineProps({
  invoices: { type: Array, default: () => [] },
  language: String,
  expanded: Boolean,
  projectName: String,
  project_id: Number,
  refreshing: Boolean,
  searchVal: String
});

// Refs & State
const invoiceArray = invoiceStore();
const search = ref('');
const expanded = ref(props.expanded);
const heightPerWindow = computed(() => (expanded.value ? '' : 405));
const dbContents = ref([]);
const loading = ref(true);
const sendingId = ref(null);
const SnackBarTrigger = ref(false);
const snackBarLabel = ref('');
const snackBarColor = ref('');
const snackBarIcon = ref('');
const activateInvoiceDetailDialog = ref(false);
const selectedInvoices = ref([]);
const selectedIssuer = ref('');
const updatedIssuer = ref(null);

watch(()=> props.searchVal, (newVal)=> search.value = newVal)
// Headers
const headers = computed(() => [
  { title: 'Supplier', key: 'issuer' },
  { title: 'Margin', key: 'totalMargin' },
  { title: 'Total + Margin', key: 'totalWithMargin' },
  { title: '', key: 'actions', sortable: false },
]);

// ✅ Fixed: Grouped Invoices (margin taken once per group, not summed)
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
    
    // Calculate total with margin per invoice (same logic as MainDisplayOverview)
    const totalWithMargin = invoices.reduce((sum, inv) => {
      const margin = Number(inv.margin || 0)
      return sum + Number(inv.amount || 0) * (1 + margin / 100)
    }, 0)
    
    // Calculate average margin for display
    const avgMargin = invoices.length > 0 
      ? invoices.reduce((sum, inv) => sum + Number(inv.margin || 0), 0) / invoices.length
      : 0; // only use first invoice’s margin

    return {
      issuer,
      invoices,
      totalAmount,
      totalMargin: avgMargin,
      totalWithMargin: totalWithMargin,
      marginChanged: false
    };
  });
});

const overallTotalWithMargin = computed(() => {  
  let total = 0;
  groupedInvoices.value.forEach(group => {
    console.log(group.issuer, group.totalWithMargin, group);
    total += group.totalWithMargin;
  });
  return Number(total.toFixed(2));
});

// Skeleton Loading Row Count
const skeletonRows = computed(() => {
  const count = props.invoices?.length || 10;
  return Math.min(Math.max(count, 3), 20);
});

// Initialize
const initialize = () => {
  loading.value = true;
  setTimeout(() => {
    dbContents.value = [...props.invoices];
    emit('amountUpdate');
    loading.value = false;
  }, 500);
};

// Handle Row Click
const openInvoiceDialog = (event, group) => {
  if (!group?.item) return;
  selectedInvoices.value = group.item.invoices;
  selectedIssuer.value = group.item.issuer;
  activateInvoiceDetailDialog.value = true;
};

// Update Margins
const updateMargin = (item, newMargin) => {
  dbContents.value.forEach(inv => {
    if (inv.issuer === item.issuer) {
      inv.margin = newMargin;
    }
  });
};

// Snackbar Trigger
const activateSnackBar = (label, color, icon = '') => {
  snackBarLabel.value = label;
  snackBarColor.value = color;
  snackBarIcon.value = icon;
  SnackBarTrigger.value = true;
  setTimeout(() => (SnackBarTrigger.value = false), 2000);
};

// Refresh computed data after store updates
const refreshComputedData = () => {
  // Trigger reactivity by updating dbContents from store
  dbContents.value = [...invoiceArray.dbResponse.filter(inv => inv.project === props.project_id)];
};

// Lifecycle: Mount + Socket Listener
const handleNewInvoice = (invoice) => {
  dbContents.value = [invoice, ...dbContents.value];
  invoiceArray.dbResponse = [invoice, ...invoiceArray.dbResponse];
  updatedIssuer.value = invoice.issuer;
  activateSnackBar('New email detected', 'success', 'mdi-email-newsletter');

  setTimeout(() => {
    updatedIssuer.value = null;
  }, 1500);
};

onMounted(() => {
  initialize();
  socket.off('new-invoice'); // Prevent multiple bindings
  socket.on('new-invoice', handleNewInvoice);
});

onUnmounted(() => {
  socket.off('new-invoice', handleNewInvoice);
});

// Watchers
watch(() => props.invoices, () => initialize(), { immediate: true });
watch(() => props.refreshing, () => initialize());

// Theme
import { globalFunctions } from '@/stores/globalFunctions.js';
const functions = globalFunctions()
const themeColor = computed(()=> functions.themeColor)
</script>

<style>
.bg-monday {
  background: #f0f3ff;
}
:deep(.v-data-table) {
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.05);
  background-color: var(--v-theme-surface);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

:deep(.v-data-table-header th) {
  background-color: rgba(0, 0, 0, 0.02);
  font-weight: 600;
}

:deep(.v-data-table tbody tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.08);
  cursor: pointer;
  transition: background 0.2s ease;
}
</style>