<template>
  <div class="table-container">
    <div class="table-header">
      <div class="header-left">
        <h1 class="project-title">{{ projectName }}</h1>
        <span class="supplier-count">{{ groupedInvoices.length }} suppliers</span>
      </div>
      <div class="header-right">
        <div class="search-wrapper">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input v-model="search" type="text" class="search-input" placeholder="Search..." />
        </div>
        <div class="action-buttons">
          <download-file
            :grouped-invoices="groupedInvoices"
            :project-name="projectName"
            :total="overallTotalWithMargin"
            :payments="projectPayments"
            :double-checked="allInvoicesChecked"
            :print="false"
          />
          <download-file
            :grouped-invoices="groupedInvoices"
            :project-name="projectName"
            :payments="projectPayments"
            :double-checked="allInvoicesChecked"
            :total="overallTotalWithMargin"
            :print="true"
          />
          <SendInvoice
            :grouped-invoices="groupedInvoices"
            :project-name="projectName"
            :current-project-id="project_id"
            :payments="projectPayments"
            :double-checked="allInvoicesChecked"
            :total="overallTotalWithMargin"
            @refresh-data="refreshComputedData"
          />
          <table-parent-toolbar-menu :project="invoiceArray" />
        </div>
      </div>
    </div>

    <div v-if="expanded" class="metrics-section">
      <invoice-dash
        :current-project-id="project_id"
        :expanded="expanded"
        :margin-adjusted-total="overallTotalWithMargin"
      />
    </div>

    <div class="table-content">
      <table v-if="!loading && filteredInvoices.length > 0" class="invoice-table">
        <thead>
          <tr>
            <th class="col-supplier" @click="sortBy('issuer')">
              <span class="th-content">
                Supplier
                <svg v-if="sortKey === 'issuer'" class="sort-icon" :class="{ desc: sortOrder === 'desc' }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              </span>
            </th>
            <th class="col-amount" @click="sortBy('totalAmount')">
              <span class="th-content">
                Amount
                <svg v-if="sortKey === 'totalAmount'" class="sort-icon" :class="{ desc: sortOrder === 'desc' }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              </span>
            </th>
            <th class="col-margin">Margin</th>
            <th class="col-total" @click="sortBy('totalWithMargin')">
              <span class="th-content">
                Total
                <svg v-if="sortKey === 'totalWithMargin'" class="sort-icon" :class="{ desc: sortOrder === 'desc' }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              </span>
            </th>
            <th class="col-status">Status</th>
            <th class="col-action" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="group in filteredInvoices" :key="group.issuer" class="invoice-row" :class="{ highlighted: updatedIssuer === group.issuer }" @click="openInvoiceDialog(group)">
            <td class="col-supplier">
              <div class="supplier-cell">
                <div class="supplier-avatar" :style="{ background: getAvatarColor(group.issuer) }">
                  {{ getInitials(group.issuer) }}
                </div>
                <div class="supplier-info">
                  <span class="supplier-name">{{ group.issuer }}</span>
                  <span class="invoice-meta">{{ group.invoices.length }} invoice{{ group.invoices.length !== 1 ? 's' : '' }}</span>
                </div>
              </div>
            </td>
            <td class="col-amount">
              <span class="amount-value">{{ formatCurrency(group.totalAmount) }}</span>
            </td>
            <td class="col-margin" @click.stop>
              <margin-setter :item="group" @margin-update="(newMargin) => updateMargin(group, newMargin)" />
            </td>
            <td class="col-total">
              <span class="total-value">{{ formatCurrency(group.totalWithMargin) }}</span>
            </td>
            <td class="col-status">
              <span class="status-pill" :class="group.allChecked ? 'verified' : 'pending'">
                {{ group.allChecked ? 'Verified' : 'Pending' }}
              </span>
            </td>
            <td class="col-action">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else-if="loading" class="state-container">
        <v-progress-circular indeterminate color="#171717" size="24" width="2" />
        <p>Loading...</p>
      </div>

      <div v-else class="state-container empty">
        <div class="empty-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <h3>No invoices yet</h3>
        <p>Upload your first invoice to get started</p>
      </div>
    </div>

    <div class="table-footer">
      <span class="footer-count">{{ filteredInvoices.length }} of {{ groupedInvoices.length }} suppliers</span>
      <div class="footer-total">
        <span class="total-label">Total</span>
        <span class="total-amount">{{ formatCurrency(overallTotalWithMargin) }}</span>
      </div>
    </div>

    <InvoiceDetails
      :invoices="selectedInvoices"
      :active="activateInvoiceDetailDialog"
      :sending-id="sendingId"
      @close="activateInvoiceDetailDialog = false"
    />

    <snack-bar
      :banner="SnackBarTrigger"
      :label="snackBarLabel"
      :color="snackBarColor"
      :icon="snackBarIcon"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { invoices as invoiceStore } from '@/stores/invoiceState.js';
