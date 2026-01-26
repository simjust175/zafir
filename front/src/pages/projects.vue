<template>
  <div class="projects-page">
    <!--<header class="page-header">
      <div class="header-content">
         <div>
          <h1 class="page-title">
            Projects
          </h1>
          <p class="page-subtitle">
            Organize and track invoices by project
          </p>
        </div> -->
    <!-- <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="addProjectDialog = true"
        > 
          New Project
        </v-btn>
      </div>
    </header>-->

    <project-dash v-model:add-project-dialog="addProjectDialog" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ProjectDash from '@/components/Projects/ProjectDash.vue'

const addProjectDialog = ref(false)
</script>
<style scoped>
.projects-page {
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100%;
  padding-bottom: 32px;
}

.page-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 4px;
}

.page-subtitle {
  font-size: 0.9375rem;
  color: rgb(var(--v-theme-grey-600));
  margin: 0;
}
</style>
