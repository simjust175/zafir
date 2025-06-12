<template>
    <v-select v-model="selectedCurrency.title" :items="currencies" class="flex-grow-0" id="menu-activator"
        v-if="selectStat"></v-select>
    <v-menu :activator="activationMethod" v-if="selectStat">
        <v-list>
            <v-list-item v-for="(currency, index) in currencies" :key="index">
                <v-list-item-title>{{ currency.title }}</v-list-item-title>
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script setup>
import { ref, defineProps, computed, watch, defineEmits } from "vue";

const props = defineProps({
    selectStat: Boolean
})

const emit = defineEmits(["currencyUpdate"])

const activationMethod = computed(() => props.selectStat ? "#menu-activator" : "parent")
const selectedCurrency = ref({ title: '€', value: 'eur' })
const currencies = ref([
    { title: '€', value: 'eur' },
    { title: '$', value: 'usd' },
    { title: '₪', value: 'ils' },
    { title: '£', value: 'gbp' },
    { title: '₣', value: 'franc' }
])

watch(selectedCurrency.value, () => emit("currencyUpdate", selectedCurrency.value.title))

</script>

<style></style>