<template>
  <v-container fluid>
    <v-fab
    extended
      color="primary"
      density="comfortable"
      prepend-icon="mdi-plus"
      location="right bottom"
      text="Add project"
      height="50"
      width="180"
      @click="openDialog()"
      app
    >
      Add User
    </v-fab>
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
    
  
      <!-- Users Table -->
      <v-data-table
        :headers="headers"
        :items="users"
        item-value="id"
        class="mt-4"
        density="comfortable"
      >
        <template #item.active="{ item }">
          <v-chip 
            :color="item.token? 'success' : 'warning'"
            :class="{ 'px-4': item.token}"
            label
          >
            {{ item.token ? 'Active' : 'Inactive' }}
          </v-chip>
        </template>
        <template #item.user_name="{ item }">
          <div class="text-capitalize">
            {{ item.user_name }}
          </div>
        </template>
        <template #item.actions="{ item }">
          <!-- <v-btn
            icon="mdi-pencil"
            color="primary"
            variant="text"
            @click="openDialog(item)"
          /> -->
          <v-btn
            icon="mdi-close"
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

      <div class="d-flex justify-center">
        <v-card
          width="520"
          class="pa-6"
          rounded="xl"
        >
       
          <v-card-title class="text-h6">
            <v-btn
              icon="mdi-arrow-left"
              @click="dialog =false"
              variant="flat"
            />
            {{ editingUser ? 'Edit User' : 'Add User' }}
          </v-card-title>
          <!--<v-card-text>
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
        </v-card-actions> -->
          <register-form @close="dialog = false" />
        </v-card>
      </div>
    </v-dialog>
  </v-container>
</template>
  
  <script setup>
import { ref, onMounted } from 'vue'
  
  const headers = [
    { title: 'Active', value: 'active' },
    { title: 'Name', value: 'user_name' },
    { title: 'Email', value: 'user_email' },
    { title: '', value: 'actions', sortable: false },
  ]
   const getUsers= async()=> {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/invoice/filtered/users`)
    const data = await res.json()
    return data.filtered;
     }
  
  const users = ref([])
  
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

  onMounted(() => getUsers().then(data => users.value = data))
  </script>
  
  <!-- <style scoped>
  .v-data-table .v-btn {
    min-width: 32px;
  }
  </style> -->