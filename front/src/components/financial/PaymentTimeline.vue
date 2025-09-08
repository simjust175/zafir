<template>
  <v-card
    elevation="2"
    class="rounded-xl"
    min-height="430"
  >
    <v-card-title class="font-semibold">
      Payments
    </v-card-title>
    <v-divider />
    
    <v-timeline
      v-if="payments && payments.length"
      side="end"
    >
      <v-timeline-item
        v-for="p in payments"
        :key="p.project + '-' + p.created_on"
        color="primary"
        dot-color="success"
      >
        <div class="d-flex">
          <strong class="me-4">
            {{ new Date(p.created_on).toLocaleDateString('BE') }}
          </strong>
          <div>
            <strong>€{{ p.amount }}</strong>
          </div>
        </div>
      </v-timeline-item>
    </v-timeline>

    <!-- EMPTY STATE -->
    <div
      v-else
      class="d-flex flex-column align-center justify-center pa-8 text-medium-emphasis"
    >
      <v-icon
        size="48"
        color="primary"
        class="mb-2"
        icon="mdi-cash-remove"
      />
      <div class="text-h6 font-weight-medium">
        No payments yet
      </div>
      <div class="text-body-2">
        Once payments are recorded, they’ll show up here
      </div>
    </div>
  </v-card>
</template>
  
<script setup>
  defineProps({ payments: Array })
</script>
  