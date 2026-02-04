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
            <v-icon
              icon="mdi-bell-outline"
              size="sm"
            />
          </v-badge>
          <v-icon
            v-else
            icon="mdi-bell-outline"
          />
        </v-btn>
      </template>

      <!-- Notifications Dropdown -->
      <v-card
        min-width="450"
        rounded="lg"
        class="elevation-5"
      >
        <v-card-title class="font-weight-bold pt-4 pl-5 text-h6">
          <div class="d-flex align-center justify-space-between">
            <span>Notifications</span>
            <v-btn
              rounded="pill"
              text="Clear all"
              prepend-icon="mdi-delete"
              class="py-1 text-capitalize"
              variant="tonal"
              @click="clearAllMessages"
            />
          </div>
        </v-card-title>
        <v-divider />

        <v-list
          dense
          nav
        >
          <transition-group
            name="fade"
            tag="div"
          >
            <!-- Empty state -->
            <v-list-item
              v-if="messages.length === 0"
              class="text-center py-5 pb-8"
            >
              <v-card
                :class="themeColor"
                class="pa-4 py-6 fill-height border-dashed"
                rounded="lg"
              >
                <div class="d-flex flex-column align-center">
                  <v-icon
                    size="80"
                    :class="themeColorText"
                  >
                    mdi-alert-remove
                  </v-icon>

                  <div
                    class="text-h5 mt-3 mb-3"
                    :class="themeColorText"
                  >
                    Hurray! No issues
                  </div>
                </div>
              </v-card>
            </v-list-item>

            <!-- Messages -->
            <template v-else>
              <v-list-item
                v-for="(message, index) in messages"
                :key="message.id"
                class="notification-item py-2"
                :class="themeColor"
                role="button"
                :aria-label="`Open alert for ${message.project}`"
                @click="openDialog(message)"
              >
                <v-hover v-slot="{ isHovering, props }">
                  <div
                    v-bind="props"
                    class="d-flex ga-4 align-center justify-space-between w-100"
                  >
                    <!-- Left side: icon + text -->
                    <div class="d-flex align-center ga-4">
                      <v-card
                        variant="tonal"
                        rounded="md"
                        class="pa-2 d-flex align-center justify-center transition-all"
                        :class="isHovering ? 'hover-card' : ''"
                      >
                        <v-icon
                          :icon="alertIcon(message.title).icon"
                          :color="isHovering ? alertIcon(message.title).color : 'default'"
                        />
                      </v-card>

                      <!-- Text block -->
                      <div class="text">
                        <div class="d-flex align-center justify-space-between">
                          <v-list-item-title class="font-weight-medium text-capitalize">
                            {{ message.title || 'Invoice Alert' }}
                          </v-list-item-title>

                          <v-chip
                            v-if="message.project"
                            size="small"
                            color="primary"
                            variant="tonal"
                            class="ml-2"
                          >
                            {{ message.project }}
                          </v-chip>
                        </div>

                        <v-list-item-subtitle class="text-truncate mt-1">
                          {{ message.body || 'A problem arose' }}
                        </v-list-item-subtitle>
                      </div>
                    </div>

                    <!-- Right side: delete button (only on hover) -->
                    <div
                      v-if="isHovering"
                      class="d-flex align-center"
                    >
                      <v-btn
                        variant="tonal"
                        density="comfortable"
                        text="View"
                      />
                      <v-btn
                        icon="mdi-delete"
                        size="small"
                        variant="text"
                        color="error"
                        @click.stop="clearMessage(index, message)"
                      />
                    </div>
                  </div>
                </v-hover>
              </v-list-item>

              <!-- Divider between items -->
              <v-divider
                v-if="index < messages.length - 1"
                class="mx-2"
              />
            </template>
          </transition-group>
        </v-list>
      </v-card>
    </v-menu>

    <!-- Invoice Popup -->
    <pdf-viewer-dialog
      :dialog="dialog"
      :url="selectedUrl"
      mode="conflict"
      :conflict-type="alertTitle"
      :duplicate-file-url="duplicateFile"
      :duplicate-id="duplicateId"
      :double-check="false"
      :file-details="selectedMessage"
      @save-supplier="resolveSaveSupplier"
      @keep-both="resolveKeepUnknown"
      @keep-this="resolveDelete"
      @keep-duplicate="resolveDelete"
      @keep-none="resolveDelete('both')"
      @keep-unknown="resolveKeepUnknown"
      @close="dialog = false"
    />

    <!-- confirm delete dialog -->
    <v-dialog
      v-model="confirmDialog"
      max-width="400"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">
          Confirm Deletion
        </v-card-title>
        <v-card-text>
          <div v-if="confirmType === 'single'">
            Are you sure you want to delete this <strong>{{ confirmMessage.title }}</strong> alert for
            <strong>{{ confirmMessage.project }}</strong>?
          </div>
          <div v-else>
            This will permanently clear <strong>all</strong> notifications. Proceed?
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            text="Cancel"
            variant="text"
            @click="confirmDialog = false"
          />
          <v-btn
            text="Delete"
            color="error"
            variant="tonal"
            @click="confirmDelete"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar"
      timeout="5000"
      location="bottom"
    >
      {{ snackbarText }}
      <template #actions>
        <v-btn
          text="Undo"
          @click="undoCallback(); snackbar = false"
        />
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"
import { useTheme } from "vuetify"
import { invoices } from "@/stores/invoiceState"

const invoiceArray = invoices()
const messages = computed(() => invoiceArray.warnings)

const theme = useTheme()
const themeColor = computed(() =>
  theme.global.name.value === "dark" ? "bg-grey-darken-3" : "bg-grey-lighten-4"
)
const themeColorText = computed(() =>
  theme.global.name.value === "dark" ? "text-grey-lighten-2" : "text-grey-darken-1"
)

