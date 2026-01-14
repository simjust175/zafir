<template>
  <div class="project-card-wrapper">
    <v-card
      class="project-card"
      rounded="xl"
    >
      <div class="card-header">
        <div class="project-info">
          <div class="project-avatar">
            <v-icon
              size="24"
              color="primary"
            >
              mdi-folder-outline
            </v-icon>
          </div>
          <div class="project-details">
            <h3 class="project-name">
              {{ projectName }}
            </h3>
            <p class="project-email">
              {{ projectEmailDisplay }}
            </p>
          </div>
        </div>
        <v-btn
          icon="mdi-pencil-outline"
          variant="text"
          size="small"
          color="grey"
          @click="editDialog = true"
        />
      </div>

      <div class="card-body">
        <div class="progress-section">
          <div class="progress-header">
            <span class="progress-label">Payment Progress</span>
            <span
              class="progress-percent"
              :class="progressColorClass"
            >{{ percentPaid }}%</span>
          </div>
          <v-progress-linear
            :model-value="percentPaid"
            :color="progressColor"
            height="8"
            rounded
            bg-color="grey-lighten-3"
          />
          <div class="progress-details">
            <span>{{ formatCurrency(payments) }} received</span>
            <span>{{ formatCurrency(invoicing) }} invoiced</span>
          </div>
        </div>

        <div class="stats-row">
          <div class="stat-item">
            <v-icon
              size="18"
              color="primary"
            >
              mdi-file-document-outline
            </v-icon>
            <span>{{ invoiceCount }} invoices</span>
          </div>
          <div class="stat-item">
            <v-icon
              size="18"
              color="success"
            >
              mdi-check-circle-outline
            </v-icon>
            <span>{{ paidCount }} paid</span>
          </div>
        </div>
      </div>

      <div class="card-actions">
        <v-btn
          variant="tonal"
          color="primary"
          block
          rounded="lg"
          @click="dialogTrigger = true"
        >
          <v-icon
            start
            size="18"
          >
            mdi-check
          </v-icon>
          Mark Complete
        </v-btn>
      </div>
    </v-card>

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

const invoiceCount = computed(() => props.project?.length || 0)
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
  border: 1px solid rgb(var(--v-theme-grey-200));
  transition: all 0.2s ease;
}

.project-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.card-header {
  background: rgb(var(--v-theme-surface));
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 20px 10px;
}

.project-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.project-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(99, 102, 241, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-details {
  display: flex;
  flex-direction: column;
}

.project-name {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
  text-transform: capitalize;
}

.project-email {
  font-size: 0.7125rem;
  color: rgb(var(--v-theme-grey-500));
  margin: 2px 0 0;
}

.card-body {
  flex: 1;
  padding: 20px;
}

.progress-section {
  margin-bottom: 16px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 0.8125rem;
  color: rgb(var(--v-theme-grey-600));
}

.progress-percent {
  font-size: 1.25rem;
  font-weight: 700;
}

.progress-percent.success { color: #22C55E; }
.progress-percent.amber { color: #F59E0B; }
.progress-percent.warning { color: #EF4444; }

.progress-details {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 0.75rem;
  color: rgb(var(--v-theme-grey-500));
}

.stats-row {
  display: flex;
  gap: 16px;
  padding: 12px 0;
  border-top: 1px solid rgb(var(--v-theme-grey-100));
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  color: rgb(var(--v-theme-grey-600));
}

.card-actions {
  padding: 0 20px 20px;
}
</style>
