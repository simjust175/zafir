<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <div class="analytics-page">
    <header class="page-header">
      <div class="header-content">
        <div>
          <h1 class="page-title">
            Analytics
          </h1>
          <p class="page-subtitle">
            Financial insights and performance metrics
          </p>
        </div>
        <div class="header-actions">
          <v-btn-toggle v-model="dateRange" mandatory density="comfortable" variant="outlined">
            <v-btn value="week">
              Week
            </v-btn>
            <v-btn value="month">
              Month
            </v-btn>
            <v-btn value="year">
              Year
            </v-btn>
          </v-btn-toggle>
        </div>
      </div>
    </header>

    <div class="metrics-grid">
      <div class="metric-card primary-metric">
        <div class="metric-icon">
          <v-icon size="28" color="white">
            mdi-currency-eur
          </v-icon>
        </div>
        <div class="metric-content">
          <span class="metric-label">Total Revenue</span>
          <span class="metric-value">{{ formatCurrency(totalRevenue) }}</span>
          <span v-if="totalPayments > 0" class="metric-change positive">
            <v-icon size="14">mdi-trending-up</v-icon>
            Based on {{ paymentCount }} payments
          </span>
          <span v-else class="metric-subtext">No payments yet</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon invoiced">
          <v-icon size="24" color="white">
            mdi-file-document-outline
          </v-icon>
        </div>
        <div class="metric-content">
          <span class="metric-label">Total Invoiced</span>
          <span class="metric-value">{{ formatCurrency(totalInvoiced) }}</span>
          <span class="metric-subtext">{{ invoiceCount }} invoices</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon paid">
          <v-icon size="24" color="white">
            mdi-check-circle-outline
          </v-icon>
        </div>
        <div class="metric-content">
          <span class="metric-label">Payments Received</span>
          <span class="metric-value">{{ formatCurrency(totalPayments) }}</span>
          <span class="metric-subtext">{{ paymentCount }} payments</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon pending">
          <v-icon size="24" color="white">
            mdi-clock-outline
          </v-icon>
        </div>
        <div class="metric-content">
          <span class="metric-label">Outstanding</span>
          <span class="metric-value">{{ formatCurrency(outstanding) }}</span>
          <span class="metric-subtext">{{ outstandingPercent }}% unpaid</span>
        </div>
      </div>
    </div>

    <div class="charts-section">
      <v-row>
        <v-col cols="12" lg="8">
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">
                Revenue Overview
              </h3>
              <v-chip size="small" color="primary" variant="tonal">
                {{ dateRange }}
              </v-chip>
            </div>
            <div class="chart-container">
              <apexchart
                type="area"
                height="320"
                :options="revenueChartOptions"
                :series="revenueSeries"
              />
            </div>
          </div>
        </v-col>

        <v-col cols="12" lg="4">
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">
                Payment Status
              </h3>
            </div>
            <div class="chart-container donut-container">
              <apexchart
                type="donut"
                height="280"
                :options="statusChartOptions"
                :series="statusSeries"
              />
            </div>
          </div>
        </v-col>
      </v-row>
    </div>

    <div class="tables-section">
      <v-row>
        <v-col cols="12" lg="6">
          <div class="data-card">
            <div class="card-header">
              <h3 class="card-title">
                Top Projects by Revenue
              </h3>
              <v-btn variant="text" size="small" color="primary">
                View All
              </v-btn>
            </div>
            <div class="project-list">
              <div v-for="project in topProjects" :key="project.name" class="project-item">
                <div class="project-info">
                  <div class="project-avatar">
                    <v-icon size="20" color="primary">
                      mdi-folder-outline
                    </v-icon>
                  </div>
                  <div class="project-details">
                    <span class="project-name">{{ project.name }}</span>
                    <span class="project-invoices">{{ project.invoiceCount }} invoices</span>
                  </div>
                </div>
                <div class="project-amount">
                  {{ formatCurrency(project.amount) }}
                </div>
              </div>
              <div v-if="!topProjects.length" class="empty-state">
                <v-icon size="48" color="grey-lighten-1">
                  mdi-folder-open-outline
                </v-icon>
                <p>No project data available</p>
              </div>
            </div>
          </div>
        </v-col>

        <v-col cols="12" lg="6">
          <div class="data-card">
            <div class="card-header">
              <h3 class="card-title">
                Recent Transactions
              </h3>
              <v-btn variant="text" size="small" color="primary">
                View All
              </v-btn>
            </div>
            <div class="transaction-list">
              <div v-for="tx in recentTransactions" :key="tx.id" class="transaction-item">
                <div class="tx-info">
                  <div class="tx-icon" :class="tx.type">
                    <v-icon size="18">
                      {{ tx.type === 'payment' ? 'mdi-arrow-down' : 'mdi-arrow-up' }}
                    </v-icon>
                  </div>
                  <div class="tx-details">
                    <span class="tx-title">{{ tx.description }}</span>
                    <span class="tx-date">{{ tx.date }}</span>
                  </div>
                </div>
                <div class="tx-amount" :class="tx.type">
                  {{ tx.type === 'payment' ? '+' : '' }}{{ formatCurrency(tx.amount) }}
                </div>
              </div>
              <div v-if="!recentTransactions.length" class="empty-state">
                <v-icon size="48" color="grey-lighten-1">
                  mdi-swap-horizontal
                </v-icon>
                <p>No recent transactions</p>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { invoices } from '@/stores/invoiceState'

