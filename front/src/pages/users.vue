<template>
  <div class="users-page">
    <header class="page-header">
      <div class="header-content">
        <div class="header-text">
          <div class="breadcrumb">
            <span class="breadcrumb-item">Settings</span>
            <v-icon
              size="14"
              color="grey-400"
            >
              mdi-chevron-right
            </v-icon>
            <span class="breadcrumb-item active">Team</span>
          </div>
          <h1 class="page-title">
            Team Members
          </h1>
          <p class="page-subtitle">
            Manage your team, invite new members, and control permissions
          </p>
        </div>
        <div class="header-actions">
          <v-btn
            variant="outlined"
            rounded="lg"
            class="action-btn secondary"
            prepend-icon="mdi-email-outline"
            @click="showInviteDialog = true"
          >
            Invite
          </v-btn>
          <v-btn
            color="primary"
            rounded="lg"
            class="action-btn primary"
            prepend-icon="mdi-plus"
            @click="showAddDialog = true"
          >
            Add Member
          </v-btn>
        </div>
      </div>
    </header>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon active">
          <v-icon size="20">
            mdi-account-check
          </v-icon>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ activeCount }}</span>
          <span class="stat-label">Active</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon inactive">
          <v-icon size="20">
            mdi-account-off
          </v-icon>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ inactiveCount }}</span>
          <span class="stat-label">Inactive</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon pending">
          <v-icon size="20">
            mdi-email-fast
          </v-icon>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ pendingCount }}</span>
          <span class="stat-label">Pending</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon total">
          <v-icon size="20">
            mdi-account-group
          </v-icon>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ totalCount }}</span>
          <span class="stat-label">Total</span>
        </div>
      </div>
    </div>

    <manage-users
      :show-add-dialog="showAddDialog"
      :show-invite-dialog="showInviteDialog"
      @close-add="showAddDialog = false"
      @close-invite="showInviteDialog = false"
      @stats-update="updateStats"
    />
  </div>
</template>

<script setup>
import ManageUsers from '@/components/Users/ManageUsers.vue'
import { ref } from 'vue'

const showAddDialog = ref(false)
const showInviteDialog = ref(false)

const activeCount = ref(0)
const inactiveCount = ref(0)
const pendingCount = ref(0)
const totalCount = ref(0)

const updateStats = (stats) => {
  activeCount.value = stats.active || 0
  inactiveCount.value = stats.inactive || 0
  pendingCount.value = stats.pending || 0
  totalCount.value = stats.total || 0
}
</script>

<style scoped>
.users-page {
  max-width: 1280px;
  margin: 0 auto;
  min-height: 100%;
  padding: 0 24px 48px;
}

.page-header {
  padding: 32px 0 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 20px;
}

.header-text {
  flex: 1;
  min-width: 280px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.breadcrumb-item {
  font-size: 0.8125rem;
  color: rgb(var(--v-theme-grey-500));
  font-weight: 500;
}

.breadcrumb-item.active {
  color: rgb(var(--v-theme-primary));
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 6px;
  letter-spacing: -0.025em;
}

.page-subtitle {
  font-size: 0.9375rem;
  color: rgb(var(--v-theme-grey-500));
  margin: 0;
  line-height: 1.5;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.action-btn {
  font-weight: 600;
  letter-spacing: 0;
  text-transform: none;
  padding: 0 20px;
  height: 42px;
}

.action-btn.secondary {
  border-color: rgb(var(--v-theme-grey-300));
  color: rgb(var(--v-theme-grey-700));
}

.action-btn.secondary:hover {
  background: rgb(var(--v-theme-grey-50));
  border-color: rgb(var(--v-theme-grey-400));
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 900px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 500px) {
  .stats-row {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-grey-200));
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: rgb(var(--v-theme-grey-300));
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon.active {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%);
  color: #10b981;
}

.stat-icon.inactive {
  background: linear-gradient(135deg, rgba(156, 163, 175, 0.15) 0%, rgba(156, 163, 175, 0.05) 100%);
  color: #6b7280;
}

.stat-icon.pending {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%);
  color: #f59e0b;
}

.stat-icon.total {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%);
  color: #6366f1;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1;
}

.stat-label {
  font-size: 0.8125rem;
  color: rgb(var(--v-theme-grey-500));
  font-weight: 500;
}
</style>
