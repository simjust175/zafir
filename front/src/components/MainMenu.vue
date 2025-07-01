<template>
  <v-container>
    <v-responsive>
      <v-row>
        <v-col
          v-for="(card, index) in buttonMenu"
          :key="index"
        >
          <v-card
            v-bind="props"
            class="py-11 px-8 d-flex flex-column align-center cursor-pointer"
            variant="outlined"
            color="primary"
            @click="handleRoute(index)"
          >
            <v-icon
              :icon="iconArray[index]"
              size="80"
            />
            {{ $t(card) }}
          </v-card>
        </v-col>
      </v-row>
    </v-responsive>
  </v-container>
</template>

<script setup>
import { ref } from "vue";
const buttonMenu = ref(["Add Transaction", "Dashboard", "Users"]);
const iconArray = ref([
  "mdi-cash-plus",
  "mdi-chart-arc",
  "mdi-account-group-outline",
]);
</script>
