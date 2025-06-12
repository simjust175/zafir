<template>
  <v-card class="px-1 bg-grey-lighten-2 mb-4" elevation-0>
    <div class="text-center pt-3">
      <!-- <v-rating v-model="rating" length="5" :size="48" color="grey-darken-3" empty-icon="mdi-circle-outline"
        full-icon="mdi-circle" hover></v-rating> -->
      <v-item-group v-model="rating" class="d-flex justify-sm-space-between px-8 pt-1 pb-4">
        <v-item v-for="n in 5" :key="n">
          <template v-slot:default="{ toggle }">
            <v-btn :active="rating != null && rating + 1 >= n" :icon="`mdi-numeric-${n}`" height="40" variant="text"
              width="40" border @click="toggle"></v-btn>
          </template>
        </v-item>
      </v-item-group>

      <!-- <v-rating v-model="rating" length="3">
                <template v-slot:item="props">
                    <v-icon :color="props.isFilled ? colors[props.index] : 'grey-lighten-1'" size="large"
                        @click="props.onClick" class="mx-4">
                        {{ props.isFilled ? 'mdi-circle' : 'mdi-circle-outline' }}
                    </v-icon>
                </template>
            </v-rating> -->

      <!-- <v-slider
      :max="4"
      :ticks="tickLabels"
      show-ticks="always"
      step="1"
      tick-size="8"
      :tick-icon="mdi-circle"
      color="primary"
      v-model="rating"
    ></v-slider> -->

    </div>
  </v-card>
</template>

<script setup>
import { ref, watch, defineEmits } from "vue";
import { debounce } from "lodash";

const tickLabels = ref({
  0: 1,
  1: 2,
  2: 3,
  3: 4,
  4: 5
});

const rating = ref(null);
const colors = ref(["orange-lighten-1", "yellow-lighten-1", "green-lighten-1"]);
const emitRatingUpdate = debounce((value) => emit("ratingUpdate", value + 1), 300);
watch(rating, (newValue) => emitRatingUpdate(newValue));
const emit = defineEmits(["ratingUpdate"]);
</script>
