<template>
  <v-dialog
    v-model="dialog"
    max-width="400"
  >
    <v-card rounded="lg">
      <!-- <v-card-title class="d-flex justify-space-between align-center">
        <div class="text-h5 text-medium-emphasis ps-2">
          {{ props.title }}
        </div>
        <v-divider class="mt-2"></v-divider>
        <v-btn icon="mdi-close" variant="text" @click="isActive.value = false" ></v-btn>
      </v-card-title> -->

      <!-- <v-divider class="mb-4"></v-divider> -->

      <v-card-text class="px-6">
        {{ props.text }}
      </v-card-text>

      <!-- <v-divider class="mt-2"></v-divider> -->

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
