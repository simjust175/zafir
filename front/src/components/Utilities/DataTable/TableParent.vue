<template>
  <div class="table-surface">
    <header class="table-header">
      <div class="header-identity">
        <div class="title-row">
          <h1 class="project-title">
            {{ projectName }}
          </h1>
        </div>
        <span class="supplier-meta">{{ groupedInvoices.length }} {{ groupedInvoices.length === 1 ? 'supplier' : 'suppliers' }}</span>
      </div>
      <div class="header-controls">
        <ProjectMarginControl
          :project-id="project_id"
          :project-name="projectName"
          :margin-value="currentProjectMargin"
          :invoice-count="projectInvoices.length"
          @saved="handleMarginSaved"
        />
        <div class="search-field">
          <svg
            class="search-icon"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle
              cx="11"
              cy="11"
              r="8"
            />
            <line
              x1="21"
              y1="21"
              x2="16.65"
              y2="16.65"
            />
          </svg>
          <input
            v-model="search"
            type="text"
            class="search-input"
            placeholder="Search suppliers..."
          >
        </div>
        <div class="header-actions">
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
            :invoicing-entries="projectInvoicing"
            :project-margin="currentProjectMargin"
            @refresh-data="refreshComputedData"
          />
          <table-parent-toolbar-menu :project="invoiceArray" />
        </div>
      </div>
    </header>

    <router-link
      :to="`/billing/${project_id}/revenue`"
      class="metrics-link"
    >
      <div class="metrics-bar">
        <div class="metric-block">
          <span class="metric-label">Total Invoiced</span>
          <span class="metric-figure">{{ formatCurrency(totalInvoicedAmount) }}</span>
        </div>
        <div class="metric-separator" />
        <div class="metric-block">
          <span class="metric-label">Total Paid</span>
          <span class="metric-figure success">{{ formatCurrency(totalPaidAmount) }}</span>
        </div>
        <div class="metric-separator" />
        <div class="metric-block">
          <span class="metric-label">Outstanding</span>
          <span
            class="metric-figure"
            :class="{ success: outstandingBalance <= 0 }"
          >
            {{ formatCurrency(Math.abs(outstandingBalance)) }}
          </span>
        </div>
        <div class="metric-cta">
          <span>Manage Revenue</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>
    </router-link>

    <div class="table-body">
      <div
        v-if="loading"
        class="loading-container"
      >
        <div class="loading-spinner" />
        <span>Loading...</span>
      </div>

      <div
        v-else-if="filteredInvoices.length === 0"
        class="empty-container"
      >
        <div class="empty-visual">
          <div class="empty-shape">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path
                d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <polyline
                points="17 8 12 3 7 8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <line
                x1="12"
                y1="3"
                x2="12"
                y2="15"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>
        <h3 class="empty-heading">
          No invoices yet
        </h3>
        <p class="empty-text">
          Upload your first invoice to begin tracking costs for this project.
        </p>
        <router-link
          to="/upload"
          class="empty-action"
        >
          Upload invoice
        </router-link>
      </div>

      <table
        v-else
        class="data-table"
      >
        <thead>
          <tr>
            <th
              class="col-supplier"
              @click="sortBy('issuer')"
            >
              <span class="th-label">
                Supplier
                <svg
                  v-if="sortKey === 'issuer'"
                  class="sort-indicator"
                  :class="{ desc: sortOrder === 'desc' }"
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              </span>
            </th>
            <th
              class="col-amount"
              @click="sortBy('totalAmount')"
            >
              <span class="th-label">
                Amount
                <svg
                  v-if="sortKey === 'totalAmount'"
                  class="sort-indicator"
                  :class="{ desc: sortOrder === 'desc' }"
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              </span>
            </th>
            <th class="col-margin">
              Margin
            </th>
            <th
              class="col-total"
              @click="sortBy('totalWithMargin')"
            >
              <span class="th-label">
                Total
                <svg
                  v-if="sortKey === 'totalWithMargin'"
                  class="sort-indicator"
                  :class="{ desc: sortOrder === 'desc' }"
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              </span>
            </th>
            <th class="col-status">
              Status
            </th>
            <th class="col-chevron" />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="group in filteredInvoices"
            :key="group.issuer"
            class="data-row"
            :class="{ highlighted: updatedIssuer === group.issuer }"
            @click="openInvoiceDialog(group)"
          >
            <td class="col-supplier">
              <div class="supplier-cell">
                <div
                  class="supplier-avatar"
                  :style="{ background: getAvatarColor(group.issuer) }"
                >
                  {{ getInitials(group.issuer) }}
                </div>
                <div class="supplier-details">
                  <span class="supplier-name">{{ group.issuer }}</span>
                  <span class="invoice-count">{{ group.invoices.length }} invoice{{ group.invoices.length !== 1 ? 's' : '' }}</span>
                </div>
              </div>
            </td>
            <td class="col-amount">
              <span class="amount-text">{{ formatCurrency(group.totalAmount) }}</span>
            </td>
            <td
              class="col-margin"
              @click.stop
            >
              <margin-setter
                :item="group"
                @margin-update="(newMargin) => updateMargin(group, newMargin)"
              />
            </td>
            <td class="col-total">
              <span class="total-text">{{ formatCurrency(group.totalWithMargin) }}</span>
            </td>
            <td class="col-status">
              <span
                class="status-badge"
                :class="group.allChecked ? 'verified' : 'pending'"
              >
                {{ group.allChecked ? 'Verified' : 'Pending' }}
              </span>
            </td>
            <td class="col-chevron">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer class="table-footer">
      <span class="footer-meta">{{ filteredInvoices.length }} of {{ groupedInvoices.length }} suppliers</span>
      <div class="footer-total">
        <span class="total-label">Total</span>
        <span class="total-figure">{{ formatCurrency(overallTotalWithMargin) }}</span>
      </div>
    </footer>

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
import ProjectMarginControl from './ProjectMarginControl.vue';

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

