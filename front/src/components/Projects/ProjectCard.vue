<template>
  <div>
    <!--  image="../../../public/construct_bg.jpeg" -->
    <v-card
      v-motion-fade
      class="project-card hover:shadow-xl transition-all"
      elevation="2"
      border
      hover
      rounded="xl"
      max-width="420"
    >
      <!-- Header -->
      <v-list-item class="pl-5 pt-5 pb-2">
        <template #prepend>
          <v-avatar
            color="primary-container"
            size="40"
            class="elevation-1"
          >
            <v-icon color="primary">
              mdi-crane
            </v-icon>
          </v-avatar>
        </template>

        <template #title>
          <div class="text-base font-weight-bold text-truncate text-capitalize">
            {{ projectName }}
          </div>
          <div class="text-grey-lighten-1 text-subtitle-2">
            {{ projectEmail[0].email_address }}
          </div>
        </template>

        <v-btn
          icon="mdi-pencil-outline"
          variant="tonal"
          rounded="lg"
          color="grey"
          elevation="1"
          size="30"
          class="position-absolute top-0 right-0 mt-3 mr-3"
          @click="editDialog = true"
        />
      </v-list-item>

      <v-divider />

      <!-- Progress Summary -->
      <v-card-text class="px-5 pb-1 pt-4">
        <div class="text-caption text-medium-emphasis mb-1">
          Payments
        </div>
        <div class="d-flex justify-space-between align-center mb-2">
          <div class="text-h5 font-weight-bold text-grey-darken-1">
            {{ percentPaid }}%
          </div>
        </div>
        <v-progress-linear
          :model-value="percentPaid"
          :color="progressColor"
          height="8"
          rounded
          bg-color="grey-lighten-1"
        />
        <div class="text-caption text-medium-emphasis mt-1">
          {{ formatCurrency(payments) }} / {{ formatCurrency(invoicing) }} paid
        </div>
      </v-card-text>

      <!-- Action Button -->
      <v-card-actions class="px-5 pb-4 pt-3 d-flex flex-column flex-sm-row gap-2 align-stretch">
        <v-btn
          block
          variant="outlined"
          color="primary"
          prepend-icon="mdi-check-outline"
          class="text-white font-weight-medium"
          rounded="lg"
          @click="dialogTrigger = true"
        >
          Mark Complete
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Dialogs -->
    <complete-project-dialog
      :project="project"
      :trigger="dialogTrigger"
      @project-removed="handleRemove"
      @close="dialogTrigger = false"
    />

    <edit-project-name-dialog
      :open="editDialog"
      :initial-name="projectName"
      :project-id="projectId"
      @close="editDialog = false"
      @saved="handleProjectNameSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue"
//import { useToast } from "vue-toastification"
import { invoices } from '@/stores/invoiceState.js'

const props = defineProps({
  project: {
    type: Array,
    required: true
  }
})

const invoiceStore = invoices()
//const toast = useToast()

const dialogTrigger = ref(false)
const editDialog = ref(false)
const projectId = computed(() => props.project[0].project_id)
const projectName = computed(() => props.project[0]?.project_name || "Unnamed")
const projectEmail = computed(() => invoiceStore.activeEmails.activeEmails.filter(e => e.email_id === props.project[0].email))

const reduceTotal = (array) => {
  return array.filter(inv => inv.project === projectId.value).reduce((sum, inv) => sum + Number(inv.amount || 0), 0)
}
const payments = computed(() => reduceTotal(invoiceStore.payments))
const invoicing = computed(() => reduceTotal(invoiceStore.invoicing))

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-BE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);

const emit = defineEmits(["project-removed"]);
const handleRemove = () => {
  emit("project-removed", props.project[0].project_name); // pass name upward
};

const percentPaid = computed(() => {

  const invoiced = parseFloat(invoicing.value) || 0
  const paid = parseFloat(payments.value) || 0
  return invoiced === 0 ? 0 : Math.round((paid / invoiced) * 100)
})

const handleProjectNameSaved = (newName) => {
  // Optimistic UI update
  invoiceStore.dbResponse.filter(p => p.project === projectId.value).forEach(p => p.project_name = newName)
  props.project.forEach(p => p.project_name = newName)
  //toast.success("Project name updated successfully!")
}

const progressColor = computed(() => percentPaid.value < 50 ? 'warning' :
  percentPaid.value < 75 ? 'amber' :
    'success')
</script>

<style scoped>
.project-card {
  transition: all 0.2s ease-in-out;
}

.position-absolute {
  position: absolute;
  z-index: 10;
}

.top-0 {
  top: 0;
}

.right-0 {
  right: 0;
}
</style>
