<template>
  <article class="project-entry" @mouseenter="hovered = true" @mouseleave="hovered = false">
    <div class="entry-main">
      <div class="entry-identity">
        <h3 class="project-name">{{ projectName }}</h3>
        <p class="project-context">{{ invoiceCount }} {{ invoiceCount === 1 ? 'invoice' : 'invoices' }}</p>
      </div>

      <div class="entry-figures">
        <div class="figure-block">
          <span class="figure-value">{{ formatCurrency(invoicing) }}</span>
          <span class="figure-label">Invoiced</span>
        </div>
        <div class="figure-block">
          <span class="figure-value received">{{ formatCurrency(payments) }}</span>
          <span class="figure-label">Received</span>
        </div>
        <div v-if="projectMargin" class="figure-block">
          <span class="figure-value margin-value">{{ projectMargin }}%</span>
          <span class="figure-label">Margin</span>
        </div>
        <div class="figure-block progress-block">
          <span class="figure-value" :class="progressClass">{{ percentPaid }}%</span>
          <span class="figure-label">Collected</span>
        </div>
      </div>

      <div class="entry-actions" :class="{ visible: hovered }">
        <button class="action-btn" @click="editDialog = true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M11.333 2a1.886 1.886 0 0 1 2.667 2.667L5.25 13.417l-3.583.75.75-3.583L11.333 2z" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button class="action-btn" @click="dialogTrigger = true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13.333 4l-.77 9.243a1.333 1.333 0 0 1-1.328 1.224H4.765a1.333 1.333 0 0 1-1.329-1.224L2.667 4M6 4V2.667A.667.667 0 0 1 6.667 2h2.666a.667.667 0 0 1 .667.667V4M1.333 4h13.334" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="entry-progress">
      <div class="progress-track">
        <div class="progress-fill" :class="progressClass" :style="{ width: `${percentPaid}%` }" />
      </div>
    </div>

    <div v-if="projectEmailDisplay !== 'No email'" class="entry-meta">
      <span class="meta-email">{{ projectEmailDisplay }}</span>
      <button 
        class="copy-trigger"
        :class="{ copied: copied }"
        @click="copyProjectEmail"
      >
        <svg v-if="!copied" width="14" height="14" viewBox="0 0 16 16" fill="none">
          <rect x="5.333" y="5.333" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.25"/>
          <path d="M10.667 5.333V4a1.333 1.333 0 0 0-1.334-1.333H4a1.333 1.333 0 0 0-1.333 1.333v5.333A1.333 1.333 0 0 0 4 10.667h1.333" stroke="currentColor" stroke-width="1.25"/>
        </svg>
        <svg v-else width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M13.333 4L6 11.333 2.667 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <v-snackbar v-model="snackbar" color="primary" timeout="2000" rounded="lg">
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
  </article>
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

const emit = defineEmits(["project-removed"])

const invoiceStore = invoices()
const dialogTrigger = ref(false)
const editDialog = ref(false)
const copied = ref(false)
const hovered = ref(false)
const snackbar = ref(false)
const snackbarMessage = ref("")

const projectId = computed(() => props.project?.[0]?.project_id ?? null)
const projectName = computed(() => props.project?.[0]?.project_name || "Unnamed Project")

const projectEmailDisplay = computed(() => {
  if (!props.project?.[0]?.email) return 'No email'
  const emailData = invoiceStore.activeEmails
  const emails = Array.isArray(emailData) ? emailData : emailData?.activeEmails
  if (!Array.isArray(emails)) return 'No email'
  const match = emails.find(e => e.email_id === props.project[0].email)
  return match?.email_address || 'No email'
})

const projectMargin = computed(() => {
  const margin = props.project?.[0]?.margin
  return margin ? parseFloat(margin) : null
})

const copyProjectEmail = async () => {
  try {
    await navigator.clipboard.writeText(projectEmailDisplay.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 1200)
  } catch (err) {
    console.error("Copy failed", err)
  }
}

const invoiceCount = computed(() => {
  if (!Array.isArray(props.project)) return 0
  return props.project.filter(invoice => invoice.invoice_id !== null).length
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

const progressClass = computed(() => {
  if (percentPaid.value >= 100) return 'complete'
  if (percentPaid.value >= 75) return 'high'
  if (percentPaid.value >= 50) return 'mid'
  return 'low'
})

const handleProjectNameSaved = (newName) => {
  if (!newName) return
  invoiceStore.dbResponse?.filter(p => p.project === projectId.value)?.forEach(p => p.project_name = newName)
  props.project?.forEach(p => p.project_name = newName)
}
</script>

<style scoped>
.project-entry {
  padding: 32px 0;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  transition: background 0.15s ease;
}

.project-entry:first-child {
  padding-top: 40px;
}

.project-entry:last-child {
  border-bottom: none;
}

.entry-main {
  display: flex;
  align-items: flex-start;
  gap: 32px;
}

.entry-identity {
  flex: 1;
  min-width: 0;
}

.project-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 4px;
  letter-spacing: -0.01em;
  text-transform: capitalize;
}

.project-context {
  font-size: 0.8125rem;
  color: rgb(var(--v-theme-grey-500));
  margin: 0;
}

.entry-figures {
  display: flex;
  gap: 40px;
}

.figure-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 80px;
}

.figure-value {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  letter-spacing: -0.01em;
}

.figure-value.received {
  color: rgb(var(--v-theme-success));
}

.figure-value.margin-value {
  color: rgb(var(--v-theme-info));
}

.figure-value.complete { color: rgb(var(--v-theme-success)); }
.figure-value.high { color: #10B981; }
.figure-value.mid { color: #F59E0B; }
.figure-value.low { color: rgb(var(--v-theme-grey-500)); }

.figure-label {
  font-size: 0.6875rem;
  color: rgb(var(--v-theme-grey-400));
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.entry-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.entry-actions.visible {
  opacity: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 6px;
  color: rgb(var(--v-theme-grey-500));
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn:hover {
  background: rgba(var(--v-theme-on-surface), 0.04);
  border-color: rgba(var(--v-theme-on-surface), 0.15);
  color: rgb(var(--v-theme-on-surface));
}

.entry-progress {
  margin-top: 16px;
  padding-left: 0;
}

.progress-track {
  height: 3px;
  background: rgba(var(--v-theme-on-surface), 0.06);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.4s ease;
}

.progress-fill.complete { background: rgb(var(--v-theme-success)); }
.progress-fill.high { background: #10B981; }
.progress-fill.mid { background: #F59E0B; }
.progress-fill.low { background: rgb(var(--v-theme-grey-400)); }

.entry-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}

.meta-email {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-grey-400));
}

.copy-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: rgb(var(--v-theme-grey-400));
  cursor: pointer;
  transition: all 0.15s ease;
}

.copy-trigger:hover {
  background: rgba(var(--v-theme-on-surface), 0.06);
  color: rgb(var(--v-theme-on-surface));
}

.copy-trigger.copied {
  color: rgb(var(--v-theme-success));
}

@media (max-width: 768px) {
  .project-entry {
    padding: 24px 0;
  }

  .entry-main {
    flex-direction: column;
    gap: 20px;
  }

  .entry-figures {
    gap: 24px;
    flex-wrap: wrap;
  }

  .entry-actions {
    opacity: 1;
    position: absolute;
    right: 0;
    top: 0;
  }

  .project-entry {
    position: relative;
    padding-right: 72px;
  }
}
</style>