watch(() => props.searchVal, (newVal) => search.value = newVal || '');

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

const projectInvoicing = computed(() => {
  return invoiceArray.invoicing?.filter(i => i.project === props.project_id) || [];
});

const totalInvoicedAmount = computed(() => {
  return projectInvoicing.value.reduce((sum, i) => sum + Number(i.amount || 0), 0);
});

const totalPaidAmount = computed(() => {
  return projectPayments.value.reduce((sum, p) => sum + Number(p.amount || 0), 0);
});

const outstandingBalance = computed(() => {
  return totalInvoicedAmount.value - totalPaidAmount.value;
});

const collectionPercent = computed(() => {
  if (totalInvoicedAmount.value === 0) return 0;
  return Math.min(100, Math.round((totalPaidAmount.value / totalInvoicedAmount.value) * 100));
});

const allInvoicesChecked = computed(() => {
  const projInv = projectInvoices.value;
  return projInv.length > 0 && projInv.every(i => i.double_checked !== null);
});

const currentProjectMargin = computed(() => {
  const projectData = invoiceArray.dbResponse?.find(inv => inv.project_id === props.project_id || inv.project === props.project_id);
  return Number(projectData?.margin) || 0;
});

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

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
};

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

const handleMarginSaved = ({ margin, projectId }) => {
  // Update margin for invoices without override in local state
  invoiceArray.dbResponse?.filter(inv => 
    (inv.project_id === projectId || inv.project === projectId) &&
    !inv.margin_override
  ).forEach(inv => {
    inv.margin = margin;
  });
  
  const updatedCount = projectInvoices.value.filter(inv => !inv.margin_override).length;
  
  snackBarLabel.value = updatedCount > 0 
    ? `Margin set to ${margin}% for ${updatedCount} invoice${updatedCount !== 1 ? 's' : ''}`
    : `Project margin set to ${margin}%`;
  snackBarColor.value = 'success';
  snackBarIcon.value = 'mdi-check';
  SnackBarTrigger.value = true;
  setTimeout(() => (SnackBarTrigger.value = false), 3500);
};

