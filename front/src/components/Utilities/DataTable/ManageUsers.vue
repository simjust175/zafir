<template>
  <v-container fluid>
    <!-- Add User FAB -->
    <v-fab
      extended
      color="primary"
      density="comfortable"
      prepend-icon="mdi-plus"
      location="right bottom"
      text="Add User"
      height="50"
      width="180"
      app
      @click="openDialog()"
    >
      Add User
    </v-fab>

    <!-- User Management Card -->
    <v-card
      class="pa-6"
      elevation="3"
    >
      <v-card-title class="text-h5 font-weight-bold mb-4">
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

      <!-- User Table -->
      <v-data-table
        :headers="headers"
        :items="users"
        item-value="id"
        class="mt-4"
        density="comfortable"
      >
        <template #item.active="{ item }">
          <v-chip
          :class="{'px-4' : item.token}"
            :color="item.token ? 'success' : 'warning'"
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
          <div class="d-flex">
            <v-btn
              icon="mdi-pencil"
              color="primary"
              variant="text"
              @click="openDialog(item)"
            />
            <v-btn
              icon="mdi-close"
              color="error"
              variant="text"
              :loading="loadingId === item.user_id"
              @click="confirmDelete(item)"
            />
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Add/Edit Dialog -->
    <v-dialog
      v-model="dialog"
    >
      <v-card
        class="py-6 px-4"
        min-width="300"
        rounded="xl"
      >
        <v-card-title class="text-h6">
          <v-btn
            icon="mdi-arrow-left"
            variant="flat"
            @click="dialog = false"
          />
          {{ editingUser ? 'Edit User' : 'Add User' }}
        </v-card-title>

        <v-card-text>
          <v-form
            ref="formRef"
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
            :loading="loading"
            @click="saveUser"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog
      v-model="deleteDialog"
      max-width="420"
    >
      <v-card>
        <v-card-title class="text-h6">
          Confirm Delete
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete
          <strong>{{ selectedUser?.user_name }}</strong>?
          This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="deleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            :loading="loadingId === selectedUser?.user_id"
            @click="deleteUser(selectedUser.user_id)"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar Notifications -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="2500"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue"

const headers = [
  { title: "Active", value: "active" },
  { title: "Name", value: "user_name" },
  { title: "Email", value: "user_email" },
  { title: "", value: "actions", sortable: false }
]

const users = ref([])
const dialog = ref(false)
const editingUser = ref(null)
const form = ref({ name: "", email: "" })
const valid = ref(false)
const loading = ref(false)
const loadingId = ref(null) // track which row is loading
const formRef = ref(null)

const snackbar = ref({ show: false, message: "", color: "success" })

const deleteDialog = ref(false)
const selectedUser = ref(null)

function showSnackbar(msg, color = "success") {
  snackbar.value = { show: true, message: msg, color }
}

async function getUsers() {
  const res = await fetch(`${import.meta.env.VITE_BASE_URL}/invoice/filtered/users`)
  const data = await res.json()
  users.value = data.filtered
}

function openDialog(user = null) {
  if (user) {
    editingUser.value = user
    form.value = { name: user.user_name, email: user.user_email }
  } else {
    editingUser.value = null
    form.value = { name: "", email: "" }
  }
  dialog.value = true
}

function confirmDelete(user) {
  selectedUser.value = user
  deleteDialog.value = true
}

function formatDateToMySQL(date) {
  return (
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0") +
    " " +
    String(date.getHours()).padStart(2, "0") +
    ":" +
    String(date.getMinutes()).padStart(2, "0") +
    ":" +
    String(date.getSeconds()).padStart(2, "0")
  )
}

async function deleteUser(id) {
  loadingId.value = id
  try {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/invoice/patch/users?user=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deleted_at: formatDateToMySQL(new Date()) })
    })
    if (!res.ok) throw new Error("Failed to delete user")
    showSnackbar("User deleted successfully", "success")
    deleteDialog.value = false
    await getUsers()
  } catch (err) {
    console.error(err)
    showSnackbar("Error deleting user", "error")
  } finally {
    loadingId.value = null
  }
}

async function saveUser() {
  if (!formRef.value.validate()) return
  loading.value = true
  try {
    const url = editingUser.value
      ? `${import.meta.env.VITE_BASE_URL}/invoice/patch/users?user=${editingUser.value.user_id}`
      : `${import.meta.env.VITE_BASE_URL}/invoice/add/users`

    const body = {
      user_name: form.value.name,
      user_email: form.value.email
    }

    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })

    if (!res.ok) throw new Error("Failed to save user")
    showSnackbar(editingUser.value ? "User updated successfully" : "User added successfully", "success")
    dialog.value = false
    await getUsers()
  } catch (err) {
    console.error(err)
    showSnackbar("Error saving user", "error")
  } finally {
    loading.value = false
  }
}

onMounted(getUsers)
</script>