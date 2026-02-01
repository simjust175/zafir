<template>
  <div class="users-management">
    <div class="tabs-section">
      <div class="tabs-container">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-btn"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <v-icon size="18">
            {{ tab.icon }}
          </v-icon>
          <span>{{ tab.label }}</span>
          <span
            v-if="tab.count > 0"
            class="tab-badge"
          >{{ tab.count }}</span>
        </button>
      </div>
      <div class="search-container">
        <v-icon
          size="18"
          class="search-icon"
        >
          mdi-magnify
        </v-icon>
        <input
          v-model="search"
          type="text"
          placeholder="Search members..."
          class="search-input"
        >
        <transition name="fade">
          <button
            v-if="search"
            class="clear-btn"
            @click="search = ''"
          >
            <v-icon size="16">
              mdi-close
            </v-icon>
          </button>
        </transition>
      </div>
    </div>

    <transition
      name="fade-slide"
      mode="out-in"
    >
      <div
        v-if="activeTab === 'members'"
        key="members"
        class="content-section"
      >
        <div
          v-if="loading"
          class="loading-state"
        >
          <v-progress-circular
            indeterminate
            color="primary"
            size="40"
          />
          <span>Loading team members...</span>
        </div>

        <div
          v-else-if="filteredUsers.length === 0"
          class="empty-state"
        >
          <div class="empty-icon">
            <v-icon
              size="48"
              color="grey-300"
            >
              mdi-account-group-outline
            </v-icon>
          </div>
          <h3>No members found</h3>
          <p>{{ search ? 'Try adjusting your search' : 'Add your first team member to get started' }}</p>
          <v-btn
            v-if="!search"
            color="primary"
            variant="flat"
            rounded="lg"
            prepend-icon="mdi-plus"
            class="mt-4"
            @click="openAddDialog()"
          >
            Add Member
          </v-btn>
        </div>

        <div
          v-else
          class="users-grid"
        >
          <transition-group name="list">
            <div
              v-for="user in filteredUsers"
              :key="user.user_id"
              class="user-card"
              :class="{ pending: user._pending }"
            >
              <div class="user-main">
                <div
                  class="user-avatar"
                  :class="{ active: user.token }"
                >
                  <span>{{ getInitials(user.user_name) }}</span>
                  <div
                    class="status-dot"
                    :class="user.token ? 'online' : 'offline'"
                  />
                </div>
                <div class="user-info">
                  <h4 class="user-name">
                    {{ user.user_name }}
                  </h4>
                  <span class="user-email">{{ user.user_email }}</span>
                </div>
              </div>
              <div class="user-meta">
                <span
                  class="status-badge"
                  :class="user.token ? 'active' : 'inactive'"
                >
                  {{ user.token ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <div class="user-actions">
                <button
                  class="action-icon-btn"
                  title="Edit"
                  @click="openEditDialog(user)"
                >
                  <v-icon size="18">
                    mdi-pencil-outline
                  </v-icon>
                </button>
                <button
                  class="action-icon-btn danger"
                  title="Delete"
                  @click="openDeleteDialog(user)"
                >
                  <v-icon size="18">
                    mdi-trash-can-outline
                  </v-icon>
                </button>
              </div>
            </div>
          </transition-group>
        </div>
      </div>

      <div
        v-else
        key="invites"
        class="content-section"
      >
        <div
          v-if="pendingInvites.length === 0"
          class="empty-state"
        >
          <div class="empty-icon">
            <v-icon
              size="48"
              color="grey-300"
            >
              mdi-email-outline
            </v-icon>
          </div>
          <h3>No pending invites</h3>
          <p>Send an invite to add new team members</p>
          <v-btn
            color="primary"
            variant="flat"
            rounded="lg"
            prepend-icon="mdi-email-fast"
            class="mt-4"
            @click="openInviteDialog()"
          >
            Send Invite
          </v-btn>
        </div>

        <div
          v-else
          class="invites-list"
        >
          <transition-group name="list">
            <div
              v-for="invite in pendingInvites"
              :key="invite.id"
              class="invite-card"
              :class="{ pending: invite._pending }"
            >
              <div class="invite-main">
                <div class="invite-avatar">
                  <v-icon size="20">
                    mdi-email-outline
                  </v-icon>
                </div>
                <div class="invite-info">
                  <h4 class="invite-email">
                    {{ invite.email }}
                  </h4>
                  <span class="invite-meta">
                    Sent {{ formatDate(invite.last_sent_at || invite.created_at) }}
                    <template v-if="invite.expires_at">
                      · Expires {{ formatDate(invite.expires_at) }}
                    </template>
                  </span>
                </div>
              </div>
              <div class="invite-actions">
                <button
                  class="text-action-btn"
                  @click="resendInvite(invite)"
                >
                  <v-icon size="16">
                    mdi-refresh
                  </v-icon>
                  Resend
                </button>
                <button
                  class="text-action-btn danger"
                  @click="cancelInviteAction(invite)"
                >
                  <v-icon size="16">
                    mdi-close
                  </v-icon>
                  Cancel
                </button>
              </div>
            </div>
          </transition-group>
        </div>
      </div>
    </transition>

    <teleport to="body">
      <transition name="modal">
        <div
          v-if="showAddDialog || props.showAddDialog"
          class="modal-overlay"
          @click.self="closeAddDialog"
        >
          <div class="modal-container">
            <div class="modal-header">
              <div class="modal-title-section">
                <div class="modal-icon add">
                  <v-icon size="22">
                    mdi-account-plus
                  </v-icon>
                </div>
                <div>
                  <h2 class="modal-title">
                    {{ editingUser ? 'Edit Member' : 'Add New Member' }}
                  </h2>
                  <p class="modal-subtitle">
                    {{ editingUser ? 'Update member details' : 'Add a new team member directly' }}
                  </p>
                </div>
              </div>
              <button
                class="modal-close"
                @click="closeAddDialog"
              >
                <v-icon size="20">
                  mdi-close
                </v-icon>
              </button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input
                  v-model="form.name"
                  type="text"
                  class="form-input"
                  :class="{ error: formErrors.name }"
                  placeholder="John Doe"
                  @input="formErrors.name = ''"
                >
                <span
                  v-if="formErrors.name"
                  class="form-error"
                >{{ formErrors.name }}</span>
              </div>
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input
                  v-model="form.email"
                  type="email"
                  class="form-input"
                  :class="{ error: formErrors.email }"
                  placeholder="john@example.com"
                  @input="formErrors.email = ''"
                >
                <span
                  v-if="formErrors.email"
                  class="form-error"
                >{{ formErrors.email }}</span>
              </div>
            </div>
            <div class="modal-footer">
              <button
                class="btn secondary"
                @click="closeAddDialog"
              >
                Cancel
              </button>
              <button
                class="btn primary"
                :disabled="saving"
                @click="saveUser"
              >
                <v-progress-circular
                  v-if="saving"
                  indeterminate
                  size="16"
                  width="2"
                  color="white"
                />
                <span v-else>{{ editingUser ? 'Save Changes' : 'Add Member' }}</span>
              </button>
            </div>
          </div>
        </div>
      </transition>

      <transition name="modal">
        <div
          v-if="showInviteDialogLocal || props.showInviteDialog"
          class="modal-overlay"
          @click.self="closeInviteDialog"
        >
          <div class="modal-container">
            <div class="modal-header">
              <div class="modal-title-section">
                <div class="modal-icon invite">
                  <v-icon size="22">
                    mdi-email-fast
                  </v-icon>
                </div>
                <div>
                  <h2 class="modal-title">
                    Invite Team Member
                  </h2>
                  <p class="modal-subtitle">
                    Send an invitation email to join your team
                  </p>
                </div>
              </div>
              <button
                class="modal-close"
                @click="closeInviteDialog"
              >
                <v-icon size="20">
                  mdi-close
                </v-icon>
              </button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input
                  v-model="inviteForm.email"
                  type="email"
                  class="form-input"
                  :class="{ error: inviteFormErrors.email }"
                  placeholder="colleague@example.com"
                  @input="inviteFormErrors.email = ''"
                >
                <span
                  v-if="inviteFormErrors.email"
                  class="form-error"
                >{{ inviteFormErrors.email }}</span>
              </div>
              <div class="form-group">
                <label class="form-label">Name <span class="optional">(Optional)</span></label>
                <input
                  v-model="inviteForm.name"
                  type="text"
                  class="form-input"
                  placeholder="Their name"
                >
              </div>
              <div class="info-box">
                <v-icon
                  size="18"
                  color="primary"
                >
                  mdi-information-outline
                </v-icon>
                <span>They'll receive an email with a link to create their account. The link expires in 72 hours.</span>
              </div>
            </div>
            <div class="modal-footer">
              <button
                class="btn secondary"
                @click="closeInviteDialog"
              >
                Cancel
              </button>
              <button
                class="btn primary"
                :disabled="sendingInvite"
                @click="sendInvite"
              >
                <v-progress-circular
                  v-if="sendingInvite"
                  indeterminate
                  size="16"
                  width="2"
                  color="white"
                />
                <template v-else>
                  <v-icon size="18">
                    mdi-send
                  </v-icon>
                  <span>Send Invite</span>
                </template>
              </button>
            </div>
          </div>
        </div>
      </transition>

      <transition name="modal">
        <div
          v-if="showDeleteDialog"
          class="modal-overlay"
          @click.self="showDeleteDialog = false"
        >
          <div class="modal-container small">
            <div class="modal-header">
              <div class="modal-title-section">
                <div class="modal-icon danger">
                  <v-icon size="22">
                    mdi-alert-circle
                  </v-icon>
                </div>
                <div>
                  <h2 class="modal-title">
                    Delete Member
                  </h2>
                  <p class="modal-subtitle">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              <button
                class="modal-close"
                @click="showDeleteDialog = false"
              >
                <v-icon size="20">
                  mdi-close
                </v-icon>
              </button>
            </div>
            <div class="modal-body">
              <p class="delete-message">
                Are you sure you want to remove <strong>{{ deletingUser?.user_name }}</strong> from the team?
              </p>
            </div>
            <div class="modal-footer">
              <button
                class="btn secondary"
                @click="showDeleteDialog = false"
              >
                Cancel
              </button>
              <button
                class="btn danger"
                :disabled="deleting"
                @click="confirmDelete"
              >
                <v-progress-circular
                  v-if="deleting"
                  indeterminate
                  size="16"
                  width="2"
                  color="white"
                />
                <span v-else>Delete Member</span>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <transition name="toast">
      <div
        v-if="toast.show"
        class="toast"
        :class="toast.type"
      >
        <v-icon size="18">
          {{ toast.type === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}
        </v-icon>
        <span>{{ toast.message }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/userStore'

const props = defineProps({
  showAddDialog: { type: Boolean, default: false },
  showInviteDialog: { type: Boolean, default: false }
})

const emit = defineEmits(['close-add', 'close-invite', 'stats-update'])

const userStore = useUserStore()

const activeTab = ref('members')
const search = ref('')
const loading = ref(false)
const saving = ref(false)
const sendingInvite = ref(false)
const deleting = ref(false)

const showAddDialogLocal = ref(false)
const showInviteDialogLocal = ref(false)
const showDeleteDialog = ref(false)

const editingUser = ref(null)
const deletingUser = ref(null)

const form = ref({ name: '', email: '' })
const formErrors = ref({ name: '', email: '' })

const inviteForm = ref({ email: '', name: '' })
const inviteFormErrors = ref({ email: '' })

const toast = ref({ show: false, message: '', type: 'success' })

const users = computed(() => userStore.users)
const pendingInvites = computed(() => userStore.pendingInvites)

const tabs = computed(() => [
  { id: 'members', label: 'Members', icon: 'mdi-account-multiple', count: users.value.length },
  { id: 'invites', label: 'Pending Invites', icon: 'mdi-email-outline', count: pendingInvites.value.length }
])

const filteredUsers = computed(() => {
  if (!search.value) return users.value
  const q = search.value.toLowerCase()
  return users.value.filter(u =>
    u.user_name?.toLowerCase().includes(q) ||
    u.user_email?.toLowerCase().includes(q)
  )
})

watch([users, pendingInvites], () => {
  emit('stats-update', {
    active: users.value.filter(u => u.token).length,
    inactive: users.value.filter(u => !u.token).length,
    pending: pendingInvites.value.length,
    total: users.value.length
  })
}, { immediate: true })

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

const openAddDialog = () => {
  editingUser.value = null
  form.value = { name: '', email: '' }
  formErrors.value = { name: '', email: '' }
  showAddDialogLocal.value = true
}

const openEditDialog = (user) => {
  editingUser.value = user
  form.value = { name: user.user_name, email: user.user_email }
  formErrors.value = { name: '', email: '' }
  showAddDialogLocal.value = true
}

const closeAddDialog = () => {
  showAddDialogLocal.value = false
  emit('close-add')
}

const openInviteDialog = () => {
  inviteForm.value = { email: '', name: '' }
  inviteFormErrors.value = { email: '' }
  showInviteDialogLocal.value = true
}

const closeInviteDialog = () => {
  showInviteDialogLocal.value = false
  emit('close-invite')
}

const openDeleteDialog = (user) => {
  deletingUser.value = user
  showDeleteDialog.value = true
}

const validateForm = () => {
  let valid = true
  if (!form.value.name.trim()) {
    formErrors.value.name = 'Name is required'
    valid = false
  }
  if (!form.value.email.trim()) {
    formErrors.value.email = 'Email is required'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    formErrors.value.email = 'Invalid email format'
    valid = false
  }
  return valid
}

const validateInviteForm = () => {
  let valid = true
  if (!inviteForm.value.email.trim()) {
    inviteFormErrors.value.email = 'Email is required'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteForm.value.email)) {
    inviteFormErrors.value.email = 'Invalid email format'
    valid = false
  }
  return valid
}

const saveUser = async () => {
  if (!validateForm()) return
  saving.value = true
  try {
    const userData = {
      user_name: form.value.name,
      user_email: form.value.email
    }
    let result
    if (editingUser.value) {
      result = await userStore.updateUser(editingUser.value.user_id, userData)
    } else {
      result = await userStore.addUser(userData)
    }
    if (result.success) {
      showToast(editingUser.value ? 'Member updated successfully' : 'Member added successfully')
      closeAddDialog()
    } else {
      showToast(result.error || 'Failed to save', 'error')
    }
  } catch (err) {
    showToast('An error occurred', 'error')
  } finally {
    saving.value = false
  }
}

const confirmDelete = async () => {
  if (!deletingUser.value) return
  deleting.value = true
  try {
    const result = await userStore.deleteUser(deletingUser.value.user_id)
    if (result.success) {
      showToast('Member removed successfully')
      showDeleteDialog.value = false
    } else {
      showToast(result.error || 'Failed to delete', 'error')
    }
  } catch (err) {
    showToast('An error occurred', 'error')
  } finally {
    deleting.value = false
  }
}

const sendInvite = async () => {
  if (!validateInviteForm()) return
  sendingInvite.value = true
  try {
    const result = await userStore.inviteUser(inviteForm.value.email, inviteForm.value.name)
    if (result.success) {
      showToast('Invitation sent successfully')
      closeInviteDialog()
      activeTab.value = 'invites'
    } else {
      showToast(result.error || 'Failed to send invite', 'error')
    }
  } catch (err) {
    showToast('An error occurred', 'error')
  } finally {
    sendingInvite.value = false
  }
}

const resendInvite = async (invite) => {
  const result = await userStore.resendInvite(invite.id)
  if (result.success) {
    showToast('Invitation resent')
  } else {
    showToast(result.error || 'Failed to resend', 'error')
  }
}

const cancelInviteAction = async (invite) => {
  const result = await userStore.cancelInvite(invite.id)
  if (result.success) {
    showToast('Invitation cancelled')
  } else {
    showToast(result.error || 'Failed to cancel', 'error')
  }
}

onMounted(async () => {
  loading.value = true
  await Promise.all([
    userStore.fetchUsers(),
    userStore.fetchPendingInvites()
  ])
  loading.value = false
})
</script>

<style scoped>
.users-management {
  position: relative;
}

.tabs-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.tabs-container {
  display: flex;
  background: rgb(var(--v-theme-grey-100));
  border-radius: 10px;
  padding: 4px;
  gap: 4px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--v-theme-grey-600));
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  color: rgb(var(--v-theme-grey-800));
}

.tab-btn.active {
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tab-badge {
  background: rgb(var(--v-theme-primary));
  color: white;
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.search-container {
  position: relative;
  width: 280px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: rgb(var(--v-theme-grey-400));
}

.search-input {
  width: 100%;
  height: 42px;
  padding: 0 40px 0 42px;
  border: 1px solid rgb(var(--v-theme-grey-200));
  border-radius: 10px;
  font-size: 0.875rem;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.search-input::placeholder {
  color: rgb(var(--v-theme-grey-400));
}

.clear-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: rgb(var(--v-theme-grey-200));
  border: none;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgb(var(--v-theme-grey-600));
}

.content-section {
  min-height: 300px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
  color: rgb(var(--v-theme-grey-500));
}

.loading-state span {
  margin-top: 16px;
  font-size: 0.9375rem;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgb(var(--v-theme-grey-100));
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.empty-state h3 {
  margin: 0 0 8px;
  font-size: 1.125rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.empty-state p {
  margin: 0;
  font-size: 0.9375rem;
}

.users-grid {
  display: grid;
  gap: 12px;
}

.user-card {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 16px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-grey-200));
  border-radius: 12px;
  padding: 16px 20px;
  transition: all 0.2s ease;
}

.user-card:hover {
  border-color: rgb(var(--v-theme-grey-300));
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.user-card.pending {
  opacity: 0.7;
}

.user-main {
  display: flex;
  align-items: center;
  gap: 14px;
}

.user-avatar {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgb(var(--v-theme-grey-200)) 0%, rgb(var(--v-theme-grey-100)) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(var(--v-theme-grey-600));
  flex-shrink: 0;
}

.user-avatar.active {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%);
  color: rgb(var(--v-theme-primary));
}

.status-dot {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgb(var(--v-theme-surface));
}

.status-dot.online {
  background: #10b981;
}

.status-dot.offline {
  background: #9ca3af;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.user-name {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  text-transform: capitalize;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 0.8125rem;
  color: rgb(var(--v-theme-grey-500));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 6px;
}

.status-badge.active {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.status-badge.inactive {
  background: rgb(var(--v-theme-grey-100));
  color: rgb(var(--v-theme-grey-600));
}

.user-actions {
  display: flex;
  gap: 6px;
}

.action-icon-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgb(var(--v-theme-grey-500));
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.action-icon-btn:hover {
  background: rgb(var(--v-theme-grey-100));
  color: rgb(var(--v-theme-grey-700));
}

.action-icon-btn.danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.invites-list {
  display: grid;
  gap: 12px;
}

.invite-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-grey-200));
  border-radius: 12px;
  padding: 16px 20px;
  transition: all 0.2s ease;
}

.invite-card:hover {
  border-color: rgb(var(--v-theme-grey-300));
}

.invite-card.pending {
  opacity: 0.7;
}

.invite-main {
  display: flex;
  align-items: center;
  gap: 14px;
}

.invite-avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d97706;
  flex-shrink: 0;
}

