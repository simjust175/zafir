<template>
  <v-app-bar
    :elevation="0"
    class="modern-appbar"
    height="64"
  >
    <template #prepend>
      <v-btn
        icon
        variant="text"
        size="small"
        class="ml-2"
        @click="$emit('toggle-sidebar')"
      >
        <v-icon>mdi-menu</v-icon>
      </v-btn>
    </template>

    <div
      class="logo-section"
      @click="navigateHome"
    >
      <img
        src="/logo.png"
        alt="Billio"
        class="logo-image"
        height="72"
      >
    </div>

    <v-spacer />

    <div class="appbar-actions">
      <div
        v-if="loginState.token"
        class="live-indicator mr-4"
      >
        <span class="pulse-dot bg-success" />
        <span class="live-text">Live</span>
      </div>

      <v-btn
        v-if="loginState.token"
        icon
        variant="text"
        size="small"
        class="action-btn"
        @click="$emit('toggle-right-panel')"
      >
        <v-icon>mdi-widgets-outline</v-icon>
        <v-tooltip
          activator="parent"
          location="bottom"
        >
          Toggle Panel
        </v-tooltip>
      </v-btn>

      <notification-menu v-if="loginState.token" />

      <v-btn
        icon
        variant="text"
        size="small"
        class="action-btn"
        @click="toggleTheme"
      >
        <v-icon>{{ themeIcon }}</v-icon>
        <v-tooltip
          activator="parent"
          location="bottom"
        >
          {{ isDark ? 'Light Mode' : 'Dark Mode' }}
        </v-tooltip>
      </v-btn>

      <v-menu
        v-if="loginState.token"
        offset-y
      >
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            class="user-menu-btn ml-2"
            variant="text"
            rounded="pill"
          >
            <v-avatar
              size="32"
              color="primary"
              class="mr-2"
            >
              <span class="text-white text-caption font-weight-bold">
                {{ userInitials }}
              </span>
            </v-avatar>
            <span class="user-name d-none d-sm-inline">{{ userName }}</span>
            <v-icon
              size="18"
              class="ml-1"
            >
              mdi-chevron-down
            </v-icon>
          </v-btn>
        </template>
        <v-list
          class="pa-2"
          min-width="200"
        >
          <v-list-item class="rounded-lg mb-1">
            <template #prepend>
              <v-avatar
                size="40"
                color="primary"
              >
                <span class="text-white">{{ userInitials }}</span>
              </v-avatar>
            </template>
            <v-list-item-title class="font-weight-medium">
              {{ userName }}
            </v-list-item-title>
            <v-list-item-subtitle>{{ userEmail }}</v-list-item-subtitle>
          </v-list-item>
          <v-divider class="my-2" />
          <v-list-item
            class="rounded-lg"
            prepend-icon="mdi-cog-outline"
            @click="openSettings"
          >
            <v-list-item-title>Settings</v-list-item-title>
          </v-list-item>
          <v-list-item
            class="rounded-lg text-error"
            prepend-icon="mdi-logout"
            @click="confirmLogout = true"
          >
            <v-list-item-title>Log out</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-btn
        v-else
        color="primary"
        variant="flat"
        class="ml-4"
        @click="$router.push('/register')"
      >
        Sign In
      </v-btn>
    </div>

    <v-dialog
      v-model="confirmLogout"
      max-width="400"
    >
      <v-card class="pa-4">
        <v-card-title class="text-h6 pb-2">
          <v-icon
            color="warning"
            class="mr-2"
          >
            mdi-logout
          </v-icon>
          Confirm Logout
        </v-card-title>
        <v-card-text class="text-body-2 text-medium-emphasis">
          Are you sure you want to log out of your account?
        </v-card-text>
        <v-card-actions class="pt-4">
          <v-spacer />
          <v-btn
            variant="text"
            @click="confirmLogout = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            :loading="loggingOut"
            @click="logout"
          >
            Log out
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <Teleport to="body">
      <transition name="settings-backdrop">
        <div
          v-if="showSettings"
          class="settings-backdrop"
          @click="closeSettings"
        />
      </transition>

      <transition name="settings-panel">
        <div
          v-if="showSettings"
          class="settings-panel"
          @keydown.esc="closeSettings"
        >
          <div class="settings-header">
            <div class="settings-header-content">
              <h2 class="settings-title">Settings</h2>
              <p class="settings-subtitle">Manage your account preferences</p>
            </div>
            <button class="settings-close" @click="closeSettings">
              <v-icon size="20">mdi-close</v-icon>
            </button>
          </div>

          <div class="settings-nav">
            <button
              v-for="tab in settingsTabs"
              :key="tab.id"
              class="settings-nav-item"
              :class="{ active: activeSettingsTab === tab.id }"
              @click="activeSettingsTab = tab.id"
            >
              <v-icon size="18">{{ tab.icon }}</v-icon>
              <span>{{ tab.label }}</span>
            </button>
          </div>

          <div class="settings-content">
            <transition name="settings-tab" mode="out-in">
              <div v-if="activeSettingsTab === 'profile'" key="profile" class="settings-section">
                <div class="section-header">
                  <h3 class="section-title">Profile Information</h3>
                  <p class="section-description">Your personal details and account information</p>
                </div>

                <div class="profile-card">
                  <div class="profile-avatar">
                    <v-avatar size="72" color="primary">
                      <span class="text-h5 text-white font-weight-bold">{{ userInitials }}</span>
                    </v-avatar>
                  </div>
                  <div class="profile-info">
                    <div class="info-row">
                      <span class="info-label">Full Name</span>
                      <span class="info-value">{{ userName }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Email Address</span>
                      <span class="info-value">{{ userEmail }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Account Status</span>
                      <span class="status-badge active">
                        <span class="status-dot" />
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else-if="activeSettingsTab === 'preferences'" key="preferences" class="settings-section">
                <div class="section-header">
                  <h3 class="section-title">Preferences</h3>
                  <p class="section-description">Customize your experience</p>
                </div>

                <div class="preference-group">
                  <div class="preference-item">
                    <div class="preference-content">
                      <div class="preference-icon">
                        <v-icon size="20">{{ isDark ? 'mdi-weather-night' : 'mdi-white-balance-sunny' }}</v-icon>
                      </div>
                      <div class="preference-text">
                        <span class="preference-label">Appearance</span>
                        <span class="preference-description">Choose your preferred theme</span>
                      </div>
                    </div>
                    <div class="theme-toggle">
                      <button
                        class="theme-option"
                        :class="{ active: !isDark }"
                        @click="setTheme('light')"
                      >
                        <v-icon size="16">mdi-white-balance-sunny</v-icon>
                        Light
                      </button>
                      <button
                        class="theme-option"
                        :class="{ active: isDark }"
                        @click="setTheme('dark')"
                      >
                        <v-icon size="16">mdi-weather-night</v-icon>
                        Dark
                      </button>
                    </div>
                  </div>

                  <div class="preference-item">
                    <div class="preference-content">
                      <div class="preference-icon">
                        <v-icon size="20">mdi-bell-outline</v-icon>
                      </div>
                      <div class="preference-text">
                        <span class="preference-label">Notifications</span>
                        <span class="preference-description">Get notified about important updates</span>
                      </div>
                    </div>
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="notificationsEnabled" />
                      <span class="toggle-slider" />
                    </label>
                  </div>

                  <div class="preference-item">
                    <div class="preference-content">
                      <div class="preference-icon">
                        <v-icon size="20">mdi-email-outline</v-icon>
                      </div>
                      <div class="preference-text">
                        <span class="preference-label">Email Digests</span>
                        <span class="preference-description">Receive weekly summary emails</span>
                      </div>
                    </div>
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="emailDigestEnabled" />
                      <span class="toggle-slider" />
                    </label>
                  </div>
                </div>
              </div>

              <div v-else-if="activeSettingsTab === 'security'" key="security" class="settings-section">
                <div class="section-header">
                  <h3 class="section-title">Security</h3>
                  <p class="section-description">Manage your account security</p>
                </div>

                <div class="security-group">
                  <div class="security-item">
                    <div class="security-content">
                      <div class="security-icon">
                        <v-icon size="20">mdi-lock-outline</v-icon>
                      </div>
                      <div class="security-text">
                        <span class="security-label">Password</span>
                        <span class="security-description">Last changed 30 days ago</span>
                      </div>
                    </div>
                    <button class="security-action" @click="showPasswordDialog = true">
                      Change
                    </button>
                  </div>

                  <div class="security-item">
                    <div class="security-content">
                      <div class="security-icon">
                        <v-icon size="20">mdi-devices</v-icon>
                      </div>
                      <div class="security-text">
                        <span class="security-label">Active Sessions</span>
                        <span class="security-description">1 device currently logged in</span>
                      </div>
                    </div>
                    <button class="security-action secondary">
                      View All
                    </button>
                  </div>

                  <div class="security-item danger">
                    <div class="security-content">
                      <div class="security-icon danger">
                        <v-icon size="20">mdi-logout</v-icon>
                      </div>
                      <div class="security-text">
                        <span class="security-label">Sign Out</span>
                        <span class="security-description">Log out of your account</span>
                      </div>
                    </div>
                    <button class="security-action danger" @click="closeSettings(); confirmLogout = true">
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </transition>
          </div>

          <div class="settings-footer">
            <span class="footer-version">Billio v2.0</span>
          </div>
        </div>
      </transition>
    </Teleport>

    <v-dialog v-model="showPasswordDialog" max-width="420">
      <div class="password-dialog">
        <div class="dialog-header">
          <div class="dialog-icon">
            <v-icon size="24" color="primary">mdi-lock-outline</v-icon>
          </div>
          <h3 class="dialog-title">Change Password</h3>
          <p class="dialog-description">Enter your current password and choose a new one</p>
        </div>

        <form class="dialog-form" @submit.prevent="handleChangePassword">
          <div class="form-field">
            <label class="field-label">Current Password</label>
            <div class="input-wrapper">
              <input
                v-model="passwordForm.current"
                :type="showCurrentPwd ? 'text' : 'password'"
                class="field-input"
                placeholder="Enter current password"
              />
              <button type="button" class="input-toggle" @click="showCurrentPwd = !showCurrentPwd">
                <v-icon size="18">{{ showCurrentPwd ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
              </button>
            </div>
          </div>

          <div class="form-field">
            <label class="field-label">New Password</label>
            <div class="input-wrapper">
              <input
                v-model="passwordForm.newPassword"
                :type="showNewPwd ? 'text' : 'password'"
                class="field-input"
                placeholder="Enter new password"
              />
              <button type="button" class="input-toggle" @click="showNewPwd = !showNewPwd">
                <v-icon size="18">{{ showNewPwd ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
              </button>
            </div>
          </div>

          <div class="form-field">
            <label class="field-label">Confirm New Password</label>
            <input
              v-model="passwordForm.confirm"
              type="password"
              class="field-input"
              placeholder="Confirm new password"
            />
          </div>

          <div class="dialog-actions">
            <button type="button" class="btn-cancel" @click="showPasswordDialog = false">
              Cancel
            </button>
            <button type="submit" class="btn-primary" :disabled="changingPassword">
              <v-progress-circular v-if="changingPassword" indeterminate size="18" width="2" color="white" />
              <span v-else>Update Password</span>
            </button>
          </div>
        </form>
      </div>
    </v-dialog>
  </v-app-bar>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useTheme } from 'vuetify'
import { useRouter } from 'vue-router'
import { useLoginStore } from '@/stores/loginState.js'

defineEmits(['toggle-sidebar', 'toggle-right-panel'])

const theme = useTheme()
const router = useRouter()
const loginState = useLoginStore()

const confirmLogout = ref(false)
const loggingOut = ref(false)
const showSettings = ref(false)
const activeSettingsTab = ref('profile')
const notificationsEnabled = ref(true)
const emailDigestEnabled = ref(false)
const showPasswordDialog = ref(false)
const changingPassword = ref(false)
const showCurrentPwd = ref(false)
const showNewPwd = ref(false)
const passwordForm = ref({
  current: '',
  newPassword: '',
  confirm: ''
})

const settingsTabs = [
  { id: 'profile', label: 'Profile', icon: 'mdi-account-outline' },
  { id: 'preferences', label: 'Preferences', icon: 'mdi-tune-variant' },
  { id: 'security', label: 'Security', icon: 'mdi-shield-check-outline' }
]

const isDark = computed(() => theme.global.current.value.dark)
const themeIcon = computed(() => isDark.value ? 'mdi-weather-night' : 'mdi-white-balance-sunny')

const userName = computed(() => {
  const info = loginState.userInfo
  if (info?.name) return info.name
  if (info?.email) return info.email.split('@')[0]
  return 'User'
})

const userEmail = computed(() => loginState.userInfo?.email || '')

const userInitials = computed(() => {
  const name = userName.value
  if (!name) return 'U'
  const parts = name.split(' ')
  if (parts.length > 1) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
})

const navigateHome = () => {
  if (loginState.token) {
    router.push('/')
  } else {
    router.push('/register')
  }
}

const toggleTheme = () => {
  theme.global.name.value = isDark.value ? 'light' : 'dark'
  loginState.theme = theme.global.name.value
}

const setTheme = (themeName) => {
  theme.global.name.value = themeName
  loginState.theme = themeName
}

const openSettings = () => {
  showSettings.value = true
  activeSettingsTab.value = 'profile'
  document.body.style.overflow = 'hidden'
}

const closeSettings = () => {
  showSettings.value = false
  document.body.style.overflow = ''
}

const handleEscKey = (e) => {
  if (e.key === 'Escape') {
    if (showPasswordDialog.value) {
      showPasswordDialog.value = false
    } else if (showSettings.value) {
      closeSettings()
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscKey)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscKey)
})

const handleChangePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirm) {
    return
  }
  changingPassword.value = true
  setTimeout(() => {
    changingPassword.value = false
    showPasswordDialog.value = false
    passwordForm.value = { current: '', newPassword: '', confirm: '' }
  }, 1500)
}

const logout = async () => {
  loggingOut.value = true
  try {
    const email = loginState.userInfo?.email
    if (!email) {
      loginState.logout()
      router.push('/register')
      return
    }

    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/register/logout/${email}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    const data = await res.json()
    
    if (data.Success) {
      loginState.logout()
      router.push('/register')
    }
  } catch (err) {
    console.error('Logout failed:', err)
    loginState.logout()
    router.push('/register')
  } finally {
    loggingOut.value = false
    confirmLogout.value = false
  }
}
</script>

<style scoped>
.modern-appbar {
  background: rgb(var(--v-theme-surface)) !important;
  border-bottom: 1px solid rgb(var(--v-theme-grey-200)) !important;
}

.logo-section {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background var(--billio-transition-fast);
}

.logo-section:hover {
  background: rgb(var(--v-theme-grey-100));
}

.logo-image {
  object-fit: contain;
}

.appbar-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-right: 16px;
}

.action-btn {
  color: rgb(var(--v-theme-grey-600));
}

.action-btn:hover {
  color: rgb(var(--v-theme-primary));
  background: rgb(var(--v-theme-grey-100));
}

.live-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(var(--v-theme-success), 0.1);
  border-radius: 20px;
}

