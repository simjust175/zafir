<template>
  <v-toolbar
    flat
    density="comfortable"
    height="56"
    :class="toolbarBackground"
  >
    <v-btn
      icon="mdi-close"
      variant="text"
      size="small"
      :color="iconColor"
      :disabled="disableClose"
      @click="$emit('close')"
    />
    <v-toolbar-title class="text-body-1 font-weight-medium">
      PDF Preview
    </v-toolbar-title>
    <v-spacer />
    <div class="d-flex align-center text-body-2 mr-4">
      <v-icon
        size="18"
        class="mr-1"
        :color="iconColor"
      >
        mdi-file-pdf-box
      </v-icon>
      <span>{{ issuer || 'Unknown Supplier' }}</span>
    </div>
    <v-btn
      icon="mdi-open-in-new"
      variant="text"
      size="small"
      :href="pdfUrl"
      target="_blank"
      rel="noopener"
      :color="iconColor"
      title="Open in New Tab"
    />
    <v-btn
      icon="mdi-download"
      variant="text"
      size="small"
      :href="pdfUrl"
      download
      :color="iconColor"
      title="Download PDF"
    />
  </v-toolbar>
</template>
  
  <script setup>
  defineProps({
    issuer: String,
    pdfUrl: String,
    iconColor: String,
    toolbarBackground: String,
    disableClose: Boolean
  })
  defineEmits(['close'])
  </script>