const refreshComputedData = () => {};

const handleNewInvoice = (invoice) => {
  if (!invoice) return;
  if (!invoice.invoice_id) return;
  if (!invoiceArray.dbResponse.find(i => i.invoice_id === invoice.invoice_id)) {
    invoiceArray.dbResponse.unshift({ ...invoice, amount: Number(invoice.amount), margin: Number(invoice.margin || 0) });
  }
  updatedIssuer.value = invoice.issuer;
  setTimeout(() => (updatedIssuer.value = null), 1500);
};

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
.table-surface {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgb(var(--v-theme-surface));
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}

.header-identity {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.project-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
  letter-spacing: -0.02em;
  text-transform: capitalize;
}

.margin-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6366f1;
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.margin-badge:hover {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  transform: translateY(-1px);
}

.add-margin-btn {
  padding: 4px 10px;
  font-size: 0.7rem;
  font-weight: 500;
  color: rgb(var(--v-theme-grey-500));
  background: rgba(var(--v-theme-on-surface), 0.04);
  border: 1px dashed rgba(var(--v-theme-on-surface), 0.15);
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-margin-btn:hover {
  color: rgb(var(--v-theme-on-surface));
  background: rgba(var(--v-theme-on-surface), 0.08);
  border-color: rgba(var(--v-theme-on-surface), 0.25);
}

.supplier-meta {
  font-size: 0.8125rem;
  color: rgb(var(--v-theme-grey-500));
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-field {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: rgb(var(--v-theme-grey-400));
  pointer-events: none;
}

.search-input {
  width: 220px;
  height: 38px;
  padding: 0 14px 0 40px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 10px;
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface));
  background: rgba(var(--v-theme-on-surface), 0.02);
  transition: all 0.15s ease;
}

.search-input:focus {
  outline: none;
  border-color: rgb(var(--v-theme-on-surface));
  background: rgb(var(--v-theme-surface));
}

.search-input::placeholder {
  color: rgb(var(--v-theme-grey-400));
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.metrics-link {
  display: block;
  text-decoration: none;
}

.metrics-link:hover .metrics-bar {
  background: rgba(var(--v-theme-on-surface), 0.03);
}

.metrics-link:hover .metric-cta {
  opacity: 1;
}

.metrics-link:hover .metric-cta svg {
  transform: translateX(2px);
}

.metrics-bar {
  display: flex;
  align-items: center;
  padding: 20px 28px;
  background: rgba(var(--v-theme-on-surface), 0.015);
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  transition: background 0.15s ease;
}

.metric-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 24px;
}

.metric-block:first-child {
  padding-left: 0;
}

.metric-label {
  font-size: 0.6875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgb(var(--v-theme-grey-500));
}

.metric-figure {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  letter-spacing: -0.01em;
}

.metric-figure.success {
  color: rgb(var(--v-theme-success));
}

.metric-separator {
  width: 1px;
  height: 32px;
  background: rgba(var(--v-theme-on-surface), 0.08);
}

.metric-cta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  padding: 10px 16px;
  background: rgb(var(--v-theme-on-surface));
  color: rgb(var(--v-theme-surface));
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 500;
  opacity: 0.9;
  transition: opacity 0.15s ease;
}

.metric-cta svg {
  transition: transform 0.15s ease;
}

.table-body {
  flex: 1;
  overflow-y: auto;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  gap: 12px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(var(--v-theme-on-surface), 0.1);
  border-top-color: rgb(var(--v-theme-on-surface));
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-container span {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-grey-500));
}

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
}

.empty-visual {
  margin-bottom: 20px;
}

.empty-shape {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: rgba(var(--v-theme-primary), 0.06);
  border-radius: 14px;
  color: rgb(var(--v-theme-primary));
}