.live-text {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgb(var(--v-theme-success));
}

.user-menu-btn {
  text-transform: none;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
}

.settings-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 2000;
}

.settings-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 420px;
  max-width: 100vw;
  background: rgb(var(--v-theme-surface));
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.12);
  z-index: 2001;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.settings-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 28px 28px 0;
}

.settings-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 4px;
  letter-spacing: -0.02em;
}

.settings-subtitle {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-grey-500));
  margin: 0;
}

.settings-close {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: rgb(var(--v-theme-grey-100));
  border-radius: 10px;
  cursor: pointer;
  color: rgb(var(--v-theme-grey-600));
  transition: all 0.2s ease;
}

.settings-close:hover {
  background: rgb(var(--v-theme-grey-200));
  color: rgb(var(--v-theme-on-surface));
}

.settings-nav {
  display: flex;
  gap: 4px;
  padding: 24px 28px 0;
  border-bottom: 1px solid rgb(var(--v-theme-grey-100));
}

.settings-nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  background: transparent;
  border-radius: 8px 8px 0 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--v-theme-grey-500));
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.settings-nav-item:hover {
  color: rgb(var(--v-theme-grey-700));
  background: rgb(var(--v-theme-grey-50));
}

.settings-nav-item.active {
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
}

.settings-nav-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: rgb(var(--v-theme-primary));
  border-radius: 2px 2px 0 0;
}

