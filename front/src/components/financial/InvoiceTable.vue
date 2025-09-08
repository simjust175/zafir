<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-card
    elevation="2"
    class="rounded-xl"
  >
    <v-card-title class="font-semibold">
      Invoices
    </v-card-title>

    <v-data-table
      :headers="headers"
      :items="invoices"
      dense
      class="elevation-1"
    >
      <!-- STATUS CHIP -->
      <template #item.status="{ item }">
        <v-chip
          :color="statusColor(item.status)"
          size="small"
          variant="flat"
        >
          {{ item.status }}
        </v-chip>
      </template>

      <!-- DATE FORMAT -->
      <template #item.created_on="{ item }">
        {{ new Date(item.created_on).toLocaleDateString() }}
      </template>

      <!-- EMPTY STATE -->
      <template #no-data>
        <div class="d-flex flex-column align-center justify-center pa-8 text-medium-emphasis">
          <v-icon
            size="48"
            color="primary"
            class="mb-2"
          >
            mdi-emoticon-sad-outline
          </v-icon>
          <div class="text-h6 font-weight-medium">
            No invoices found
          </div>
          <div class="text-body-2">
            Add a new invoice to see it appear here
          </div>
        </div>
      </template>
    </v-data-table>
  </v-card>
</template>
  
<script setup>
// eslint-disable-next-line vue/require-default-prop
defineProps({ invoices: Array })

const headers = [
  { title: "Date", value: "created_on" },
  { title: "Amount", value: "amount" },
  { title: "Status", value: "status" }
]

function statusColor(status) {
  return status === "Paid"
    ? "success"
    : status === "Overdue"
    ? "error"
    : "warning"
}
</script>