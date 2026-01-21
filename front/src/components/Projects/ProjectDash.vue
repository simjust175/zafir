<template>
  <div class="projects-container">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <v-progress-circular
        indeterminate
        color="primary"
        size="48"
      />
      <p class="loading-text">Loading projects...</p>
    </div>

    <!-- Projects Grid -->
    <div
      v-else-if="projects.length"
      class="projects-content"
    >
      <div class="projects-header">
        <div class="header-text">
          <h1 class="projects-title">Your Projects</h1>
          <p class="projects-subtitle">{{ projects.length }} active {{ projects.length === 1 ? 'project' : 'projects' }}</p>
        </div>
        <v-btn
          color="primary"
          size="large"
          prepend-icon="mdi-plus"
          rounded="xl"
          elevation="2"
          class="add-project-btn"
          @click="emit('update:addProjectDialog', true)"
        >
          New Project
        </v-btn>
      </div>

      <div class="projects-grid">
        <TransitionGroup name="project-fade">
          <div
            v-for="(projectGroup, index) in groupedProjects"
            :key="projectGroup[0].project_name"
            :style="{ '--index': index }"
            class="project-grid-item"
          >
            <project-card
              :project="projectGroup"
              @project-removed="removeWithUndo"
            />
          </div>
        </TransitionGroup>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="empty-state"
    >
      <div class="empty-animation">
        <div class="empty-icon-wrapper">
          <v-icon
            size="80"
            color="primary"
            class="empty-icon"
          >
            mdi-folder-star-outline
          </v-icon>
        </div>
      </div>
      
      <div class="empty-content">
        <h2 class="empty-title">Welcome to Your Workspace</h2>
        <p class="empty-text">
          Create your first project to start tracking invoices, managing expenses, and staying organized
        </p>
        
        <v-btn
          color="primary"
          size="x-large"
          prepend-icon="mdi-plus"
          rounded="xl"
          elevation="4"
          class="empty-cta"
          @click="emit('update:addProjectDialog', true)"
        >
          Create Your First Project
        </v-btn>

        <div class="empty-features">
          <div class="feature-item">
            <v-icon color="primary" size="20">mdi-check-circle</v-icon>
            <span>Track invoices</span>
          </div>
          <div class="feature-item">
            <v-icon color="primary" size="20">mdi-check-circle</v-icon>
            <span>Manage expenses</span>
          </div>
          <div class="feature-item">
            <v-icon color="primary" size="20">mdi-check-circle</v-icon>
            <span>Stay organized</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Project Dialog -->
    <v-dialog
      :model-value="addProjectDialog"
      max-width="600"
      persistent
      @update:model-value="emit('update:addProjectDialog', $event)"
    >
      <v-card rounded="xl" elevation="24">
        <AddNewProject
          @close="emit('update:addProjectDialog', false)"
          @new-project-added="addNewProject"
        />
      </v-card>
    </v-dialog>

    <!-- Undo Snackbar -->
    <v-snackbar
      v-model="undoSnackbar"
      location="bottom"
      timeout="5000"
      color="surface-variant"
      elevation="8"
      rounded="xl"
    >
      <div class="snackbar-content">
        <v-icon color="warning" class="mr-3">
          mdi-folder-remove-outline
        </v-icon>
        <span class="snackbar-text">Project removed</span>
      </div>
      <template #actions>
        <v-btn
          variant="text"
          color="primary"
          rounded="lg"
          @click="undoRemove"
        >
          <v-icon start size="20">mdi-undo</v-icon>
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

  // Immediate UI update with optimistic placeholder
  invoiceArray.addProjectOptimistic(project)
  
  emit("update:addProjectDialog", false)

  // Fetch real data from backend after a brief delay
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
  // Load projects on mount
  await invoiceArray.refreshInvoices()
  isLoading.value = false
})
</script>

<style scoped>
.projects-container {
  min-height: calc(100vh - 200px);
  padding: 24px;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 24px;
}

.loading-text {
  font-size: 1rem;
  color: rgb(var(--v-theme-grey-600));
  margin: 0;
}

/* Projects Content */
.projects-content {
  max-width: 1400px;
  margin: 0 auto;
}

.projects-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 0 8px;
}

.header-text {
  flex: 1;
}

.projects-title {
  font-size: 2rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 4px;
  letter-spacing: -0.02em;
}

.projects-subtitle {
  font-size: 0.9375rem;
  color: rgb(var(--v-theme-grey-600));
  margin: 0;
}

.add-project-btn {
  font-weight: 600;
  letter-spacing: 0.01em;
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.25);
}

/* Projects Grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.project-grid-item {
  height: 100%;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 600px;
  padding: 80px 24px;
  background: linear-gradient(135deg, 
    rgba(var(--v-theme-surface), 1) 0%, 
    rgba(var(--v-theme-primary), 0.03) 100%
  );
  border-radius: 32px;
  border: 2px dashed rgba(var(--v-theme-primary), 0.2);
  position: relative;
  overflow: hidden;
}

.empty-state::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, 
    rgba(var(--v-theme-primary), 0.05) 0%, 
    transparent 70%
  );
  animation: pulse 8s ease-in-out infinite;
}

.empty-animation {
  position: relative;
  z-index: 1;
  margin-bottom: 32px;
}

.empty-icon-wrapper {
  width: 140px;
  height: 140px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, 
    rgb(var(--v-theme-primary)) 0%, 
    rgb(var(--v-theme-secondary)) 100%
  );
  border-radius: 32px;
  box-shadow: 0 12px 40px rgba(var(--v-theme-primary), 0.3);
  animation: float 3s ease-in-out infinite;
}

.empty-icon {
  animation: rotate 4s ease-in-out infinite;
}

.empty-content {
  position: relative;
  z-index: 1;
  max-width: 600px;
}

.empty-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 16px;
  letter-spacing: -0.02em;
}

.empty-text {
  font-size: 1.0625rem;
  color: rgb(var(--v-theme-grey-600));
  margin: 0 0 40px;
  line-height: 1.6;
}

.empty-cta {
  font-weight: 600;
  letter-spacing: 0.01em;
  padding: 24px 48px !important;
  font-size: 1rem;
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.35);
  margin-bottom: 48px;
}

.empty-features {
  display: flex;
  gap: 32px;
  justify-content: center;
  flex-wrap: wrap;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9375rem;
  color: rgb(var(--v-theme-grey-700));
  font-weight: 500;
}

/* Snackbar */
.snackbar-content {
  display: flex;
  align-items: center;
}

.snackbar-text {
  font-weight: 500;
  font-size: 0.9375rem;
}

/* Animations */
.project-fade-enter-active {
  transition: all 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
  transition-delay: calc(var(--index, 0) * 60ms);
}

.project-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.project-fade-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.project-fade-leave-to {
  opacity: 0;
  transform: translateY(-15px) scale(0.95);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(2deg);
  }
}

@keyframes rotate {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-5deg);
  }
  75% {
    transform: rotate(5deg);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.5;
  }
  50% {
    transform: translate(-5%, -5%) scale(1.1);
    opacity: 0.3;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .projects-container {
    padding: 16px;
  }

  .projects-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .add-project-btn {
    width: 100%;
  }

  .projects-grid {
    grid-template-columns: 1fr;
  }

  .projects-title {
    font-size: 1.75rem;
  }

  .empty-title {
    font-size: 1.75rem;
  }

  .empty-features {
    flex-direction: column;
    gap: 16px;
  }

  .empty-state {
    min-height: 500px;
    padding: 60px 24px;
  }
}
</style>