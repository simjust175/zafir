<template>
  <div class="projects-container">
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner">
        <v-progress-circular
          indeterminate
          color="primary"
          size="44"
          width="4"
        />
      </div>
      <p class="loading-text">Loading your projects...</p>
    </div>

    <div v-else-if="projects.length" class="projects-content">
      <header class="page-header">
        <div class="header-content">
          <div class="header-icon">
            <v-icon size="24" color="primary">mdi-folder-multiple-outline</v-icon>
          </div>
          <div class="header-text">
            <h1 class="page-title">Projects</h1>
            <p class="page-subtitle">
              {{ projects.length }} active {{ projects.length === 1 ? 'project' : 'projects' }}
            </p>
          </div>
        </div>
        <v-btn
          color="primary"
          size="large"
          prepend-icon="mdi-plus"
          rounded="lg"
          class="new-project-btn"
          @click="emit('update:addProjectDialog', true)"
        >
          New Project
        </v-btn>
      </header>

      <div class="projects-grid">
        <TransitionGroup name="project-card">
          <div
            v-for="(projectGroup, index) in groupedProjects"
            :key="projectGroup[0].project_name"
            :style="{ '--index': index }"
            class="grid-item"
          >
            <project-card
              :project="projectGroup"
              @project-removed="removeWithUndo"
            />
          </div>
        </TransitionGroup>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-visual">
        <div class="visual-glow" />
        <div class="visual-icon">
          <v-icon size="48" color="white">mdi-folder-star-outline</v-icon>
        </div>
        <div class="visual-rings">
          <div class="ring ring-1" />
          <div class="ring ring-2" />
          <div class="ring ring-3" />
        </div>
      </div>
      
      <div class="empty-content">
        <h2 class="empty-title">Welcome to Your Workspace</h2>
        <p class="empty-description">
          Create your first project to start tracking invoices, managing expenses, and staying organized.
        </p>
        
        <v-btn
          color="primary"
          size="x-large"
          prepend-icon="mdi-plus"
          rounded="xl"
          class="empty-cta"
          @click="emit('update:addProjectDialog', true)"
        >
          Create Your First Project
        </v-btn>

        <div class="empty-features">
          <div class="feature-badge">
            <v-icon size="18" color="success">mdi-check-circle</v-icon>
            <span>Track invoices</span>
          </div>
          <div class="feature-badge">
            <v-icon size="18" color="success">mdi-check-circle</v-icon>
            <span>Manage payments</span>
          </div>
          <div class="feature-badge">
            <v-icon size="18" color="success">mdi-check-circle</v-icon>
            <span>Stay organized</span>
          </div>
        </div>
      </div>
    </div>

    <v-dialog
      :model-value="addProjectDialog"
      max-width="560"
      persistent
      @update:model-value="emit('update:addProjectDialog', $event)"
    >
      <v-card rounded="xl" class="dialog-card">
        <AddNewProject
          @close="emit('update:addProjectDialog', false)"
          @new-project-added="addNewProject"
        />
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="undoSnackbar"
      location="bottom"
      timeout="5000"
      color="surface"
      elevation="8"
      rounded="xl"
      class="undo-snackbar"
    >
      <div class="snackbar-content">
        <div class="snackbar-icon">
          <v-icon size="20" color="warning">mdi-folder-remove-outline</v-icon>
        </div>
        <span class="snackbar-message">Project completed and archived</span>
      </div>
      <template #actions>
        <v-btn
          variant="text"
          color="primary"
          rounded="lg"
          class="undo-btn"
          @click="undoRemove"
        >
          <v-icon start size="18">mdi-undo</v-icon>
          Undo
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import ProjectCard from "./ProjectCard.vue"
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

const addNewProject = async (project) => {
  console.log('[ProjectDash] New project added:', project)
  
  if (!project?.project_name) {
    console.error('[ProjectDash] Invalid project data:', project)
    return
  }

  invoiceArray.addProjectOptimistic(project)
  
  emit("update:addProjectDialog", false)

  setTimeout(async () => {
    console.log('[ProjectDash] Fetching updated invoice data...')
    await invoiceArray.refreshInvoices()
    console.log('[ProjectDash] Invoice data refreshed')
  }, 500)
}

const removeWithUndo = (projectName) => {
  lastRemovedProject = Object.freeze(
    invoiceArray.dbResponse.filter(
      inv => inv.project_name === projectName
    )
  )

  invoiceArray.removeProjectOptimistic(projectName)
  undoSnackbar.value = true
}

