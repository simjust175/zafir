<template>
  <div class="users-container">
    <div class="users-card">
      <div class="card-header">
        <div class="search-section">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search users..."
            variant="outlined"
            density="compact"
            hide-details
            rounded="lg"
            class="search-input"
          />
        </div>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          rounded="lg"
          @click="openDialog()"
        >
          Add User
        </v-btn>
      </div>

      <div class="table-container">
        <v-data-table
          :headers="headers"
          :items="filteredUsers"
          :search="search"
          item-value="id"
          class="users-table"
          :items-per-page="10"
        >
          <template #item.active="{ item }">
            <v-chip
              :color="item.token ? 'success' : 'grey'"
              size="small"
              variant="tonal"
            >
              <v-icon
                start
                size="12"
              >
                {{ item.token ? 'mdi-check-circle' : 'mdi-circle-outline' }}
              </v-icon>
              {{ item.token ? 'Active' : 'Inactive' }}
            </v-chip>
          </template>

          <template #item.user_name="{ item }">
            <div class="user-cell">
              <v-avatar
                size="36"
                color="primary"
                variant="tonal"
              >
                <span class="text-caption font-weight-medium">{{ getInitials(item.user_name) }}</span>
              </v-avatar>
              <div class="user-info">
                <span class="user-name">{{ item.user_name }}</span>
                <span class="user-email">{{ item.user_email }}</span>
              </div>
            </div>
          </template>

          <template #item.user_email="{ item }">
            <span class="text-grey-darken-1">{{ item.user_email }}</span>
          </template>

          <template #item.actions="{ item }">
            <div class="action-buttons">
              <v-btn
                icon="mdi-pencil-outline"
                size="small"
                variant="text"
                color="grey"
                @click="openDialog(item)"
              />
              <v-btn
                icon="mdi-trash-can-outline"
                size="small"
                variant="text"
                color="error"
                :loading="loadingId === item.user_id"
                @click="confirmDelete(item)"
              />
            </div>
          </template>

          <template #no-data>
            <div class="empty-state">
              <v-icon
                size="48"
                color="grey-lighten-1"
              >
                mdi-account-group-outline
              </v-icon>
              <p>No users found</p>
            </div>
          </template>
        </v-data-table>
      </div>
    </div>

    <v-dialog
      v-model="dialog"
      max-width="480"
    >
      <v-card rounded="xl">
        <v-card-title class="dialog-header">
          <span>{{ editingUser ? 'Edit User' : 'Add New User' }}</span>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="dialog = false"
          />
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form
            ref="formRef"
            v-model="valid"
          >
            <v-text-field
              v-model="form.name"
              label="Full Name"
              variant="outlined"
              :rules="[v => !!v || 'Name is required']"
              class="mb-4"
            />
            <v-text-field
              v-model="form.email"
              label="Email Address"
              type="email"
              variant="outlined"
              :rules="[v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'Invalid email']"
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn
            variant="text"
            @click="dialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="loading"
            @click="saveUser"
          >
            {{ editingUser ? 'Save Changes' : 'Add User' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="deleteDialog"
      max-width="400"
    >
      <v-card rounded="xl">
        <v-card-title class="dialog-header">
          <v-icon
            color="error"
            class="mr-2"
          >
            mdi-alert-circle-outline
          </v-icon>
          Confirm Delete
        </v-card-title>

        <v-card-text class="pa-6">
          Are you sure you want to delete <strong>{{ selectedUser?.user_name }}</strong>?
          This action cannot be undone.
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn
            variant="text"
            @click="deleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            :loading="loadingId === selectedUser?.user_id"
            @click="deleteUser(selectedUser.user_id)"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      location="bottom right"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"

const headers = [
  { title: "Status", value: "active", width: "100px" },
  { title: "User", value: "user_name" },
  { title: "Actions", value: "actions", sortable: false, width: "100px", align: "end" }
]

const users = ref([])
const search = ref("")
const dialog = ref(false)
const editingUser = ref(null)
const form = ref({ name: "", email: "" })
const valid = ref(false)
const loading = ref(false)
const loadingId = ref(null)
const formRef = ref(null)
const snackbar = ref({ show: false, message: "", color: "success" })
const deleteDialog = ref(false)
const selectedUser = ref(null)

const filteredUsers = computed(() => users.value)

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function showSnackbar(msg, color = "success") {
  snackbar.value = { show: true, message: msg, color }
}

async function getUsers() {
  try {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/invoice/filtered/users`)
    const data = await res.json()
    users.value = data.filtered || []
  } catch (err) {
    console.debug("Could not fetch users - backend may not be running")
    users.value = []
  }
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
  const { valid: isValid } = await formRef.value.validate()
  if (!isValid) return
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
    showSnackbar(editingUser.value ? "User updated" : "User added", "success")
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

<style scoped>
.users-container {
  max-width: 1200px;
  margin: 0 auto;
}

.users-card {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-grey-200));
  border-radius: 16px;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgb(var(--v-theme-grey-100));
  gap: 16px;
  flex-wrap: wrap;
}

.search-section {
  background: rgb(var(--v-theme-surface-variant));
  flex: 1;
  max-width: 320px;
}

.search-input {
  background: rgb(var(--v-theme-surface-variant));
}

.table-container {
  padding: 0;
}

.users-table {
  background: transparent !important;
}


/* Table header */
:deep(.v-data-table__thead) {
  background: rgb(var(--v-theme-surface-variant));
}

/* Table header text */
:deep(.v-data-table__thead th) {
  color: rgb(var(--v-theme-on-surface-variant)) !important;
}

/* Row hover */
:deep(.v-data-table__tr:hover) {
  background: rgb(var(--v-theme-surface-variant)) !important;
}

/* Secondary text */
.user-email,
.empty-state {
  color: rgb(var(--v-theme-on-surface-variant));
}

:deep(.v-field) {
  background-color: rgb(var(--v-theme-surface-variant));
}

:deep(.v-field__outline) {
  color: rgb(var(--v-theme-outline));
}

:deep(.v-field__input) {
  color: rgb(var(--v-theme-on-surface));
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  text-transform: capitalize;
}

.user-email {
  font-size: 0.8125rem;
  color: rgb(var(--v-theme-grey-500));
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid rgb(var(--v-theme-grey-100));
  font-size: 1.125rem;
  font-weight: 600;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
  color: rgb(var(--v-theme-grey-500));
}

.empty-state p {
  margin-top: 12px;
}
</style>