.empty-heading {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 8px;
  letter-spacing: -0.01em;
}

.empty-text {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-grey-500));
  margin: 0 0 24px;
  max-width: 300px;
  line-height: 1.5;
}

.empty-action {
  display: inline-flex;
  padding: 12px 20px;
  background: rgb(var(--v-theme-on-surface));
  color: rgb(var(--v-theme-surface));
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: opacity 0.15s ease;
}

.empty-action:hover {
  opacity: 0.88;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  position: sticky;
  top: 0;
  background: rgba(var(--v-theme-on-surface), 0.02);
  z-index: 10;
}

.data-table th {
  padding: 14px 20px;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgb(var(--v-theme-grey-500));
  text-align: left;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  cursor: pointer;
  user-select: none;
  transition: color 0.12s ease;
}

.data-table th:hover {
  color: rgb(var(--v-theme-on-surface));
}

.th-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.sort-indicator {
  transition: transform 0.15s ease;
}

.sort-indicator.desc {
  transform: rotate(180deg);
}

.col-amount,
.col-total {
  text-align: right;
}

.col-margin,
.col-status {
  text-align: center;
}

.col-chevron {
  width: 48px;
  text-align: center;
}

.data-row {
  cursor: pointer;
  transition: background 0.12s ease;
}

.data-row:hover {
  background: rgba(var(--v-theme-on-surface), 0.02);
}

.data-row.highlighted {
  background: rgba(var(--v-theme-primary), 0.04);
  animation: row-highlight 1.5s ease;
}

@keyframes row-highlight {
  0% { background: rgba(var(--v-theme-primary), 0.1); }
  100% { background: rgba(var(--v-theme-primary), 0.04); }
}

.data-table td {
  padding: 16px 20px;
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface));
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.04);
  vertical-align: middle;
}

.supplier-cell {
  display: flex;
  align-items: center;
  gap: 14px;
}

.supplier-avatar {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.supplier-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.supplier-name {
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
}

.invoice-count {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-grey-400));
}

.amount-text {
  color: rgb(var(--v-theme-grey-600));
}

