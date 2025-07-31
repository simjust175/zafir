<template>
  <v-card
    class="d-flex flex-column"
    :class="{ 'rounded-xl': !expanded, 'elevation-3': !expanded, 'mx-2': !expanded}"
    :flat="expanded"
    min-height="75vh"
  >
    <!-- prepend-icon="mdi-refresh"
  @click:prepend="refresh = true" -->
    <!-- Top-right Icon -->
    <v-icon
      v-if="!expanded"
      icon="mdi-arrow-expand"
      class="mr-5 mt-4 mb-3 position-absolute top-0 right-0 zIndex"
      color="primary"
      @click="$router.push('/table')"
    />
    <!-- <v-icon
      v-else
      icon="mdi-arrow-left"
      class="ml-1 mt-1 mb-3 position-absolute top-0 left-0 zIndex"
      color="primary"
      @click="$router.push('/')"
    /> -->
  
    <!-- Main Content -->
    <v-row
      no-gutters
      class="fill-height"
    >
      <!-- Sidebar Tabs -->
      <v-col
        cols="12"
        :md="!expanded ? 3 : 12"
        :class="[themeColor, 'd-flex flex-column pa-0']"
        style="max-height: 100%;"
      >
        <div class="d-flex flex-column flex-grow-1 overflow-y-auto">
          <!-- maybe? selected-class="bg-white" -->
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
            <!-- :class="{'d-flex flex-column py-0' : $vuetify.display.mdAndUp}"
            color="primary"
            class="flex-grow-1 d-flex flex-column" -->
            <v-tab
              v-for="project in projects"
              :key="project"
              :value="project"
              class="pl-8"
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
              :class="{'pl-8' : !expanded}"
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
          <!-- Project Tabs -->
          <v-tabs-window-item
            v-for="project in projects"
            :key="project"
            :value="project"
          >
            <table-parent
              class="mt-4"
              :invoices="props.invoiceArray.filter(inv => inv.project_name === project && inv.invoice_id)"
              :project-name="project"
              :project_id="props.invoiceArray.filter(inv => inv.project_name === project).map(proj => proj.project_id)[0]"
              :expanded="expanded"
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
              :in-tabs="true"
            />
          </v-tabs-window-item>
        </v-tabs-window>
      </v-col>
    </v-row>
  </v-card>
</template>
  
  <script setup>
  import AddNewProject from "@/components/Projects/AddNewProject.vue";
  import { ref, computed } from "vue";
  import { useTheme } from "vuetify"
  const theme = useTheme();
   const themeColor = computed(()=> `bg-grey-${theme.global.name.value}en-4`);
  const props = defineProps({
    invoiceArray: {
      type: Array,
      required: true
    },
    expanded: Boolean
  });
  const refresh = ref(false)
  
  const tab = ref(0);
  
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