import socket from '@/socket.js';
import InvoiceDash from "@/components/Invoicing-dash/InvoiceDash.vue";

const props = defineProps({
  invoices: { type: Array, default: () => [] },
  language: String,
  expanded: Boolean,
  projectName: String,
  project_id: Number,
  refreshing: Boolean,
  searchVal: String
});

const emit = defineEmits(['amountUpdate']);
const invoiceArray = invoiceStore();

const search = ref('');
const loading = ref(true);
const sendingId = ref(null);
const SnackBarTrigger = ref(false);
const snackBarLabel = ref('');
const snackBarColor = ref('');
const snackBarIcon = ref('');
const activateInvoiceDetailDialog = ref(false);
const selectedInvoices = ref([]);
const updatedIssuer = ref(null);
const sortKey = ref('issuer');
const sortOrder = ref('asc');

const avatarColors = ['#171717','#374151','#1e40af','#047857','#7c3aed','#be185d','#b45309','#0369a1','#4338ca','#0f766e'];

// Reactive search
watch(() => props.searchVal, (newVal) => search.value = newVal || '');

// --- COMPUTED SAFE SOURCES ---
const projectInvoices = computed(() => {
  const map = new Map();
  invoiceArray.dbResponse
    ?.filter(inv => inv.project === props.project_id)
    .forEach(inv => {
      if (!inv.invoice_id) return;
      map.set(inv.invoice_id, {
        ...inv,
        amount: Number(inv.amount) || 0,
        margin: Number(inv.margin) || 0
      });
    });
  return [...map.values()];
});

const groupedInvoices = computed(() => {
  const groups = {};
  projectInvoices.value.forEach(inv => {
    const issuer = inv.issuer?.trim() || 'Unknown';
    if (!groups[issuer]) groups[issuer] = { issuer, invoices: [], totalAmount: 0, totalWithMargin: 0, weightedMargin: 0, allChecked: true };
    const g = groups[issuer];
    g.invoices.push(inv);
    g.totalAmount += inv.amount;
    g.totalWithMargin += inv.amount * (1 + inv.margin / 100);
    if (inv.double_checked !== true) g.allChecked = false;
  });
  Object.values(groups).forEach(g => {
    g.weightedMargin = g.totalAmount > 0 ? ((g.totalWithMargin - g.totalAmount) / g.totalAmount) * 100 : 0;
  });
  return Object.values(groups);
});

const filteredInvoices = computed(() => {
  let results = [...groupedInvoices.value];
  if (search.value) {
    const query = search.value.toLowerCase();
    results = results.filter(g => g.issuer?.toLowerCase().includes(query));
  }
  results.sort((a, b) => {
    let aVal = a[sortKey.value];
    let bVal = b[sortKey.value];
    if (typeof aVal === 'string') { aVal = aVal.toLowerCase(); bVal = bVal?.toLowerCase() || ''; }
    return sortOrder.value === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
  });
  return results;
});

const overallTotalWithMargin = computed(() => {
  return Number(groupedInvoices.value.reduce((sum, g) => sum + g.totalWithMargin, 0).toFixed(2));
});

const projectPayments = computed(() => {
  return invoiceArray.payments?.filter(p => p.project === props.project_id) || [];
});

const allInvoicesChecked = computed(() => {
  const projInv = projectInvoices.value;
  return projInv.length > 0 && projInv.every(i => i.double_checked === true);
});

// --- UTILITY FUNCTIONS ---
const formatCurrency = (value) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(Number(value) || 0);

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

const getAvatarColor = (name) => {
  if (!name) return avatarColors[0];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
};

// --- ACTIONS ---
const openInvoiceDialog = (group) => {
  if (!group) return;
  selectedInvoices.value = group.invoices;
  activateInvoiceDetailDialog.value = true;
};

const updateMargin = (group, newMargin) => {
  group.invoices.forEach(inv => {
    invoiceArray.updateInvoice(inv.invoice_id, { margin: Number(newMargin) || 0 });
  });
};

const refreshComputedData = () => {
  // Reactive, safe: nothing else needed as projectInvoices/groupedInvoices recompute automatically
};

const handleNewInvoice = (invoice) => {
  if (!invoice) return;
  if (!invoice.invoice_id) return;
  // Inject safely into store, deduplicated
  if (!invoiceArray.dbResponse.find(i => i.invoice_id === invoice.invoice_id)) {
    invoiceArray.dbResponse.unshift({ ...invoice, amount: Number(invoice.amount), margin: Number(invoice.margin || 0) });
  }
  updatedIssuer.value = invoice.issuer;
  setTimeout(() => (updatedIssuer.value = null), 1500);
};

// --- LIFECYCLE ---
onMounted(() => {
  loading.value = false;
  socket.off('new-invoice');
  socket.on('new-invoice', handleNewInvoice);
});

onUnmounted(() => {
  socket.off('new-invoice', handleNewInvoice);
});

