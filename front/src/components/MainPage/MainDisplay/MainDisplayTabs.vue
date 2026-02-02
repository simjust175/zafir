<template>
  <div class="invoice-workspace">
    <aside class="workspace-sidebar">
      <div class="sidebar-lead">
        <span class="sidebar-label">Projects</span>
      </div>
      
      <nav class="project-nav">
        <button
          v-for="project in filteredProjects"
          :key="project"
          class="project-nav-item"
          :class="{ active: tab === project }"
          @click="tab = project"
        >
          <span class="nav-item-name">{{ project }}</span>
          <span class="nav-item-count">{{ getProjectInvoiceCount(project) }}</span>
        </button>
        
        <div
          v-if="filteredProjects.length === 0"
          class="nav-empty"
        >
          <span>No projects</span>
        </div>
      </nav>
      
      <div class="sidebar-action">
        <button
          class="add-project-trigger"
          @click="addProjectDialog = true"
        >
          <span class="trigger-icon">+</span>
          <span class="trigger-text">New Project</span>
        </button>
      </div>
    </aside>

    <main class="workspace-main">
      <div
        v-if="tab"
        class="main-container"
      >
        <table-parent
          :invoices="invoicesByProject[tab]?.invoices || []"
          :project-name="tab"
          :project_id="invoicesByProject[tab]?.projectId"
          :expanded="expanded"
          :refreshing="refresh"
          :search-val="searchValue"
          @table-update="fetchFromSessionStorage"
        />
      </div>
      
      <div
        v-else
        class="empty-workspace"
      >
        <div class="empty-container">
          <div class="empty-visual">
            <div class="visual-shape">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <polyline
                  points="14 2 14 8 20 8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <line
                  x1="16"
                  y1="13"
                  x2="8"
                  y2="13"
                  stroke-linecap="round"
                />
                <line
                  x1="16"
                  y1="17"
                  x2="8"
                  y2="17"
                  stroke-linecap="round"
                />
              </svg>
            </div>
          </div>

          <div class="empty-text">
            <span
              v-if="filteredProjects.length === 0"
              class="empty-eyebrow"
            >Get Started</span>
            <h2 class="empty-heading">
              {{ filteredProjects.length === 0 ? 'Track invoices effortlessly' : 'Select a project' }}
            </h2>
            <p class="empty-body">
              {{ filteredProjects.length === 0 
                ? 'Organize supplier invoices, apply margins, and keep your project costs under control.' 
                : 'Choose a project from the sidebar to view its invoices.' 
              }}
            </p>
          </div>

          <button 
            v-if="filteredProjects.length === 0" 
            class="empty-action" 
            @click="addProjectDialog = true"
          >
            Create your first project
          </button>
        </div>
      </div>
    </main>

    <v-dialog
      v-model="addProjectDialog"
      max-width="480"
    >
      <div class="dialog-surface">
        <add-new-project
          @close="addProjectDialog = false"
          @new-project-added="handleProjectAdded"
        />
      </div>
    </v-dialog>
  </div>
</template>

<script setup>
import AddNewProject from "@/components/Projects/AddNewProject.vue"
import { ref, computed, watch } from "vue"
import { invoices } from "@/stores/invoiceState.js"

const invoiceStore = invoices()

const props = defineProps({
  invoiceArray: { type: Array, required: true },
  expanded: Boolean,
  searchValue: { type: String, default: '' }
})

const emit = defineEmits(['table-update'])

const refresh = ref(false)
const addProjectDialog = ref(false)

const projects = computed(() => {
  const set = new Set()
  for (const inv of props.invoiceArray || []) {
    if (inv?.project_name) set.add(inv.project_name)
  }
  return [...set]
})

const filteredProjects = computed(() => {
  const q = (props.searchValue || '').trim().toLowerCase()
  if (!q) return projects.value
  return projects.value.filter((p) => p?.toLowerCase().includes(q))
})

const invoicesByProject = computed(() => {
  const map = {}
  for (const inv of props.invoiceArray || []) {
    if (!inv?.project_name) continue
    if (!map[inv.project_name]) {
      map[inv.project_name] = { invoices: [], projectId: inv.project_id }
    }
    if (inv.invoice_id) map[inv.project_name].invoices.push(inv)
  }
  return map
})

const getProjectInvoiceCount = (project) => {
  return invoicesByProject.value[project]?.invoices?.length || 0
}

