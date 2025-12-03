<template>
  <div class="d-flex">
    <v-chip
      color="primary"
      label
    >
      Total invoiced: 
      {{ formatCurrency(totalInvoiced || 0) }}
    </v-chip>
  
     
    <v-chip
      color="success"
      label
      class="ml-2"
    >
      Total Paid:       
      {{ formatCurrency(totalPaid || 0) }}
    </v-chip>
    <!-- Add Button -->
    <!-- <v-btn
            icon="mdi-plus"
            size="small"
            rounded="xl"
            color="indigo-darken-2"
            variant="tonal"
            @click="$emit('open-dialog', 'invoiced', false)"
          /> -->
    <!-- Add Button -->
    <!-- <v-btn
          icon="mdi-plus"
          size="small"
          rounded="xl"
          color="green-darken-2"
          variant="tonal"
          @click="$emit('open-dialog', 'paid', false)"
        /> -->
  </div>
</template>
  
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