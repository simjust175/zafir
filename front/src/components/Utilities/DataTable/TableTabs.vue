<template>
    <v-card>
        <!-- <v-toolbar color="primary" :title="$t('User Profile')">
        </v-toolbar> -->

        <div class="d-flex flex-row">
            <v-tabs v-model="tab" color="primary" direction="vertical">
                <v-tab prepend-icon="mdi-account" :text="$t('Transactions')" value="option-1"></v-tab>
                <v-tab prepend-icon="mdi-lock" :text="$t('Users')" value="option-2"></v-tab>
            </v-tabs>

            <v-tabs-window v-model="tab">
                

                <v-tabs-window-item value="option-1">
                    <table-parent  :amountArray="amountArray" :actionStat="true" @tableUpdate="fetchFromSessionStorage" class="overflow-y-auto"/>
                </v-tabs-window-item>

                <v-tabs-window-item value="option-2">
                    <div class="bg-blue pa-12"></div>
                </v-tabs-window-item>
            </v-tabs-window>
        </div>
    </v-card>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import store from "../../../storage"
const props = defineProps({amountArray: Array})

const tab = ref('option-1')
let amountArray = ref([])
const fetchFromSessionStorage = () =>{
    amountArray.value = store.state.dbContent
}

watch(store.state.dbContent, (updatedValue)=> amountArray.value = updatedValue)
onMounted(()=> fetchFromSessionStorage())
</script>