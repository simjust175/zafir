<template>
  <v-container fluid>
    <v-card
      class="pa-6"
      elevation="3"
    >
      <v-card-title
        class="text-h5 font-weight-bold mb-4"
      >
        <v-icon
          class="mr-6 cursor-pointer"
          size="25"
          @click="$router.push('/')"
        >
          mdi-arrow-left
        </v-icon>
        <v-icon>mdi-account-multiple</v-icon>
        User Management
      </v-card-title>
  
      <!-- Add User Button -->
      <v-btn
        color="primary"
        prepend-icon="mdi-account-plus"
        @click="openDialog()"
      >
        Add User
      </v-btn>
  
      <!-- Users Table -->
      <v-data-table
        :headers="headers"
        :items="users"
        item-value="id"
        class="mt-4"
        density="comfortable"
      >
        <template #item.actions="{ item }">
          <v-btn
            icon="mdi-pencil"
            color="primary"
            variant="text"
            @click="openDialog(item)"
          />
          <v-btn
            icon="mdi-delete"
            color="error"
            variant="text"
            @click="deleteUser(item.id)"
          />
        </template>
      </v-data-table>
    </v-card>
  
    <!-- Add/Edit Dialog -->
    <v-dialog
      v-model="dialog"
    >
      <v-card width="420" class="pa-2">
        <v-card-title class="text-h6">
          {{ editingUser ? 'Edit User' : 'Add User' }}
        </v-card-title>
        <v-card-text>
          <v-form
            ref="form"
            v-model="valid"
          >
            <v-text-field
              v-model="form.name"
              label="Full Name"
              :rules="[v => !!v || 'Name is required']"
              required
            />
            <v-text-field
              v-model="form.email"
              label="Email"
              type="email"
              :rules="[v => !!v || 'Email is required']"
              required
            />
            <v-select
              v-model="form.role"
              :items="roles"
              label="Role"
              :rules="[v => !!v || 'Role is required']"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="dialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="saveUser"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
  
  <script setup>
import { ref } from 'vue'
  
  const headers = [
    { title: 'Name', value: 'name' },
    { title: 'Email', value: 'email' },
    { title: 'Role', value: 'role' },
    { title: '', value: 'actions', sortable: false },
  ]
  
  const roles = ['Admin', 'Manager', 'Employee']
  
  const users = ref([
    { id: 1, name: 'Alice Johnson', email: 'alice@company.com', role: 'Admin' },
    { id: 2, name: 'Bob Smith', email: 'bob@company.com', role: 'Employee' },
  ])
  
  const dialog = ref(false)
  const editingUser = ref(null)
  const form = ref({ name: '', email: '', role: '' })
  const valid = ref(false)
  const formRef = ref(null)
  
  function openDialog(user = null) {
    if (user) {
      editingUser.value = user
      form.value = { ...user }
    } else {
      editingUser.value = null
      form.value = { name: '', email: '', role: '' }
    }
    dialog.value = true
  }
  
  function saveUser() {
    if (!valid.value) return
  
    if (editingUser.value) {
      const index = users.value.findIndex(u => u.id === editingUser.value.id)
      if (index !== -1) users.value[index] = { ...form.value }
    } else {
      const newUser = {
        ...form.value,
        id: Date.now(),
      }
      users.value.push(newUser)
    }
  
    dialog.value = false
  }
  
  function deleteUser(id) {
    users.value = users.value.filter(u => u.id !== id)
  }
  </script>
  
  <!-- <style scoped>
  .v-data-table .v-btn {
    min-width: 32px;
  }
  </style> -->