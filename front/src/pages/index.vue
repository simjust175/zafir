<template>
  <div class="dashboard">
    <header class="dash-header">
      <div class="header-content">
        <span class="header-label">Financial Overview</span>
        <h1 class="header-title">
          Dashboard
        </h1>
      </div>
      <div class="header-period">
        <button 
          v-for="period in periods" 
          :key="period.value"
          class="period-btn"
          :class="{ active: activePeriod === period.value }"
          @click="activePeriod = period.value"
        >
          {{ period.label }}
        </button>
      </div>
    </header>

    <section class="summary-row">
      <div class="summary-card">
        <div class="card-header">
          <span class="card-label">Outstanding Invoices</span>
          <div class="card-icon outgoing">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
            >
              <path
                d="M9 14V4M9 14l3.5-3.5M9 14l-3.5-3.5"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>
        <div class="card-value">
          {{ formatCurrency(outstandingInvoices) }}
        </div>
        <div class="card-meta">
          <span class="meta-count">{{ unpaidInvoiceCount }} unpaid</span>
          <span class="meta-label">expenses to pay</span>
        </div>
      </div>

      <div class="summary-card">
        <div class="card-header">
          <span class="card-label">Outstanding Invoicing</span>
          <div class="card-icon incoming">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
            >
              <path
                d="M9 4v10M9 4l3.5 3.5M9 4l-3.5 3.5"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>
        <div class="card-value">
          {{ formatCurrency(outstandingInvoicing) }}
        </div>
        <div class="card-meta">
          <span class="meta-count">{{ unpaidInvoicingCount }} pending</span>
          <span class="meta-label">revenue to collect</span>
        </div>
      </div>

      <div class="summary-card">
        <div class="card-header">
          <span class="card-label">Total Received</span>
          <div class="card-icon success">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
            >
              <path
                d="M15 5L7.5 12.5 4 9"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>
        <div class="card-value success">
          {{ formatCurrency(totalReceived) }}
        </div>
        <div class="card-meta">
          <span class="meta-label">collected this period</span>
        </div>
      </div>

      <div class="summary-card">
        <div class="card-header">
          <span class="card-label">Total Paid Out</span>
          <div class="card-icon neutral">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
            >
              <rect
                x="3"
                y="6"
                width="12"
                height="8"
                rx="1.5"
                stroke="currentColor"
                stroke-width="1.5"
              />
              <path
                d="M6 6V4.5A1.5 1.5 0 017.5 3h3A1.5 1.5 0 0112 4.5V6"
                stroke="currentColor"
                stroke-width="1.5"
              />
            </svg>
          </div>
        </div>
        <div class="card-value">
          {{ formatCurrency(totalPaid) }}
        </div>
        <div class="card-meta">
          <span class="meta-label">paid to vendors</span>
        </div>
      </div>
    </section>

    <section class="content-grid">
      <div class="content-block">
        <div class="block-header">
          <h2 class="block-title">
            Money In
          </h2>
          <span class="block-subtitle">Client payments and revenue</span>
        </div>
        <div class="block-content">
          <div class="flow-visual incoming">
            <div
              class="flow-bar"
              :style="{ width: incomeProgress + '%' }"
            />
          </div>
          <div class="flow-stats">
            <div class="stat-item">
              <span class="stat-value">{{ formatCurrency(totalInvoicing) }}</span>
              <span class="stat-label">Invoiced</span>
            </div>
            <div class="stat-item">
              <span class="stat-value success">{{ formatCurrency(totalReceived) }}</span>
              <span class="stat-label">Received</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ incomeProgress }}%</span>
              <span class="stat-label">Collected</span>
            </div>
          </div>
        </div>
        <router-link
          to="/outgoing"
          class="block-action"
        >
          View all invoicing
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M6 4l4 4-4 4"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </router-link>
      </div>

      <div class="content-block">
        <div class="block-header">
          <h2 class="block-title">
            Money Out
          </h2>
          <span class="block-subtitle">Vendor invoices and expenses</span>
        </div>
        <div class="block-content">
          <div class="flow-visual outgoing">
            <div
              class="flow-bar"
              :style="{ width: expenseProgress + '%' }"
            />
          </div>
          <div class="flow-stats">
            <div class="stat-item">
              <span class="stat-value">{{ formatCurrency(totalInvoices) }}</span>
              <span class="stat-label">Invoiced</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ formatCurrency(totalPaid) }}</span>
              <span class="stat-label">Paid</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ expenseProgress }}%</span>
              <span class="stat-label">Settled</span>
            </div>
          </div>
        </div>
        <router-link
          to="/incoming"
          class="block-action"
        >
          View all invoices
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M6 4l4 4-4 4"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </router-link>
      </div>
    </section>

    <section class="activity-section">
      <div class="section-header">
        <h2 class="section-title">
          Recent Activity
        </h2>
        <router-link
          to="/payments"
          class="section-link"
        >
          View all
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M6 4l4 4-4 4"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </router-link>
      </div>
      <div class="activity-list">
        <div
          v-if="recentActivity.length === 0"
          class="empty-activity"
        >
          <span class="empty-text">No recent activity</span>
        </div>
        <div
          v-for="(item, index) in recentActivity"
          v-else
          :key="index"
          class="activity-item"
        >
          <div
            class="activity-icon"
            :class="item.type"
          >
            <svg
              v-if="item.type === 'incoming'"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M8 3v10M8 3l3 3M8 3L5 6"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <svg
              v-else
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M8 13V3M8 13l3-3M8 13L5 10"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div class="activity-content">
            <span class="activity-title">{{ item.title }}</span>
            <span class="activity-meta">{{ item.meta }}</span>
          </div>
          <div
            class="activity-amount"
            :class="item.type"
          >
            {{ item.type === 'incoming' ? '+' : '-' }}{{ formatCurrency(item.amount) }}
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { invoices } from '@/stores/invoiceState.js'

