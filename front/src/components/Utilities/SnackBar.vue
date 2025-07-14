<template>
  <v-snackbar
    v-model="trigger"
    :timeout="2000"
    elevation="24"
    transition="slide-x-reverse-transition"
  >
    {{ props.label }}
    <v-btn
      color="blue"
      variant="text"
      class="mr-0 pr-0 pl-8"
      @click="trigger = false"
    >
      Close
    </v-btn>
  </v-snackbar>
</template>

<script setup>
import  { ref, watch } from "vue";
const props = defineProps({
    banner: Boolean,
    label: String,
    color: String
})
const trigger = ref(props.banner);
watch(()=> props.banner, (update)=> trigger.value = update)



</script>

<style>

</style>