<template>
  <v-container
    fluid
    class="pa-0 fill-height"
  >
    <v-row no-gutters>
      <!-- Sidebar -->
      <v-col
        cols="3"
        class="pa-0 bg-blue"
      >
        <project-sidebar
          :selected-project="selectedProject"
          :projects="projects"
          @update:selected-project="selectedProject = $event"
        />
      </v-col>

      <!-- Main Content -->
      <v-col
        cols="12"
        class="pa-6"
      >
        <project-filter-bar
          v-model:search-text="search"
          v-model:status-filter="statusFilter"
          @update:search-text="search = $event"
          @update:status-filter="statusFilter = $event"     
        />
        <project-overview
          :project="selectedProjectData"
          :invoices="invoiceArray.invoicing.filter(i => i.project === selectedProject)"
          class="mb-6"
        />
        <detail-section
          :invoices="filteredInvoices"
          :payments="filteredPayments"
          :total-owed="totalOwnedPerProject"
          class="mb-6"
        />

        <v-row>
          <v-col cols="6">
            <invoice-table :invoices="filteredInvoices" />
          </v-col>
          <v-col cols="6">
            <payment-timeline :payments="filteredPayments" />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>
  
  <script setup>
  import { ref, computed } from "vue"
//   import ProjectSidebar from "./ProjectSidebar.vue"
//   import ProjectOverview from "./ProjectOverview.vue"
//   import InvoiceTable from "./InvoiceTable.vue"
//   import PaymentTimeline from "./PaymentTimeline.vue"
//   import DetailSection from "./DetailSection.vue"
//   import ProjectFilterBar from "./ProjectFilterBar.vue"
  import { invoices } from "@/stores/invoiceState"
  const invoiceArray = invoices()

const invoicesInStore = computed(() => invoiceArray.invoicing)

const selectedProject = ref(1)
const search = ref("")
const statusFilter = ref("All")

const filteredPayments = computed(() =>
  invoiceArray.payments.filter(p => p.project === selectedProject.value)
)
  
  const selectedProjectData = computed(() =>
    projects.value.find(p => p.id === selectedProject.value)
  )
  
  const totalOwnedPerProject = computed(()=> invoiceArray.dbResponse
  .filter(i => i.project === selectedProject.value)
  .map(f => f.amount)
  .reduce((acc, val) => acc + val, 0)
)

// 🧾 Filter invoices by project + search + status
const filteredInvoices = computed(() => {
  return invoicesInStore.value
    .filter(inv => {
      // project filter
      if (inv.project !== selectedProject.value) return false

      // status filter (only if status exists in the invoice)
      if (statusFilter.value !== "All" && inv.status && inv.status !== statusFilter.value) {
        return false
      }

      // search filter (amount or created_on)
      const searchStr = search.value.toLowerCase()
      return (
        inv.project === selectedProject.value &&
        inv.amount.toString().includes(searchStr) ||
        inv.created_on.toLowerCase().includes(searchStr)
      )
    })
    .map(inv => ({
      ...inv,
      // ensure a status so the table won't break
      status: inv.status || "Pending"
    }))
})

  const projects = computed(() => {
  const set = []
  for (const inv of invoiceArray.dbResponse) {
    if (inv.project_name && !set.some(p => p.name === inv.project_name)) {
      set.push({ name: inv.project_name, id: inv.project_id })
    }
  }
  return set
})
  // const loadInfo = ()=> {
  //   invoicesInStore.value = invoiceArray.invoicing
  //   payments.value = invoiceArray.payments
  // }

  // onMounted(()=> loadInfo())
  </script>