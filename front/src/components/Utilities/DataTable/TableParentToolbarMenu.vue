<template>
  <main>
    <v-btn
      id="menu-activator"
      icon="mdi-dots-vertical"
    />
    <v-menu activator="#menu-activator">
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

<script setup>

</script>

<style>

</style>