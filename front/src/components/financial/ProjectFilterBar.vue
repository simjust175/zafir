<template>
  <v-row
    class="mb-1"
    align="center"
  >
    <v-col cols="6">
      <v-text-field
        v-model="searchTextProxy"
        label="Search invoices"
        variant="outlined"
        density="compact"
        clearable
      />
    </v-col>
    <v-col cols="6">
      <v-select
        v-model="statusFilterProxy"
        :items="['All', 'Paid', 'Pending', 'Overdue']"
        label="Filter by status"
        variant="outlined"
        density="compact"
      />
    </v-col>
  </v-row>
</template>

<script setup>
import { computed } from "vue"

const props = defineProps({
  searchText: String,
  statusFilter: String
})
const emit = defineEmits(["update:searchText", "update:statusFilter"])

// Proxies to keep props reactive with v-model
const searchTextProxy = computed({
  get: () => props.searchText,
  set: val => emit("update:searchText", val)
})

const statusFilterProxy = computed({
  get: () => props.statusFilter,
  set: val => emit("update:statusFilter", val)
})
</script>