const tab = ref(projects.value.length ? projects.value[0] : null)

watch(projects, (val) => {
  if (!val.includes(tab.value) && val.length > 0) {
    tab.value = val[0]
  }
}, { immediate: true })

const handleProjectAdded = (newProject) => {
  if (newProject) {
    invoiceStore.dbResponse.push(newProject)
  }
  addProjectDialog.value = false
}

const fetchFromSessionStorage = () => {
  emit('table-update')
}
</script>

<style scoped>
.invoice-workspace {
  display: flex;
  height: 100%;
  min-height: 100vh;
  background: rgb(var(--v-theme-background));
}

.workspace-sidebar {
  width: 260px;
  min-width: 260px;
  display: flex;
  flex-direction: column;
  background: rgb(var(--v-theme-surface));
  border-right: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}

.sidebar-lead {
  padding: 28px 24px 20px;
}

.sidebar-label {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgb(var(--v-theme-grey-400));
}

.project-nav {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px;
}

.project-nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 14px;
  margin-bottom: 2px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.12s ease;
  text-align: left;
}

.project-nav-item:hover {
  background: rgba(var(--v-theme-on-surface), 0.04);
}

.project-nav-item.active {
  background: rgb(var(--v-theme-on-surface));
}

.project-nav-item.active .nav-item-name {
  color: rgb(var(--v-theme-surface));
}

.project-nav-item.active .nav-item-count {
  background: rgba(255, 255, 255, 0.15);
  color: rgb(var(--v-theme-surface));
}

.nav-item-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: capitalize;
}

.nav-item-count {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgb(var(--v-theme-grey-500));
  background: rgba(var(--v-theme-on-surface), 0.06);
  padding: 3px 8px;
  border-radius: 12px;
  flex-shrink: 0;
}

.nav-empty {
  padding: 24px 16px;
  text-align: center;
}

.nav-empty span {
  font-size: 0.8125rem;
  color: rgb(var(--v-theme-grey-400));
}

.sidebar-action {
  padding: 16px 12px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}

.add-project-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  cursor: pointer;
  transition: all 0.12s ease;
}

.add-project-trigger:hover {
  background: rgba(var(--v-theme-on-surface), 0.03);
  border-color: rgba(var(--v-theme-on-surface), 0.2);
}

.trigger-icon {
  font-size: 1rem;
  font-weight: 400;
  line-height: 1;
}

.workspace-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.empty-workspace {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
}

.empty-container {
  max-width: 380px;
  text-align: center;
}

.empty-visual {
  margin-bottom: 28px;
}

.visual-shape {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  background: rgba(var(--v-theme-on-surface), 0.04);
  border-radius: 16px;
  color: rgb(var(--v-theme-grey-400));
}

.empty-text {
  margin-bottom: 32px;
}

.empty-eyebrow {
  display: inline-block;
  padding: 6px 12px;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
  border-radius: 100px;
  margin-bottom: 16px;
}

.empty-heading {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 12px;
  letter-spacing: -0.02em;
  line-height: 1.25;
}

.empty-body {
  font-size: 0.9375rem;
  color: rgb(var(--v-theme-grey-500));
  line-height: 1.6;
  margin: 0;
}

.empty-action {
  display: inline-flex;
  padding: 14px 24px;
  background: rgb(var(--v-theme-on-surface));
  color: rgb(var(--v-theme-surface));
  border: none;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.12s ease;
}

.empty-action:hover {
  opacity: 0.88;
}

.dialog-surface {
  background: rgb(var(--v-theme-surface));
  border-radius: 16px;
  overflow: hidden;
}

@media (max-width: 1024px) {
  .workspace-sidebar {
    width: 220px;
    min-width: 220px;
  }
}

@media (max-width: 768px) {
  .invoice-workspace {
    flex-direction: column;
  }
  
  .workspace-sidebar {
    width: 100%;
    min-width: 100%;
    max-height: 180px;
    border-right: none;
    border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  }
  
  .project-nav {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    gap: 8px;
    padding: 0 16px 16px;
  }
  
  .project-nav-item {
    flex: 0 0 auto;
    margin-bottom: 0;
  }
  
  .sidebar-action {
    display: none;
  }
  
  .sidebar-lead {
    padding: 20px 16px 12px;
  }
}
</style>
