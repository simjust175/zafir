<template>
  <v-dialog
    v-model="dialog"
    max-width="900"
    scrollable
  >
    <div class="invoice-dialog">
      <!-- Header -->
      <div class="dialog-header">
        <div class="header-left">
          <button class="back-btn" @click="$emit('close')">
            <v-icon size="20">mdi-arrow-left</v-icon>
          </button>
          <div class="header-info">
            <h2 class="supplier-name">{{ supplierName }}</h2>
            <span class="invoice-count">{{ invoiceArray.length }} invoice{{ invoiceArray.length !== 1 ? 's' : '' }}</span>
          </div>
        </div>
        <div class="header-actions">
          <button class="icon-btn" title="Print" @click="printInvoices">
            <v-icon size="18">mdi-printer-outline</v-icon>
          </button>
          <button class="icon-btn" title="Download" @click="downloadInvoices">
            <v-icon size="18">mdi-download-outline</v-icon>
          </button>
        </div>
      </div>

      <!-- Invoice Table -->
      <div class="dialog-content">
        <table v-if="invoiceArray.length > 0" class="invoice-table">
          <thead>
            <tr>
              <th>Date</th>
              <th class="text-right">Amount</th>
              <th class="text-center">VAT</th>
              <th class="text-center">Status</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="invoice in invoiceArray"
              :key="invoice.invoice_id"
              :class="{ 'row-highlight': invoice.id === updatedId }"
            >
              <td>
                <div class="date-cell">
                  <v-icon size="16" color="grey">mdi-calendar</v-icon>
                  {{ formatDate(invoice.invoice_date) }}
                </div>
              </td>
              <td class="text-right amount-cell">
                €{{ formatCurrency(invoice.amount) }}
              </td>
              <td class="text-center">
                <span v-if="invoice.btwPercent" class="vat-badge">
                  {{ invoice.btwPercent }}%
                </span>
                <span v-else class="vat-badge vat-none">N/A</span>
              </td>
              <td class="text-center">
                <button
                  class="status-btn"
                  :class="{ verified: invoice.double_checked }"
                  @click="handleVerifyClick(invoice)"
                >
                  <v-icon size="16">
                    {{ invoice.double_checked ? 'mdi-check-circle' : 'mdi-eye-check-outline' }}
                  </v-icon>
                  {{ invoice.double_checked ? 'Verified' : 'Verify' }}
                </button>
              </td>
              <td class="text-center">
                <div class="action-buttons">
                  <button class="action-btn view" title="View PDF" @click="previewPdf(invoice)">
                    <v-icon size="16">mdi-file-eye-outline</v-icon>
                  </button>
                  <button class="action-btn edit" title="Edit" @click="editItem(invoice)">
                    <v-icon size="16">mdi-pencil-outline</v-icon>
                  </button>
                  <button class="action-btn delete" title="Delete" @click="deleteItem(invoice)">
                    <v-icon size="16">mdi-delete-outline</v-icon>
                  </button>
                  <v-progress-circular
                    v-if="sendingId === invoice.id"
                    indeterminate
                    color="primary"
                    size="16"
                    width="2"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="empty-state">
          <v-icon size="48" color="grey-lighten-1">mdi-file-document-outline</v-icon>
          <p>No invoices found</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="dialog-footer">
        <span class="footer-label">Total with margin:</span>
        <span class="footer-total">€{{ totalWithMargin() }}</span>
      </div>
    </div>
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

  <snack-bar
    :banner="activateAlert"
    :label="alertLabel"
    color="success"
    icon="mdi-check-circle"
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
</template>

<script setup>
import SnackBar from '../SnackBar.vue';
import { ref, computed, watch, nextTick } from 'vue';
import { invoices as useInvoiceStore } from '@/stores/invoiceState.js';

const invoiceStore = useInvoiceStore();

const props = defineProps({
  active: Boolean,
  invoices: Array,
  actionStat: Boolean,
  sendingId: Number
});

defineEmits(['edit', 'delete', 'close']);

const invoiceArray = ref([]);
const dialog = computed(() => props.active);
const updatedId = ref(null);

const supplierName = computed(() => invoiceArray.value[0]?.issuer || 'Invoice Details');

