<template>
    <v-card class="bg-grey-lighten-3 pa-4 fill-height" height="500" theme="light">
        <div class="d-flex justify-space-between text-grey-darken-4 text-subtitle-2">
            <div>{{ props.label }}</div>
            <div>{{ Math.round(props.percentage) }}%</div>
        </div>
        <div class="py-3">
            <v-progress-linear v-model="props.percentage" height="9" color="blue" rounded
                class="auto-draw"></v-progress-linear>
        </div>
        <div class="d-flex justify-space-between">
            <div>{{ currency }}{{ props.masserGiven }}/ {{ currency }}{{ props.masserToGive / 10 }}</div>
            <div :class="dayColor">{{ daysLeftDisplay }}</div>
        </div>

    </v-card>
</template>

<script setup>
import router from "@/router/index";
import { defineProps, computed } from "vue";

const props = defineProps({
    period: String,
    percentage: Number,
    color: String,
    label: String,
    daysLeft: Number,
    currency: String,
    masserGiven: Number,
    masserToGive: Number
})

const oldValueNotYetGiven = 1 //props.oldValueNotYetGiven
const totalValue = computed(() => oldValueNotYetGiven)
//const totalValue = computed(()=>props.masserToGive + oldValueNotYetGiven)


const daysLeftDisplay = computed(() => {
    if (props.daysLeft > 14) {
        return `${Math.round(props.daysLeft / 7)} weeks left`;
    } else if (props.daysLeft < 14 && props.daysLeft >= 7) {
        return "1 week left";
    } else if (props.daysLeft < 7 && props.daysLeft > 1) {
        return `${props.daysLeft} days left`;
    } else {
        return "last day!";
    }
})

const colorCalc = () => {
    if (props.daysLeft > 14) {
        return "green";
    } else if (props.daysLeft > 7) {
        return "orange";
    } else {
        return "red";
    }
}

const dayColor = computed(() => `text-${colorCalc()}`)

const percentageColor = computed(() => {
    if (props.percentage > 50) {
        return "green"
    } else if (props.percentage < 50 && props.percentage > 25) {
        return "yellow-darken-1"
    } else {
        return "orange"
    }
})
</script>

<style>
.auto-draw {
    animation: draw 2s ease-in-out forwards;
}

@keyframes draw {
    from {
        width: 0%;
    }

    to {
        width: 100%;
    }
}
</style>