.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
}

.settings-section {
  animation: fadeIn 0.2s ease;
}

.section-header {
  margin-bottom: 24px;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 4px;
}

.section-description {
  font-size: 0.8125rem;
  color: rgb(var(--v-theme-grey-500));
  margin: 0;
}

.profile-card {
  background: rgb(var(--v-theme-grey-50));
  border-radius: 16px;
  padding: 24px;
}

.profile-avatar {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgb(var(--v-theme-grey-500));
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.info-value {
  font-size: 0.9375rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8125rem;
  font-weight: 500;
  width: fit-content;
}

.status-badge.active {
  background: rgba(var(--v-theme-success), 0.12);
  color: rgb(var(--v-theme-success));
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.preference-group,
.security-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preference-item,
.security-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: rgb(var(--v-theme-grey-50));
  border-radius: 12px;
  transition: background 0.2s ease;
}

.preference-item:hover,
.security-item:hover {
  background: rgb(var(--v-theme-grey-100));
}

.preference-content,
.security-content {
  display: flex;
  align-items: center;
  gap: 14px;
}

.preference-icon,
.security-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(var(--v-theme-surface));
  border-radius: 10px;
  color: rgb(var(--v-theme-grey-600));
}

.security-icon.danger {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.preference-text,
.security-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.preference-label,
.security-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
}

