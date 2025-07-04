<template>
  <v-container
    :class="{ 'pt-0': !actionStat }"
    fluid
  >
    <v-card
      class="pa-6"
     
      elevation="3"
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
          <v-skeleton-loader type="table-row@10" />
        </template>

        <template #top>
          <v-toolbar
            class="bg-grey-lighten-5"
            flat
          >
            <v-toolbar-title>
              <v-icon
                v-if="actionStat"
                class="mb-4 mr-2"
                icon="mdi-arrow-left-circle"
                size="large"
                @click="$router.push('/')"
              />
              {{ actionStat ? 'Invoices' : 'All Invoices' }}
            </v-toolbar-title>

            <v-spacer />

            <v-text-field
              v-if="actionStat"
              v-model="search"
              density="compact"
              class="pr-4 rounded-b-pill"
              label="Search"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              hide-details
              single-line
            />

            <v-icon
              v-if="!actionStat"
              icon="mdi-arrow-expand"
              class="mr-5"
              color="blue-darken-1"
              @click="$router.push('/table')"
            />

            <DialogComponent
              :dialog-prop="dialogProp"
              :edited-item="editedItem"
              :form-title="formTitle"
              @close="close"
              @save="save"
            />

            <DeleteDialogComponent
              :dialog-delete="dialogDelete"
              @close-delete="closeDelete"
              @delete-item-confirm="deleteItemConfirm"
            />
            <InvoiceDetails
              :invoices="selectedInvoices"
              :active="activateInvoiceDetailDialog"
              :sending-id="sendingId"
              @close="activateInvoiceDetailDialog = false"
              @edit="editItem"
              @delete="deleteItem"
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
          {{ item.totalMargin.toFixed(2) }}%
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
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, defineProps, defineEmits } from 'vue';
import DialogComponent from './DialogComponent.vue';
import DeleteDialogComponent from './DeleteDialogComponent.vue';
import EmptyState from '../EmptyState.vue';
import { invoices as invoiceStore } from '@/stores/invoiceState';
import socket from '@/socket.js';

const emit = defineEmits(['amountUpdate']);
const props = defineProps({
  invoices: { type: Array, default: () => [] },
  language: String,
  actionStat: Boolean,
  employee: Number,
});

const invoiceArray = invoiceStore();
const search = ref('');
const dialogProp = ref(false);
const dialogDelete = ref(false);
const activateInvoiceDetailDialog = ref(false)
const actionStat = ref(props.actionStat);
const heightPerWindow = computed(() => (actionStat.value ? '' : 405));

const headers = computed(() => [
  { title: 'Issuer', key: 'issuer' },
  { title: 'Total', key: 'totalAmount' },
  { title: 'Margin', key: 'totalMargin' },
  { title: 'Total + Margin', key: 'totalWithMargin' },
  { title: '', key: 'actions', sortable: false },
]);

const dbContents = ref([]);
const loading = ref(true);
const editedIndex = ref(-1);
const editedItem = ref({});
const defaultItem = { issuer: '', amount: 0, created_at: '', includesBtw: false, btwPercent: null, margin: 0 };
const formTitle = computed(() => (editedIndex.value === -1 ? 'New Item' : 'Edit Item'));
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
      totalWithMargin: totalAmount + totalMargin,
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

const editItem = (item) => {
  editedIndex.value = dbContents.value.indexOf(item);
  editedItem.value = { ...item };
  dialogProp.value = true;
};

const deleteItem = (item) => {
  editedIndex.value = dbContents.value.indexOf(item);
  editedItem.value = { ...item };
  dialogDelete.value = true;
};

const sendInvoice = async (item) => {
  sendingId.value = item.id;
  await new Promise((resolve) => setTimeout(resolve, 1000));
  sendingId.value = null;
};

const deleteItemConfirm = () => {
  dbContents.value.splice(editedIndex.value, 1);
  closeDelete();
};

const close = () => {
  dialogProp.value = false;
  nextTick(() => {
    editedItem.value = { ...defaultItem };
    editedIndex.value = -1;
  });
};

const closeDelete = () => {
  dialogDelete.value = false;
  nextTick(() => {
    editedItem.value = { ...defaultItem };
    editedIndex.value = -1;
  });
};

const save = () => {
  if (editedIndex.value > -1) {
    Object.assign(dbContents.value[editedIndex.value], editedItem.value);
  } else {
    dbContents.value.push({ ...editedItem.value });
  }
  close();
};
</script>


