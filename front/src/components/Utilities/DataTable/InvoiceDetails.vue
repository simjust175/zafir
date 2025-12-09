<template>
  <v-main>
    <v-dialog
      v-model="dialog"
      max-width="70vw"
      max-height="95%"
      scrollable="y"
    >
      <v-card class="pa-0">
        <v-toolbar class="pr-3">
          <template #prepend>
            <v-btn
              icon="mdi-arrow-left"
              @click="$emit('close')"
            />
          </template>
          <v-toolbar-title class="text-h6 text-grey-darken-5">
            {{ invoiceArray[0]?.issuer || 'Invoice Details' }}
          </v-toolbar-title>

          <!-- <v-btn
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
          /> -->
        </v-toolbar>

        <v-card-text>
          <v-data-table
            :headers="headers"
            :items="invoiceArray"
            class="elevation-0"
            density="comfortable"
            hide-default-footer
            style="max-width: 100%"
            :item-class="(item) => item.id === updatedId ? 'row-highlight' : ''"
          >
            <template #item.invoice_date="{ item }">
              {{ new Date(item.invoice_date).toLocaleDateString() }}
            </template>

            <template #item.amount="{ item }">
              €{{ item.amount }}
            </template>

            <template #item.includesBtw="{ item }">
              {{ item.btwPercent ? 'included' : 'excluded' }}
            </template>

            <template #item.btwPercent="{ item }">
              {{ item.btwPercent ? `${item.btwPercent}%` : '' }}
            </template>

            <template #item.actions="{ item }">
              <div class="d-flex flex-row flex-nowrap align-center ga-2">
                <v-icon
                  size="22"
                  color="info"
                  @click="previewPdf(item)"
                >
                  mdi-file-eye-outline
                </v-icon>

                <v-icon
                  size="22"
                  color="primary"
                  @click="editItem(item)"
                >
                  mdi-pencil-outline
                </v-icon>

                <v-icon
                  size="22"
                  color="error"
                  @click="deleteItem(item, false)"
                >
                  mdi-delete-outline
                </v-icon>

                <v-scale-transition>
                  <v-progress-circular
                    v-if="sendingId === item.id"
                    indeterminate
                    color="success"
                    size="20"
                  />
                </v-scale-transition>
              </div>
            </template>

            <template #item.check="{ item }">
              <div class="d-flex align-center justify-center">
                <v-icon
                  :icon="item.double_checked ? 'mdi-check-circle-outline' : 'mdi-eye-check-outline'"
                  size="32"
                  :disabled="item.double_checked"
                  :color="item.double_checked ? 'success' : 'warning'"
                  class="ml-3"
                  @click="previewPdf(item, true)"
                />
              </div>
            </template>
            <template #no-data>
              <empty-state
                class="my-12"
                @refresh="initialize()"
              />
            </template>
          </v-data-table>
        </v-card-text>

        <v-card-actions
          class="d-flex justify-end align-center ma-2 mt-0 px-4 py-0 rounded-md text-subtitle-1"
          :class="themeColor"
        >
          <div class="d-flex pr-2 ga-2">
            <strong>Total: </strong> €{{ totalWithMargin() }}
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- PDF Viewer Dialog -->
    <pdf-viewer-dialog
      :dialog="pdfDialog"
      :double-check="doubleCheckTrigger"
      :mode="doubleCheckTrigger ? 'double-check' : 'normal'"
      :url="selectedUrl"
      :file-details="selectedPdf"
      @close="closePdfDialog"
      @close-double-check="doubleCheckTrigger = false"
      @double-checked="handleDoubleCheck"
    />
    <!-- <alert-prop 
      :alert="activateAlert"
      type="success"
      :label="alertLabel"
      :closable="true"
    /> -->
    <snack-bar
      :icon="mdi-check-circle"
      :banner="activateAlert"
      :label="alertLabel"
      color="success"
    />
   
    <dialog-component
      :dialog-prop="triggerDialog"
      :edited-item="editedItem"
      :original-item="{ ...editedItem }"
      :form-title="formTitle"
      @close="close"
      @save="prepareEditChanges"
    />

    <DeleteDialogComponent
      :id="deletedId"
      :edited-index="editedIndex"
      :dialog-delete="dialogDelete"
      @close-delete="closeDelete"
      @delete-item-confirm="deleteItemConfirm($event)"
    />
  </v-main>