watch(() => props.invoices, () => { loading.value = false; }, { immediate: true });
watch(() => props.refreshing, () => { loading.value = false; });
</script>

<style scoped>
.table-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eaeaea;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.project-title {
  font-size: 20px;
  font-weight: 600;
  color: #171717;
  margin: 0;
  letter-spacing: -0.02em;
}

.supplier-count {
  font-size: 13px;
  color: #666;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: #999;
  pointer-events: none;
}

.search-input {
  width: 200px;
  height: 36px;
  padding: 0 12px 0 36px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  font-size: 14px;
  color: #171717;
  background: #fafafa;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #171717;
  background: #fff;
}

.search-input::placeholder {
  color: #999;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
}

.metrics-section {
  border-bottom: 1px solid #eaeaea;
}

.table-content {
  flex: 1;
  overflow-y: auto;
}

.invoice-table {
  width: 100%;
  border-collapse: collapse;
}

.invoice-table thead {
  position: sticky;
  top: 0;
  background: #fafafa;
  z-index: 10;
}

.invoice-table th {
  padding: 12px 16px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #666;
  text-align: left;
  border-bottom: 1px solid #eaeaea;
  cursor: pointer;
  user-select: none;
}

.invoice-table th:hover {
  color: #171717;
}

.th-content {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.sort-icon {
  transition: transform 0.2s ease;
}

.sort-icon.desc {
  transform: rotate(180deg);
}

.col-amount,
.col-total {
  text-align: right;
}

.col-margin,
.col-status,
.col-action {
  text-align: center;
}

.col-action {
  width: 48px;
}

.invoice-row {
  cursor: pointer;
  transition: background 0.15s ease;
}

.invoice-row:hover {
  background: #fafafa;
}

.invoice-row.highlighted {
  background: #f0f9ff;
  animation: highlight 1.5s ease;
}

@keyframes highlight {
  0% { background: #dbeafe; }
  100% { background: #f0f9ff; }
}

.invoice-table td {
  padding: 14px 16px;
  font-size: 14px;
  color: #171717;
  border-bottom: 1px solid #f5f5f5;
  vertical-align: middle;
}

.supplier-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.supplier-avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.supplier-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.supplier-name {
  font-weight: 500;
  color: #171717;
}

.invoice-meta {
  font-size: 12px;
  color: #999;
}

.amount-value {
  color: #666;
}

.total-value {
  font-weight: 600;
  color: #171717;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 16px;
}

.status-pill.verified {
  background: #ecfdf5;
  color: #059669;
}

.status-pill.pending {
  background: #fffbeb;
  color: #d97706;
}

.col-action svg {
  color: #d4d4d4;
  transition: color 0.15s ease;
}

.invoice-row:hover .col-action svg {
  color: #999;
}

.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.state-container p {
  margin-top: 12px;
  font-size: 14px;
  color: #999;
}

.state-container.empty .empty-icon {
  color: #d4d4d4;
  margin-bottom: 8px;
}

.state-container.empty h3 {
  font-size: 15px;
  font-weight: 500;
  color: #171717;
  margin: 0 0 4px;
}

.state-container.empty p {
  margin: 0;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #fafafa;
  border-top: 1px solid #eaeaea;
}

.footer-count {
  font-size: 13px;
  color: #666;
}

.footer-total {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.total-label {
  font-size: 13px;
  color: #666;
}

.total-amount {
  font-size: 20px;
  font-weight: 600;
  color: #171717;
  letter-spacing: -0.02em;
}

@media (max-width: 1024px) {
  .col-margin {
    display: none;
  }
  
  .invoice-table td.col-margin {
    display: none;
  }
}

@media (max-width: 768px) {
  .table-header {
    flex-wrap: wrap;
    gap: 12px;
    padding: 16px;
  }
  
  .header-left {
    width: 100%;
  }
  
  .header-right {
    width: 100%;
    justify-content: space-between;
  }
  
  .search-wrapper {
    flex: 1;
  }
  
  .search-input {
    width: 100%;
  }
  
  .action-buttons {
    flex-shrink: 0;
  }
  
  .invoice-table td,
  .invoice-table th {
    padding: 12px 8px;
  }
  
  .col-status {
    display: none;
  }
  
  .invoice-table td.col-status {
    display: none;
  }
  
  .supplier-avatar {
    width: 32px;
    height: 32px;
    font-size: 11px;
  }
  
  .table-footer {
    padding: 12px 16px;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .footer-total {
    gap: 8px;
  }
  
  .total-amount {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .action-buttons {
    gap: 4px;
  }
  
  .col-amount {
    display: none;
  }
  
  .invoice-table td.col-amount {
    display: none;
  }
  
  .supplier-cell {
    gap: 8px;
  }
  
  .supplier-name {
    font-size: 13px;
  }
  
  .invoice-meta {
    font-size: 11px;
  }
}
</style>
