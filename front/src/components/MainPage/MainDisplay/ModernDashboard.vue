<template>
  <div class="modern-dashboard">
    <header class="dashboard-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="dashboard-title">
            Welcome back{{ userName ? ', ' + userName : '' }}
          </h1>
          <p class="dashboard-subtitle">
            Here's an overview of your invoices and financials
          </p>
        </div>
        <div class="header-actions">
          <v-btn
            color="primary"
            variant="flat"
            prepend-icon="mdi-plus"
            @click="openUploadDialog"
          >
            New Invoice
          </v-btn>
        </div>
      </div>
    </header>

    <section class="stats-section">
      <v-row>
        <v-col
          cols="12"
          sm="6"
          lg="3"
        >
          <StatCard
            label="Total Invoices"
            :value="totalInvoices"
            icon="mdi-file-document-multiple"
            color="primary"
            subtitle="all invoices"
            elevated
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
          lg="3"
        >
          <StatCard
            label="Total Amount"
            :value="totalAmount"
            icon="mdi-currency-eur"
            color="success"
            format="currency"
            subtitle="combined value"
            elevated
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
          lg="3"
        >
          <StatCard
            label="Pending Review"
            :value="pendingReview"
            icon="mdi-alert-circle-outline"
            color="warning"
            subtitle="needs attention"
            elevated
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
          lg="3"
        >
          <StatCard
            label="Active Projects"
            :value="activeProjects"
            icon="mdi-folder-outline"
            color="info"
            subtitle="with invoices"
            elevated
          />
        </v-col>
      </v-row>
    </section>

    <section class="main-content-section">
      <v-row>
        <v-col
          cols="12"
          lg="8"
        >
          <v-card class="content-card">
            <div class="card-header">
              <div>
                <h3 class="card-title">
                  Recent Invoices
                </h3>
                <p class="card-subtitle">
                  Latest invoice activity
                </p>
              </div>
              <v-btn
                variant="text"
                color="primary"
                append-icon="mdi-arrow-right"
                @click="$router.push('/table')"
              >
                View All
              </v-btn>
            </div>
            <v-divider />
            <div class="card-body">
              <LoadingState
                v-if="loading"
                message="Loading invoices..."
                inline
              />
              <EmptyState
                v-else-if="recentInvoices.length === 0"
                icon="mdi-file-document-outline"
                title="No invoices yet"
                description="Upload your first invoice to get started"
              >
                <template #action>
                  <v-btn
                    color="primary"
                    @click="openUploadDialog"
                  >
                    <v-icon class="mr-2">
                      mdi-upload
                    </v-icon>
                    Upload Invoice
                  </v-btn>
                </template>
              </EmptyState>
              <div
                v-else
                class="invoice-list"
              >
                <div
                  v-for="invoice in recentInvoices"
                  :key="invoice.invoice_id"
                  class="invoice-item"
                  @click="openInvoice(invoice)"
                >
                  <div class="invoice-icon">
                    <v-icon
                      icon="mdi-file-document"
                      size="20"
                    />
                  </div>
                  <div class="invoice-info">
                    <span class="invoice-issuer">{{ invoice.issuer || 'Unknown Supplier' }}</span>
                    <span class="invoice-meta">{{ invoice.project_name || 'No Project' }} • {{
                      formatDate(invoice.created_at)
                    }}</span>
                  </div>
                  <div class="invoice-amount">
                    <span class="amount-value">{{ formatCurrency(invoice.amount) }}</span>
                    <v-chip
                      :color="getStatusColor(invoice)"
                      size="x-small"
                      variant="tonal"
                    >
                      {{ getStatus(invoice) }}
                    </v-chip>
                  </div>
                </div>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col
          cols="12"
          lg="4"
        >
          <v-card class="content-card mb-4">
            <div class="card-header">
              <div>
                <h3 class="card-title">
                  Alerts
                </h3>
                <p class="card-subtitle">
                  Items requiring attention
                </p>
              </div>
            </div>
            <v-divider />
            <div class="card-body">
              <EmptyState
                v-if="warnings.length === 0"
                icon="mdi-check-circle-outline"
                icon-color="success"
                title="All clear!"
                description="No issues requiring your attention"
              />
              <div
                v-else
                class="alert-list"
              >
                <div
                  v-for="(warning, idx) in warnings.slice(0, 5)"
                  :key="idx"
                  class="alert-item"
                  :class="`alert-item--${warning.title}`"
                >
                  <v-icon
                    :icon="getWarningIcon(warning.title)"
                    size="18"
                    class="alert-icon"
                  />
                  <div class="alert-content">
                    <span class="alert-title">{{ getWarningTitle(warning.title) }}</span>
                    <span class="alert-body">{{ warning.body }}</span>
                  </div>
                </div>
              </div>
            </div>
          </v-card>

          <v-card class="content-card">
            <div class="card-header">
              <div>
                <h3 class="card-title">
                  Projects Overview
                </h3>
                <p class="card-subtitle">
                  By invoice count
                </p>
              </div>
            </div>
            <v-divider />
            <div class="card-body">
              <EmptyState
                v-if="projectStats.length === 0"
                icon="mdi-folder-outline"
                title="No projects"
                description="Create a project to organize invoices"
              />
              <div
                v-else
                class="project-list"
              >
                <div
                  v-for="project in projectStats.slice(0, 5)"
                  :key="project.id"
                  class="project-item"
                >
                  <div class="project-info">
                    <span class="project-name">{{ project.name }}</span>
                    <span class="project-count">{{ project.count }} invoices</span>
                  </div>
                  <v-progress-linear
                    :model-value="project.percentage"
                    color="primary"
                    height="6"
                    rounded
                  />
                </div>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </section>

    <InvoiceUploadMain
      :active="showUploadDialog"
      @close="showUploadDialog = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { invoices } from '@/stores/invoiceState.js'
