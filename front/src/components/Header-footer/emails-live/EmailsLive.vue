<template>
  <div>
    <v-menu
      v-model="menu"
      :close-on-content-click="false"
      class="mr-1"
      offset-y
      location="bottom"
    >
      <template #activator="{ props }">
        <!-- Live Email Watch Icon -->
        <v-btn
          v-bind="props"
          :id="online ? 'liveBanner' : ''"
          variant="outlined"
          :prepend-icon="online ? 'mdi-access-point-network' : 'mdi-access-point-network-off'"
          class="mr-3"
          :color="online ? 'error' : 'grey-lighten-1'"
          rounded="xl"
          density="comfortable"
        >
          {{ online ? `Live` : 'No emails' }}
          <span
            class="ml-2"
            :class="{ 'live-dot': online }"
          />
        </v-btn>
      </template>

      <!-- Notifications Dropdown -->
      <v-card
        min-width="420"
        rounded="xl"
        class="elevation-6 live-email-panel"
      >
        <v-card-title class="font-weight-bold text-h6 px-4 pt-4 d-flex justify-space-between align-center">
          <span>📡 Active Email Streams</span>
          <v-btn
            icon="mdi-refresh"
            variant="text"
            @click="refreshEmails"
          />
        </v-card-title>

        <v-divider />

        <v-list class="py-2">
          <v-list-item
            v-for="email in activeEmailAddresses"
            :key="email"
            class="px-4 py-2 rounded-xl"
          >
            <!-- Left side: Icon + Email -->
            <template #prepend>
              <v-icon
                icon="mdi-email-outline"
                class="mr-2"
              />
            </template>

            <v-list-item-title class="font-weight-medium">
              {{ email }}
            </v-list-item-title>

            <!-- Right side: Live chip -->
            <template #append>
              <v-chip
                color="green"
                size="small"
                label
                class="ml-auto"
              >
                Live
              </v-chip>
            </template>
          </v-list-item>
        </v-list>


        <v-divider size="2" />

        <v-card-text class="text-caption text-grey-darken-1 px-4 pb-4">
          Monitoring {{ activeEmailAddresses.length }} streams in real time.
        </v-card-text>
      </v-card>
    </v-menu>

    <!-- Invoice Popup -->
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { invoices } from "@/stores/invoiceState";
const invoiceArray = invoices()
const activeEmailAddresses = computed(() => {
  const emails = invoiceArray.activeEmails.activeEmails || []
  return [...new Set(emails.map(ks => ks.email_address))]
})

import { useTheme } from "vuetify"

const theme = useTheme()
const themeColor = computed(() =>
  theme.global.name.value === "dark" ? "bg-grey-darken-3" : "bg-grey-lighten-4"
)

const menu = ref(false)
//CHECK IF ONLInE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
const online = computed(() => activeEmailAddresses.value.length)
</script>

<style scoped>
#logo {
  z-index: 1;
}

#logo-text {
  z-index: 2;
}

.live-dot {
  height: 10px;
  width: 10px;
  background-color: red;
  border-radius: 50%;
  display: inline-block;
  animation: pulse 1.5s infinite;
  z-index: 1;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.5);
    opacity: 0.5;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>