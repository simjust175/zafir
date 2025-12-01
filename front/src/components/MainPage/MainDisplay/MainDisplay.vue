<template>
  <v-container fluid>
    <v-container
      class="fill-height fill-width pa-1"
      fluid
    >
      <v-responsive
        class="fill-height fill-width"
        width="100%"
      >
        <!-- 🔄 Loading State -->
        <v-row
          v-if="loading"
          class="d-flex justify-center align-center"
        >
          <v-progress-circular
            indeterminate
            size="64"
            color="primary"
          />
        </v-row>

        <!-- 🗂 Empty State -->
        <v-row
          v-else-if="1==2"
          class="d-flex justify-center align-center"
        >
          <v-card
            class="pa-8 ma-4 d-flex flex-column align-center justify-center rounded-xl"
            width="100%"
            style="backdrop-filter: blur(12px); background: linear-gradient(135deg, #f5f7fa, #e2e6ea); box-shadow: 0 8px 24px rgba(0,0,0,0.1);"
          >
            <v-icon
              icon="mdi-folder-open-outline"
              size="120"
              color="primary"
              class="mb-4 animate__animated animate__fadeInDown"
            />
            <h2 class="text-h5 font-weight-medium text-grey-darken-3 mb-2">
              No projects yet
            </h2>
            <p class="text-body-2 text-grey-darken-1 mb-6 text-center">
              You haven’t added any projects. When you do, they’ll show up here with all their invoices, payments, and drama-level UX.
            </p>
            <v-btn
              prepend-icon="mdi-rocket-launch"
              color="primary"
              size="large"
              class="mt-2"
              @click="addProjectDialog = true"
            >
              Launch your first project
            </v-btn>
          </v-card>
        </v-row>

        <!-- ✅ Main Content -->
        <v-row
          v-else
          no-gutters
        >
          <!-- Sidebar -->
          <v-col
            cols="3"
            class="pa-0 bg-blue"
          >
            <project-sidebar
              :selected-project="selectedProject"
              :projects="projects"
              @update:selected-project="selectedProject = $event"
            />
          </v-col>

          <!-- Main Area -->
          <v-col
            cols="12"
            class="pa-6"
          >
            <project-filter-bar
              v-model:search-text="search"
              v-model:status-filter="statusFilter"
              location="mainPage"
              @update:search-text="search = $event"
              @update:status-filter="statusFilter = $event"
              @add-payment="addInvoicing('paid')"
              @add-invoice="addInvoicing('invoiced')"
            />

            <main-display-overview
              :project="selectedProjectData"
              :invoices="invoices.filter(i => i.project === selectedProject)"
              :project-name="selectedProjectData?.name"
              :email="emails"
              :db-response="invoices"
              class="mb-6"
            />

            <v-fade-transition mode="out-in">
              <v-card
                width="99%"
                rounded="xl"
                class="pa-4"
              >
                <table-parent
                  :key="selectedProjectData?.id"
                  :search-val="search"
                  class="mt-4"
                  :invoices="invoicesByProject[selectedProjectData?.name]?.invoices || []"
                  :project-name="selectedProjectData?.name"
                  :project_id="invoicesByProject[selectedProjectData?.name]?.projectId"
                  :expanded="expanded"
                  :refreshing="refresh"
                  fill-width
                  fill-height
                  @table-update="fetchFromSessionStorage"
                />
              </v-card>
            </v-fade-transition>
          </v-col>
        </v-row>

        <!-- ➕ Floating Button -->
        <v-fab
          extended
          color="primary"
          density="comfortable"
          prepend-icon="mdi-plus"
          location="right bottom"
          text="Add project"
          height="50"
          width="180"
          app
          @click="addProjectDialog = !addProjectDialog"
        />

        <!-- Add Project Dialog -->
        <v-dialog
          v-model="addProjectDialog"
          :in-tabs="false"
        >
          <add-new-project
            @close="addProjectDialog = false"
            @new-project-added="handleProjectRemoved"
          />
        </v-dialog>
      </v-responsive>
    </v-container>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue"

// Props from parent
const props = defineProps({
  invoices: { type: Array, default: () => [] },
  emails: Array,
  currencyInUse: String,
  monthly: Object,
  daysLeft: Number,
  language: String
})

// Local state
const loading = ref(true)
const selectedProject = ref(null)
const search = ref("")
const statusFilter = ref("All")
const addingInvoicing = ref([])
const addProjectDialog = ref(false)

// Derived projects
const projects = computed(() => {
  const set = []
  for (const inv of props.invoices) {
    if (inv.project_name && !set.some(p => p.name === inv.project_name)) {
      set.push({ name: inv.project_name, id: inv.project_id  })
    }
  }
  return set
})

// Map project → invoices
const invoicesByProject = computed(() => {
  const map = {}
  for (const inv of props.invoices) {
    if (!inv.project_name) continue
    if (!map[inv.project_name]) {
      map[inv.project_name] = { invoices: [], projectId: inv.project_id }
    }
    if (inv.invoice_id) map[inv.project_name].invoices.push(inv)
  }
  return map
})

// Currently selected project data
const selectedProjectData = computed(() =>
  projects.value.find(p => p.id === selectedProject.value) || null
)

// Select first project by default
watch(
  () => projects.value,
  (newProjects) => {
    if (newProjects.length > 0 && !selectedProject.value) {
      selectedProject.value = newProjects[0].id
    }
  },
  { immediate: true }
)

// Simulate data load
onMounted(() => {
  // ✅ mark loading false once invoices are passed down
  if (props.invoices) {
    loading.value = false
  }
})

import { globalFunctions } from "@/stores/globalFunctions.js";
const functions = globalFunctions();
// Helpers
const addInvoicing = (adding) => {
  functions.add = adding;
  addingInvoicing.value = adding
}

const fetchFromSessionStorage = () => {}
const handleProjectRemoved = (projectName) => {
  // adjust this if you use Pinia or Vuex
}
</script>