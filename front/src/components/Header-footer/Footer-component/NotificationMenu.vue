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
            :content="messages.length < 10 ? messages.length : '9+'"
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
        rounded="xl"
        class="elevation-5 rounded-lg"
      >
        <v-card-title
          class="font-weight-bold py-1 text-h6"
          :class="themeColor"
        />
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
              <div class="text-h5 mt-3 mb-3">
                Hurray! No issues
              </div>
            </v-list-item-content>
          </v-list-item>

          <template v-else>
            <v-list-item
              v-for="(message, index) in messages"
              :key="index"
              class="notification-item d-flex "
              @click="openDialog(message)"
            >
              <v-hover v-slot="{ isHovering, props }">
                <v-list-item-content
                  class="d-flex ga-4 align-center"
                  v-bind="props"
                >
                  <div class="icon">
                    <v-card
                      variant="tonal"
                      rounded="md"
                      class="pa-2 d-flex align-center justify-center"
                      :color="isHovering ? 'white' : 'default'"
                    >
                      <v-icon
                        icon="mdi-alert-circle"
                        :color="isHovering ? 'warning' : 'default'"
                      />
                    </v-card>
                  </div>
                  <div class="text">
                    <v-list-item-title class="font-weight-medium text-capitalize">
                      {{ message.title || 'Invoice Alert' }}
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-truncate">
                      A problem arose
                    </v-list-item-subtitle>
                  </div>
                </v-list-item-content>
              </v-hover>
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
    <!-- <issue-prompt
      v-model="dialog"
      :message="selectedMessage"
    /> -->
    <pdf-viewer
      :dialog="dialog"
      :url="selectedUrl"
      mode="conflict"
      :conflict-type="alertTitle"
      :duplicate-file-url="duplicateFile"
      :double-check="false"
      :file-details="selectedMessage"
      @close="dialog = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
//THEME 
import { useTheme } from "vuetify"
const theme = useTheme();
const themeColor = computed(() =>
  theme.global.name.value === 'dark' ? 'bg-grey-darken-3' : 'bg-grey-lighten-4'
);
import { invoices } from "@/stores/invoiceState";
const invoiceArray = invoices();

const messages = computed(() => invoiceArray.warnings)
const menu = ref(false)
const dialog = ref(false)
const selectedMessage = ref(null)
const selectedUrl = ref('')

//what kind of "pdfViewer should it be.."
const alertTitle = ref("")
const duplicateFile = ref("")


function openDialog(message) {
  selectedMessage.value = message.item
  console.log("in pdf dialog in notification menu", message, message.item.pdf_file);
  selectedUrl.value = message.item.pdf_file ||  message.item[0].pdf_file
  alertTitle.value = message.title;
  duplicateFile.value = message.item[1]?.pdf_file || ''
  dialog.value = true
}
</script>

<style scoped>
/* .notification-item {
    transition: background-color 0.2s ease;
    cursor: pointer;
    padding: 12px;
    border-radius: 6px;
  } */
.notification-item .mdi-alert:hover {
    color: #7FD813FF;
  }
/* .text-truncate {
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  } */

   .alert-item:hover, .mdi-icon {
    color: rgb(255, 179, 0);
   }
</style>