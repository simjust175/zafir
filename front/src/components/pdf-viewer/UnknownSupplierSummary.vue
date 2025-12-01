<template>
  <div>
    <div class="d-flex align-center">
      <v-autocomplete
        v-if="!addNewSupplier"
        v-model="localIssuer"
        autofocus
        :items="suppliersInDb"
        label="Enter or choose existing supplier"
        variant="outlined"
        class="w-100"
        density="compact"
        no-data-text="Supplier name mot found: Click + to add new supplier"
        hide-details 
        allow-overflow
        :menu-props="{ maxHeight: '300px' }"
        placeholder="Type supplier name or pick from list..."
      />
      <v-text-field
        v-else
        v-model="localIssuer"
        autofocus
        label="New supplier name (not recommended)"
        variant="outlined"
        class="w-100"
        density="compact"
        hide-details
      />
      <v-btn
        :icon="!addNewSupplier ? 'mdi-plus-circle-outline' : 'mdi-arrow-u-left-top'"
        variant="text"
        color="primary"
        @click="addNewSupplier = !addNewSupplier"
      />
    </div>
    <v-chip
      v-if="issuer"
      class="mt-2"
      :color="isNewSupplier ? 'info' : 'success'"
      label
      size="small"
    >
      <v-icon left>
        {{ isNewSupplier ? 'mdi-plus-circle' : 'mdi-check-circle' }}
      </v-icon>
      {{ isNewSupplier ? 'New supplier will be added' : 'Existing supplier recognized' }}
    </v-chip>
    <div
      class="text-right mt-6"
    >
      <v-btn
        color="primary"
        text="save"
        :disabled="!localIssuer "
        @click="$emit('save-supplier', localIssuer)"
      />
      <v-btn
        variant="outlined"
        text="Keep as Unknown"
        class="ml-2"
        @click="$emit('keep-unknown')"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"
const props = defineProps({
    issuer: String
})
defineEmits(['keep-unknown', 'save-supplier'])
import { invoices } from "@/stores/invoiceState.js"
const invoiceArray = invoices()

const suppliersInDb = computed(() => {
  const knownSuppliers = invoiceArray.dbResponse.filter(
    i => i.issuer && i.issuer !== "UNKNOWN ISSUER"
  )
  return [...new Set(knownSuppliers.map(ks => ks.issuer))]
})
const isNewSupplier = ref(false)
const localIssuer = ref(props.issuer)

const addNewSupplier = ref(false)


</script>