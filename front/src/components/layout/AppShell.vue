<template>
  <v-layout class="app-shell fill-height">
    <ModernAppBar 
      @toggle-sidebar="toggleSidebar"
      @toggle-right-panel="toggleRightPanel"
    />
    
    <ModernSidebar
      v-model="sidebarOpen"
      :rail="sidebarRail"
      @toggle-rail="toggleSidebarRail"
    />

    <v-main class="app-main fill-height">
      <div class="app-content d-flex">
        <div class="main-content flex-grow-1" :class="{ 'with-right-panel': showRightPanel }">
          <slot />
        </div>
        
        <transition name="slide-right">
          <aside v-if="showRightPanel" class="right-panel">
            <RightPanel @close="showRightPanel = false" />
          </aside>
        </transition>
      </div>
    </v-main>
  </v-layout>
</template>

<script setup>
import { ref, provide, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import ModernAppBar from './ModernAppBar.vue'
import ModernSidebar from './ModernSidebar.vue'
import RightPanel from './RightPanel.vue'

const display = useDisplay()

const sidebarOpen = ref(true)
const sidebarRail = ref(false)
const showRightPanel = ref(false)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const toggleSidebarRail = () => {
  sidebarRail.value = !sidebarRail.value
}

const toggleRightPanel = () => {
  showRightPanel.value = !showRightPanel.value
}

provide('toggleRightPanel', toggleRightPanel)
provide('showRightPanel', showRightPanel)

onMounted(() => {
  if (display.smAndDown.value) {
    sidebarRail.value = true
  }
})
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  height: 100vh;
  background: rgb(var(--v-theme-background));
}

.app-main {
  background: rgb(var(--v-theme-background));
  display: flex;
  flex-direction: column;
}

.app-content {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.main-content {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px 32px;
  transition: margin-right var(--billio-transition-normal);
}

.main-content.with-right-panel {
  margin-right: 0;
}

.right-panel {
  width: 320px;
  min-width: 320px;
  flex-shrink: 0;
  border-left: 1px solid rgb(var(--v-theme-grey-200));
  background: rgb(var(--v-theme-surface));
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

@media (max-width: 960px) {
  .right-panel {
    position: fixed;
    right: 0;
    top: 64px;
    height: calc(100vh - 64px);
    z-index: 100;
    box-shadow: var(--billio-shadow-xl);
  }
}
</style>