const invoiceStore = invoices()

const activePeriod = ref('month')
const periods = [
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' }
]

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-BE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val || 0)

const totalInvoices = computed(() => {
  return (invoiceStore.dbResponse || [])
    .filter(inv => inv.invoice_id)
    .reduce((sum, inv) => sum + Number(inv.amount || 0), 0)
})

const totalInvoicing = computed(() => {
  return (invoiceStore.invoicing || []).reduce((sum, inv) => sum + Number(inv.amount || 0), 0)
})

const totalReceived = computed(() => {
  return (invoiceStore.payments || []).reduce((sum, inv) => sum + Number(inv.amount || 0), 0)
})

const totalPaid = computed(() => {
  return (invoiceStore.dbResponse || [])
    .filter(inv => inv.paid)
    .reduce((sum, inv) => sum + Number(inv.amount || 0), 0)
})

const outstandingInvoices = computed(() => {
  return (invoiceStore.dbResponse || [])
    .filter(inv => inv.invoice_id && !inv.paid)
    .reduce((sum, inv) => sum + Number(inv.amount || 0), 0)
})

const outstandingInvoicing = computed(() => {
  const invoiced = (invoiceStore.invoicing || []).reduce((sum, inv) => sum + Number(inv.amount || 0), 0)
  const received = (invoiceStore.payments || []).reduce((sum, inv) => sum + Number(inv.amount || 0), 0)
  return Math.max(0, invoiced - received)
})

const unpaidInvoiceCount = computed(() => {
  return (invoiceStore.dbResponse || []).filter(inv => inv.invoice_id && !inv.paid).length
})

const unpaidInvoicingCount = computed(() => {
  return (invoiceStore.invoicing || []).length - (invoiceStore.payments || []).length
})

const incomeProgress = computed(() => {
  if (!totalInvoicing.value) return 0
  return Math.min(100, Math.round((totalReceived.value / totalInvoicing.value) * 100))
})

const expenseProgress = computed(() => {
  if (!totalInvoices.value) return 0
  return Math.min(100, Math.round((totalPaid.value / totalInvoices.value) * 100))
})

