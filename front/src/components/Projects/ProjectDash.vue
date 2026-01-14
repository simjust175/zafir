<template>
  <div class="projects-container">
    <div
      v-if="projects.length"
      class="projects-grid"
    >
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

    <div
      v-else
      class="empty-state"
    >
      <div class="empty-icon">
        <v-icon
          size="64"
          color="grey-lighten-1"
        >
          mdi-folder-open-outline
        </v-icon>
      </div>
      <h2 class="empty-title">
        No projects yet
      </h2>
      <p class="empty-text">
        Create your first project to start organizing your invoices
      </p>
      <v-btn
        color="primary"
        size="large"
        prepend-icon="mdi-plus"
        rounded="lg"
        @click="addProjectDialog = true"
      >
        Create Project
      </v-btn>
    </div>

    <!-- <v-fab
      v-if="projects.length"
      extended
      color="primary"
      text="New Project"
      prepend-icon="mdi-plus"
      location="right bottom"
      size="large"
      app
      @click="addProjectDialog = true"
    /> -->

    <v-dialog
      :model-value="addProjectDialog"
      max-width="500"
      @update:model-value="emit('update:addProjectDialog', $event)"
    >
      <AddNewProject
        @close="emit('update:addProjectDialog', false)"
        @new-project-added="addNewProject"
      />
    </v-dialog>

    <v-snackbar
      v-model="undoSnackbar"
      location="bottom"
      timeout="5000"
      color="surface"
    >
      <div class="d-flex align-center">
        <v-icon
          color="warning"
          class="mr-2"
        >
          mdi-folder-remove-outline
        </v-icon>
        Project removed
      </div>
      <template #actions>
        <v-btn
          variant="text"
          color="primary"
          @click="undoRemove"
        >
          Undo
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import ProjectCard from "./ProjectCard.vue"
import AddNewProject from "./AddNewProject.vue"
import { ref, computed } from "vue"
import { invoices } from "@/stores/invoiceState.js"

const props = defineProps({
  addProjectDialog: Boolean
})

const emit = defineEmits(["update:addProjectDialog"])

const invoiceArray = invoices()
const undoSnackbar = ref(false)
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

const addNewProject = (project) => {
  if (!project?.project_name) return

  // instant UI update
  invoiceArray.addProjectOptimistic(project)

  emit("update:addProjectDialog", false)

  // safety net (authoritative)
  queueMicrotask(() => {
    invoiceArray.refreshInvoices()
  })
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

// const addNewProject = (newProject) => {
//   if (!newProject) return
//   // invoiceArray.dbResponse.push(newProject)
//   emit("update:addProjectDialog", false)
// }

const projects = computed(() => groupedProjects.value.map(g => g[0].project_name))
</script>

<style scoped>
.projects-container {
  min-height: 400px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.project-grid-item {
  height: 100%;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 80px 24px;
  background: rgb(var(--v-theme-surface));
  border-radius: 20px;
  border: 2px dashed rgb(var(--v-theme-grey-200));
}

.empty-icon {
  margin-bottom: 24px;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 8px;
}

.empty-text {
  font-size: 0.9375rem;
  color: rgb(var(--v-theme-grey-500));
  margin: 0 0 24px;
  max-width: 300px;
}

.project-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
  transition-delay: calc(var(--index, 0) * 50ms);
}

.project-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.project-fade-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.project-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

@media (max-width: 768px) {
  .projects-grid {
    grid-template-columns: 1fr;
  }
}
</style>