watch(() => props.invoices, (updated) => invoiceArray.value = updated || []);

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return isNaN(d) ? 'N/A' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatCurrency = (value) => {
  return (Number(value) || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const totalWithMargin = () => {
  if (!invoiceArray.value?.length) return '0.00';

  const total = invoiceArray.value.reduce((sum, invoice) => {
    const amount = Number(invoice?.amount) || 0;
    const margin = Number(invoice?.margin) || 0;
    return sum + amount + (amount * margin / 100);
  }, 0);

  return formatCurrency(total);
};

const printInvoices = () => {};
const downloadInvoices = () => {};

const pdfDialog = ref(false);
const doubleCheckTrigger = ref(false);
const selectedUrl = ref('');
const selectedPdf = ref({});

const previewPdf = (file, doubleCheck = false) => {
  selectedUrl.value = file?.pdf_file || '';
  selectedPdf.value = file || {};
  pdfDialog.value = true;
  if (doubleCheck) doubleCheckTrigger.value = true;
};

const handleVerifyClick = (invoice) => {
  if (!invoice?.double_checked) {
    previewPdf(invoice, true);
  }
};

const closePdfDialog = () => {
  pdfDialog.value = false;
  doubleCheckTrigger.value = false;
};

const activateAlert = ref(false);
const alertLabel = ref("");

const editedIndex = ref(-1);
const editedItem = ref({});
const deletedId = ref();
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

function formatDateToMySQL(date) {
  return date.getFullYear() + '-' +
    String(date.getMonth() + 1).padStart(2, '0') + '-' +
    String(date.getDate()).padStart(2, '0') + ' ' +
    String(date.getHours()).padStart(2, '0') + ':' +
    String(date.getMinutes()).padStart(2, '0') + ':' +
    String(date.getSeconds()).padStart(2, '0');
}

const prepareEditChanges = ({ body, id }) => {
  const updatedBody = { ...body };

  if ('btwPercent' in updatedBody && 'amount' in updatedBody) {
    const currentInvoice = invoiceArray.value.find(inv => inv?.invoice_id === id);
    if (currentInvoice) {
      const netAmount = currentInvoice.btwPercent
        ? currentInvoice.amount / (1 + currentInvoice.btwPercent / 100)
        : currentInvoice.amount;

      updatedBody.amount = Number(
        (netAmount * (1 + (Number(updatedBody.btwPercent) || 0) / 100)).toFixed(2)
      );
    }
  }

  patchChanges({ id, body: updatedBody });
};

const deleteItem = (item) => {
  editedIndex.value = invoiceArray.value.indexOf(item);
  deletedId.value = { ...item };
  dialogDelete.value = true;
};

const deleteItemConfirm = (id) => {
  invoiceArray.value.splice(editedIndex.value, 1);  
  patchChanges({ id: id, body: { deleted_at: formatDateToMySQL(new Date()) } });
  activateAlert.value = true;
  setTimeout(() => {
    activateAlert.value = false;
  }, 2000);
  alertLabel.value = "Invoice successfully deleted.";
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

const handleDoubleCheck = (id) => {
  patchChanges({ id: id, body: { double_checked: formatDateToMySQL(new Date()) } });
  activateAlert.value = true;
  setTimeout(() => {
    activateAlert.value = false;
  }, 2000);
  alertLabel.value = "Invoice verified successfully.";
};

const patchChanges = async (changes) => {
  const { id, body } = changes;
  try {
    const result = await invoiceStore.updateInvoice(id, body);
    const index = invoiceArray.value.findIndex(inv => inv?.invoice_id === id || inv?.id === id);

    if (index !== -1) {
      Object.assign(invoiceArray.value[index], {
        ...invoiceArray.value[index],
        ...changes.body
      });
    }

    close();
    return result;
  } catch (storeErr) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/invoice/patch/invoices?id=${id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }
      );

      if (!response.ok) throw new Error('Failed to patch invoice');

      const data = await response.json();
      const index = invoiceArray.value.findIndex(inv => inv?.invoice_id === id || inv?.id === id);
      if (index !== -1) {
        Object.assign(invoiceArray.value[index], {
          ...invoiceArray.value[index],
          ...body
        });
      }

      close();
      return data;
    } catch (netErr) {
      throw netErr;
    }
  }
};
</script>

<style scoped>
.invoice-dialog {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 85vh;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e3e8ee;
  background: #fafbfc;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.back-btn:hover {
  background: #f0f2f5;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.supplier-name {
  font-size: 18px;
  font-weight: 600;
  color: #1a1f36;
  margin: 0;
}

.invoice-count {
  font-size: 13px;
  color: #697386;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid #e3e8ee;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #697386;
}

.icon-btn:hover {
  background: #f0f2f5;
  color: #1a1f36;
}

.dialog-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.invoice-table {
  width: 100%;
  border-collapse: collapse;
}

.invoice-table th {
  padding: 14px 20px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #697386;
  text-align: left;
  background: #fafbfc;
  border-bottom: 1px solid #e3e8ee;
  position: sticky;
  top: 0;
  z-index: 1;
}

.invoice-table th.text-right {
  text-align: right;
}

.invoice-table th.text-center {
  text-align: center;
}

.invoice-table tr {
  transition: background 0.15s ease;
}

.invoice-table tr:hover {
  background: #f7f9fc;
}

.invoice-table tr.row-highlight {
  background: #f0f7ff;
}

.invoice-table td {
  padding: 16px 20px;
  font-size: 14px;
  color: #1a1f36;
  border-bottom: 1px solid #f0f2f5;
  vertical-align: middle;
}

.date-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #697386;
}

.amount-cell {
  font-weight: 500;
}

.vat-badge {
  display: inline-block;
  padding: 3px 8px;
  font-size: 12px;
  font-weight: 500;
  background: #f0f2f5;
  color: #1a1f36;
  border-radius: 4px;
}

.vat-badge.vat-none {
  color: #697386;
}

.status-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  background: #fef3c7;
  color: #92400e;
}

.status-btn:hover {
  background: #fcd34d;
}

.status-btn.verified {
  background: #dcfce7;
  color: #166534;
  cursor: default;
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #697386;
}

.action-btn:hover {
  background: #f0f2f5;
}

.action-btn.view:hover {
  color: #3b82f6;
  background: #eff6ff;
}

.action-btn.edit:hover {
  color: #635bff;
  background: #f5f3ff;
}

.action-btn.delete:hover {
  color: #ef4444;
  background: #fef2f2;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #697386;
}

.empty-state p {
  margin-top: 12px;
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: #fafbfc;
  border-top: 1px solid #e3e8ee;
}

.footer-label {
  font-size: 14px;
  color: #697386;
}

.footer-total {
  font-size: 20px;
  font-weight: 600;
  color: #1a1f36;
}
</style>
