<template>
  <v-toolbar
    class="pl-4 bg-transparent"
    elevation="2"
    rounded="lg"
    width="98%"
  >
    <div class="text-h6 text-capitalize">
      {{ project?.name }}
    </div>
    <v-spacer />

    <div class="d-flex align-center">
      <invoice-dash
        :current-project-id="project?.id"
        :expanded="false"
        :add-invoicing="adding"
      />
      <download-file
        class="ms-5"
        :grouped-invoices="groupedInvoices"
        :project-name="projectName"
        :total="overallTotalWithMargin"
        :payments="invoiceArray.payments.filter(p => p.project === project?.id)"
        :double-checked="invoiceArray.dbResponse.filter(i => i.project === project?.id).every(p => p.double_checked !== null)"
        :print="false"
      />
      <download-file
        :grouped-invoices="groupedInvoices"
        :project-name="projectName"
        :payments="invoiceArray.payments.filter(p => p.project === project?.id)"
        :double-checked="invoiceArray.dbResponse.filter(i => i.project === project?.id).every(p => p.double_checked !== null)"
        :total="overallTotalWithMargin"
        :print="true"
      />
      <send-invoice
        :grouped-invoices="groupedInvoices"
        :project-name="projectName"
        :current-project-id="project?.id"
        :payments="invoiceArray.payments.filter(p => p.project === project?.id)"
        :double-checked="invoiceArray.dbResponse.filter(i => i.project === project?.id).every(p => p.double_checked !== null)"
        :total="overallTotalWithMargin"
      />
      <v-divider
        class="mx-2"
        inset
        vertical
      />
      <table-parent-toolbar-menu
        :project="invoices"
        class="pr-1"
      />
    </div>
  </v-toolbar>
</template>

<!-- eslint-disable vue/require-default-prop -->
<script setup>
import { computed, watch } from "vue"
import { invoices } from "@/stores/invoiceState.js"

const props = defineProps({
  projectName: String,
  project: Object,
  email: Array,
  adding: String
})

const invoiceArray = invoices()
const invoicesByProject = computed(()=> invoiceArray.dbResponse.filter(i => i.project === props.project.id))

// Group invoices by issuer and calculate totals per invoice margin
const groupedInvoices = computed(() => {
  const groups = {};
  (invoicesByProject.value || []).forEach(inv => {
    const issuer = inv.issuer || 'Unknown'
    if (!groups[issuer]) groups[issuer] = []
    groups[issuer].push(inv)
  })

  return Object.keys(groups).map(issuer => {
    const invoices = groups[issuer]

    const totalAmount = invoices.reduce(
      (sum, inv) => sum + Number(inv.amount || 0),
      0
    )

    // Correct: sum each invoice's margin individually
    const totalWithMargin = invoices.reduce((sum, inv) => {
      const margin = Number(inv.margin || 0)
      return sum + Number(inv.amount || 0) * (1 + margin / 100)
    }, 0)

    // Calculate average margin for display
    const avgMargin = invoices.length > 0 
      ? invoices.reduce((sum, inv) => sum + Number(inv.margin || 0), 0) / invoices.length
      : 0

    return {
      issuer,
      invoices,
      totalAmount,
      totalMargin: avgMargin,
      totalWithMargin,
      marginChanged: false
    }
  })
})

const overallTotalWithMargin = computed(() => {
  let total = 0;
  groupedInvoices.value.forEach(group => {
    //>>>>>>>>>>>Good test!>>> console.log(group.issuer, group.totalWithMargin, group);
    total += group.totalWithMargin;
  });
  return Number(total.toFixed(2));
});
let counter = 0
watch(()=> props.adding,  (newVal)=> console.log("adding", counter++, "{{}}", newVal))
</script>