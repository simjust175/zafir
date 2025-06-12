<template>
  <v-snackbar :timeout="2000" elevation="24" v-model="banner">
            {{ props.label }}
            <v-btn color="blue" variant="text" @click="banner = false">
                Close
            </v-btn>
        </v-snackbar>
</template>

<script setup>
import  { defineProps } from "vue";
const props = defineProps({
    banner: Boolean,
    label: String,
    color: String
})


</script>

<style>

</style>