</template>

<!-- eslint-disable vue/require-default-prop -->
<script setup>
import SnackBar from '../SnackBar.vue';
import { ref, computed, watch, nextTick } from 'vue';
import { invoices as useInvoiceStore } from '@/stores/invoiceState.js'; // adjust path if your stores folder differs
const invoiceStore = useInvoiceStore();
import { useTheme } from "vuetify"
  const theme = useTheme();
  const themeColor = computed(() =>
  theme.global.name.value === 'dark' ? 'bg-grey-darken-3' : 'bg-grey-lighten-4'
);


const props = defineProps({
  active: Boolean,
  invoices: Array,
  actionStat: Boolean,
  sendingId: Number
});

defineEmits(['edit', 'delete', 'close']);

const invoiceArray = ref([]);
const dialog = computed(() => props.active);
const headers = [
  { title: 'Generated on', key: 'invoice_date' },
  { title: 'Amount', key: 'amount' },
  { title: 'Btw', key: 'includesBtw' },
  { title: '(%)', key: 'btwPercent' },
  { title: '', key: 'actions', sortable: false },
  { title: 'Double-checked', key: 'check', sortable: false }
];

watch(() => props.invoices, (updated) => invoiceArray.value = updated);

const totalWithMargin = () => {
  if (!invoiceArray.value.length) return '0.00';

  const total = invoiceArray.value.reduce((sum, invoice) => {
    const amount = Number(invoice.amount) || 0;
    const margin = Number(invoice.margin) || 0;
    return sum + amount + (amount * margin / 100);
  }, 0);

  return total.toFixed(2);
};

const updatedId = ref(null); // 🟡 Highlight tracker

// ========== PDF Preview ==========
const pdfDialog = ref(false);
const doubleCheckTrigger = ref(false)
const selectedUrl = ref('');
const selectedPdf = ref({})

// const previewPdf = (fileName) => {
//   selectedUrl.value = `${import.meta.env.VITE_BASE_URL}/file/${fileName}?t=${Date.now()}`;
//   pdfDialog.value = true;
// };

const previewPdf = (file, doubleCheck) => {
  selectedUrl.value = file.pdf_file;
  selectedPdf.value = file;
  pdfDialog.value = true;
  if(doubleCheck) doubleCheckTrigger.value = true
};

const closePdfDialog = () => {
  pdfDialog.value = false;
  doubleCheckTrigger.value = false;
}
//⚠️alert prop
const activateAlert = ref(false)
const alertLabel = ref("");

// ========== Edit ==========
const editedIndex = ref(-1);
const editedItem = ref({});
const deletedId = ref()
const triggerDialog = ref(false);
const dialogDelete = ref(false);
const defaultItem = {
  issuer: '',
  amount: 0,
  created_at: '',
  includesBtw: false,
  btwPercent: null,
  margin: 0
};

const formTitle = computed(() =>
  editedIndex.value === -1 ? 'New Item' : 'Edit Item'
);

const editItem = (item) => {
  editedIndex.value = invoiceArray.value.indexOf(item);
  editedItem.value = { ...item };
  triggerDialog.value = true;
};

// ========== Delete ==========
function formatDateToMySQL(date) {
  return date.getFullYear() + '-' +
    String(date.getMonth() + 1).padStart(2, '0') + '-' +
    String(date.getDate()).padStart(2, '0') + ' ' +
    String(date.getHours()).padStart(2, '0') + ':' +
    String(date.getMinutes()).padStart(2, '0') + ':' +
    String(date.getSeconds()).padStart(2, '0');
}

