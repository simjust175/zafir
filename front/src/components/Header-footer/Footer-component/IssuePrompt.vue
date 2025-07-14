<template>
  <v-dialog
    v-model="model"
    max-width="600"
  >
    <v-card>
      <v-card-title class="text-h6">
        ⚠️ Invoice Issue
      </v-card-title>
      <v-card-subtitle class="mb-2">
        {{ message?.body }}
      </v-card-subtitle>
      <v-divider />
      <v-card-text>
        <div class="d-flex flex-wrap ga-4 mt-2">
          <v-img
            v-for="(img, i) in message?.attachments || []"
            :key="i"
            :src="img"
            width="250"
            height="350"
            cover
            class="rounded-lg elevation-2"
          />
        </div>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn
          text
          color="primary"
          @click="$emit('update:modelValue', false)"
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
  
  <script setup>
  import { ref, watch } from "vue"
  const props = defineProps({
    modelValue: Boolean,
    message: Object,
  })
  const model = ref(props.modelValue)
  watch(() => props.modelValue, (val) => {
  model.value = val
})
  defineEmits(['update:modelValue'])
  </script>