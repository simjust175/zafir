<template>
  <v-dialog
    v-model="dialog"
  >
    <v-card rounded="lg" width="400">
      <v-card-text class="px-6">
        {{ props.text }}
      </v-card-text>

      <v-card-actions class="d-flex justify-end">
        <v-btn
          class="text-none"
          rounded="xl"
          text="Cancel"
          @click="dialog = false"
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
  </v-dialog>
</template>


<!-- eslint-disable vue/require-default-prop -->
<script setup>
import { ref, watch } from "vue";
const emit = defineEmits(["confirm"]);

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

watch(() => props.activateDialog, (newVal) => {
  console.log("props update: ", newVal);
  dialog.value = newVal;
})

</script>
