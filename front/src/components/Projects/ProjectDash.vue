<template>
  <div class="projects-container">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      <span class="loading-text">Loading projects</span>
    </div>

    <!-- Main Content -->
    <div v-else-if="projects.length" class="projects-content">
      <!-- Header Section -->
      <header class="page-header">
        <div class="header-left">
          <div class="breadcrumb">
            <span class="breadcrumb-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 6L8 2L14 6V13C14 13.5523 13.5523 14 13 14H3C2.44772 14 2 13.5523 2 13V6Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6 14V8H10V14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <span class="breadcrumb-text">Projects</span>
          </div>
          <h1 class="page-title">Your Projects</h1>
          <p class="page-subtitle">Manage invoices, track payments, and monitor progress</p>
        </div>
        <button class="create-button" @click="emit('update:addProjectDialog', true)">
          <span class="button-icon">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 3.75V14.25M3.75 9H14.25" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </span>
          <span class="button-text">New Project</span>
        </button>
      </header>

      <!-- Stats Overview -->
      <section class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon projects-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="3" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
              <rect x="11" y="3" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
              <rect x="3" y="11" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
              <rect x="11" y="11" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ projects.length }}</span>
            <span class="stat-label">Active {{ projects.length === 1 ? 'Project' : 'Projects' }}</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon invoiced-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M14 2H6C4.89543 2 4 2.89543 4 4V16C4 17.1046 4.89543 18 6 18H14C15.1046 18 16 17.1046 16 16V4C16 2.89543 15.1046 2 14 2Z" stroke="currentColor" stroke-width="1.5"/>
              <path d="M8 6H12M8 10H12M8 14H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ formatCurrency(totalInvoiced) }}</span>
            <span class="stat-label">Total Invoiced</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon received-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.5"/>
              <path d="M7 10L9 12L13 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value received">{{ formatCurrency(totalReceived) }}</span>
            <span class="stat-label">Payments Received</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon progress-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="44" :stroke-dashoffset="44 - (44 * overallProgress / 100)"/>
              <circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.5" opacity="0.2"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value" :class="progressColorClass">{{ overallProgress }}%</span>
            <span class="stat-label">Collection Rate</span>
          </div>
        </div>
      </section>

      <!-- Projects List -->
      <section class="projects-section">
        <div class="section-header">
          <h2 class="section-title">All Projects</h2>
          <span class="section-count">{{ projects.length }}</span>
        </div>
        
        <div class="projects-list">
          <TransitionGroup name="project-slide">
            <project-entry
              v-for="projectGroup in groupedProjects"
              :key="projectGroup[0].project_name"
              :project="projectGroup"
              @project-removed="removeWithUndo"
            />
          </TransitionGroup>
        </div>
      </section>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-visual">
        <div class="empty-glow"></div>
        <div class="empty-icon">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <rect x="8" y="12" width="48" height="40" rx="4" stroke="currentColor" stroke-width="2"/>
            <path d="M8 20H56" stroke="currentColor" stroke-width="2"/>
            <circle cx="14" cy="16" r="1.5" fill="currentColor"/>
            <circle cx="20" cy="16" r="1.5" fill="currentColor"/>
            <circle cx="26" cy="16" r="1.5" fill="currentColor"/>
            <rect x="16" y="28" width="32" height="4" rx="2" fill="currentColor" opacity="0.3"/>
            <rect x="16" y="36" width="24" height="4" rx="2" fill="currentColor" opacity="0.2"/>
            <rect x="16" y="44" width="16" height="4" rx="2" fill="currentColor" opacity="0.1"/>
          </svg>
        </div>
      </div>
      <h2 class="empty-title">Create your first project</h2>
      <p class="empty-description">
        Projects help you organize invoices and track payments from your clients. Get started by creating your first project.
      </p>
      <button class="empty-button" @click="emit('update:addProjectDialog', true)">
        <span class="button-icon">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 3.75V14.25M3.75 9H14.25" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </span>
        Create Project
      </button>
      <div class="empty-features">
        <div class="feature-item">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13.333 4L6 11.333 2.667 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Automatic invoice capture</span>
        </div>
        <div class="feature-item">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13.333 4L6 11.333 2.667 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Payment tracking</span>
        </div>
        <div class="feature-item">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13.333 4L6 11.333 2.667 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Financial reports</span>
        </div>
      </div>
    </div>

    <!-- Create Dialog -->
    <v-dialog
      :model-value="addProjectDialog"
      max-width="520"
      @update:model-value="emit('update:addProjectDialog', $event)"
    >
      <div class="dialog-container">
        <AddNewProject
          @close="emit('update:addProjectDialog', false)"
          @new-project-added="addNewProject"
        />
      </div>
    </v-dialog>

    <!-- Undo Toast -->
    <Transition name="toast-slide">
      <div v-if="undoSnackbar" class="undo-toast">
        <div class="toast-content">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M14 4L5.5 12.5L2 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="toast-message">Project archived</span>
        </div>
        <button class="toast-action" @click="undoRemove">Undo</button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import ProjectEntry from "./ProjectCard.vue"
