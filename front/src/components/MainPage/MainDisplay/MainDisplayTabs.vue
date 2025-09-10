<template>
  <v-card
    class="d-flex flex-column"
    rounded="xl"
    :class="{ 'rounded-xl': !expanded, 'elevation-3': !expanded, 'mx-2': !expanded }"
    :flat="expanded"
    min-height="75vh"
  >
    <!-- Expand Icon -->
    <v-icon
      v-show="!expanded"
      icon="mdi-arrow-expand"
      class="mr-5 mt-4 mb-3 position-absolute top-0 right-0 zIndex"
      color="primary"
      @click="$router.push('/table')"
    />

    <v-row
      no-gutters
      class="fill-height"
    >
      <!-- SPLIT VIEW (sidebar + content) -->
      <template v-if="!expanded">
        <!-- Sidebar Tabs (vertical) -->
        <v-col
          cols="12"
          md="3"
          :class="[themeBg, 'd-flex flex-column pa-0']"
          style="max-height: 100%;"
        >
          <div class="d-flex flex-column overflow-y-auto">
            <v-tabs
              v-model="tab"
              direction="vertical"
              class="pt-2 d-flex flex-column justify-start"
              :selected-class="selectedTab"
              :ripple="true"
              color="primary"
            >
              <v-tab
                v-for="project in projects"
                :key="project"
                :value="project"
                class="px-6 pb-1"
                :ripple="false"
                prepend-icon="mdi-domain"
              >
                {{ project }}
              </v-tab>

              <div class="flex-grow-1" />

              <v-tab
                value="__add__"
                class="text-left font-weight-bold text-primary mb-2"
                selected-class="bg-transparent"
              >
                <v-btn
                  color="primary"
                  prepend-icon="mdi-plus"
                  class="px-10"
                  variant="outlined"
                  @click="addProjectDialog = true"
                >
                  Add Project
                </v-btn>
              </v-tab>
            </v-tabs>
          </div>
        </v-col>

        <!-- Right Content -->
        <v-col
          cols="12"
          md="9"
          class="pa-4 pt-0 d-flex flex-column"
        >
          <v-tabs-window
            v-model="tab"
            class="flex-1 min-h-0 overflow-y-auto pr-2"
          >
            <v-tabs-window-item
              v-for="project in projects"
              :key="project"
              :value="project"
            >
              <table-parent
                class="mt-4"
                :invoices="invoicesByProject[project]?.invoices || []"
                :project-name="project"
                :project_id="invoicesByProject[project]?.projectId"
                :expanded="expanded"
                :refreshing="refresh"
                fill-width
                fill-height
                @table-update="fetchFromSessionStorage"
              />
            </v-tabs-window-item>
          </v-tabs-window>
        </v-col>
      </template>

      <!-- EXPANDED VIEW (sticky horizontal tabs) -->
      <template v-else>
        <v-col
          cols="12"
          class="pa-0"
        >
          <div class="content-scroll">
            <!-- Sticky bar -->
            <div class="sticky-bar position-sticky">
              <v-tabs
                v-model="tab"
                direction="horizontal"
                :show-arrows="true"
                color="primary"
                :ripple="false"
                class="shrink-0"
                :selected-class="selectedTab"
              >
                <!-- Project tabs -->
                <v-tab
                  v-for="project in filteredProjects"
                  :key="project"
                  :value="project"
                  class="px-4"
                  prepend-icon="mdi-domain"
                >
                  {{ project }}
                </v-tab>

                <!-- Add Project tab -->
                <v-tab
                  :value="'__add__'"
                  variant="tonal"
                  elevation="1"
                  class="px-4 bg-primary text-white font-weight-bold"
                  @click="addProjectDialog = true"
                >
                  <template #default>
                    <v-icon
                      icon="mdi-plus"
                      class="mr-2"
                    />
                    Add Project
                  </template>
                </v-tab>
              </v-tabs>
            </div>

            <!-- Content -->
            <v-tabs-window
              v-model="tab"
              class="flex-1 min-h-0 px-4 py-2"
            >
              <v-tabs-window-item
                v-for="project in filteredProjects"
                :key="project"
                :value="project"
              >
                <table-parent
                  class="mt-4"
                  :invoices="invoicesByProject[project]?.invoices || []"
                  :project-name="project"
                  :project_id="invoicesByProject[project]?.projectId"
                  :expanded="expanded"
                  :refreshing="refresh"
                  fill-width
                  fill-height
                  @table-update="fetchFromSessionStorage"
                />
              </v-tabs-window-item>

              <!-- Empty state if no match -->
              <v-tabs-window-item
                v-if="filteredProjects.length === 0"
                :value="'__none__'"
              >
                <div class="d-flex flex-column align-center justify-center my-12 text-medium-emphasis">
                  <v-icon
                    size="36"
                    class="mb-3"
                  >
                    mdi-folder-search-outline
                  </v-icon>
                  No projects match “{{ search }}”
                </div>
              </v-tabs-window-item>
            </v-tabs-window>
          </div>
        </v-col>
      </template>
    </v-row>

    <!-- FAB (expanded mode) -->
    <v-fab
      v-if="expanded"
      extended
      color="primary"
      density="comfortable"
      prepend-icon="mdi-plus"
      location="right bottom"
      text="Add project"
      height="40"
      width="170"
      app
      @click="addProjectDialog = true"
    />

    <!-- Add Project Dialog -->
    <v-dialog v-model="addProjectDialog">
      <v-card class="px-2 py-4">
        <add-new-project
          @close="addProjectDialog = false"
          @new-project-added="handleProjectRemoved"
        />
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import AddNewProject from "@/components/Projects/AddNewProject.vue";
import { ref, computed, watch } from "vue";
import { useTheme } from "vuetify";
import { invoices } from "@/stores/invoiceState";