.total-text {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.status-badge {
  display: inline-flex;
  padding: 5px 10px;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  border-radius: 6px;
}

.status-badge.verified {
  background: rgba(var(--v-theme-success), 0.1);
  color: rgb(var(--v-theme-success));
}

.status-badge.pending {
  background: rgba(var(--v-theme-warning), 0.1);
  color: rgb(var(--v-theme-warning));
}

.col-chevron svg {
  color: rgb(var(--v-theme-grey-300));
  transition: color 0.12s ease;
}

.data-row:hover .col-chevron svg {
  color: rgb(var(--v-theme-grey-500));
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 28px;
  background: rgba(var(--v-theme-on-surface), 0.02);
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}

.footer-meta {
  font-size: 0.8125rem;
  color: rgb(var(--v-theme-grey-500));
}

.footer-total {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.total-label {
  font-size: 0.8125rem;
  color: rgb(var(--v-theme-grey-500));
}

.total-figure {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  letter-spacing: -0.02em;
}

@media (max-width: 1024px) {
  .col-margin,
  .data-table td.col-margin {
    display: none;
  }
  
  .metrics-bar {
    padding: 16px 20px;
  }
  
  .metric-block {
    padding: 0 16px;
  }
}

@media (max-width: 768px) {
  .table-header {
    flex-wrap: wrap;
    gap: 16px;
    padding: 20px;
  }
  
  .header-identity {
    width: 100%;
  }
  
  .header-controls {
    width: 100%;
    justify-content: space-between;
  }
  
  .search-field {
    flex: 1;
  }
  
  .search-input {
    width: 100%;
  }
  
  .metrics-bar {
    flex-wrap: wrap;
    gap: 16px;
    padding: 16px 20px;
  }
  
  .metric-separator {
    display: none;
  }
  
  .metric-block {
    flex: 1;
    min-width: 100px;
    padding: 0;
  }
  
  .metric-cta {
    flex: 1 1 100%;
    justify-content: center;
    margin-top: 8px;
  }
  
  .col-status,
  .data-table td.col-status {
    display: none;
  }
  
  .data-table td,
  .data-table th {
    padding: 12px 12px;
  }
  
  .table-footer {
    padding: 14px 20px;
  }
}

@media (max-width: 480px) {
  .col-amount,
  .data-table td.col-amount {
    display: none;
  }
  
  .supplier-avatar {
    width: 32px;
    height: 32px;
    font-size: 0.6875rem;
  }
  
  .supplier-cell {
    gap: 10px;
  }
}

.margin-dialog-premium {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.margin-dialog-premium .margin-dialog-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 24px 24px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.margin-dialog-premium .header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: #fff;
  flex-shrink: 0;
}

.margin-dialog-premium .header-text {
  flex: 1;
  min-width: 0;
}

.margin-dialog-premium .header-text h3 {
  margin: 0 0 4px;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f0f0f;
  letter-spacing: -0.02em;
}

.margin-dialog-premium .header-text p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.margin-dialog-premium .close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  border-radius: 10px;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.margin-dialog-premium .close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.margin-dialog-premium .margin-dialog-body {
  padding: 24px;
}

.margin-preview-card {
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
  border: 1px solid #e5e5e5;
  border-radius: 14px;
  padding: 16px 20px;
  margin-bottom: 24px;
}

.preview-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.preview-label {
  font-size: 0.8125rem;
  color: #6b7280;
  font-weight: 500;
}

.preview-value {
  font-size: 1.125rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.preview-value.current {
  color: #9ca3af;
}

.preview-value.new {
  color: #0f0f0f;
  transition: all 0.2s ease;
}

.preview-value.new.changed {
  color: #7c3aed;
}

.preview-divider {
  height: 1px;
  background: #e5e5e5;
  margin: 12px 0;
}

.margin-input-section {
  margin-bottom: 20px;
}

.input-label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.margin-slider-group {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.margin-slider {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(90deg, #e5e7eb 0%, #e5e7eb 100%);
  border-radius: 3px;
  outline: none;
}

.margin-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
  transition: transform 0.15s ease;
}

.margin-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}

.margin-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

.margin-dialog-premium .margin-input-wrapper {
  display: flex;
  align-items: center;
  background: #fff;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
  width: 100px;
  flex-shrink: 0;
}

.margin-dialog-premium .margin-input-wrapper:focus-within {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
}

.margin-dialog-premium .margin-input {
  flex: 1;
  width: 50px;
  height: 44px;
  padding: 0 8px 0 12px;
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f0f0f;
  background: transparent;
  border: none;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.margin-dialog-premium .margin-input:focus {
  outline: none;
}

.margin-dialog-premium .margin-suffix {
  padding: 0 12px 0 4px;
  font-size: 1rem;
  font-weight: 600;
  color: #9ca3af;
}

.quick-presets {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.preset-btn {
  height: 32px;
  padding: 0 14px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #6b7280;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.preset-btn:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.preset-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.info-callout {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 16px;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 10px;
}

.info-callout svg {
  color: #d97706;
  flex-shrink: 0;
  margin-top: 1px;
}

.info-callout span {
  font-size: 0.8125rem;
  color: #92400e;
  line-height: 1.5;
}

.margin-dialog-premium .margin-dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px 24px;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
}

.margin-dialog-premium .btn-cancel {
  height: 44px;
  padding: 0 24px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.margin-dialog-premium .btn-cancel:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.margin-dialog-premium .btn-save {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 24px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(102, 126, 234, 0.35);
}

.margin-dialog-premium .btn-save:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.45);
}

.margin-dialog-premium .btn-save:disabled {
  background: #d1d5db;
  box-shadow: none;
  cursor: not-allowed;
}

.spinner-sm {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
</style>
