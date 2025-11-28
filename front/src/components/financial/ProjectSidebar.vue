<template>
  <v-navigation-drawer
    permanent
    class="pa-4"
    max-height="50%"
  >
    <v-list>
      <v-list-subheader class="bg-primary rounded-sm mb-2">
        Projects
      </v-list-subheader>
      <v-list-item
        v-for="p in projects"
        :key="p.id"
        class="mb-1 rounded-lg py-2"
        :class="[functions.themeColor, {'bg-primary' : p.id === selectedProject}]"
        :active="p.id === selectedProject"
        @click="$emit('update:selectedProject', p.id)"
      >
        <v-list-item-title>{{ p.name }}</v-list-item-title>
        <v-list-item-subtitle>Client name {{ p.id }}</v-list-item-subtitle>
      </v-list-item>
      <v-divider />
    </v-list>
  </v-navigation-drawer>
</template>

<!-- eslint-disable vue/require-default-prop -->
<script setup>
import { globalFunctions } from "@/stores/globalFunctions"
const functions = globalFunctions()
defineProps({
  projects: Array,
  selectedProject: Number
})
defineEmits(["update:selectedProject"])
</script>