const recentActivity = computed(() => {
  const items = []
  
  const payments = (invoiceStore.payments || []).slice(0, 3)
  payments.forEach(p => {
    items.push({
      type: 'incoming',
      title: `Payment received`,
      meta: p.project_name || 'Project',
      amount: p.amount
    })
  })
  
  const invoices = (invoiceStore.dbResponse || []).filter(i => i.paid).slice(0, 3)
  invoices.forEach(i => {
    items.push({
      type: 'outgoing',
      title: `Invoice paid`,
      meta: i.issuer || 'Vendor',
      amount: i.amount
    })
  })
  
  return items.slice(0, 5)
})

onMounted(async () => {
  await invoiceStore.refreshInvoices()
})
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 8px;
}

.dash-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 48px 0 40px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  margin-bottom: 40px;
}

.header-label {
  display: block;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgb(var(--v-theme-grey-500));
  margin-bottom: 8px;
}

.header-title {
  font-size: 2rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
  letter-spacing: -0.02em;
}

.header-period {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: rgba(var(--v-theme-on-surface), 0.04);
  border-radius: 8px;
}

.period-btn {
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgb(var(--v-theme-grey-500));
  cursor: pointer;
  transition: all 0.15s ease;
}

.period-btn:hover {
  color: rgb(var(--v-theme-on-surface));
}

.period-btn.active {
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.summary-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.summary-card {
  padding: 24px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.card-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgb(var(--v-theme-grey-500));
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
}

.card-icon.outgoing {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

.card-icon.incoming {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

.card-icon.success {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

.card-icon.neutral {
  background: rgba(var(--v-theme-on-surface), 0.06);
  color: rgb(var(--v-theme-grey-500));
}

.card-value {
  font-size: 1.75rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  letter-spacing: -0.02em;
  margin-bottom: 8px;
}

.card-value.success {
  color: #10B981;
}

.card-meta {
  display: flex;
  gap: 6px;
  font-size: 0.75rem;
  color: rgb(var(--v-theme-grey-400));
}

.meta-count {
  font-weight: 600;
  color: rgb(var(--v-theme-grey-600));
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 40px;
}

.content-block {
  padding: 28px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  border-radius: 12px;
}

.block-header {
  margin-bottom: 24px;
}

.block-title {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 4px;
}

.block-subtitle {
  font-size: 0.8125rem;
  color: rgb(var(--v-theme-grey-500));
}

.block-content {
  margin-bottom: 20px;
}

.flow-visual {
  height: 8px;
  background: rgba(var(--v-theme-on-surface), 0.06);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 20px;
}

.flow-visual.incoming .flow-bar {
  background: linear-gradient(90deg, #10B981, #34D399);
}

.flow-visual.outgoing .flow-bar {
  background: linear-gradient(90deg, #EF4444, #F87171);
}

.flow-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.flow-stats {
  display: flex;
  justify-content: space-between;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.stat-value.success {
  color: #10B981;
}

.stat-label {
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgb(var(--v-theme-grey-400));
}

.block-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgb(var(--v-theme-grey-600));
  text-decoration: none;
  transition: color 0.15s ease;
}

.block-action:hover {
  color: rgb(var(--v-theme-on-surface));
}

.activity-section {
  padding: 28px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  border-radius: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
}

.section-link {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgb(var(--v-theme-grey-500));
  text-decoration: none;
}

.section-link:hover {
  color: rgb(var(--v-theme-on-surface));
}

.activity-list {
  display: flex;
  flex-direction: column;
}

.empty-activity {
  padding: 40px;
  text-align: center;
}

.empty-text {
  color: rgb(var(--v-theme-grey-400));
  font-size: 0.875rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.04);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
}

.activity-icon.incoming {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

.activity-icon.outgoing {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

.activity-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.activity-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
}

.activity-meta {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-grey-400));
}

.activity-amount {
  font-size: 0.9375rem;
  font-weight: 600;
}

.activity-amount.incoming {
  color: #10B981;
}

.activity-amount.outgoing {
  color: rgb(var(--v-theme-on-surface));
}

@media (max-width: 1024px) {
  .summary-row {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .dash-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
    padding: 32px 0;
  }
  
  .summary-row {
    grid-template-columns: 1fr;
  }
  
  .header-title {
    font-size: 1.5rem;
  }
}
</style>
