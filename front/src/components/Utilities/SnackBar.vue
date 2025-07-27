<template>
  <v-snackbar
    v-model="trigger"
    :timeout="2000"
    elevation="24"
    transition="slide-x-reverse-transition"
  >
    <div class="d-flex flex-column align-center">
      <v-icon
        v-if="icon"
        :icon="icon"
        size="50"
      />
      <div class="d-flex align-center justify-space-between">
        {{ props.label }}
        <v-btn
          color="blue"
          variant="text"      
          @click="trigger = false"
        >
          Close
        </v-btn>
      </div>
    </div>
  </v-snackbar>
</template>

<script setup>

import  { ref, watch } from "vue";
const props = defineProps({
    banner: Boolean,
    label: String,
    color: String,
    icon: String
})
const trigger = ref(props.banner);
watch(()=> props.banner, (update)=> trigger.value = update)



</script>

<style>

</style>