import AddNewProject from "./AddNewProject.vue"
import { ref, computed, onMounted } from "vue"
import { invoices } from "@/stores/invoiceState.js"

const props = defineProps({
  addProjectDialog: Boolean
})

const emit = defineEmits(["update:addProjectDialog"])

const invoiceArray = invoices()
const undoSnackbar = ref(false)
const isLoading = ref(true)
let lastRemovedProject = null
let undoTimeout = null

const groupedProjects = computed(() => {
  const map = new Map()
  invoiceArray.dbResponse?.forEach(inv => {
    if (!inv.project_name) return
    if (!map.has(inv.project_name)) map.set(inv.project_name, [])
    map.get(inv.project_name).push(inv)
  })
  return Array.from(map.values())
})

const projects = computed(() => groupedProjects.value.map(g => g[0].project_name))

const totalInvoiced = computed(() => {
  return (invoiceArray.invoicing || []).reduce((sum, inv) => sum + Number(inv.amount || 0), 0)
})

const totalReceived = computed(() => {
  return (invoiceArray.payments || []).reduce((sum, inv) => sum + Number(inv.amount || 0), 0)
})

const overallProgress = computed(() => {
  if (!totalInvoiced.value) return 0
  return Math.round((totalReceived.value / totalInvoiced.value) * 100)
})

const progressColorClass = computed(() => {
  if (overallProgress.value >= 100) return 'complete'
  if (overallProgress.value >= 75) return 'high'
  if (overallProgress.value >= 50) return 'mid'
  return 'low'
})

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-BE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val || 0)

const addNewProject = async (project) => {
  if (!project?.project_name) return
  invoiceArray.addProjectOptimistic(project)
  emit("update:addProjectDialog", false)
  setTimeout(async () => {
    await invoiceArray.refreshInvoices()
  }, 500)
}

const removeWithUndo = (projectName) => {
  lastRemovedProject = Object.freeze(
    invoiceArray.dbResponse.filter(inv => inv.project_name === projectName)
  )
  invoiceArray.removeProjectOptimistic(projectName)
  undoSnackbar.value = true
  
  if (undoTimeout) clearTimeout(undoTimeout)
  undoTimeout = setTimeout(() => {
    undoSnackbar.value = false
    lastRemovedProject = null
  }, 5000)
}

const undoRemove = () => {
  if (!lastRemovedProject) return
  lastRemovedProject.forEach(p => invoiceArray.addProjectOptimistic(p))
  lastRemovedProject = null
  undoSnackbar.value = false
  if (undoTimeout) clearTimeout(undoTimeout)
  queueMicrotask(() => invoiceArray.refreshInvoices())
}

onMounted(async () => {
  await invoiceArray.refreshInvoices()
  isLoading.value = false
})
</script>

<style scoped>
.projects-container {
  min-height: 100vh;
  padding: 0 32px 80px;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 24px;
}

.loading-spinner {
  position: relative;
  width: 48px;
  height: 48px;
}

.spinner-ring {
  position: absolute;
  inset: 0;
  border: 2px solid transparent;
  border-top-color: rgb(var(--v-theme-primary));
  border-radius: 50%;
  animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.spinner-ring:nth-child(2) {
  inset: 4px;
  animation-delay: 0.15s;
  opacity: 0.7;
}

.spinner-ring:nth-child(3) {
  inset: 8px;
  animation-delay: 0.3s;
  opacity: 0.4;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--v-theme-grey-500));
  letter-spacing: 0.02em;
}

