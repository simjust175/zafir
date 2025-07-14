<template>
  <div>
    <v-menu
      v-model="menu"
      :close-on-content-click="false"
      class="mr-1"
      offset-y
      location="bottom"
    >
      <!-- Bell Icon -->
      <template #activator="{ props }">
        <v-btn
          icon
          v-bind="props"
        >
          <v-badge
            v-if="messages.length > 0"
            :content="messages.length"
            color="red"
            overlap
          >
            <v-icon icon="mdi-bell-outline" />
          </v-badge>
          <v-icon
            v-else
            icon="mdi-bell-outline"
          />
        </v-btn>
      </template>
  
      <!-- Notifications Dropdown -->
      <v-card
        min-width="380"
        class="elevation-5 rounded-lg"
      >
        <v-card-title class="bg-grey-lighten-4 font-weight-bold py-1 text-h6 text-grey-darken-3">
          <!-- <v-icon
            icon="mdi-bell"
            size="20"
            class="mr-2"
          /> -->
          Notifications
        </v-card-title>
        <v-divider />
  
        <v-list
          dense
          nav
        >
          <v-list-item
            v-if="messages.length === 0"
            class="text-center py-5 pb-8"
          >
            <v-list-item-content>
              <v-icon
                size="80"
                color="grey-lighten-3"
              >
                mdi-alert-remove
              </v-icon>
              <div class="text-h5 text-grey-darken-1 mt-3 mb-3">
                Hurray! No issues
              </div>
            </v-list-item-content>
          </v-list-item>
  
          <template v-else>
            <v-list-item
              v-for="(message, index) in messages"
              :key="index"
              class="notification-item d-flex"
              @click="openDialog(message)"
            >
              <v-list-item-icon>
                <v-icon
                  icon="mdi-alert"
                  color="amber-darken-2"
                />
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="font-weight-medium">
                  {{ message.title || 'Invoice Alert' }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-truncate">
                  {{ message.body }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-divider
              v-if="index < messages.length - 1"
              :key="'divider' + index"
              class="mx-2"
            />
          </template>
        </v-list>
      </v-card>
    </v-menu>
  
    <!-- Invoice Popup Component -->
    <issue-prompt
      v-model="dialog"
      :message="selectedMessage"
    />
  </div>
</template>
  
  <script setup>
  import { ref } from 'vue'
 
  defineProps({
    messages: {
      type: Array,
      default: () => [],
    },
  })
  
  const menu = ref(false)
  const dialog = ref(false)
  const selectedMessage = ref(null)
  
  function openDialog(message) {
    selectedMessage.value = message
    dialog.value = true
  }
  </script>
  
  <style scoped>
  .notification-item {
    transition: background-color 0.2s ease;
    cursor: pointer;
    padding: 12px;
    border-radius: 6px;
  }
  .notification-item:hover {
    background-color: #f5f5f5;
  }
  .text-truncate {
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  </style>