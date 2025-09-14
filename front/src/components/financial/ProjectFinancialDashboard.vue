<!-- ProjectFinancialDashboard.vue -->
<template>
  <v-container
    fluid
    class="pa-6 bg-grey-lighten-4"
  >
    <v-row>
      <!-- Sidebar: Project List -->
      <v-col
        cols="3"
        class="pr-4"
      >
        <v-card class="rounded-2xl elevation-3">
          <v-card-title class="bg-primary text-white font-weight-bold">
            Projects
          </v-card-title>
          <v-divider />
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="Search Projects"
            hide-details
            dense
            variant="outlined"
            class="ma-2"
          />
          <v-list lines="two">
            <v-list-item
              v-for="project in filteredProjects"
              :key="project.id"
              :class="{
                'bg-primary text-white': selectedProject?.id === project.id,
                'cursor-pointer': true
              }"
              class="rounded-lg ma-1"
              @click="selectProject(project)"
            >
              <v-list-item-title>{{ project.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ project.client }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
  
      <!-- Main Content -->
      <v-col cols="9">
        <v-slide-y-transition>
          <v-card
            v-if="selectedProject"
            class="rounded-2xl elevation-3 pa-4"
          >
            <v-card-title class="d-flex justify-space-between align-center">
              <div>
                <h2 class="text-h5 font-weight-bold mb-1">
                  {{ selectedProject.name }}
                </h2>
                <div class="text-subtitle-2">
                  Client: {{ selectedProject.client }}
                </div>
              </div>
              <v-chip
                color="success"
                class="font-weight-bold"
                label
              >
                {{ projectBalance }} EUR
              </v-chip>
            </v-card-title>
            <v-divider class="my-4" />
  
            <!-- Invoices Section -->
            <v-row>
              <v-col
                cols="12"
                md="6"
              >
                <v-card class="rounded-xl elevation-2">
                  <v-card-title class="bg-grey-lighten-3 font-weight-bold">
                    Invoices
                  </v-card-title>
                  <v-divider />
                  <v-data-table
                    :headers="invoiceHeaders"
                    :items="selectedProject.invoices"
                    class="rounded-xl"
                    dense
                  >
                    <template #item.amount="{ item }">
                      <span class="font-weight-bold text-primary">€{{ item.amount }}</span>
                    </template>
                    <template #item.status="{ item }">
                      <v-chip
                        :color="item.status === 'Paid' ? 'success' : 'warning'"
                        label
                        small
                      >
                        {{ item.status }}
                      </v-chip>
                    </template>
                  </v-data-table>
                </v-card>
              </v-col>
  
              <!-- Payments Section -->
              <v-col
                cols="12"
                md="6"
              >
                <v-card class="rounded-xl elevation-2">
                  <v-card-title class="bg-grey-lighten-3 font-weight-bold">
                    Payments
                  </v-card-title>
                  <v-divider />
                  <v-data-table
                    :headers="paymentHeaders"
                    :items="selectedProject.payments"
                    class="rounded-xl"
                    dense
                  >
                    <template #item.amount="{ item }">
                      <span class="font-weight-bold text-success">€{{ item.amount }}</span>
                    </template>
                  </v-data-table>
                </v-card>
              </v-col>
            </v-row>
          </v-card>
        </v-slide-y-transition>
        <v-slide-y-transition>
          <v-card
            v-if="!selectedProject"
            class="rounded-2xl elevation-1 pa-6 text-center"
          >
            <v-icon
              size="64"
              color="grey"
            >
              mdi-folder-open
            </v-icon>
            <div class="text-h6 mt-2">
              Select a project to view details
            </div>
          </v-card>
        </v-slide-y-transition>
      </v-col>
    </v-row>
  </v-container>
</template>
  
  <script setup>
  import { ref, computed } from 'vue'
  
  const search = ref('')
  const selectedProject = ref(null)
  
  const projects = ref([
    {
      id: 1,
      name: 'CRM Migration',
      client: 'Acme Corp',
      invoices: [
        { id: 1, date: '2025-05-01', amount: 1200, status: 'Paid' },
        { id: 2, date: '2025-06-01', amount: 800, status: 'Pending' }
      ],
      payments: [
        { id: 1, date: '2025-05-15', amount: 1200 },
      ]
    },
    {
      id: 2,
      name: 'Website Revamp',
      client: 'Beta Ltd',
      invoices: [
        { id: 3, date: '2025-07-10', amount: 2000, status: 'Paid' }
      ],
      payments: [
        { id: 2, date: '2025-07-15', amount: 2000 },
      ]
    }
  ])
  
  const invoiceHeaders = [
    { title: 'Date', value: 'date' },
    { title: 'Amount', value: 'amount' },
    { title: 'Status', value: 'status' }
  ]
  
  const paymentHeaders = [
    { title: 'Date', value: 'date' },
    { title: 'Amount', value: 'amount' }
  ]
  
  const filteredProjects = computed(() => {
    return projects.value.filter(p =>
      p.name.toLowerCase().includes(search.value.toLowerCase())
    )
  })
  
  const selectProject = (project) => {
    selectedProject.value = project
  }
  
  const projectBalance = computed(() => {
    if (!selectedProject.value) return 0
    const totalInvoices = selectedProject.value.invoices.reduce((sum, i) => sum + i.amount, 0)
    const totalPayments = selectedProject.value.payments.reduce((sum, p) => sum + p.amount, 0)
    return (totalInvoices - totalPayments).toFixed(2)
  })
  </script>
  
  <style scoped>
  .cursor-pointer {
    cursor: pointer;
  }
  </style>
  