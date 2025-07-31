<template>
  <v-card
    class="d-flex flex-column"
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

    <v-row no-gutters class="fill-height">
      <!-- Sidebar Tabs -->
      <v-col
        cols="12"
        :md="!expanded ? 3 : 12"
        :class="[themeColor, 'd-flex flex-column pa-0']"
        style="max-height: 100%;"
      >
        <div class="d-flex flex-column flex-grow-1 overflow-y-auto">
          <v-tabs
            v-model="tab"
            :direction="$vuetify.display.mdAndUp && !expanded ? 'vertical' : 'horizontal'"
            :stacked="!$vuetify.display.mdAndUp"
            :class="[
              $vuetify.display.mdAndUp && !expanded ? 'd-flex flex-column justify-start py-0' : '',
              'flex-grow-1 pt-1'
            ]"
            color="primary"
            :show-arrows="!$vuetify.display.mdAndUp || expanded"
          >
            <v-tab
              v-for="project in projects"
              :key="project"
              :value="project"
              class="pl-8"
              prepend-icon="mdi-domain"
            >
              {{ project }}
            </v-tab>

            <div class="flex-grow-1" />

            <v-tab
              value="add"
              class="text-left font-weight-bold text-primary mb-2"
              :class="{ 'pl-8': !expanded }"
              prepend-icon="mdi-domain-plus"
            >
              Add Project
            </v-tab>
          </v-tabs>
        </div>
      </v-col>

      <!-- Right Content -->
      <v-col
        cols="12"
        :md="!expanded ? 9 : 12"
        class="pa-4 d-flex flex-column"
      >
        <v-tabs-window
          v-model="tab"
          class="flex-grow-1 overflow-y-auto pr-2"
        >
          <!-- Projects -->
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

          <!-- Add New Project -->
          <v-tabs-window-item value="add">
            <add-new-project fill-width fill-height :in-tabs="true" />
          </v-tabs-window-item>
        </v-tabs-window>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import AddNewProject from "@/components/Projects/AddNewProject.vue";
import { ref, computed, watch } from "vue";
import { useTheme } from "vuetify";

const theme = useTheme();
const themeColor = computed(() => `bg-grey-${theme.global.name.value}en-4`);

const props = defineProps({
  invoiceArray: {
    type: Array,
    required: true
  },
  expanded: Boolean
});

const refresh = ref(false);

// Extract unique project names
const projects = computed(() => {
  const set = new Set();
  props.invoiceArray.forEach(inv => {
    if (inv.project_name) set.add(inv.project_name);
  });
  return [...set];
});

// Create a project → invoice mapping for easy reuse
const invoicesByProject = computed(() => {
  const map = {};
  props.invoiceArray.forEach(inv => {
    if (!inv.project_name) return;
    if (!map[inv.project_name]) {
      map[inv.project_name] = {
        invoices: [],
        projectId: inv.project_id
      };
    }
    if (inv.invoice_id) {
      map[inv.project_name].invoices.push(inv);
    }
  });
  return map;
});

// Selected tab (defaults to first project name)
const tab = ref(projects.value[0] || null);
watch(projects, (val) => {
  if (!val.includes(tab.value)) {
    tab.value = val[0] || "add";
  }
});

// Placeholder function
const fetchFromSessionStorage = () => {
  // Implement if needed
};
</script>

<style scoped>
.v-tabs-window {
  flex-grow: 1;
  min-width: 0;
}
.zIndex {
  z-index: 999 !important;
}
</style>