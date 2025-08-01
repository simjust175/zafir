<template>
  <v-main>
    <v-dialog
      v-model="dialog"
      max-width="70%"
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
                  icon="mdi-check-circle-outline"
                  size="32"
                  :disabled="item.double_checked"
                  :color="item.double_checked ? 'success' : 'grey-lighten-2'"
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
    <pdf-viewer 
      :dialog="pdfDialog"
      :double-check="doubleCheckTrigger"
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
      @save="patchChanges($event)"
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
//THEME 
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
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_URL}/invoice/patch/invoices?id=${changes.id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes.body)
      }
    );

    if (!response.ok) throw new Error('Failed to patch invoice');
    const data = await response.json();
    // ✅ Always update the corresponding item by ID
    const index = invoiceArray.value.findIndex(inv => inv.invoice_id === changes.id);
    if (index !== -1) {
      Object.assign(invoiceArray.value[index], {
        ...invoiceArray.value[index],
        ...changes.body
      });
    }

    updatedId.value = changes.id; // 🚨 Highlight updated row
    setTimeout(() => {
      updatedId.value = null;
    }, 2000); // Reset highlight

    close();
    console.log('✅ Successfully patched:', data);
  } catch (error) {
    console.error('❌ Patch error:', error.message);
  }
};
</script>

<style scoped>

</style>