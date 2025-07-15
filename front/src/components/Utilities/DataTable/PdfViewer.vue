<template>
  <v-dialog
    :model-value="dialog"
    max-width="800"
    scrollable
  >
    <v-card class="pa-0 overflow-hidden">
      <v-toolbar
        flat
        dense
        class="bg-grey-lighten-4"
      >
        <!-- Close Button -->
        <v-btn
          icon
          @click="$emit('close')"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>

        <!-- Title -->
        <v-toolbar-title class="text-h6">
          PDF Preview
        </v-toolbar-title>

        <!-- Spacer pushes next items to the far right -->
        <v-spacer />

        <!-- Open in New Tab Button -->
        <v-btn
          icon
          :href="pdfUrl"
          target="_blank"
          title="Open in New Tab"
          rel="noopener noreferrer"
        >
          <v-icon>mdi-open-in-new</v-icon>
        </v-btn>
      </v-toolbar>

      <!-- Summary section -->
      <div class="pa-4 bg-grey-lighten-3 text-grey-darken-3 text-body-2">
        <div class="d-flex justify-space-between align-center">
          <div>
            <strong>Invoice#:</strong> VO250020931<br>
            <strong>Issued:</strong> 12/05/2025<br>
            <strong>Due:</strong> 20/06/2025
          </div>
          <div>
            <strong>Btw:</strong> Eurofast TX30 Houtschroef<br>
            <strong>Btw percent:</strong> 1.00 ds%<br>
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
          class="border-none"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>


<script setup>
import { computed } from "vue"
const props = defineProps({
    url: String,
    dialog: Boolean
});

const pdfUrl = computed(() =>
    props.url ? `${import.meta.env.VITE_BASE_URL}/file/${props.url}` : ''
);
</script>

<style scoped>
iframe {
    border: none;
}
</style>