const invoiceStore = invoices()
const dateRange = ref('month')

const totalInvoiced = computed(() => {
  return invoiceStore.invoicing?.reduce((sum, inv) => sum + Number(inv.amount || 0), 0) || 0
})

const totalPayments = computed(() => {
  return invoiceStore.payments?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0
})

const totalRevenue = computed(() => totalPayments.value)

const outstanding = computed(() => totalInvoiced.value - totalPayments.value)

const outstandingPercent = computed(() => {
  if (totalInvoiced.value === 0) return 0
  return Math.round((outstanding.value / totalInvoiced.value) * 100)
})

const invoiceCount = computed(() => invoiceStore.invoicing?.length || 0)
const paymentCount = computed(() => invoiceStore.payments?.length || 0)

const topProjects = computed(() => {
  const projectMap = new Map()
  invoiceStore.dbResponse?.forEach(inv => {
    if (!inv.project_name) return
    const existing = projectMap.get(inv.project_name) || { name: inv.project_name, amount: 0, invoiceCount: 0 }
    existing.amount += Number(inv.amount || 0)
    existing.invoiceCount++
    projectMap.set(inv.project_name, existing)
  })
  return Array.from(projectMap.values())
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
})

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const recentTransactions = computed(() => {
  const transactions = []
  invoiceStore.payments?.slice(0, 5).forEach((p, i) => {
    transactions.push({
      id: `p-${i}`,
      type: 'payment',
      description: `Payment received`,
      amount: Number(p.amount || 0),
      date: formatDate(p.created_on) || 'Recently'
    })
  })
  invoiceStore.invoicing?.slice(0, 3).forEach((inv, i) => {
    transactions.push({
      id: `i-${i}`,
      type: 'invoice',
      description: `Invoice #${inv.supplier || inv.id || i + 1}`,
      amount: Number(inv.amount || 0),
      date: formatDate(inv.created_on) || 'Recently'
    })
  })
  return transactions.slice(0, 6)
})

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-BE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val || 0)
}

const revenueChartOptions = {
  chart: {
    type: 'area',
    toolbar: { show: false },
    fontFamily: 'Inter, system-ui, sans-serif',
    sparkline: { enabled: false }
  },
  colors: ['#6366F1', '#8B5CF6'],
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0.05,
      stops: [0, 100]
    }
  },
  stroke: { curve: 'smooth', width: 2 },
  dataLabels: { enabled: false },
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    labels: { style: { colors: '#64748B', fontSize: '12px' } },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: {
    labels: {
      style: { colors: '#64748B', fontSize: '12px' },
      formatter: (val) => `€${(val / 1000).toFixed(0)}k`
    }
  },
  grid: { borderColor: '#E2E8F0', strokeDashArray: 4 },
  tooltip: {
    y: { formatter: (val) => `€${val.toLocaleString()}` }
  },
  legend: { show: true, position: 'top', horizontalAlign: 'right' }
}

const revenueSeries = computed(() => {
  const monthlyPayments = new Array(12).fill(0)
  const monthlyInvoices = new Array(12).fill(0)
  
  invoiceStore.payments?.forEach(p => {
    const date = new Date(p.created_on)
    if (!isNaN(date.getTime())) {
      const month = date.getMonth()
      monthlyPayments[month] += Number(p.amount || 0)
    }
  })
  
  invoiceStore.invoicing?.forEach(inv => {
    const date = new Date(inv.created_on)
    if (!isNaN(date.getTime())) {
      const month = date.getMonth()
      monthlyInvoices[month] += Number(inv.amount || 0)
    }
  })
  
  return [
    { name: 'Payments Received', data: monthlyPayments },
    { name: 'Invoiced', data: monthlyInvoices }
  ]
})

