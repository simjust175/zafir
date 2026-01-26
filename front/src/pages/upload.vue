<template>
  <main>
    <invoice-upload-main
      :active="activateDialog"
      @close="$router.push('/invoices')"
    />
  </main>
</template>

<script setup>
import InvoiceUploadMain from '@/components/InvoiceUpload/InvoiceUploadMain.vue';
import { onMounted, ref } from "vue";
const activateDialog = ref(false)
onMounted(()=> activateDialog.value = true)
</script>

<style>

</style>