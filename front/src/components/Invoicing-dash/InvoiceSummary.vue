<template>
  <v-row dense>
    <!-- 💳 Total Invoiced -->
    <v-col
      cols="12"
      md="6"
    >
      <v-card
        v-if="!animateLoading"
        class="stat-card bg-indigo-lighten-5 d-flex align-center rounded-lg overflow-hidden"
        
        elevation="0"
      >
        <!-- Icon Section -->
        <v-card
          class="icon-section bg-indigo-lighten-4 d-flex align-center justify-center"
          height="100"
        >
          <v-img
            src="/invoice.png"
            height="32"
            width="32"
          />
        </v-card>

        <!-- Content Section -->
        <div class="content-section pa-4 pt-1 flex-grow-1 position-relative">
          <!-- Add Button -->
          <v-btn
            icon="mdi-plus"
            size="small"
            elevation="1"
            rounded="xl"
            density="comfortable"
            color="indigo-darken-2"
            variant="tonal"
            class="position-absolute top-0 right-0 mt-0 mr-2"
            @click="$emit('open-dialog', 'invoiced', false)"
          />

          <div class="text-subtitle-2 text-grey-darken-2">
            Total Invoiced
          </div>
          <div class="text-h6 font-weight-bold text-indigo-darken-3">
            €{{ (totalInvoiced || 0).toFixed(2) }}
          </div>
        </div>
      </v-card>

      <v-skeleton-loader
        v-else
        type="card"
        height="100"
        class="rounded-lg"
      />
    </v-col>

    <!-- 💰 Total Paid -->
    <v-col
      cols="12"
      md="6"
    >
      <v-card
        v-if="!animateLoading"
        class="stat-card d-flex align-center rounded-lg overflow-hidden"
        elevation="0"
        height="50"
      >
        <!-- Icon Section -->
        <v-card
          class="icon-section bg-green-lighten-4 d-flex align-center justify-center"
          height="100"
        >
          <v-img
            src="/paid.png"
            height="32"
            width="32"
          />
        </v-card>

        <!-- Content Section -->
        <div class="content-section pa-4 mt- flex-grow-1 position-relative bg-green-lighten-5">
          <!-- Add Button -->
          <v-btn
            icon="mdi-plus"
            size="small"
            elevation="1"
            rounded="xl"
            density="comfortable"
            color="green-darken-2"
            variant="tonal"
            class="position-absolute top-0 right-0 mt-5 mr-2"
            @click="$emit('open-dialog', 'paid', false)"
          />

          <div class="text-subtitle-2 text-grey-darken-2">
            Total Paid
          </div>
          <div class="text-h6 font-weight-bold text-green-darken-3">
            €{{ (totalPaid || 0).toFixed(2) }}
          </div>

          <!-- Progress -->
          <v-progress-linear
            :model-value="percentPaid"
            height="2"
            color="green-darken-2"
            class="rounded-pill mt-1"
          />
          <div class="text-caption text-end text-green-darken-3">
            {{ percentPaid }}%
          </div>
        </div>
      </v-card>

      <v-skeleton-loader
        v-else
        type="card"
        height="100"
        class="rounded-lg"
      />
    </v-col>
  </v-row>
</template>

<!-- eslint-disable vue/require-default-prop -->
<script setup>
import { ref, onMounted } from 'vue'

defineProps({
  totalInvoiced: Number,
  totalPaid: Number,
  percentPaid: Number,
  loadingInvoiced: Boolean,
  loadingPaid: Boolean
})

defineEmits(['open-dialog'])

const animateLoading = ref(true)

onMounted(() => {
  setTimeout(() => {
    animateLoading.value = false
  }, 1000) // Animation duration
})
</script>


<style scoped>
.stat-card {
  min-height: 100px;
}
.icon-section {
  width: 70px;
  min-height: 100%;
}
.content-section {
  flex: 1;
}
</style>