const statusChartOptions = {
  chart: { type: 'donut', fontFamily: 'Inter, system-ui, sans-serif' },
  colors: ['#22C55E', '#F59E0B', '#EF4444'],
  labels: ['Paid', 'Pending', 'Overdue'],
  legend: { position: 'bottom', fontSize: '13px' },
  dataLabels: { enabled: false },
  plotOptions: {
    pie: {
      donut: {
        size: '70%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total',
            fontSize: '14px',
            color: '#64748B',
            formatter: () => formatCurrency(totalInvoiced.value)
          }
        }
      }
    }
  }
}

// const statusSeries = computed(() => {
//   const paid = totalPayments.value
//   const pending = Math.max(0, outstanding.value * 0.7)
//   const overdue = Math.max(0, outstanding.value * 0.3)

//   return [
//     Number((paid || 1).toFixed(2)),
//     Number((pending || 1).toFixed(2)),
//     Number((overdue || 1).toFixed(2))
//   ]
// })

const statusSeries = computed(() => {
  const today = new Date()
  let paid = 0
  let pending = 0
  let overdue = 0

  invoiceStore.invoicing?.forEach(inv => {
    const totalAmount = Number(inv.amount || 0)
    const paidAmount = Number(inv.paid_amount || 0)
    const remaining = Math.max(0, totalAmount - paidAmount)

    const dueDate = inv.due_date ? new Date(inv.due_date) : null

    // Fully paid
    if (paidAmount >= totalAmount) {
      paid += totalAmount
      return
    }

    // Unpaid / partially paid
    if (!dueDate) {
      // If no due date, treat as pending (safe default)
      pending += remaining
      return
    }

    if (dueDate < today) {
      overdue += remaining
    } else {
      pending += remaining
    }
  })

  return [
    Number(paid.toFixed(2)),
    Number(pending.toFixed(2)),
    Number(overdue.toFixed(2))
  ]
})
</script>

<style scoped>
.analytics-page {
  max-width: 1600px;
  margin: 0 auto;
  min-height: 100%;
  padding-bottom: 32px;
}

.page-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 4px;
}

.page-subtitle {
  font-size: 0.9375rem;
  color: rgb(var(--v-theme-grey-600));
  margin: 0;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.metric-card {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-grey-200));
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  transition: all 0.2s ease;
}

.metric-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.metric-card.primary-metric {
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
  border: none;
}

.metric-card.primary-metric .metric-label,
.metric-card.primary-metric .metric-value,
.metric-card.primary-metric .metric-change {
  color: white;
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.metric-icon.invoiced { background: linear-gradient(135deg, #3B82F6, #1D4ED8); }
.metric-icon.paid { background: linear-gradient(135deg, #22C55E, #16A34A); }
.metric-icon.pending { background: linear-gradient(135deg, #F59E0B, #D97706); }

.metric-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgb(var(--v-theme-grey-600));
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.metric-change {
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

.metric-change.positive { color: #22C55E; }
.metric-change.negative { color: #EF4444; }

.metric-subtext {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-grey-500));
}

.charts-section,
.tables-section {
  margin-bottom: 32px;
}

.chart-card,
.data-card {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-grey-200));
  border-radius: 16px;
  padding: 24px;
  height: 100%;
}

.chart-header,
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-title,
.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
}

.chart-container {
  width: 100%;
}

.donut-container {
  display: flex;
  justify-content: center;
}

.project-list,
.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.project-item,
.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgb(var(--v-theme-grey-50));
  border-radius: 12px;
  transition: background 0.15s ease;
}

.project-item:hover,
.transaction-item:hover {
  background: rgb(var(--v-theme-grey-100));
}

.project-info,
.tx-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.project-avatar,
.tx-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(var(--v-theme-primary), 0.1);
}

.tx-icon.payment {
  background: rgba(34, 197, 94, 0.1);
  color: #22C55E;
}

.tx-icon.invoice {
  background: rgba(59, 130, 246, 0.1);
  color: #3B82F6;
}

.project-details,
.tx-details {
  display: flex;
  flex-direction: column;
}

.project-name,
.tx-title {
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  font-size: 0.9375rem;
}

.project-invoices,
.tx-date {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-grey-500));
}

.project-amount,
.tx-amount {
  font-weight: 600;
  font-size: 0.9375rem;
  color: rgb(var(--v-theme-on-surface));
}

.tx-amount.payment { color: #22C55E; }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.empty-state p {
  margin-top: 12px;
  color: rgb(var(--v-theme-grey-500));
  font-size: 0.875rem;
}

@media (max-width: 960px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    flex-direction: column;
  }
}
</style>
