<template>
  <v-dialog
    v-model="trigger"
    max-width="400"
  >
    <v-card>
      ++{{ localAmount }}++
      <v-card-title>
        {{ isEdit ? 'Edit' : 'Add' }} {{ dialogType === 'invoiced' ? 'Invoice' : 'Payment' }}
      </v-card-title>
  
      <v-card-text>
        <v-number-input
          v-model="localAmount"
          control-variant="stacked"
          label="Amount"
          prefix="€"
          type="number"
        />
      </v-card-text>
  
      <v-card-actions>
        <v-spacer />
        <v-btn
          text
          @click="$emit('close')"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          @click="handleSave"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
  
  <script setup>
  import { ref, computed, watch } from "vue"
  
  const props = defineProps({
    show: Boolean,
    dialogType: String,
    initialAmount: Number,
    isEdit: Boolean
  })
  
  const trigger = computed(()=> props.show)
  const emit = defineEmits(['close', 'update'])
  
  const localAmount = ref(props.initialAmount ?? 0)
  
  watch(() => props.initialAmount, (val) => {
    localAmount.value = val ?? 0
  })
  
  const handleSave = () => { 
    emit('update', localAmount.value)
  }
  </script>