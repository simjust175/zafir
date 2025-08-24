<template>
  <!-- <v-layout class="pa-0 ma-0 fill-height position-absolute top-0"> -->
  <v-footer
    class="d-flex flex-column pa-0 ma-0 text-grey-lighten-5 position-absolute bottom-0 mb-0"
    height="0"
  >
    <div class="zafir-secondary d-flex w-100 align-center px-4 py-2">
      <strong class="px-12">Billio- Invoice management simplified</strong>
      <v-spacer />
    </div>
    <div class="px-4 py-2 pb-5 zafir-primary text-center w-100 mb-0">
      Copyright ©
      {{ new Date().getFullYear() }} - Dreamware. All rights reserved. 
    </div>
    <v-img
      src="../../../public/logo/dreamware.png"
      max-width="30"
      max-height="30"
    />
  </v-footer>
  <!-- </v-layout> -->
</template>

<script>
  //
</script>