<template>
  <v-container fluid class="pa-8">

    <!-- PROJECT LIST -->
    <transition-group
      tag="v-row"
      name="project-fade-slide"
      v-if="projects.length"
      class="d-flex flex-wrap"
    >
      <v-col
        v-for="(projectGroup, index) in groupedProjects"
        :key="projectGroup[0].project_name"
        :style="{ '--index': index }"
        cols="12" sm="6" md="4"
      >
        <project-card
          :project="projectGroup"
          @project-removed="removeWithUndo"
        />
      </v-col>
    </transition-group>

    <!-- EMPTY STATE -->
    <v-row v-else justify="center">
      <v-col cols="12" class="text-center">
        <v-card class="py-12 d-flex flex-column align-center" elevation="0">
          <h1 class="text-h1">🫢</h1>
          <h2 class="text-grey-lighten-1 mb-6">Oops... Nothing here.. Yet...</h2>
          <v-btn prepend-icon="mdi-plus" color="primary" text="Add Project"/>
        </v-card>
      </v-col>
    </v-row>

    <!-- ADD NEW -->
    <v-fab
      extended color="primary" text="Add project"
      prepend-icon="mdi-plus" location="right bottom"
      height="50" width="180" app
      @click="addProjectDialog = !addProjectDialog"
    />

    <v-dialog v-model="addProjectDialog">
      <add-new-project
        @close="addProjectDialog = false"
        @new-project-added="forceRemove"
      />
    </v-dialog>

    <!-- 🔥 SNACKBAR UNDO -->
    <v-snackbar v-model="undoSnackbar" location="bottom" timeout="5000">
      Project removed
      <template #actions>
        <v-btn variant="text" color="primary" @click="undoRemove">Undo</v-btn>
      </template>
    </v-snackbar>

  </v-container>
</template>

<script setup>
import ProjectCard from "./ProjectCard.vue"
import AddNewProject from "./AddNewProject.vue"
import { ref, computed } from "vue"
import { invoices } from "@/stores/invoiceState.js"

const invoiceArray = invoices()

const addProjectDialog = ref(false)
const undoSnackbar = ref(false)
let lastRemovedProject = null // store for undo restore


/* GROUP PROJECTS */
const groupedProjects = computed(() => {
  const map = new Map()
  invoiceArray.dbResponse?.forEach(inv => {
    if (!inv.project_name) return
    if (!map.has(inv.project_name)) map.set(inv.project_name, [])
    map.get(inv.project_name).push(inv)
  })
  return Array.from(map.values())
})


/* LEVEL 2 LOGIC 🔥 Undo-enabled removal */
const removeWithUndo = (projectName) => {
  lastRemovedProject = invoiceArray.dbResponse.filter(
    inv => inv.project_name === projectName
  )

  invoiceArray.dbResponse = invoiceArray.dbResponse.filter(
    inv => inv.project_name !== projectName
  )

  undoSnackbar.value = true
}

/* Restore after undo press */
const undoRemove = () => {
  if (!lastRemovedProject) return
  invoiceArray.dbResponse.push(...lastRemovedProject)
  lastRemovedProject = null
  undoSnackbar.value = false
}

/* No undo — permanent delete */
const forceRemove = (projectName) => {
  invoiceArray.dbResponse = invoiceArray.dbResponse.filter(
    inv => inv.project_name !== projectName
  )
}


/* Show list only if exists */
const projects = computed(() => groupedProjects.value.map(g => g[0].project_name))
</script>

<style scoped>
/* ==========================================================
     LEVEL 2 — Premium Motion
   ========================================================== */

:root { --project-ease: cubic-bezier(.22,.61,.36,1); }

/*** ENTER (soft pop) ***/
.project-fade-slide-enter-active {
  transition: opacity .45s var(--project-ease), transform .45s var(--project-ease), filter .45s var(--project-ease);
}
.project-fade-slide-enter-from {
  opacity: 0; transform: translateY(14px) scale(.97); filter: blur(3px);
}

/*** LEAVE (melt + fold upward + blur) ***/
.project-fade-slide-leave-active {
  transition: opacity .45s var(--project-ease), transform .45s var(--project-ease), filter .45s var(--project-ease);
  transition-delay: calc(var(--index, 0) * 65ms);
}
.project-fade-slide-leave-to {
  opacity: 0; transform: translateY(-20px) scale(.88); filter: blur(5px) brightness(1.1);
}

/* Smooth spacing while animating */
.d-flex.flex-wrap { gap: 12px 0; }
</style>