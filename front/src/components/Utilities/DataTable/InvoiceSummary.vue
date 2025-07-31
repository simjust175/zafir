<template>
  <v-row dense>
    <v-col
      cols="12"
      md="4"
    >
      <v-card
        v-if="!animateLoading"
        color="indigo-lighten-5"
        class="pa-3 rounded-xl position-relative"
        :loading="loadingInvoiced"
        elevation="0"
      >
        <v-btn
          icon="mdi-plus"
          size="small"
          elevation="1"
          rounded="xl"
          density="comfortable"
          color="indigo-darken-2"
          variant="tonal"
          class="position-absolute top-0 right-0 mt-2 mr-2"
          @click="$emit('open-dialog', 'invoiced', false)"
        />
        <v-btn
          icon="mdi-pencil"
          size="small"
          elevation="1"
          rounded="xl"
          density="comfortable"
          color="indigo-darken-2"
          variant="tonal"
          class="position-absolute top-0 left-0 mt-2 ml-2"
          @click="$emit('open-dialog', 'invoiced', true)"
        />
        <v-img
          src="/invoice.png"
          height="40"
        />
        <div class="text-subtitle-2 text-center font-weight-medium text-grey-darken-2 mb-1 pt-1">
          Total Invoiced
        </div>
        <div class="text-h6 text-center font-weight-bold text-indigo">
          €{{ (totalInvoiced || 0).toFixed(2) }}
        </div>
      </v-card>
      <v-skeleton-loader
        v-else
        type="card"
        height="120"
        class="rounded-xl"
      />
    </v-col>

    <v-col
      cols="12"
      md="4"
    >
      <v-card
        v-if="!animateLoading"
        color="green-lighten-5"
        class="pa-3 rounded-xl position-relative"
        :loading="loadingPaid"
        elevation="0"
      >
        <v-btn
          icon="mdi-plus"
          size="small"
          elevation="1"
          rounded="xl"
          density="comfortable"
          color="green"
          variant="tonal"
          class="position-absolute top-0 right-0 mt-2 mr-2"
          @click="$emit('open-dialog', 'paid', false)"
        />
        <v-btn
          icon="mdi-pencil"
          size="small"
          elevation="1"
          rounded="xl"
          density="comfortable"
          color="green"
          variant="tonal"
          class="position-absolute top-0 left-0 mt-2 ml-2"
          @click="$emit('open-dialog', 'paid', true)"
        />
        <v-img
          src="/paid.png"
          height="40"
        />
        <div class="text-subtitle-2 text-center font-weight-medium text-grey-darken-2 mb-1 pt-1">
          Total Paid
        </div>
        <div class="text-h6 text-center font-weight-bold text-green-darken-4">
          €{{ (totalPaid || 0).toFixed(2) }}
        </div>
      </v-card>
      <v-skeleton-loader
        v-else
        type="card"
        height="120"
        class="rounded-xl"
      />
    </v-col>

    <v-col
      cols="12"
      md="4"
    >
      <v-card
        v-if="!animateLoading"
        color="blue-grey-lighten-5"
        class="pa-3 rounded-xl d-flex flex-column align-center"
        elevation="0"
      >
        <v-icon
          icon="mdi-percent-circle-outline"
          color="blue-grey-darken-2"
          size="35"
        />
        <div class="text-subtitle-2 font-weight-medium text-grey-darken-2 mb-1 pt-1">
          Client Payment
        </div>
        <div class="percent-wrapper w-100 px-1">
          <v-progress-linear
            :model-value="percentPaid"
            height="12"
            color="blue-grey-darken-2"
            class="rounded-pill"
          />
          <div class="text-caption text-end text-blue-grey-darken-2 mt-1">
            {{ percentPaid }}%
          </div>
        </div>
      </v-card>
      <v-skeleton-loader
        v-else
        type="card"
        height="120"
        class="rounded-xl"
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
.position-relative {
  position: relative;
}
.position-absolute {
  position: absolute;
  z-index: 999 !important;
}
.top-0 {
  top: 0;
}
.right-0 {
  right: 0;
}
</style>