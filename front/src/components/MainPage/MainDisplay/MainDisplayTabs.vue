<template>
  <v-card
    class="d-flex flex-column"
    :class="{ 'rounded-xl': !actionStat, 'elevation-3': !actionStat, 'mx-2': !actionStat, 'pt-1': actionStat }"
    :flat="actionStat"
    min-height="75vh"
  >
    <!-- prepend-icon="mdi-refresh"
  @click:prepend="refresh = true" -->
    <!-- Top-right Icon -->
    <v-icon
      v-if="!actionStat"
      icon="mdi-arrow-expand"
      class="mr-5 mt-4 mb-3 position-absolute top-0 right-0 zIndex"
      color="blue-darken-1"
      @click="$router.push('/table')"
    />
    <v-icon
      v-else
      icon="mdi-close"
      class="mr-5 mt-4 mb-3 position-absolute top-0 right-0 zIndex"
      color="blue-darken-1"
      @click="$router.push('/')"
    />
  
    <!-- Main Content -->
    <v-row
      no-gutters
      class="fill-height"
    >
      <!-- Sidebar Tabs -->
      <v-col
        cols="12"
        md="3"
        class="pt-4 bg-grey-lighten-4"
        :class="{'d-flex flex-column': $vuetify.display.mdAndUp}"
        style="max-height: 100%;"
      >
        <div class="d-flex flex-column flex-grow-1 overflow-y-auto">
          <v-tabs
            v-model="tab"
            :direction="$vuetify.display.mdAndUp ? 'vertical' : 'horizontal'"
            :stacked="!$vuetify.display.mdAndUp"
            :class="{'d-flex flex-column py-0' : $vuetify.display.mdAndUp}"
            color="primary"
            class="flex-grow-1 d-flex flex-column"
          >
            <v-tab
              v-for="project in projects"
              :key="project"
              :value="project"
              :class="{'pl-8' : !actionStat}"
              prepend-icon="mdi-domain"
            >
              {{ project }}
            </v-tab>
  
            <!-- Spacer to push button to bottom -->
            <div class="flex-grow-1" />
  
            <!-- Add Project Button -->
            <v-tab
              value="add"
              class="text-left font-weight-bold text-primary mb-2"
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
        md="9"
        class="pa-4 d-flex flex-column"
      >
        <v-tabs-window
          v-model="tab"
          class="flex-grow-1 overflow-y-auto pr-2"
        >
          <!-- Project Tabs -->
          <v-tabs-window-item
            v-for="project in projects"
            :key="project"
            :value="project"
          >
            <table-parent
              class="mt-4"
              :invoices="props.invoiceArray.filter(inv => inv.project_name === project)"
              :project-name="project"
              :action-stat="actionStat"
              :refreshing="refresh"
              fill-width
              fill-height
              @table-update="fetchFromSessionStorage"
            />
          </v-tabs-window-item>
  
          <!-- Add Project Tab -->
          <v-tabs-window-item
            value="add"
          >
            <add-new-project 
              fill-width
              fill-height
            />
          </v-tabs-window-item>
        </v-tabs-window>
      </v-col>
    </v-row>
  </v-card>
</template>
  
  <script setup>
  import { ref, computed } from "vue";
  
  const props = defineProps({
    invoiceArray: {
      type: Array,
      required: true
    },
    actionStat: Boolean
  });
  const refresh = ref(false)
  
  const tab = ref(null);
  
  // Extract unique projects from data
  const projects = computed(() => {
    const set = new Set();
    props.invoiceArray?.forEach(inv => {
      if (inv.project_name) set.add(inv.project_name);
    });
    return [...set];
  });
  
  
  // Placeholder fetch function
  const fetchFromSessionStorage = () => {
    // Logic to fetch or refresh if needed
  };
  </script>

<style scoped>
.v-tabs-window {
  flex-grow: 1;
  min-width: 0; /* helps with overflow issues */
}
.zIndex {
     z-index: 999 !important; 
  }
</style>