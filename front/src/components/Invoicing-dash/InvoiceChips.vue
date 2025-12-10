<template>
  <div class="d-flex">
    <v-chip
      color="primary"
      label
    >
      Invoiced: 
      {{ formatCurrency(totalInvoiced || 0) }}
    </v-chip>
  
     
    <v-chip
      color="success"
      label
      class="ml-2"
    >
      Paid:       
      {{ formatCurrency(totalPaid || 0) }}
    </v-chip>
  </div>
</template>

  <!-- eslint-disable vue/require-default-prop -->
  <script setup>
  defineProps({
    totalInvoiced: Number,
    totalPaid: Number,
    percentPaid: Number,
    loadingInvoiced: Boolean,
    loadingPaid: Boolean
  })
  
  defineEmits(['open-dialog'])
  
  const formatCurrency = (val) =>
  new Intl.NumberFormat('en-BE', {
    style: 'currency',
    currency: 'EUR',
  }).format(val);

  </script>
  
  <!-- <style scoped>
  .v-chip {
    min-height: 70px;
    width: 100%;
  }
  </style> -->