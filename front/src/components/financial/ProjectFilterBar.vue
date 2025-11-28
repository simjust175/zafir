<template>
  <v-row
    class="mb-1"
  >
    <!-- Search bar: only show when NOT on mainPage -->
    <v-col cols="6">
      <v-text-field
        v-model="searchTextProxy"
        prepend-inner-icon="mdi-magnify"
        label="Search invoices"
        variant="outlined"
        density="compact"
        clearable
      />
    </v-col>

    <!-- Right column -->
    <v-col cols="6">
      <!-- Buttons: only on mainPage -->
      <template v-if="location === 'mainPage'">
        <div class="d-flex align-center ga-2 gap-3">
          <v-btn
            color="primary"
            variant="elevated"
            prepend-icon="mdi-file-plus"
            @click="$emit('add-invoice')"
          >
            Add Invoice
          </v-btn>
          <v-btn
            color="secondary"
            variant="elevated"
            prepend-icon="mdi-cash-plus"
            @click="$emit('add-payment')"
          >
            Add Payment
          </v-btn>
        </div>
      </template>

      <!-- Status filter: everywhere else -->
      <template v-else>
        <v-select
          v-model="statusFilterProxy"
          :items="['All', 'Paid', 'Pending', 'Overdue']"
          label="Filter by status"
          variant="outlined"
          density="compact"
        />
      </template>
    </v-col>
  </v-row>
</template>

<!-- eslint-disable vue/require-default-prop -->
<script setup>
import { computed } from "vue"

const props = defineProps({
  searchText: String,
  statusFilter: String,
  location: String
})
const emit = defineEmits([
  "update:searchText",
  "update:statusFilter",
  "add-invoice",
  "add-payment"
])

// Proxies for props
const searchTextProxy = computed({
  get: () => props.searchText,
  set: val => emit("update:searchText", val)
})

const statusFilterProxy = computed({
  get: () => props.statusFilter,
  set: val => emit("update:statusFilter", val)
})
</script>