const invoiceStore = invoices();

const theme = useTheme();
const themeBg = computed(() =>
  theme.global.name.value === "dark" ? "bg-grey-darken-4" : "bg-grey-lighten-4"
);

const props = defineProps({
  invoiceArray: { type: Array, required: true },
  expanded: Boolean,
});

const refresh = ref(false);
const addProjectDialog = ref(false);

// Build project list from invoiceArray
const projects = computed(() => {
  const set = new Set();
  for (const inv of props.invoiceArray) {
    if (inv.project_name) set.add(inv.project_name);
  }
  return [...set];
});

// Search (expanded sticky bar)
const search = ref("");
const filteredProjects = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return projects.value;
  return projects.value.filter((p) => p.toLowerCase().includes(q));
});

// Map: project -> { invoices, projectId }
const invoicesByProject = computed(() => {
  const map = {};
  for (const inv of props.invoiceArray) {
    if (!inv.project_name) continue;
    if (!map[inv.project_name]) {
      map[inv.project_name] = { invoices: [], projectId: inv.project_id };
    }
    if (inv.invoice_id) map[inv.project_name].invoices.push(inv);
  }
  return map;
});

// Selected tab starts as first project (or null if none)
const tab = ref(projects.value.length ? projects.value[0] : null);

// Keep tab valid when projects change
watch(projects, (val) => {
  if (!val.includes(tab.value)) {
    tab.value = val[0] || null;
  }
});

// Keep tab valid while filtering (expanded mode)
watch(filteredProjects, (val) => {
  if (props.expanded && val.length && !val.includes(tab.value)) {
    tab.value = val[0];
  }
  if (props.expanded && val.length === 0) {
    tab.value = "__none__";
  }
});

// Watch tab changes
watch(tab, (val) => {
  if (val === "__add__") {
    //addProjectDialog.value = true;
    // Reset tab so dialog isn't triggered forever
    tab.value = filteredProjects.value[0] || projects.value[0] || null;
  }
});

const selectedTab = computed(() =>
  props.expanded
    ? `bg-${theme.global.name.value === "dark" ? "grey-darken-3" : "white"}`
    : "border-1"
);

const handleProjectRemoved = (projectName) => {
  invoiceStore.dbResponse = invoiceStore.dbResponse.filter(
    (inv) => inv.project_name !== projectName
  );
};

// Placeholder
const fetchFromSessionStorage = () => {};
</script>

<style scoped>
/* Make the right column’s content scrollable (expanded) with a sticky top bar */
.content-scroll {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto; /* the sticky element must be inside the scroll container */
}

.sticky-bar {
  position: sticky;
  top: 0;
  z-index: 6;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 8px;
  padding-left: 15px;
  padding-right: 15px;
  background: var(--v-theme-surface); /* Vuetify theme surface color */
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  backdrop-filter: saturate(180%) blur(6px);
}

.sticky-actions {
  display: flex;
  align-items: center;
}

.v-tabs-window {
  flex-grow: 1;
  min-height: 0; /* allow child to size within container */
}

.min-h-0 {
  min-height: 0;
}

.zIndex {
  z-index: 999 !important;
}

/* Optional: nicer selected tab in light mode */
:deep(.v-tab--selected) {
  border-radius: 10px;
}
</style>