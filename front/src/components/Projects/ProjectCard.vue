<template>
  <div class="project-card-wrapper">
    <v-card class="project-card" rounded="xl">
      <div class="card-header">
        <div class="project-info">
          <div class="project-avatar">
            <v-icon size="22" color="primary">mdi-folder-outline</v-icon>
          </div>
          <div class="project-details">
            <h3 class="project-name">{{ projectName }}</h3>
            <div class="email-row">
              <span class="project-email">{{ projectEmailDisplay }}</span>
              <v-tooltip :text="copied ? 'Copied!' : 'Copy email'" location="top">
                <template #activator="{ props }">
                  <button
                    v-bind="props"
                    class="copy-btn"
                    :class="{ 'copied': copied }"
                    @click="copyProjectEmail(projectEmailDisplay)"
                  >
                    <v-icon
                      :icon="copied ? 'mdi-check' : 'mdi-content-copy'"
                      :size="copied ? 14 : 12"
                    />
                  </button>
                </template>
              </v-tooltip>
            </div>
          </div>
        </div>
        <v-btn
          icon
          variant="text"
          size="small"
          class="edit-btn"
          @click="editDialog = true"
        >
          <v-icon size="18" color="grey-darken-1">mdi-pencil-outline</v-icon>
        </v-btn>
      </div>

      <div class="card-body">
        <div class="metrics-grid">
          <div class="metric-item">
            <div class="metric-icon invoices">
              <v-icon size="18" color="primary">mdi-file-document-outline</v-icon>
            </div>
            <div class="metric-content">
              <span class="metric-value">{{ invoiceCount }}</span>
              <span class="metric-label">Invoices</span>
            </div>
          </div>
          <div class="metric-item">
            <div class="metric-icon paid">
              <v-icon size="18" color="success">mdi-check-circle-outline</v-icon>
            </div>
            <div class="metric-content">
              <span class="metric-value">{{ paidCount }}</span>
              <span class="metric-label">Paid</span>
            </div>
          </div>
        </div>

        <div class="progress-section">
          <div class="progress-header">
            <span class="progress-label">Payment Progress</span>
            <span class="progress-percent" :class="progressColorClass">{{ percentPaid }}%</span>
          </div>
          <div class="progress-track">
            <div 
              class="progress-fill" 
              :class="progressColorClass"
              :style="{ width: `${percentPaid}%` }"
            />
          </div>
          <div class="progress-details">
            <div class="detail-item">
              <span class="detail-label">Received</span>
              <span class="detail-value success">{{ formatCurrency(payments) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Invoiced</span>
              <span class="detail-value">{{ formatCurrency(invoicing) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card-footer">
        <v-btn
          variant="flat"
          color="primary"
          block
          rounded="lg"
          class="complete-btn"
          @click="dialogTrigger = true"
        >
          <v-icon start size="18">mdi-check-circle</v-icon>
          Mark Complete
        </v-btn>
      </div>
    </v-card>

    <v-snackbar
      v-model="snackbar"
      color="primary"
      timeout="2000"
      rounded="lg"
    >
      {{ snackbarMessage }}
    </v-snackbar>

    <complete-project-dialog
      :project="project"
      :trigger="dialogTrigger"
      @project-removed="handleRemove"
      @close="dialogTrigger = false"
    />

    <edit-project-name-dialog
      :open="editDialog"
      :initial-name="projectName"
      :project-id="projectId"
      @close="editDialog = false"
      @saved="handleProjectNameSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue"
import { invoices } from '@/stores/invoiceState.js'

const props = defineProps({
  project: {
    type: Array,
    required: true
  }
})

const invoiceStore = invoices()
const dialogTrigger = ref(false)
const editDialog = ref(false)
const copied = ref(false)

const projectId = computed(() => props.project?.[0]?.project_id ?? null)
const projectName = computed(() => props.project?.[0]?.project_name || "Unnamed Project")
const projectEmailDisplay = computed(() => {
  if (!props.project?.[0]?.email) return 'No email'
  const emailData = invoiceStore.activeEmails
  const emails = Array.isArray(emailData) 
    ? emailData 
    : emailData?.activeEmails
  if (!Array.isArray(emails)) return 'No email'
  const match = emails.find(e => e.email_id === props.project[0].email)
  return match?.email_address || 'No email'
})

const snackbar = ref(false)
const snackbarMessage = ref("")

const copyProjectEmail = async (emailAddress) => {
  try {
    await navigator.clipboard.writeText(emailAddress)

    copied.value = true

    setTimeout(() => {
      copied.value = false
    }, 1000)

  } catch (err) {
    console.error("Copy failed", err)
  }
}
const invoiceCount = computed(() => {
  if (!Array.isArray(props.project)) return 0

  return props.project.filter(
    invoice => invoice.invoice_id !== null
  ).length
})
const invoiceLabel = computed(() => {
  if (invoiceCount.value === 0) return 'No invoices'
  if (invoiceCount.value === 1) return '1 invoice'
  return `${invoiceCount.value} invoices`
})
const paidCount = computed(() => props.project?.filter(inv => inv.paid)?.length || 0)

const reduceTotal = (array) => {
  return array.filter(inv => inv.project === projectId.value).reduce((sum, inv) => sum + Number(inv.amount || 0), 0)
}

const payments = computed(() => reduceTotal(invoiceStore.payments || []))
const invoicing = computed(() => reduceTotal(invoiceStore.invoicing || []))

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-BE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val || 0)

const emit = defineEmits(["project-removed"])

const handleRemove = () => {
  if (props.project?.[0]?.project_name) {
    emit("project-removed", props.project[0].project_name)
  }
}

const percentPaid = computed(() => {
  const invoiced = parseFloat(invoicing.value) || 0
  const paid = parseFloat(payments.value) || 0
  return invoiced === 0 ? 0 : Math.round((paid / invoiced) * 100)
})

const handleProjectNameSaved = (newName) => {
  if (!newName) return
  invoiceStore.dbResponse?.filter(p => p.project === projectId.value)?.forEach(p => p.project_name = newName)
  props.project?.forEach(p => p.project_name = newName)
}

const progressColor = computed(() => {
  if (percentPaid.value < 50) return 'warning'
  if (percentPaid.value < 75) return 'amber'
  return 'success'
})

const progressColorClass = computed(() => {
  if (percentPaid.value < 50) return 'warning'
  if (percentPaid.value < 75) return 'amber'
  return 'success'
})
</script>

<style scoped>
.project-card-wrapper {
  height: 100%;
}

.project-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.project-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.2);
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 10px 20px -2px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(var(--v-theme-primary), 0.05);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 20px 16px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}

.project-info {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 0;
}

.project-avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(var(--v-theme-primary), 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.project-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.project-name {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
  text-transform: capitalize;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.email-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.project-email {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-grey-500));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: rgb(var(--v-theme-grey-400));
  transition: all 0.2s ease;
}

.copy-btn:hover {
  background: rgba(var(--v-theme-on-surface), 0.06);
  color: rgb(var(--v-theme-grey-600));
}

.copy-btn.copied {
  color: rgb(var(--v-theme-success));
  background: rgba(var(--v-theme-success), 0.1);
}

.edit-btn {
  margin: -4px -8px 0 0;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.project-card:hover .edit-btn {
  opacity: 1;
}

.card-body {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: rgba(var(--v-theme-on-surface), 0.02);
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.04);
}

.metric-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-icon.invoices {
  background: rgba(var(--v-theme-primary), 0.1);
}

.metric-icon.paid {
  background: rgba(var(--v-theme-success), 0.1);
}

.metric-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.metric-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1;
}

.metric-label {
  font-size: 0.6875rem;
  font-weight: 500;
  color: rgb(var(--v-theme-grey-500));
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.progress-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgb(var(--v-theme-grey-600));
}

.progress-percent {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
}

.progress-percent.success { color: #22C55E; }
.progress-percent.amber { color: #F59E0B; }
.progress-percent.warning { color: #EF4444; }

.progress-track {
  height: 8px;
  background: rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-fill.success { background: linear-gradient(90deg, #22C55E, #34D399); }
.progress-fill.amber { background: linear-gradient(90deg, #F59E0B, #FBBF24); }
.progress-fill.warning { background: linear-gradient(90deg, #EF4444, #F87171); }

.progress-details {
  display: flex;
  justify-content: space-between;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-label {
  font-size: 0.6875rem;
  font-weight: 500;
  color: rgb(var(--v-theme-grey-400));
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.detail-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(var(--v-theme-grey-700));
}

.detail-value.success {
  color: #22C55E;
}

.card-footer {
  padding: 16px 20px 20px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}

.complete-btn {
  font-weight: 600;
  letter-spacing: 0.01em;
  text-transform: none;
}

@media (max-width: 480px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
