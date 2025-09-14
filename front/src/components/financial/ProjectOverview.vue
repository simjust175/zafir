<template>
  <v-card
    class="pa-4"
    elevation="2"
    rounded="lg"
    width="98%"
  >
    <v-row>
      <v-col cols="6">
        <div class="text-h6 text-capitalize">
          {{ project?.name }}
        </div>
        <div class="text-subtitle-1 text-grey">
          {{ project?.project }}
        </div>
      </v-col>
      <v-col
        cols="6"
        class="text-right"
      >
        <v-chip
          color="primary"
          label
        >
          Total Invoices: {{ totalInvoices }}
        </v-chip>
        <v-chip
          color="success"
          label
          class="ml-2"
        >
          Paid: {{ totalPaid }}
        </v-chip>
      </v-col>
    </v-row>
  </v-card>
</template>
  
  <script setup>
  import { computed } from "vue"
  const props = defineProps({
    project: Object,
    invoices: Array
  })
  
  const totalInvoices = computed(() => props.invoices?.length)
  const totalPaid = computed(() => Math.floor(Math.random() * 8 + 1))
  </script>
  