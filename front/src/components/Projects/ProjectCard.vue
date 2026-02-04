<template>
  <article class="project-card" @mouseenter="hovered = true" @mouseleave="hovered = false">
    <div class="card-content">
      <!-- Left: Project Info -->
      <div class="project-info">
        <div class="project-avatar">
          <span class="avatar-letter">{{ projectName.charAt(0).toUpperCase() }}</span>
        </div>
        <div class="project-details">
          <h3 class="project-name">{{ projectName }}</h3>
          <div class="project-meta">
            <span class="meta-item">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M11 2H3C2.44772 2 2 2.44772 2 3V11C2 11.5523 2.44772 12 3 12H11C11.5523 12 12 11.5523 12 11V3C12 2.44772 11.5523 2 11 2Z" stroke="currentColor" stroke-width="1.25"/>
                <path d="M5 1V3M9 1V3M2 5H12" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>
              </svg>
              {{ invoiceCount }} {{ invoiceCount === 1 ? 'invoice' : 'invoices' }}
            </span>
            <span v-if="projectEmailDisplay !== 'No email'" class="meta-item email-meta">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1.5" y="3" width="11" height="8" rx="1.5" stroke="currentColor" stroke-width="1.25"/>
                <path d="M1.5 4.5L7 8L12.5 4.5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>
              </svg>
              {{ truncatedEmail }}
              <button 
                class="copy-btn"
                :class="{ copied: copied }"
                @click.stop="copyProjectEmail"
              >
                <svg v-if="!copied" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <rect x="4" y="4" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.25"/>
                  <path d="M8 4V3C8 2.44772 7.55228 2 7 2H3C2.44772 2 2 2.44772 2 3V7C2 7.55228 2.44772 8 3 8H4" stroke="currentColor" stroke-width="1.25"/>
                </svg>
                <svg v-else width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </span>
          </div>
        </div>
      </div>

      <!-- Center: Stats -->
      <div class="project-stats">
        <div class="stat-item">
          <span class="stat-label">Invoiced</span>
          <span class="stat-value">{{ formatCurrency(invoicing) }}</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-label">Received</span>
          <span class="stat-value received">{{ formatCurrency(payments) }}</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item margin-stat" @click.stop="openMarginEdit">
          <span class="stat-label">Margin</span>
          <div v-if="!editingMargin" class="margin-display">
            <span class="stat-value margin">{{ projectMargin ? `${projectMargin}%` : '—' }}</span>
            <span class="edit-hint">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M7.5 1.25L8.75 2.5L3.125 8.125L1.25 8.75L1.875 6.875L7.5 1.25Z" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </div>
          <div v-else class="margin-editor" @click.stop>
            <input
              ref="marginInputRef"
              v-model.number="tempMargin"
              type="number"
              min="0"
              max="100"
              step="0.1"
              class="margin-input"
              placeholder="0"
              @keyup.enter="saveMargin"
              @keyup.escape="cancelMarginEdit"
              @blur="saveMargin"
            />
            <span class="margin-unit">%</span>
          </div>
        </div>
      </div>

      <!-- Right: Progress & Actions -->
      <div class="project-progress">
        <div class="progress-ring">
          <svg width="48" height="48" viewBox="0 0 48 48">
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="currentColor"
              stroke-width="4"
              class="ring-bg"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="currentColor"
              stroke-width="4"
              stroke-linecap="round"
              class="ring-fill"
              :class="progressClass"
              :style="{ 
                strokeDasharray: `${2 * Math.PI * 20}`,
                strokeDashoffset: `${2 * Math.PI * 20 * (1 - percentPaid / 100)}`
              }"
            />
          </svg>
          <span class="progress-value" :class="progressClass">{{ percentPaid }}%</span>
        </div>
        
        <div class="card-actions" :class="{ visible: hovered }">
          <button class="action-btn" title="Edit project" @click.stop="editDialog = true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M11.333 2a1.886 1.886 0 0 1 2.667 2.667L5.25 13.417l-3.583.75.75-3.583L11.333 2z" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="action-btn delete" title="Archive project" @click.stop="dialogTrigger = true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M5.333 4V2.667a.667.667 0 0 1 .667-.667h4a.667.667 0 0 1 .667.667V4M12.667 4v9.333a1.333 1.333 0 0 1-1.334 1.334H4.667a1.333 1.333 0 0 1-1.334-1.334V4" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="progress-bar">
      <div class="bar-track">
        <div class="bar-fill" :class="progressClass" :style="{ width: `${percentPaid}%` }"></div>
      </div>
    </div>

    <!-- Dialogs -->
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
import { ref, computed, nextTick } from "vue"
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
const editingMargin = ref(false)
const tempMargin = ref(null)
const marginInputRef = ref(null)
const savingMargin = ref(false)
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