/* Main Content */
.projects-content {
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 48px 0 40px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.breadcrumb-icon {
  display: flex;
  color: rgb(var(--v-theme-grey-400));
}

.breadcrumb-text {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgb(var(--v-theme-grey-500));
}

.page-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.page-subtitle {
  font-size: 0.9375rem;
  color: rgb(var(--v-theme-grey-500));
  margin: 0;
  margin-top: 4px;
}

.create-button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  background: linear-gradient(135deg, 
    rgb(var(--v-theme-primary)) 0%, 
    color-mix(in srgb, rgb(var(--v-theme-primary)) 85%, black) 100%
  );
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.05),
    0 4px 12px rgba(var(--v-theme-primary), 0.25);
}

.create-button:hover {
  transform: translateY(-1px);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.05),
    0 8px 24px rgba(var(--v-theme-primary), 0.35);
}

.create-button:active {
  transform: translateY(0);
}

.button-icon {
  display: flex;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 48px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  border-radius: 16px;
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: rgba(var(--v-theme-on-surface), 0.12);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  flex-shrink: 0;
}

.stat-icon.projects-icon {
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
}

.stat-icon.invoiced-icon {
  background: rgba(59, 130, 246, 0.1);
  color: #3B82F6;
}

.stat-icon.received-icon {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

.stat-icon.progress-icon {
  background: rgba(245, 158, 11, 0.1);
  color: #F59E0B;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  letter-spacing: -0.02em;
  line-height: 1;
}

.stat-value.received { color: #10B981; }
.stat-value.complete { color: #10B981; }
.stat-value.high { color: #10B981; }
.stat-value.mid { color: #F59E0B; }
.stat-value.low { color: rgb(var(--v-theme-grey-500)); }

.stat-label {
  font-size: 0.8125rem;
  color: rgb(var(--v-theme-grey-500));
  white-space: nowrap;
}

/* Projects Section */
.projects-section {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  border-radius: 20px;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 28px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
  letter-spacing: -0.01em;
}

.section-count {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.projects-list {
  padding: 8px 0;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 120px);
  padding: 64px 24px;
  text-align: center;
}

.empty-visual {
  position: relative;
  margin-bottom: 32px;
}

.empty-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, 
    rgba(var(--v-theme-primary), 0.15) 0%, 
    transparent 70%
  );
  border-radius: 50%;
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
  50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.4; }
}

.empty-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, 
    rgba(var(--v-theme-primary), 0.1) 0%, 
    rgba(var(--v-theme-primary), 0.05) 100%
  );
  border: 1px solid rgba(var(--v-theme-primary), 0.15);
  border-radius: 28px;
  color: rgb(var(--v-theme-primary));
}

.empty-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 12px;
  letter-spacing: -0.02em;
}

.empty-description {
  font-size: 1rem;
  color: rgb(var(--v-theme-grey-500));
  line-height: 1.6;
  max-width: 420px;
  margin: 0 0 32px;
}

.empty-button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 32px;
  background: linear-gradient(135deg, 
    rgb(var(--v-theme-primary)) 0%, 
    color-mix(in srgb, rgb(var(--v-theme-primary)) 85%, black) 100%
  );
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.05),
    0 8px 24px rgba(var(--v-theme-primary), 0.3);
  margin-bottom: 40px;
}

.empty-button:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.05),
    0 12px 32px rgba(var(--v-theme-primary), 0.4);
}

.empty-features {
  display: flex;
  gap: 24px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgb(var(--v-theme-grey-500));
  font-size: 0.875rem;
}

.feature-item svg {
  color: #10B981;
}

/* Dialog */
.dialog-container {
  background: rgb(var(--v-theme-surface));
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.05),
    0 24px 64px rgba(0, 0, 0, 0.15);
}

/* Toast */
.undo-toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px 20px 16px 24px;
  background: rgb(var(--v-theme-on-surface));
  color: rgb(var(--v-theme-surface));
  border-radius: 14px;
  box-shadow: 
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 16px 48px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toast-message {
  font-size: 0.9375rem;
  font-weight: 500;
}

.toast-action {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.15);
  color: inherit;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}

.toast-action:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* Animations */
.project-slide-enter-active,
.project-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.project-slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.project-slide-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .projects-container {
    padding: 0 20px 64px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
    padding: 32px 0;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .create-button {
    width: 100%;
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .stat-card {
    padding: 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .section-header {
    padding: 20px;
  }

  .empty-features {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
