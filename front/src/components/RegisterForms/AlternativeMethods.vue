<template>
     <div>
        <v-btn v-if="screen > 220" variant="outlined" color="#316FF6" prepend-icon="mdi-facebook" class="text-none text-subtitle-1 mb-3"
            size="large" block>Login with Facebook</v-btn>
        <v-btn v-if="screen > 220" prepend-icon="mdi-google" size="large" class="text-none text-subtitle-1" block> Login with Google</v-btn>
        <div class="d-flex justify-space-evenly my-6" v-else>
            <v-btn icon="mdi-google" variant="outlined"></v-btn>
            <v-btn icon="mdi-facebook" variant="outlined" color="#316FF6"></v-btn>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";
import { useDisplay } from "vuetify";

const { name } = useDisplay()

const screen = computed(() => {
    switch (name.value) {
        case 'xs': return 220
        case 'sm': return 400
        case 'md': return 500
        case 'lg': return 600
        case 'xl': return 800
        case 'xxl': return 1200
    }
    return undefined
});

</script>

<style>

</style>