.preference-description,
.security-description {
  font-size: 0.8125rem;
  color: rgb(var(--v-theme-grey-500));
}

.theme-toggle {
  display: flex;
  background: rgb(var(--v-theme-grey-200));
  border-radius: 8px;
  padding: 3px;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgb(var(--v-theme-grey-600));
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-option.active {
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
  cursor: pointer;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  inset: 0;
  background: rgb(var(--v-theme-grey-300));
  border-radius: 24px;
  transition: all 0.25s ease;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  left: 3px;
  top: 3px;
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  transition: all 0.25s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.toggle-switch input:checked + .toggle-slider {
  background: rgb(var(--v-theme-primary));
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(20px);
}

.security-action {
  padding: 8px 16px;
  border: none;
  background: rgb(var(--v-theme-primary));
  color: white;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.security-action:hover {
  opacity: 0.9;
}

.security-action.secondary {
  background: rgb(var(--v-theme-grey-200));
  color: rgb(var(--v-theme-grey-700));
}

.security-action.danger {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.security-action.danger:hover {
  background: rgba(239, 68, 68, 0.15);
}

.security-item.danger {
  margin-top: 12px;
  border: 1px solid rgba(239, 68, 68, 0.15);
}

.settings-footer {
  padding: 16px 28px;
  border-top: 1px solid rgb(var(--v-theme-grey-100));
  text-align: center;
}

.footer-version {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-grey-400));
}

.settings-backdrop-enter-active,
.settings-backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.settings-backdrop-enter-from,
.settings-backdrop-leave-to {
  opacity: 0;
}

.settings-panel-enter-active,
.settings-panel-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.settings-panel-enter-from,
.settings-panel-leave-to {
  transform: translateX(100%);
}

.settings-tab-enter-active,
.settings-tab-leave-active {
  transition: all 0.2s ease;
}

.settings-tab-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.settings-tab-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.password-dialog {
  background: rgb(var(--v-theme-surface));
  border-radius: 20px;
  overflow: hidden;
}

.dialog-header {
  padding: 32px 32px 24px;
  text-align: center;
}

.dialog-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--v-theme-primary), 0.1);
  border-radius: 14px;
}

.dialog-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 6px;
}

.dialog-description {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-grey-500));
  margin: 0;
}

.dialog-form {
  padding: 0 32px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
}

.input-wrapper {
  position: relative;
}

.field-input {
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

.field-input:focus {
  outline: none;
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.1);
}

.input-wrapper .field-input {
  padding-right: 44px;
}

.input-toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgb(var(--v-theme-grey-500));
  cursor: pointer;
  padding: 4px;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn-cancel,
.btn-primary {
  flex: 1;
  height: 44px;
  border: none;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-cancel {
  background: rgb(var(--v-theme-grey-100));
  color: rgb(var(--v-theme-grey-700));
}

.btn-cancel:hover {
  background: rgb(var(--v-theme-grey-200));
}

.btn-primary {
  background: rgb(var(--v-theme-primary));
  color: white;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .settings-panel {
    width: 100vw;
  }
}
</style>
