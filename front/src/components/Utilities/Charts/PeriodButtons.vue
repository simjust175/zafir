<template>
    <v-btn-toggle v-model="selectedPeriod" color="primary" class="bg-white" rounded="xl" variant="outlined" group mandatory>
        <v-btn value="monthly">{{ $t('Monthly') }} </v-btn>
        <v-btn value="yearly" class="px-7"> {{ $t('Yearly') }} </v-btn>
    </v-btn-toggle>
</template>

<script setup>
import { ref, watch, defineEmits } from 'vue'
const selectedPeriod = ref('monthly');
const emit = defineEmits(["periodUpdate"]);
watch(selectedPeriod, (newVal) => emit("periodUpdate", newVal))
</script>