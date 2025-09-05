<template>
  <v-card
    class="py-5 px-4"
    width="500"
    elevation="2"
  >
    <v-icon
      icon="mdi-close"
      class="mt-0 ml-0 mb-4 cursor-pointer"
      @click="$emit('close')"
    />
    <v-row
      align="center"
      justify="center"
    >
      <v-col
        cols="12"
        md="8"
      >
        <!-- File Input -->
        <!-- <v-file-input
            v-model="file"
            accept="application/pdf"
            label="Upload Invoice (PDF only)"
            prepend-icon="mdi-file-upload"
            outlined
            show-size
            dense
            class="mb-4"
            @change="handleFileSelect"
          /> -->
        <v-file-upload density="default" />
        <!-- Upload Success Alert -->
        <v-slide-y-transition>
          <v-alert
            v-if="uploadSuccess"
            type="success"
            border="start"
            prominent
            class="mb-4"
          >
            ✅ Invoice uploaded successfully!
          </v-alert>
        </v-slide-y-transition>

        <!-- Upload Error Alert -->
        <v-slide-y-transition>
          <v-alert
            v-if="uploadError"
            type="error"
            border="start"
            prominent
            class="mb-4"
          >
            ❌ Upload failed: {{ uploadError }}
          </v-alert>
        </v-slide-y-transition>

        <!-- Upload Button -->
        <v-btn
          :disabled="!file || uploading"
          color="primary"
          block
          class="mt-2"
          @click="uploadInvoice"
        >
          <v-progress-circular
            v-if="uploading"
            indeterminate
            color="white"
            size="20"
            class="mr-2"
          />
          Upload
        </v-btn>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { ref, watch } from "vue";
const file = ref(null);
const uploading = ref(false);
const uploadSuccess = ref(false);
const uploadError = ref(null);

const handleFileSelect = () => {
  uploadSuccess.value = false;
  uploadError.value = null;
};

const uploadInvoice = async () => {
  if (!file.value) return;

  // Optional: File size validation
  if (file.value.size > 5 * 1024 * 1024) {
    uploadError.value = "File too large (max 5MB)";
    return;
  }

  const formData = new FormData();
  formData.append("invoice", file.value);

  uploading.value = true;
  uploadSuccess.value = false;
  uploadError.value = null;

  try {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/post`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (res.status === 200) {
      uploadSuccess.value = true;
      file.value = null;

      // Optional: auto-hide alert
      setTimeout(() => {
        uploadSuccess.value = false;
      }, 3000);
    } else {
      uploadError.value = res.data?.message || "Unknown error";
    }
  } catch (err) {
    uploadError.value =
      err.response?.data?.message || err.message || "Upload failed";
  } finally {
    uploading.value = false;
  }
};

</script>

<style scoped>
.v-card {
  max-width: 600px;
  margin: auto;
  border-radius: 16px;
  transition: box-shadow 0.3s ease-in-out;
}
</style>