const undoRemove = () => {
  if (!lastRemovedProject) return

  lastRemovedProject.forEach(p => {
    invoiceArray.addProjectOptimistic(p)
  })

  lastRemovedProject = null
  undoSnackbar.value = false

  queueMicrotask(() => {
    invoiceArray.refreshInvoices()
  })
}

onMounted(async () => {
  await invoiceArray.refreshInvoices()
  isLoading.value = false
})
</script>

<style scoped>
.projects-container {
  min-height: calc(100vh - 180px);
  padding: 32px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-text {
  font-size: 0.9375rem;
  color: rgb(var(--v-theme-grey-500));
  margin: 0;
}

.projects-content {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--v-theme-primary), 0.1);
  border-radius: 12px;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-grey-500));
  margin: 0;
}

.new-project-btn {
  font-weight: 600;
  letter-spacing: 0.01em;
  text-transform: none;
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.25);
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

.grid-item {
  height: 100%;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 560px;
  padding: 64px 32px;
  background: linear-gradient(180deg, 
    rgba(var(--v-theme-primary), 0.02) 0%, 
    transparent 50%
  );
  border-radius: 24px;
  border: 2px dashed rgba(var(--v-theme-primary), 0.15);
  position: relative;
}

.empty-visual {
  position: relative;
  margin-bottom: 40px;
  width: 160px;
  height: 160px;
}

.visual-glow {
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
}

.visual-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 96px;
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, 
    rgb(var(--v-theme-primary)) 0%, 
    rgb(var(--v-theme-secondary)) 100%
  );
  border-radius: 24px;
  box-shadow: 0 12px 32px rgba(var(--v-theme-primary), 0.35);
  z-index: 2;
  animation: float 3s ease-in-out infinite;
}

.visual-rings {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
}

.ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid rgba(var(--v-theme-primary), 0.1);
  border-radius: 50%;
  animation: ring-pulse 3s ease-in-out infinite;
}

.ring-1 {
  width: 120px;
  height: 120px;
  animation-delay: 0s;
}

.ring-2 {
  width: 140px;
  height: 140px;
  animation-delay: 0.5s;
}

.ring-3 {
  width: 160px;
  height: 160px;
  animation-delay: 1s;
}

.empty-content {
  position: relative;
  z-index: 1;
  max-width: 480px;
}

.empty-title {
  font-size: 2rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 12px;
  letter-spacing: -0.02em;
}

.empty-description {
  font-size: 1rem;
  color: rgb(var(--v-theme-grey-500));
  margin: 0 0 36px;
  line-height: 1.6;
}

.empty-cta {
  font-weight: 600;
  letter-spacing: 0.01em;
  text-transform: none;
  padding: 20px 40px !important;
  font-size: 1rem;
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.3);
  margin-bottom: 40px;
}

.empty-features {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.feature-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: rgba(var(--v-theme-success), 0.08);
  border: 1px solid rgba(var(--v-theme-success), 0.15);
  border-radius: 24px;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--v-theme-grey-700));
}

.dialog-card {
  overflow: hidden;
}

.snackbar-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.snackbar-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--v-theme-warning), 0.12);
  border-radius: 10px;
}

.snackbar-message {
  font-weight: 500;
  font-size: 0.9375rem;
}

.undo-btn {
  font-weight: 600;
  text-transform: none;
}

.project-card-enter-active {
  transition: all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
  transition-delay: calc(var(--index, 0) * 50ms);
}

.project-card-leave-active {
  transition: all 0.25s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.project-card-enter-from {
  opacity: 0;
  transform: translateY(24px) scale(0.96);
}

.project-card-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.96);
}

@keyframes float {
  0%, 100% { transform: translate(-50%, -50%) translateY(0); }
  50% { transform: translate(-50%, -50%) translateY(-10px); }
}

@keyframes ring-pulse {
  0%, 100% { 
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.5;
  }
  50% { 
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.2;
  }
}

@media (max-width: 768px) {
  .projects-container {
    padding: 20px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

  .new-project-btn {
    width: 100%;
  }

  .projects-grid {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .empty-title {
    font-size: 1.625rem;
  }

  .empty-features {
    flex-direction: column;
    align-items: center;
  }

  .empty-state {
    min-height: 480px;
    padding: 48px 24px;
  }
}
</style>