.invite-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.invite-email {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.invite-meta {
  font-size: 0.8125rem;
  color: rgb(var(--v-theme-grey-500));
}

.invite-actions {
  display: flex;
  gap: 8px;
}

.text-action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  background: rgb(var(--v-theme-grey-100));
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgb(var(--v-theme-grey-700));
  cursor: pointer;
  transition: all 0.15s ease;
}

.text-action-btn:hover {
  background: rgb(var(--v-theme-grey-200));
}

.text-action-btn.danger {
  color: #dc2626;
}

.text-action-btn.danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 9999;
  /* backdrop-filter: blur(2px); */
}

.modal-container {
  background: rgb(var(--v-theme-surface));
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.modal-container.small {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 24px 16px;
  border-bottom: 1px solid rgb(var(--v-theme-grey-100));
}

.modal-title-section {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.modal-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-icon.add {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.05) 100%);
  color: rgb(var(--v-theme-primary));
}

.modal-icon.invite {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%);
  color: #10b981;
}

.modal-icon.danger {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%);
  color: #ef4444;
}

.modal-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.modal-subtitle {
  margin: 4px 0 0;
  font-size: 0.875rem;
  color: rgb(var(--v-theme-grey-500));
}

.modal-close {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgb(var(--v-theme-grey-500));
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.modal-close:hover {
  background: rgb(var(--v-theme-grey-100));
  color: rgb(var(--v-theme-grey-700));
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
}

.form-label .optional {
  font-weight: 400;
  color: rgb(var(--v-theme-grey-500));
}

.form-input {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border: 1px solid rgb(var(--v-theme-grey-200));
  border-radius: 10px;
  font-size: 0.9375rem;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-input::placeholder {
  color: rgb(var(--v-theme-grey-400));
}

.form-input.error {
  border-color: #ef4444;
}

.form-input.error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-error {
  display: block;
  margin-top: 6px;
  font-size: 0.8125rem;
  color: #ef4444;
}

.info-box {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(99, 102, 241, 0.06);
  border-radius: 10px;
  margin-top: 20px;
}

.info-box span {
  font-size: 0.8125rem;
  color: rgb(var(--v-theme-grey-600));
  line-height: 1.5;
}

.delete-message {
  margin: 0;
  font-size: 0.9375rem;
  color: rgb(var(--v-theme-grey-600));
  line-height: 1.6;
}

.delete-message strong {
  color: rgb(var(--v-theme-on-surface));
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 24px;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 42px;
  padding: 0 20px;
  border: none;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.primary {
  background: rgb(var(--v-theme-primary));
  color: white;
}

.btn.primary:hover:not(:disabled) {
  background: rgb(var(--v-theme-primary-darken-1));
}

.btn.secondary {
  background: rgb(var(--v-theme-grey-100));
  color: rgb(var(--v-theme-grey-700));
}

.btn.secondary:hover:not(:disabled) {
  background: rgb(var(--v-theme-grey-200));
}

.btn.danger {
  background: #ef4444;
  color: white;
}

.btn.danger:hover:not(:disabled) {
  background: #dc2626;
}

.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 10000;
}

.toast.success {
  background: #10b981;
  color: white;
}

.toast.error {
  background: #ef4444;
  color: white;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95) translateY(10px);
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@media (max-width: 640px) {
  .tabs-section {
    flex-direction: column;
    align-items: stretch;
  }

  .search-container {
    width: 100%;
  }

  .user-card {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .user-meta {
    order: -1;
  }

  .user-actions {
    justify-content: flex-end;
  }

  .invite-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .invite-actions {
    width: 100%;
    margin-top: 8px;
  }
}
</style>