const truncatedEmail = computed(() => {
  const email = projectEmailDisplay.value
  if (email.length > 24) {
    return email.substring(0, 21) + '...'
  }
  return email
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

const openMarginEdit = async () => {
  if (editingMargin.value || savingMargin.value) return
  tempMargin.value = projectMargin.value || ''
  editingMargin.value = true
  await nextTick()
  marginInputRef.value?.focus()
  marginInputRef.value?.select()
}

const cancelMarginEdit = () => {
  editingMargin.value = false
  tempMargin.value = null
}

const saveMargin = async () => {
  if (!editingMargin.value || savingMargin.value) return
  
  const newMargin = tempMargin.value
  editingMargin.value = false
  
  if (newMargin === projectMargin.value) return
  if (newMargin !== null && newMargin !== '' && (newMargin < 0 || newMargin > 100)) {
    snackbarMessage.value = 'Margin must be between 0 and 100'
    snackbar.value = true
    return
  }
  
  savingMargin.value = true
  
  try {
    const baseUrl = import.meta.env.VITE_BASE_URL
    const response = await fetch(`${baseUrl}/invoice/patch/projects?id=${projectId.value}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ margin: newMargin || null })
    })
    
    if (response.ok) {
      props.project.forEach(p => p.margin = newMargin || null)
      snackbarMessage.value = 'Margin updated'
      snackbar.value = true
    }
  } catch (err) {
    console.error('Failed to update margin:', err)
    snackbarMessage.value = 'Failed to update margin'
    snackbar.value = true
  } finally {
    savingMargin.value = false
  }
}
</script>

<style scoped>
.project-card {
  padding: 20px 28px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  transition: background 0.15s ease;
}

.project-card:hover {
  background: rgba(var(--v-theme-on-surface), 0.02);
}

.project-card:last-child {
  border-bottom: none;
}

.card-content {
  display: flex;
  align-items: center;
  gap: 32px;
}

/* Project Info */
.project-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.project-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, 
    rgba(var(--v-theme-primary), 0.15) 0%, 
    rgba(var(--v-theme-primary), 0.08) 100%
  );
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
  border-radius: 12px;
  flex-shrink: 0;
}

.avatar-letter {
  font-size: 1.125rem;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
  text-transform: uppercase;
}

.project-details {
  min-width: 0;
}

.project-name {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 4px;
  letter-spacing: -0.01em;
  text-transform: capitalize;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  color: rgb(var(--v-theme-grey-500));
}

.meta-item svg {
  flex-shrink: 0;
}

.email-meta {
  cursor: default;
}

.copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: rgb(var(--v-theme-grey-400));
  cursor: pointer;
  transition: all 0.15s ease;
  opacity: 0;
}

.email-meta:hover .copy-btn {
  opacity: 1;
}

.copy-btn:hover {
  background: rgba(var(--v-theme-on-surface), 0.08);
  color: rgb(var(--v-theme-on-surface));
}

.copy-btn.copied {
  color: #10B981;
  opacity: 1;
}

/* Stats */
.project-stats {
  display: flex;
  align-items: center;
  gap: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 90px;
}

.stat-label {
  font-size: 0.6875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgb(var(--v-theme-grey-400));
}

.stat-value {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  letter-spacing: -0.01em;
}

.stat-value.received {
  color: #10B981;
}

.stat-value.margin {
  color: rgb(var(--v-theme-primary));
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: rgba(var(--v-theme-on-surface), 0.08);
}

.margin-stat {
  cursor: pointer;
  padding: 8px 12px;
  margin: -8px -12px;
  border-radius: 10px;
  transition: background 0.15s ease;
}

.margin-stat:hover {
  background: rgba(var(--v-theme-primary), 0.06);
}

.margin-display {
  display: flex;
  align-items: center;
  gap: 6px;
}

.edit-hint {
  opacity: 0;
  color: rgb(var(--v-theme-grey-400));
  transition: opacity 0.15s ease;
}

.margin-stat:hover .edit-hint {
  opacity: 1;
}

.margin-editor {
  display: flex;
  align-items: center;
  gap: 2px;
}

.margin-input {
  width: 48px;
  padding: 4px 8px;
  font-size: 1rem;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
  border: 1px solid rgb(var(--v-theme-primary));
  border-radius: 6px;
  outline: none;
  text-align: right;
}

.margin-input:focus {
  box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.15);
}

.margin-unit {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}

/* Progress Ring */
.project-progress {
  display: flex;
  align-items: center;
  gap: 16px;
}

.progress-ring {
  position: relative;
  width: 48px;
  height: 48px;
}

.progress-ring svg {
  transform: rotate(-90deg);
}

.ring-bg {
  color: rgba(var(--v-theme-on-surface), 0.08);
}

.ring-fill {
  transition: stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.ring-fill.complete { color: #10B981; }
.ring-fill.high { color: #10B981; }
.ring-fill.mid { color: #F59E0B; }
.ring-fill.low { color: rgb(var(--v-theme-grey-400)); }

.progress-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.progress-value.complete { color: #10B981; }
.progress-value.high { color: #10B981; }
.progress-value.mid { color: #F59E0B; }
.progress-value.low { color: rgb(var(--v-theme-grey-500)); }

/* Actions */
.card-actions {
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.card-actions.visible {
  opacity: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: transparent;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 8px;
  color: rgb(var(--v-theme-grey-500));
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn:hover {
  background: rgba(var(--v-theme-on-surface), 0.04);
  border-color: rgba(var(--v-theme-on-surface), 0.15);
  color: rgb(var(--v-theme-on-surface));
}

.action-btn.delete:hover {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.2);
  color: #EF4444;
}

/* Progress Bar */
.progress-bar {
  margin-top: 16px;
}

.bar-track {
  height: 4px;
  background: rgba(var(--v-theme-on-surface), 0.06);
  border-radius: 2px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.bar-fill.complete { background: #10B981; }
.bar-fill.high { background: #10B981; }
.bar-fill.mid { background: #F59E0B; }
.bar-fill.low { background: rgb(var(--v-theme-grey-400)); }

/* Responsive */
@media (max-width: 900px) {
  .project-stats {
    display: none;
  }
}

@media (max-width: 768px) {
  .project-card {
    padding: 16px 20px;
  }

  .card-content {
    gap: 16px;
  }

  .project-avatar {
    width: 40px;
    height: 40px;
  }

  .avatar-letter {
    font-size: 1rem;
  }

  .project-name {
    font-size: 0.9375rem;
  }

  .project-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .progress-ring {
    width: 40px;
    height: 40px;
  }

  .progress-ring svg {
    width: 40px;
    height: 40px;
  }

  .card-actions {
    opacity: 1;
  }
}
</style>
