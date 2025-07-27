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
        <v-list-item prepend-icon="mdi-pencil-outline" value="edit">
          <v-list-item-title>Edit project</v-list-item-title>
        </v-list-item>
        <v-list-item prepend-icon="mdi-check-circle" value="complete">
          <v-list-item-title>Project completed</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </main>
</template>

<!-- eslint-disable vue/require-default-prop -->
<script setup>
defineProps({
  project: Object
})
</script>

<style>

</style>