<template>
  <v-navigation-drawer
    v-model="drawerOpen"
    :rail="rail"
    :permanent="!isMobile"
    :temporary="isMobile"
    class="modern-sidebar"
    width="260"
    rail-width="72"
  >
    <div class="sidebar-content">
      <div class="nav-section">
        <div v-if="!rail" class="section-label">Main</div>
        <v-list class="pa-2" nav density="compact">
          <template v-for="item in mainNavItems" :key="item.value">
            <v-list-item
              :value="item.value"
              :to="item.to"
              :active="isActive(item.to)"
              class="nav-item mb-1"
              rounded="lg"
              @click="item.action ? item.action() : null"
            >
              <template #prepend>
                <v-icon :icon="item.icon" size="22" />
              </template>
              <v-list-item-title class="nav-title">{{ item.title }}</v-list-item-title>
              <template v-if="item.badge" #append>
                <v-chip 
                  :color="item.badgeColor || 'primary'" 
                  size="x-small"
                  variant="flat"
                >
                  {{ item.badge }}
                </v-chip>
              </template>
              <v-tooltip v-if="rail" activator="parent" location="end">
                {{ item.title }}
              </v-tooltip>
            </v-list-item>
          </template>
        </v-list>
      </div>

      <v-divider class="my-2 mx-3" />

      <div class="nav-section">
        <div v-if="!rail" class="section-label">Actions</div>
        <v-list class="pa-2" nav density="compact">
          <v-list-item
            class="nav-item action-item mb-1"
            rounded="lg"
            @click="openUploadDialog"
          >
            <template #prepend>
              <v-icon icon="mdi-upload" size="22" />
            </template>
            <v-list-item-title class="nav-title">Upload Invoice</v-list-item-title>
            <v-tooltip v-if="rail" activator="parent" location="end">Upload Invoice</v-tooltip>
          </v-list-item>

          <v-list-item
            class="nav-item action-item mb-1"
            rounded="lg"
            @click="openChatBot"
          >
            <template #prepend>
              <v-icon icon="mdi-robot-outline" size="22" />
            </template>
            <v-list-item-title class="nav-title">AI Assistant</v-list-item-title>
            <template #append>
              <v-chip color="success" size="x-small" variant="tonal">Beta</v-chip>
            </template>
            <v-tooltip v-if="rail" activator="parent" location="end">AI Assistant</v-tooltip>
          </v-list-item>
        </v-list>
      </div>
    </div>

    <template #append>
      <div class="sidebar-footer pa-3">
        <v-btn
          v-if="!isMobile"
          :icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
          variant="text"
          size="small"
          class="rail-toggle"
          @click="$emit('toggle-rail')"
        >
          <v-tooltip activator="parent" location="end">
            {{ rail ? 'Expand' : 'Collapse' }}
          </v-tooltip>
        </v-btn>
      </div>
    </template>

    <invoice-upload-main
      :active="showUploadDialog"
      @close="showUploadDialog = false"
    />

    <v-dialog v-model="showChatBot" max-width="600" persistent>
      <ChatBot @close="showChatBot = false" />
    </v-dialog>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useLoginStore } from '@/stores/loginState.js'
import { invoices } from '@/stores/invoiceState.js'

const props = defineProps({
  modelValue: Boolean,
  rail: Boolean
})

const emit = defineEmits(['update:modelValue', 'toggle-rail'])

const route = useRoute()
const router = useRouter()
const display = useDisplay()
const loginState = useLoginStore()
const invoiceStore = invoices()

const showUploadDialog = ref(false)
const showChatBot = ref(false)

const isMobile = computed(() => display.smAndDown.value)

const drawerOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const warningsCount = computed(() => invoiceStore.warnings?.length || 0)

const mainNavItems = computed(() => [
  {
    title: 'Dashboard',
    icon: 'mdi-view-dashboard-outline',
    to: '/',
    value: 'dashboard'
  },
  {
    title: 'Invoices',
    icon: 'mdi-file-document-outline',
    to: '/table',
    value: 'table',
    badge: warningsCount.value > 0 ? warningsCount.value : null,
    badgeColor: 'warning'
  },
  {
    title: 'Projects',
    icon: 'mdi-folder-outline',
    to: '/projects',
    value: 'projects'
  },
  {
    title: 'Analytics',
    icon: 'mdi-chart-line',
    to: '/analytics',
    value: 'analytics'
  },
  {
    title: 'Team',
    icon: 'mdi-account-group-outline',
    to: '/users',
    value: 'users'
  }
])

const isActive = (path) => {
  if (!path) return false
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const openUploadDialog = () => {
  showUploadDialog.value = true
}

const openChatBot = () => {
  showChatBot.value = true
}
</script>

<style scoped>
.modern-sidebar {
  background: rgb(var(--v-theme-surface)) !important;
  border-right: 1px solid rgb(var(--v-theme-grey-200)) !important;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-top: 8px;
}

.section-label {
  padding: 8px 20px 4px;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgb(var(--v-theme-grey-500));
}

.nav-item {
  margin: 0 8px;
  transition: all var(--billio-transition-fast);
}

.nav-item:hover {
  background: rgb(var(--v-theme-grey-100)) !important;
}

.nav-item.v-list-item--active {
  background: rgba(var(--v-theme-primary), 0.1) !important;
  color: rgb(var(--v-theme-primary)) !important;
}

.nav-item.v-list-item--active .v-icon {
  color: rgb(var(--v-theme-primary)) !important;
}

.nav-title {
  font-size: 0.875rem;
  font-weight: 500;
}

.action-item {
  color: rgb(var(--v-theme-grey-700));
}

.action-item:hover {
  color: rgb(var(--v-theme-primary));
}

.sidebar-footer {
  border-top: 1px solid rgb(var(--v-theme-grey-200));
  display: flex;
  justify-content: center;
}

.rail-toggle {
  color: rgb(var(--v-theme-grey-500));
}

.rail-toggle:hover {
  color: rgb(var(--v-theme-primary));
  background: rgb(var(--v-theme-grey-100));
}
</style>
