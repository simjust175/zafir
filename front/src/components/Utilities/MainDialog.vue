<template>
  <v-dialog
    v-model="dialog"
  >
    <div class="d-flex justify-center">
      <v-card
        rounded="lg"
        width="400"
      >
        <v-card-text class="px-6">
          {{ props.text }}
        </v-card-text>

        <v-card-actions class="d-flex justify-end">
          <v-btn
            class="text-none"
            rounded="xl"
            text="Cancel"
            @click="cancelDialog"
          />

          <v-btn
            class="text-none"
            color="primary"
            rounded="lg"
            text="OK"
            variant="outlined"
            @click="emitConfirmed"
          />
        </v-card-actions>
      </v-card>
    </div>
  </v-dialog>
</template>


<!-- eslint-disable vue/require-default-prop -->
<script setup>
import { ref, watch } from "vue";
const emit = defineEmits(['confirm', 'close']);

const props = defineProps({
  activateDialog: Boolean,
  title: String,
  text: String,
});

//const dialog = computed(()=> props.activateDialog);
const dialog = ref(false);
const emitConfirmed = () => {
  dialog.value = false
  emit("confirm")
}

const cancelDialog = () => {
  dialog.value = false
  emit('close')
}

watch(() => props.activateDialog, (newVal) => {
  console.log("props update: ", newVal);
  dialog.value = newVal;
})

</script>
