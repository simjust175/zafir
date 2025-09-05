<template>
  <v-container fluid>
    <!-- <overlay-component
      :overlay-trigger="triggerOverlay"
    /> -->
    <main-dialog
      :activate-dialog="activateDialog"
      title="Confirm Log-out"
      text="Confirm dialog"
    />
    <v-container
      class="fill-height fill-width pa-1"
      fluid
    >
      <v-responsive
        class="fill-height fill-width"
        width="100%"
      >
        <!-- Main Content: Left (Form) and Right (Progress Bars + Pie Chart) -->
        <v-row>
          <!-- Left: Main Form -->
          <v-col
            v-for="button in 6"
            :key="button" 
            cols="12"
            md="4"
            sm="6"
            class="mb-1"
          >
            <!--<v-spacer class="mt-5" /> -->
            <!-- <main-display-tabs 
              :invoice-array="invoices"
              :expanded="false"
              height="100%"
              class="overflow-y-auto scrollbar-style"
            /> -->
            <v-card
              class="pa-4 d-flex flex-column align-center"
              height="300"
              rounded="xl"
              color="grey-lighten-2"
              @click="console.log(`/maybe`)"
            >
              <h6> Upload </h6>
              <v-icon
                icon="mdi-invoice-plus-outline"
                color="grey-lighten-1"
                size="100"
              />
            </v-card>
          </v-col>
          <!-- <v-col cols="3">
            <invoice-control-panel />
          </v-col> -->
        </v-row>

        <!-- <v-row class="mt-7">
          <progress-cards />
        </v-row> -->
      </v-responsive>
    </v-container>
  </v-container>
</template>

<!-- eslint-disable vue/require-default-prop -->
<script setup>
import { ref, onMounted } from "vue";
//import MainForm from "../MainDisplay/AmountForm/MainForm.vue";


defineProps({
  currencyInUse: String,
  monthly: Object,
  daysLeft: Number,
  invoices: Array,
  language: String,
});

const triggerOverlay = ref(false);
const activateDialog = ref(false);

const triggerOverlayFunction = () => {
  triggerOverlay.value = true;

  setTimeout(() => {
    triggerOverlay.value = false;
  }, 500);
};

onMounted(() => {
  triggerOverlayFunction();
  //updateValues();
})
//,
  //watch(() => props.monthly, updateValues,
   //{ immediate: true });
</script>

<style>

.scrollbar-style::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  background-color: #f5f5f5;
}

.scrollbar-style::-webkit-scrollbar {
  width: 3px;
  background-color: #f5f5f5;
}

.scrollbar-style::-webkit-scrollbar-thumb {
  border-radius: 10px;
  /* -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3); */
  background-color: #e5e5e5ff;
}
</style>
