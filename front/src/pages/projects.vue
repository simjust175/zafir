<template>
  <div class="projects-page">
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
  min-height: 100vh;
  background: rgb(var(--v-theme-background));
}
</style>
