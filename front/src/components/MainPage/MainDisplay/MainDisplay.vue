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
        <v-row no-gutters>
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

          <!-- Main Content -->
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
              :adding="addingInvoicing"
              class="mb-6"
            />
            <v-fade-transition
              mode="out-in"
            >
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
      </v-responsive>
    </v-container>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue"

// Props coming from parent
const props = defineProps({
  currencyInUse: String,
  monthly: Object,
  daysLeft: Number,
  invoices: { type: Array, default: () => [] },
  emails: Array,
  language: String
})

// Local state
const triggerOverlay = ref(false)
const activateDialog = ref(false) // <-- should be fetched/prop-passed in real use
const selectedProject = ref(null)
const search = ref("")
const statusFilter = ref("All")
const addingInvoicing = ref([])

// Projects derived from invoices
const projects = computed(() => {
  const set = []
  for (const inv of props.invoices) {
    if (inv.project_name && !set.some(p => p.name === inv.project_name)) {
      set.push({ name: inv.project_name, id: inv.project })
    }
  }
  return set
})

const addInvoicing = (adding)=> {
  addingInvoicing.value = adding
}

// Search (expanded sticky bar)
const filteredProjects = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return projects.value;
  return projects.value.filter((p) => p.toLowerCase().includes(q));
});

// Map: project -> { invoices, projectId }
const invoicesByProject = computed(() => {
  const map = {};
  for (const inv of props.invoices) {
    console.log("inv:", inv, "<<<<");
    
    if (!inv.project_name) continue;
    if (!map[inv.project_name]) {
      map[inv.project_name] = { invoices: [], projectId: inv.project_id };
    }
    if (inv.invoice_id) map[inv.project_name].invoices.push(inv);
  }
  return map;
});


// Currently selected project data
const selectedProjectData = computed(() =>
  projects.value.find(p => p.id === selectedProject.value) || null
)

// Ensure default project is first one
watch(
  () => projects.value,
  (newProjects) => {
    if (newProjects.length > 0 && !selectedProject.value) {
      selectedProject.value = newProjects[0].id
    }
  },
  { immediate: true }
)

// Example overlay trigger
const triggerOverlayFunction = () => {
  triggerOverlay.value = true
  setTimeout(() => {
    triggerOverlay.value = false
  }, 500)
}

const handleProjectRemoved = (projectName) => {
  invoiceStore.dbResponse = invoiceStore.dbResponse.filter(
    (inv) => inv.project_name !== projectName
  );
};

// Placeholder
const fetchFromSessionStorage = () => {};

onMounted(() => {
  triggerOverlayFunction()
})

</script>

<style>
.scrollbar-style::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  background-color: #f5f5f5;
}
.scrollbar-style::-webkit-scrollbar {
  width: 3px;
  background-color: #f5f5f5;
}
.scrollbar-style::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background-color: #e5e5e5ff;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.35s ease;
  position: relative;
  display: block;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>