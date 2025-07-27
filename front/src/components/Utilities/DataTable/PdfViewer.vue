<template>
  <v-dialog
    :model-value="dialog"
    max-width="800"
    scrollable
  >
    <!-- PDF content available -->
    <v-card
      v-if="url"
      class="pa-0 overflow-hidden"
      :class="cardBackground"
    >
      <v-toolbar
        flat
        dense
        :class="toolbarBackground"
      >
        <!-- Close Button -->
        <v-btn icon @click="$emit('close')">
          <v-icon :color="iconColor">mdi-close</v-icon>
        </v-btn>

        <!-- Title -->
        <v-toolbar-title class="text-h6">
          PDF Preview
        </v-toolbar-title>

        <v-spacer />

        <!-- Open in New Tab Button -->
        <v-btn
          icon
          :href="pdfUrl"
          target="_blank"
          title="Open in New Tab"
          rel="noopener noreferrer"
        >
          <v-icon :color="iconColor">mdi-open-in-new</v-icon>
        </v-btn>
      </v-toolbar>

      <!-- Summary section -->
      <div :class="[summaryBackground, 'pa-4', 'text-body-2']">
        <div class="d-flex justify-space-between align-center">
          <div>
            <strong>Invoice#:</strong> VO250020931<br />
            <strong>Issued:</strong> 12/05/2025<br />
            <strong>Due:</strong> 20/06/2025
          </div>
          <div>
            <strong>Btw:</strong> Eurofast TX30 Houtschroef<br />
            <strong>Btw percent:</strong> 1.00 ds%<br />
            <strong>Total (incl. Btw):</strong> €45.05
          </div>
        </div>
      </div>

      <!-- PDF Viewer -->
      <v-card-text class="pa-0">
        <iframe
          v-if="pdfUrl"
          :src="pdfUrl"
          type="application/pdf"
          width="100%"
          height="600px"
        />
      </v-card-text>
    </v-card>

    <!-- No PDF available fallback -->
    <v-card
      v-else
      height="900"
      class="d-flex flex-column align-center justify-center px-5 py-4"
      :class="cardBackground"
      flat
    >
      <v-icon size="48" :color="iconColor">mdi-file-remove-outline</v-icon>
      <div class="text-subtitle-1 mt-2">
        No PDF available
      </div>
      <div class="text-body-2">
        There is no document to preview at the moment.
      </div>
      <v-btn
        class="mt-4"
        variant="outlined"
        color="primary"
        @click="$emit('close')"
      >
        Close
      </v-btn>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from "vue";
import { useTheme } from "vuetify";

// Props
const props = defineProps({
  url: String,
  dialog: Boolean
});

// PDF URL
const pdfUrl = computed(() =>
  props.url ? `${import.meta.env.VITE_BASE_URL}/file/${props.url}` : ""
);

// Theme logic
const theme = useTheme();
const isDark = computed(() => theme.global.name.value === 'dark');

const cardBackground = computed(() =>
  isDark.value ? 'bg-grey-darken-4' : 'bg-grey-lighten-4'
);
const toolbarBackground = computed(() =>
  isDark.value ? 'bg-grey-darken-3' : 'bg-grey-lighten-3'
);
const summaryBackground = computed(() =>
  isDark.value ? 'bg-grey-darken-2 text-grey-lighten-3' : 'bg-grey-lighten-3 text-grey-darken-3'
);
const iconColor = computed(() =>
  isDark.value ? 'grey-lighten-1' : 'grey-darken-2'
);
</script>

<style scoped>
iframe {
  border: none;
}
</style>