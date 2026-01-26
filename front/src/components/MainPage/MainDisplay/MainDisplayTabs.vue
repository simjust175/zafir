<template>
  <div class="invoice-dashboard">
    <div class="dashboard-layout">
      <aside class="projects-sidebar">
        <div class="sidebar-header">
          <h2 class="sidebar-title">
            Projects
          </h2>
        </div>
        
        <div class="project-list">
          <div
            v-for="project in filteredProjects"
            :key="project"
            class="project-item"
            :class="{ active: tab === project }"
            @click="tab = project"
          >
            <div class="project-content">
              <span class="project-name">{{ capitalizeName(project) }}</span>
              <span class="invoice-count">{{ getProjectInvoiceCount(project) }}</span>
            </div>
          </div>
          
          <div
            v-if="filteredProjects.length === 0"
            class="empty-projects"
          >
            <p>No projects yet</p>
          </div>
        </div>
        
        <div class="sidebar-footer">
          <button
            class="new-project-btn"
            @click="addProjectDialog = true"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line
                x1="12"
                y1="5"
                x2="12"
                y2="19"
              />
              <line
                x1="5"
                y1="12"
                x2="19"
                y2="12"
              />
            </svg>
            <span>New Project</span>
          </button>
        </div>
      </aside>

      <main class="main-content">
        <div
          v-if="tab"
          class="content-wrapper"
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
          class="empty-state"
        >
          <div class="empty-content">
            <div class="empty-illustration">
              <div class="illustration-wrapper">
                <div class="illustration-glow" />
                <div class="illustration-bg">
                  <svg
                    class="illustration-icon"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <polyline
                      points="14 2 14 8 20 8"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <line
                      x1="16"
                      y1="13"
                      x2="8"
                      y2="13"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    />
                    <line
                      x1="16"
                      y1="17"
                      x2="8"
                      y2="17"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div
              v-if="filteredProjects.length === 0"
              class="empty-badge"
            >
              Get Started
            </div>

            <h2
              v-if="filteredProjects.length === 0"
              class="empty-title"
            >
              Track invoices effortlessly
            </h2>
            <h2
              v-else
              class="empty-title"
            >
              Select a project
            </h2>
            
            <p
              v-if="filteredProjects.length === 0"
              class="empty-description"
            >
              Organize supplier invoices, apply margins, and keep your project costs under control — all in one place.
            </p>
            <p
              v-else
              class="empty-description"
            >
              Choose a project from the sidebar to view its invoices.
            </p>

            <button
              v-if="filteredProjects.length === 0"
              class="empty-cta-btn"
              @click="addProjectDialog = true"
            >
              Create your first project
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line
                  x1="5"
                  y1="12"
                  x2="19"
                  y2="12"
                />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>

    <v-dialog
      v-model="addProjectDialog"
      max-width="480"
    >
      <add-new-project
        @close="addProjectDialog = false"
        @new-project-added="handleProjectAdded"
      />
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

const capitalizeName = s =>
  s ? s[0].toUpperCase() + s.slice(1) : "";


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
.invoice-dashboard {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.dashboard-layout {
  display: flex;
  flex: 1;
  min-height: 0;
  background: rgb(var(--v-theme-background));
}

.projects-sidebar {
  width: 240px;
  min-width: 240px;
  display: flex;
  flex-direction: column;
  background: rgb(var(--v-theme-surface));
  border-right: 1px solid #eaeaea;
}

.sidebar-header {
  padding: 24px 20px 16px;
}

.sidebar-title {
  font-size: 13px;
  font-weight: 500;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0;
}

.project-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px;
}

.project-item {
  padding: 0;
  margin-bottom: 2px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.project-item:hover {
 background: rgb(var(--v-theme-surface-variant));
}

.project-item.active {
  background: rgb(var(--v-theme-primary));
}

.project-item.active .project-name {
  color: rgb(var(--v-theme-on-primary));
}

.project-item.active .invoice-count {
  /* background: rgba(255, 255, 255, 0.2);
  color: #fff; */
   background: rgba(var(--v-theme-on-primary), 0.2);
  color: rgb(var(--v-theme-on-primary));
}

.project-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
}

.project-name {
  font-size: 14px;
  font-weight: 450;
  color: rgb(var(--v-theme-on-surface));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.invoice-count {
  font-size: 12px;
  font-weight: 500;
  /* color: #666;
  background: #eaeaea; */
  color: rgb(var(--v-theme-on-surface-variant));
  background: rgb(var(--v-theme-surface-variant));
  padding: 2px 8px;
  border-radius: 10px;
  flex-shrink: 0;
}

.empty-projects {
  padding: 20px;
  text-align: center;
}

.empty-projects p {
  font-size: 13px;
  color: #999;
  margin: 0;
}

.sidebar-footer {
  padding: 16px 12px;
  border-top: 1px solid #eaeaea;
}

.new-project-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #171717;
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.new-project-btn:hover {
  background: #fafafa;
  border-color: #d4d4d4;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-content {
  text-align: center;
}

.empty-icon {
  color: #d4d4d4;
  margin-bottom: 16px;
}

.empty-content h3 {
  font-size: 16px;
  font-weight: 500;
  color: #171717;
  margin: 0 0 8px;
}

.empty-content p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

@media (max-width: 1024px) {
  .projects-sidebar {
    width: 200px;
    min-width: 200px;
  }
}

@media (max-width: 768px) {
  .dashboard-layout {
    flex-direction: column;
  }
  
  .projects-sidebar {
    width: 100%;
    min-width: 100%;
    max-height: 200px;
    border-right: none;
    border-bottom: 1px solid #eaeaea;
  }
  
  .project-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px;
  }
  
  .project-item {
    flex: 0 0 auto;
    margin-bottom: 0;
  }
  
  .sidebar-footer {
    display: none;
  }
}

.empty-content {
  text-align: center;
  max-width: 420px;
  padding: 48px 32px;
}

.empty-illustration {
  position: relative;
  display: inline-block;
  margin-bottom: 28px;
}

.illustration-wrapper {
  position: relative;
}

.illustration-glow {
  position: absolute;
  inset: -20px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%);
  border-radius: 50%;
  animation: glow 4s ease-in-out infinite;
}

@keyframes glow {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

.illustration-bg {
  width: 100px;
  height: 100px;
  background: linear-gradient(145deg, #fafbff 0%, #f0f2ff 100%);
  border: 1px solid rgba(99, 102, 241, 0.1);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.02),
    0 4px 16px rgba(99, 102, 241, 0.06);
}

.illustration-icon {
  color: #6366f1;
}

.empty-badge {
  display: inline-block;
  padding: 6px 14px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6366f1;
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  border-radius: 100px;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 26px;
  font-weight: 700;
  /* color: #0f0f0f; */
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 12px;
  letter-spacing: -0.03em;
  line-height: 1.2;
}

.empty-description {
  font-size: 15px;
  /* color: #6b7280; */
  color: rgb(var(--v-theme-on-surface-variant));
  line-height: 1.7;
  margin: 0 0 32px;
}

.empty-cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: #0f0f0f;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.empty-cta-btn:hover {
  background: #171717;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.empty-cta-btn:active {
  transform: translateY(0);
}

.empty-cta-btn svg {
  stroke: currentColor;
  transition: transform 0.2s ease;
}

.empty-cta-btn:hover svg {
  transform: translateX(3px);
}
</style>
