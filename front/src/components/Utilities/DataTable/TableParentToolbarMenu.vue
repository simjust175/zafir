<template>
  <div class="toolbar-menu">
    <v-menu>
      <template #activator="{ props }">
        <button v-bind="props" class="menu-btn" title="More options">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="12" cy="5" r="1"></circle>
            <circle cx="12" cy="19" r="1"></circle>
          </svg>
        </button>
      </template>
      <div class="menu-dropdown">
        <button class="menu-item" @click="$router.push('/projects')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          <span>Manage Project</span>
        </button>
        <button class="menu-item" @click="dialogTrigger = !dialogTrigger">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span>Mark Complete</span>
        </button>
        <div class="menu-divider"></div>
        <button class="menu-item" @click="$router.push('/analytics')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          <span>View Analytics</span>
        </button>
      </div>
    </v-menu>
    
    <complete-project-dialog
      :project="project"
      :trigger="dialogTrigger"
      @close="dialogTrigger = false"
    />
  </div>
</template>

<script setup>
import CompleteProjectDialog from "@/components/Projects/CompleteProjectDialog.vue";
import { ref } from "vue"

defineProps({
  project: Object
})

const dialogTrigger = ref(false);
</script>

<style scoped>
.toolbar-menu {
  display: inline-flex;
}

.menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid #eaeaea;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  color: #666;
  transition: all 0.15s ease;
}

.menu-btn:hover {
  background: #fafafa;
  border-color: #d4d4d4;
  color: #171717;
}

.menu-dropdown {
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 10px;
  padding: 6px;
  min-width: 200px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 450;
  color: #171717;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.menu-item:hover {
  background: #fafafa;
}

.menu-item svg {
  color: #666;
}

.menu-divider {
  height: 1px;
  background: #eaeaea;
  margin: 6px 0;
}
</style>
