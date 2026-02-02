<template>
  <div class="projects-surface">
    <div v-if="isLoading" class="loading-state">
      <div class="loading-indicator" />
      <span class="loading-text">Loading</span>
    </div>

    <div v-else-if="projects.length" class="projects-layout">
      <header class="page-lead">
        <div class="lead-content">
          <span class="lead-label">Projects</span>
          <h1 class="lead-title">Your Work</h1>
        </div>
        <button class="action-trigger" @click="emit('update:addProjectDialog', true)">
          <span class="trigger-icon">+</span>
          <span class="trigger-text">New Project</span>
        </button>
      </header>

      <section class="impact-summary">
        <div class="summary-item">
          <span class="summary-figure">{{ projects.length }}</span>
          <span class="summary-label">{{ projects.length === 1 ? 'Active Project' : 'Active Projects' }}</span>
        </div>
        <div class="summary-divider" />
        <div class="summary-item">
          <span class="summary-figure">{{ formatCurrency(totalInvoiced) }}</span>
          <span class="summary-label">Total Invoiced</span>
        </div>
        <div class="summary-divider" />
        <div class="summary-item">
          <span class="summary-figure">{{ formatCurrency(totalReceived) }}</span>
          <span class="summary-label">Received</span>
        </div>
        <div class="summary-divider" />
        <div class="summary-item">
          <span class="summary-figure">{{ overallProgress }}%</span>
          <span class="summary-label">Collected</span>
        </div>
      </section>

      <section class="projects-list">
        <TransitionGroup name="project-fade">
          <project-entry
            v-for="projectGroup in groupedProjects"
            :key="projectGroup[0].project_name"
            :project="projectGroup"
            @project-removed="removeWithUndo"
          />
        </TransitionGroup>
      </section>
    </div>

    <div v-else class="empty-surface">
      <div class="empty-content">
        <span class="empty-label">Projects</span>
        <h2 class="empty-title">Start your first project</h2>
        <p class="empty-description">
          Projects help you organize invoices, track payments, and maintain clarity across your work.
        </p>
        <button class="empty-action" @click="emit('update:addProjectDialog', true)">
          Create Project
        </button>
      </div>
    </div>

    <v-dialog
      :model-value="addProjectDialog"
      max-width="480"
      @update:model-value="emit('update:addProjectDialog', $event)"
    >
      <div class="dialog-surface">
        <AddNewProject
          @close="emit('update:addProjectDialog', false)"
          @new-project-added="addNewProject"
        />
      </div>
    </v-dialog>

    <Transition name="snackbar-fade">
      <div v-if="undoSnackbar" class="undo-toast">
        <span class="toast-message">Project archived</span>
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
.projects-surface {
  min-height: 100vh;
  padding: 0 24px 80px;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 400px;
}

.loading-indicator {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(var(--v-theme-on-surface), 0.1);
  border-top-color: rgb(var(--v-theme-on-surface));
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-text {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-grey-500));
  letter-spacing: 0.02em;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.projects-layout {
  max-width: 960px;
  margin: 0 auto;
}

.page-lead {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 64px 0 48px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.lead-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lead-label {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgb(var(--v-theme-grey-500));
}

.lead-title {
  font-size: 2.5rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
  letter-spacing: -0.025em;
  line-height: 1.1;
}

.action-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgb(var(--v-theme-on-surface));
  color: rgb(var(--v-theme-surface));
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.action-trigger:hover {
  opacity: 0.85;
}

.trigger-icon {
  font-size: 1.125rem;
  font-weight: 400;
  line-height: 1;
}

.impact-summary {
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 40px 0;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary-figure {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  letter-spacing: -0.02em;
  line-height: 1;
}

.summary-label {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-grey-500));
  letter-spacing: 0.01em;
}

.summary-divider {
  width: 1px;
  height: 32px;
  background: rgba(var(--v-theme-on-surface), 0.1);
}

.projects-list {
  padding-top: 16px;
}

.empty-surface {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 120px);
  padding: 64px 24px;
}

.empty-content {
  max-width: 400px;
  text-align: center;
}

.empty-label {
  display: block;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgb(var(--v-theme-grey-400));
  margin-bottom: 16px;
}

.empty-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 12px;
  letter-spacing: -0.02em;
}

.empty-description {
  font-size: 0.9375rem;
  color: rgb(var(--v-theme-grey-500));
  line-height: 1.6;
  margin: 0 0 32px;
}

.empty-action {
  display: inline-flex;
  padding: 14px 28px;
  background: rgb(var(--v-theme-on-surface));
  color: rgb(var(--v-theme-surface));
  border: none;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.empty-action:hover {
  opacity: 0.85;
}

.dialog-surface {
  background: rgb(var(--v-theme-surface));
  border-radius: 16px;
  overflow: hidden;
}

.undo-toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 20px;
  background: rgb(var(--v-theme-on-surface));
  color: rgb(var(--v-theme-surface));
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  z-index: 1000;
}

.toast-message {
  font-size: 0.875rem;
  font-weight: 500;
}

.toast-action {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.15);
  color: inherit;
  border: none;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}

.toast-action:hover {
  background: rgba(255, 255, 255, 0.25);
}

.project-fade-enter-active,
.project-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.project-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.project-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.snackbar-fade-enter-active,
.snackbar-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.snackbar-fade-enter-from,
.snackbar-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(16px);
}

@media (max-width: 768px) {
  .projects-surface {
    padding: 0 16px 64px;
  }

  .page-lead {
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
    padding: 40px 0 32px;
  }

  .lead-title {
    font-size: 2rem;
  }

  .action-trigger {
    width: 100%;
    justify-content: center;
  }

  .impact-summary {
    flex-wrap: wrap;
    gap: 24px;
    padding: 32px 0;
  }

  .summary-divider {
    display: none;
  }

  .summary-item {
    flex: 1;
    min-width: 120px;
  }

  .summary-figure {
    font-size: 1.25rem;
  }
}
</style>