import { useLoginStore } from '@/stores/loginState.js'
import StatCard from '@/components/ui/StatCard.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const router = useRouter()
const invoiceStore = invoices()
const loginState = useLoginStore()

const loading = ref(true)
const showUploadDialog = ref(false)

const userName = computed(() => {
  const info = loginState.userInfo
  if (info?.name) return info.name
  if (info?.email) return info.email.split('@')[0]
  return ''
})

const invoiceData = computed(() => invoiceStore.dbResponse || [])
const warnings = computed(() => invoiceStore.warnings || [])

const totalInvoices = computed(() => invoiceData.value.length)
const totalAmount = computed(() =>
  invoiceData.value.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0)
)
const pendingReview = computed(() => warnings.value.length)
const activeProjects = computed(() => {
  const projects = new Set(invoiceData.value.map(inv => inv.project_id).filter(Boolean))
  return projects.size
})

const recentInvoices = computed(() => {
  if (invoiceData.value.length < 1) { return }
  else {
    return [...invoiceData.value]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 8)
  }
}
)

const projectStats = computed(() => {
  const projectMap = new Map()
  invoiceData.value.forEach(inv => {
    if (inv.project_name) {
      const current = projectMap.get(inv.project_id) || { name: inv.project_name, id: inv.project_id, count: 0 }
      current.count++
      projectMap.set(inv.project_id, current)
    }
  })
  const stats = Array.from(projectMap.values())
  const maxCount = Math.max(...stats.map(p => p.count), 1)
  return stats
    .map(p => ({ ...p, percentage: (p.count / maxCount) * 100 }))
    .sort((a, b) => b.count - a.count)
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount || 0)
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const getStatus = (invoice) => {
  if (invoice.issuer === 'UNKNOWN ISSUER' || !invoice.issuer) return 'Review'
  if (invoice.conflict_resolved === false) return 'Duplicate'
  return 'Processed'
}

const getStatusColor = (invoice) => {
  const status = getStatus(invoice)
  if (status === 'Review') return 'warning'
  if (status === 'Duplicate') return 'error'
  return 'success'
}

const getWarningIcon = (type) => {
  if (type === 'duplicate') return 'mdi-content-duplicate'
  if (type === 'unknown-supplier') return 'mdi-help-circle'
  return 'mdi-alert'
}

const getWarningTitle = (type) => {
  if (type === 'duplicate') return 'Possible Duplicate'
  if (type === 'unknown-supplier') return 'Unknown Supplier'
  return 'Alert'
}

const openUploadDialog = () => {
  showUploadDialog.value = true
}

const openInvoice = (invoice) => {
  // TODO: add option to selected selected invoice 

  router.push('/table')
}

onMounted(async () => {
  await invoiceStore.getAmounts()
  loading.value = false
})
</script>

<style scoped>
.modern-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100%;
  padding-bottom: 32px;
}

.dashboard-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
}

.dashboard-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 4px;
}

.dashboard-subtitle {
  font-size: 0.9375rem;
  color: rgb(var(--v-theme-grey-600));
  margin: 0;
}

.stats-section {
  margin-bottom: 32px;
}

.content-card {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-grey-200));
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40px 38px 40px 30px;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
}

.card-subtitle {
  font-size: 0.8125rem;
  color: rgb(var(--v-theme-grey-500));
  margin: 4px 0 0;
}

.card-body {
  padding: 16px 24px 24px;
}

.invoice-list {
  display: flex;
  flex-direction: column;
}

.invoice-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid rgb(var(--v-theme-grey-100));
  cursor: pointer;
  transition: background var(--billio-transition-fast);
  margin: 0 -24px;
  padding-left: 24px;
  padding-right: 24px;
}

.invoice-item:last-child {
  border-bottom: none;
}

.invoice-item:hover {
  background: rgb(var(--v-theme-grey-50));
}

.invoice-icon {
  width: 40px;
  height: 40px;
  background: rgb(var(--v-theme-grey-100));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(var(--v-theme-grey-600));
}

.invoice-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.invoice-issuer {
  font-size: 0.9375rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.invoice-meta {
  font-size: 0.8125rem;
  color: rgb(var(--v-theme-grey-500));
}

.invoice-amount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.amount-value {
  font-size: 0.9375rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  background: rgb(var(--v-theme-grey-50));
}

.alert-item--duplicate {
  background: rgba(var(--v-theme-error), 0.08);
}

.alert-item--duplicate .alert-icon {
  color: rgb(var(--v-theme-error));
}

.alert-item--unknown-supplier {
  background: rgba(var(--v-theme-warning), 0.08);
}

.alert-item--unknown-supplier .alert-icon {
  color: rgb(var(--v-theme-warning));
}

.alert-content {
  display: flex;
  flex-direction: column;
}

.alert-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.alert-body {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-grey-600));
}

.project-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.project-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
}

.project-count {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-grey-500));
}
</style>