const menu = ref(false)
const dialog = ref(false)
const selectedMessage = ref(null)
const selectedUrl = ref("")
const selectedId = ref("")
const duplicateId = ref(null)
const alertTitle = ref("")
const duplicateFile = ref("")

// Confirmation dialog
const confirmDialog = ref(false)
const confirmType = ref("") // 'single' or 'all'
const confirmIndex = ref(null)
const confirmMessage = ref(null)

// Snackbar
const snackbar = ref(false)
const snackbarText = ref("")
const undoCallback = ref(() => {})

/* ---------------- Helpers ---------------- */
function formatForMySQL(date) {
  return date.toISOString().slice(0, 19).replace("T", " ")
}

async function patchWarning(query, where) {
  const res = await fetch(`${import.meta.env.VITE_BASE_URL}/invoice/patch/invoices?${where}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(query),
  })
  if (!res.ok) throw new Error("Failed to resolve error")
  return await res.json()
}

/* ---------------- Core Resolution Logic ---------------- */
function resolveConflict({ id, index, payload, message, undoMessage }) {
  console.log("info as resolveConflict:", { id, index, payload, message, undoMessage })
  const backup = message
  invoiceArray.warnings.splice(index, 1)

  // persist immediately
  patchWarning(payload, `id=${id}`)

  // snackbar + undo
  snackbarText.value = undoMessage || `Resolved "${backup.title}"`
  undoCallback.value = async () => {
    invoiceArray.warnings.splice(index, 0, backup)
    // rollback patch
    await patchWarning({ conflict_resolved: null, issuer: backup.item?.issuer }, `id=${id}`)
    snackbar.value = false
  }
  snackbar.value = true
}

/* ---------------- Actions ---------------- */
function openDialog(message) {
  const item = Array.isArray(message.item) ? message.item[0] : message.item
  selectedMessage.value = item
  selectedUrl.value = item?.pdf_file || ""
  selectedId.value = message.id
  alertTitle.value = message.title
  duplicateId.value = Array.isArray(message.item) ? message.item[1]?.invoice_id || "" : ""
  duplicateFile.value = Array.isArray(message.item) ? message.item[1]?.pdf_file || "" : ""
  dialog.value = true
}

function clearMessage(index, message) {
  confirmType.value = "single"
  confirmIndex.value = index
  confirmMessage.value = message
  confirmDialog.value = true
}

function clearAllMessages() {
  confirmType.value = "all"
  confirmDialog.value = true
}

function confirmDelete() {
  if (confirmType.value === "single") {
    const index = confirmIndex.value
    resolveConflict({
      id: confirmMessage.value.id,
      index,
      payload: { conflict_resolved: formatForMySQL(new Date()) },
      message: confirmMessage.value,
      undoMessage: `Deleted ${confirmMessage.value.title} alert`,
    })
  } else {
    const backup = [...invoiceArray.warnings]
    invoiceArray.warnings = []
    patchWarning({ conflict_resolved: formatForMySQL(new Date()) }, "allWarnings=true")

    snackbarText.value = "Cleared all notifications"
    undoCallback.value = () => {
      invoiceArray.warnings = backup
      snackbar.value = false
    }
    snackbar.value = true
  }
  confirmDialog.value = false
}

function resolveSaveSupplier(issuer) {
  console.log("issuer from pef viewer:", issuer);
  
  const index = invoiceArray.warnings.findIndex(w => w.id === selectedId.value)
  if (index !== -1) {
    resolveConflict({
      id: selectedId.value,
      index,
      payload: { issuer, conflict_resolved: formatForMySQL(new Date()) },
      message: invoiceArray.warnings[index],
      undoMessage: `Supplier updated for "${invoiceArray.warnings[index].title}"`,
    })
  }
  dialog.value = false
}

function resolveDelete(mode) {
  const index = invoiceArray.warnings.findIndex(w => w.id === selectedId.value)
  if (index === -1) return
  const currentWarning = invoiceArray.warnings[index]
  const message = currentWarning
  const id = selectedId.value

  if (mode === "both") {
    // Delete both duplicate and current invoice
    resolveConflict({
      id,
      index,
      payload: { deleted_at: formatForMySQL(new Date()), delete_both: true, duplicate_id: duplicateId.value  },  
      message,
      undoMessage: `Deleted both invoices for "${message.title}"`,
    })
  } else {
    // Keep current, delete duplicate
    resolveConflict({
      id,
      index,
      payload: { deleted_at: formatForMySQL(new Date()), keep_current: true },
      message,
      undoMessage: `Kept original invoice for "${message.title}"`,
    })
  }
  dialog.value = false
}

function resolveKeepUnknown() {
  console.log("keeping unkown");
  dialog.value = false;
  const index = invoiceArray.warnings.findIndex(w => w.id === selectedId.value)
  if (index !== -1) {
    resolveConflict({
      id: selectedId.value,
      index,
      payload: { conflict_resolved: formatForMySQL(new Date()) },
      message: invoiceArray.warnings[index],
      undoMessage: `Marked "${invoiceArray.warnings[index].title}" as resolved`,
    })
  }
  dialog.value = false
}

function alertIcon(type) {
  switch (type) {
    case "unknown-supplier":
      return { icon: "mdi-account-question-outline", color: "amber" }
    case "duplicate":
      return { icon: "mdi-content-duplicate", color: "deep-orange" }
    case "conflict":
      return { icon: "mdi-alert-circle", color: "red" }
    default:
      return { icon: "mdi-bell-alert", color: "primary" }
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>