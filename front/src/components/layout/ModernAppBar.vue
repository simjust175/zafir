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
        <v-icon>mdi-view-sidebar-right</v-icon>
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
  </v-app-bar>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTheme } from 'vuetify'
import { useRouter } from 'vue-router'
import { useLoginStore } from '@/stores/loginState.js'

defineEmits(['toggle-sidebar', 'toggle-right-panel'])

const theme = useTheme()
const router = useRouter()
const loginState = useLoginStore()

const confirmLogout = ref(false)
const loggingOut = ref(false)

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

const openSettings = () => {
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
</style>
