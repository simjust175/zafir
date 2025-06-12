<template>
  <v-card class="pa-4" theme="light">
    <v-data-table :headers="headers" :items="amountArray" theme="light" class="bg-grey-lighten-3" hide-default-footer>
      <template v-slot:item.amount="{ value }">
        <v-chip :color="getColor(value)">
        </v-chip>
      </template>
    
    </v-data-table>
  </v-card>
</template>

<script>
export default {
  props: {
    amountArray: Array
  },
  data: () => ({
    headers: [
      { title: 'Date', key: 'created_at' },
      { title: 'Category', key: 'method' },
      { title: 'level of integrity', key: 'amount' },
      { title: 'Amount', key: 'amount' },
      { title: 'Description', key: 'description' },
    ]
  }),

  methods: {
    getColor(calories) {
      if (calories > 100) return 'red'
      else if (calories > 50) return 'orange'
      else return 'green'
    },
  },
}
</script>