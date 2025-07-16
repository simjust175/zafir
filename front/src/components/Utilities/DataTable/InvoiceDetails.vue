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
              <v-icon
                size="22"
                color="info"
                class="ml-3"
                @click="previewPdf(item.pdf_file)"
              >
                mdi-file-eye-outline
              </v-icon>

              <v-icon
                size="22"
                color="primary"
                class="ml-3"
                @click="editItem(item)"
              >
                mdi-pencil-outline
              </v-icon>

              <v-icon
                size="22"
                color="error"
                class="ml-3"
                @click="deleteItem(item)"
              >
                mdi-delete-outline
              </v-icon>

              <v-scale-transition>
                <v-progress-circular
                  v-if="sendingId === item.id"
                  indeterminate
                  color="success"
                  size="20"
                  class="ml-3"
                />
              </v-scale-transition>
            </template>
          </v-data-table>
        </v-card-text>

        <v-card-actions
          class="d-flex justify-end align-center bg-grey-lighten-4 text-grey-darken-3 ma-2 mt-0 px-4 py-0 rounded-md text-subtitle-1"
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
      :url="selectedUrl"
      @close="pdfDialog = false"
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
      :dialog-delete="dialogDelete"
      @close-delete="closeDelete"
      @delete-item-confirm="deleteItemConfirm($event)"
    />
  </v-main>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';

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
  { title: 'Date', key: 'invoice_date' },
  { title: 'Amount', key: 'amount' },
  { title: 'Btw', key: 'includesBtw' },
  { title: '(%)', key: 'btwPercent' },
  { title: '', key: 'actions', sortable: false }
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
const selectedUrl = ref('');

// const previewPdf = (fileName) => {
//   selectedUrl.value = `${import.meta.env.VITE_BASE_URL}/file/${fileName}?t=${Date.now()}`;
//   pdfDialog.value = true;
// };

const previewPdf = (fileName) => {
  selectedUrl.value = fileName;
  pdfDialog.value = true;
};

const printPdf = () => {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = selectedUrl.value;
  document.body.appendChild(iframe);
  iframe.onload = () => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  };
};

const downloadPdf = () => {
  const link = document.createElement('a');
  link.href = selectedUrl.value;
  link.download = selectedUrl.value.split('/').pop();
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const sendPdfByEmail = () => {
  alert("📨 This would trigger an email send function (hook up backend if needed)");
};

// ========== Edit ==========
const editedIndex = ref(-1);
const editedItem = ref({});
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
const deleteItem = (item) => {
  editedIndex.value = invoiceArray.value.indexOf(item);
  editedItem.value = { ...item };
  dialogDelete.value = true;
};

const deleteItemConfirm = (item) => {
  invoiceArray.value.splice(editedIndex.value, 1);
  console.log("item to delete:", item);
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

const save = () => {
  if (editedIndex.value > -1) {
    Object.assign(invoiceArray.value[editedIndex.value], editedItem.value);
  } else {
    invoiceArray.value.push({ ...editedItem.value });
  }
  close();
};

const patchChanges = async (changes) => {
  console.log("changes", changes);

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

    // 🔄 Instantly update UI
    if (editedIndex.value > -1) {
      Object.assign(invoiceArray.value[editedIndex.value], {
        ...invoiceArray.value[editedIndex.value],
        ...changes.body
      });
      updatedId.value = changes.id; // 🚨 Trigger highlight
      setTimeout(() => {
        updatedId.value = null;
      }, 2000); // Reset after 2s
    }

    close();
    console.log('✅ Successfully patched:', data);
  } catch (error) {
    console.error('❌ Patch error:', error.message);
  }
};
</script>

<style scoped>

</style>