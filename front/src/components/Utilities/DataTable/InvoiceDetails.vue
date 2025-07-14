<template>
  <v-dialog
    v-model="dialog"
    max-width="75%"
    max-height="75%"
    scrollable="y"
  >
    <v-card class="pa-0">
      <v-toolbar class="pr-3">
        <template #prepend>
          <v-btn
            icon="mdi-arrow-left"
            @click="$emit('close')"
          />
        </template>
        <v-toolbar-title class="text-h6 text-grey-darken-5">
          {{ invoiceArray[0].issuer }}
        </v-toolbar-title>

        <v-btn
          class="ms-5"
          icon="mdi-printer-outline"
        />

        <v-btn icon="mdi-download-outline" />

        <v-btn icon="mdi-send-variant-outline" />
      </v-toolbar>

      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="invoiceArray"
          class="elevation-0"
          density="comfortable"
          hide-default-footer
          style="max-width: 100%"
        >
          <template #item.invoice_date="{ item }">
            {{ new Date(item.invoice_date).toLocaleDateString() }}
          </template>
  
          <template #item.amount="{ item }">
            €{{ item.amount }}
          </template>
  
          <template #item.includesBtw="{ item }">
            {{ item.btwPercent ? 'included' : 'excluded' }}
          </template>
  
          <template #item.btwPercent="{ item }">
            {{ item.btwPercent ? `${item.btwPercent}%` : '' }}
          </template>
  
          <!-- <template #item.margin="{ item }">
            <v-number-input
              v-model="item.margin"
              control-variant="stacked"
              density="compact"
              variant="tonal"
            />
          </template> -->
  
          <template
            #item.actions="{ item }"
          >
            <v-icon
              size="22"
              color="primary"
              @click="$emit('edit', item)"
            >
              mdi-pencil
            </v-icon>
            <v-icon
              size="22"
              color="error"
              class="ml-3"
              @click="$emit('delete', item)"
            >
              mdi-delete
            </v-icon>
  
            <v-scale-transition>
              <v-progress-circular
                v-if="sendingId === item.id"
                indeterminate
                color="success"
                size="20"
                class="ml-3"
              />
            </v-scale-transition>
          </template>
        </v-data-table>
      </v-card-text>
      <v-card-actions class="d-flex justify-end align-center bg-grey-lighten-4 text-grey-darken-3 ma-2 mt-0 px-4 py-0 rounded-md text-subtitle-1">
        <div class="d-flex pr-2 ga-2">
          <strong>Total: </strong> €{{ totalWithMargin() }}
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
  
  
<!-- eslint-disable vue/require-default-prop -->
<script setup>
import { ref, computed, watch, onMounted } from 'vue';
const props = defineProps({
    active: Boolean,
    invoices: Array,
    actionStat: Boolean,
    sendingId: Number
  });
  
const invoiceArray = ref([])
watch(()=> props.invoices, (updated)=> invoiceArray.value = updated)

onMounted(()=> console.log("props>>>>>", props.invoices))
defineEmits(['edit', 'delete', 'close']);
  
  const headers = [
    { title: 'Date', key: 'invoice_date' },
    { title: 'Amount', key: 'amount' },
    { title: 'Btw', key: 'includesBtw' },
    { title: '(%)', key: 'btwPercent' },
    { title: '', key: 'actions', sortable: false }
  ];
  
  const totalWithMargin = ()=> {
    const {amount, margin} = invoiceArray.value[0];
    return (amount + ( amount* margin/100)).toFixed(2)
  }
  const dialog = computed(()=> props.active)
  </script>
  