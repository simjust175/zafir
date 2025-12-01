<template>
  <v-container
    fluid
    class="pa-8"
  >
    <!-- Show project cards -->
    <v-row v-if="projects.length">
      <v-col
        v-for="projectGroup in groupedProjects"
        :key="projectGroup.project_name"
        cols="12"
        sm="6"
        md="4"
      >
        <project-card
          :project="projectGroup"
          @project-removed="handleProjectRemoved"
        />
      </v-col>
      <v-col
        cols="12"
        sm="6"
        md="4"
      >
        <!-- <v-card
          v-motion-fade
          class="project-card transition-all pb-6"
          hover="shadow-lg"
          rounded="2xl"
          elevation="1"
          max-width="420"
          border
        >
          <add-new-project />
        </v-card> -->
      </v-col>
    </v-row>
  
    <!-- Empty state -->
    <v-row
      v-else
      justify="center"
    >
      <v-col
        cols="12"
        class="text-center"
      >
        <v-card
          class="py-12 fill-height d-flex flex-column align-center"
          elevation="0"
        >
          <h1 class="text-h1">
            🫢
          </h1>
          <h2 class="text-grey-lighten-1 mb-6">
            Oops... Nothing here.. Yet...
          </h2>
          <v-btn
            prepend-icon="mdi-plus"
            color="primary"
            text="Add Project"
          />
        </v-card>
      </v-col>
    </v-row>
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
    <v-dialog
      v-model="addProjectDialog"
      :in-tabs="false"
    >
      <add-new-project
        @close="addProjectDialog = false"
        @new-project-added="handleProjectRemoved"
      />
    </v-dialog>
  </v-container>
</template>
  
  <script setup>
  import ProjectCard from "./ProjectCard.vue"
  import AddNewProject from "./AddNewProject.vue"
  import { ref, computed } from "vue"
  import { invoices } from "@/stores/invoiceState.js"
  
  const invoiceArray = invoices()

// const payments = computed(() => reduceTotal(invoiceStore.payments))
// const invoicing = computed(() => reduceTotal(invoiceStore.invoicing))

  const addProjectDialog = ref(false)
  
  // 🧠 Group data by project
  const groupedProjects = computed(() => {
    const map = new Map()
    console.log("in state store in project-sdash:", invoiceArray);
    
    invoiceArray.dbResponse?.forEach(inv => {
      if (!inv.project_name) return
      if (!map.has(inv.project_name)) map.set(inv.project_name, [])
      map.get(inv.project_name).push(inv)
    })
    return Array.from(map.values())
  })

  const handleProjectRemoved = (projectName) => {
  invoiceArray.dbResponse = invoiceArray.dbResponse.filter(
    inv => inv.project_name !== projectName
  )
}
  
  // 🟢 Just for v-if to check if there's content
  const projects = computed(() => groupedProjects.value.map(g => g[0].project_name))
  </script>