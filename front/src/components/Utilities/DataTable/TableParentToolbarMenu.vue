<template>
  <main>
    <v-menu>
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          icon="mdi-dots-vertical"
        />
      </template>
      <v-list>
        <v-list-item
          prepend-icon="mdi-cog-outline"
          value="edit"
          @click="$router.push('/projects')"
        >
          <v-list-item-title>Manage project</v-list-item-title>
        </v-list-item>
        <v-list-item
          prepend-icon="mdi-check-circle"
          value="complete"
          @click="dialogTrigger = !dialogTrigger"
        >
          <v-list-item-title>Project completed</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <complete-project-dialog
      :project="project"
      :trigger="dialogTrigger"
      @close="dialogTrigger = false"
    />
  </main>
</template>

<!-- eslint-disable vue/require-default-prop -->
<script setup>
import CompleteProjectDialog from "@/components/Projects/CompleteProjectDialog.vue";
import { ref } from "vue"
defineProps({
  project: Object
})
const dialogTrigger = ref(false);

</script>

<style>

</style>