const prepareEditChanges = ({ body, id }) => {
  console.log("event in prepare", body, id);
  
  const updatedBody = { ...body };

  // If btwPercent changed and amount exists
  if ('btwPercent' in updatedBody && 'amount' in updatedBody) {
    const currentInvoice = invoiceArray.value.find(inv => inv.invoice_id === id);
    if (currentInvoice) {
      // Determine net amount without BTW
      const netAmount = currentInvoice.btwPercent
        ? currentInvoice.amount / (1 + currentInvoice.btwPercent / 100)
        : currentInvoice.amount;

      // Apply new BTW percent
      updatedBody.amount = Number(
        (netAmount * (1 + (Number(updatedBody.btwPercent) || 0) / 100)).toFixed(2)
      );
    }
  }

  patchChanges({ id, body: updatedBody });
};

const deleteItem = (item) => {
  editedIndex.value = invoiceArray.value.indexOf(item);
  deletedId.value = {...item};
  dialogDelete.value = true;
};

const deleteItemConfirm = (id) => {
  invoiceArray.value.splice(editedIndex.value, 1);  
  patchChanges({id: id, body: { deleted_at: formatDateToMySQL(new Date()) } });
 activateAlert.value = true
    setTimeout(()=>{
     activateAlert.value = false
    }, 2000)
  alertLabel.value = "Invoice successfully deleted."
  closeDelete();
};

const close = () => {
  triggerDialog.value = false;
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

const handleDoubleCheck = (id)=> {
  patchChanges({id: id, body: { double_checked : formatDateToMySQL(new Date()) } });
   activateAlert.value = true
    setTimeout(()=>{
     activateAlert.value = false
    }, 2000)
   alertLabel.value = "Thanks for double checking!."
}

const save = () => {
  if (editedIndex.value > -1) {
    Object.assign(invoiceArray.value[editedIndex.value], editedItem.value);
  } else {
    invoiceArray.value.push({ ...editedItem.value });
  }
  close();
};

const patchChanges = async (changes) => {
  const { id, body } = changes;
  try {
    // Try to use the store (optimistic updates + sync)
    console.log("➡️ patchChanges using invoiceStore.updateInvoice", id, body);
    const result = await invoiceStore.updateInvoice(id, body);
    const index = invoiceArray.value.findIndex(inv => inv.invoice_id === id || inv.id === id);

    if (index !== -1) {
      Object.assign(invoiceArray.value[index], {
        ...invoiceArray.value[index],
        ...changes.body
      });
      // // If store returned an updated object, use it; otherwise merge the changes.
      // if (result && typeof result === 'object') {
      //   //Object.assign(invoiceArray.value[index], result);
      //   invoiceArray.value[index] = { ...invoiceArray.value[index], ...result };
      // } else {
      //   //Object.assign(invoiceArray.value[index], { ...invoiceArray.value[index], ...body });
      //   invoiceArray.value[index] = { ...invoiceArray.value[index], ...body };
      // }
    }

    close();
    console.log('✅ Successfully edited via store:', result);
    return result;
  } catch (storeErr) {
    // If store update fails for any reason, fall back to the old network path (preserves behaviour)
    console.warn('⚠️ invoiceStore.updateInvoice failed, falling back to direct PATCH:', storeErr);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/invoice/patch/invoices?id=${id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }
      );

      if (!response.ok) throw new Error('Failed to patch invoice (fallback)');

      const data = await response.json();

      // Ensure local invoiceArray gets updated (same logic as before)
      const index = invoiceArray.value.findIndex(inv => inv.invoice_id === id || inv.id === id);
      if (index !== -1) {
        Object.assign(invoiceArray.value[index], {
          ...invoiceArray.value[index],
          ...body
        });
      }

      close();
      console.log('✅ Successfully edited (fallback):', data);
      return data;
    } catch (netErr) {
      console.error('❌ Patch error (fallback):', netErr.message || netErr);
      // keep UI stable — don't close dialog so user can retry
      throw netErr;
    }
  }
};
</script>

<style scoped>

</style>