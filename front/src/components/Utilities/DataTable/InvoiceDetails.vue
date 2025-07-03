<template>
  <v-dialog
    v-model="dialog"
    max-width="75%"
    max-height="75%"
    scrollable="y"
  >
    <v-card class="pa-0">
      <v-toolbar
        class="zafir-secondary"
        dark
        flat
      >
        <v-toolbar-title>Invoice Details for {{ invoiceArray[0].issuer }}</v-toolbar-title>
        <v-spacer />
        <v-btn
          icon
          @click="$emit('close')"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
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
          <template #item.created_at="{ item }">
            {{ new Date(item.created_at).toLocaleDateString() }}
          </template>
  
          <template #item.amount="{ item }">
            €{{ item.amount }}
          </template>
  
          <template #item.includesBtw="{ item }">
            {{ item.includesBtw ? 'included' : 'excluded' }}
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
    </v-card>
  </v-dialog>
</template>
  
  
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
//watch(()=> props.invoices, (updated)=> invoiceArray.value = updated)
onMounted(()=> console.log("woadkjfhuvhdbvz", invoiceArray.value, "props>>>>>", props.invoices))
defineEmits(['edit', 'delete', 'close']);
  
  const headers = [
    { title: 'Date', key: 'created_at' },
    { title: 'Amount', key: 'amount' },
    { title: 'Btw', key: 'includesBtw' },
    { title: '(%)', key: 'btwPercent' },
    { title: 'Margin', key: 'margin' },
    { title: '', key: 'actions', sortable: false }
  ];
  
  const dialog = computed(()=> props.active)
  </script>
  