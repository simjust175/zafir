<template>
    <v-card class="pa-8 bg-grey-lighten-4">
        <overlay-component :overlayTrigger="triggerOverlay"/>
    <div id="chart">
        <apexchart type="bar" height="350" :options="chartOptions" :series="series"></apexchart>
    </div>
    </v-card>
</template>

<script setup>
import { ref, onMounted } from "vue";
const props = defineProps({
    monthly: Array,
    amountArray: Array,
    optionMethods: Array,     
})

// const series = ref([{
//     name: props.optionMethods[0],
//     data: [(props.monthly.sums.income/1000), 12, 34, 65, 88]
// }, {
//     name: props.optionMethods[1],
//     data: [(props.monthly.sums.masser/1000), 44, 56, 76, 54]
// }, {
//     name: props.optionMethods[2],
//     data: [(props.monthly.sums.expenses/1000), 23, 67, 33, 64]
// }])

const series = ref([{
    name:"Income",
    data: [(props.monthly.sums.income/1000), 12, 34, 65, 88]
}, {
    name: "Tzedaka",
    data: [(props.monthly.sums.masser/1000), 44, 56, 76, 54]
}, {
    name: "Expenses",
    data: [(props.monthly.sums.expenses/1000), 23, 67, 33, 64]
}])
const chartOptions = ({
    chart: {
        type: 'bar',
        height: 350
    },
    plotOptions: {
        bar: {
            horizontal: false,
            columnWidth: '55%',
            borderRadius: 5,
            borderRadiusApplication: 'end'
        },
    },
    dataLabels: {
        enabled: false
    },
    stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
    },
    xaxis: {
        categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    },
    yaxis: {
        title: {
            text: '$ (thousands)'
        }
    },
    fill: {
        opacity: 1
    },
    tooltip: {
        y: {
            formatter: function (val) {
                return "$ " + val + " thousands"
            }
        }
    }
});
const triggerOverlay = ref(false)
const triggerOverlayFunction = () => {
  triggerOverlay.value = true

  setTimeout(() => {
    triggerOverlay.value = false;
  }, 3000)

}
onMounted(()=> triggerOverlayFunction())
</script>

<style></style>