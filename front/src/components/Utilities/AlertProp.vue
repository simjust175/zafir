<template>
    <!-- PASS-IN 
    1. alert - to activate
    2. type: [error, info, success, warning]
    3.label/title
    4.closable(optional) -->
    <div>
        <v-alert v-show="props.alert" :type="props.type" :title="props.title" close-label="Close Alert" class="mb-3" :closable="props.closable" variant="outlined">
            {{ props.label }}
        </v-alert>
    </div>
</template>

<script setup>
import { ref, defineProps } from 'vue';

const props = defineProps({
    alert: Boolean,
    type: String,
    closable: Boolean,
    label: String,
    title: String
})

</script>

<style></style>