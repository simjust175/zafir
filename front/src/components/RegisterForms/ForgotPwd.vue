<template>
  <div class="me-n2 text-center d-flex flex-column mb-4 align-center justify-space-between">
    <v-btn
      density="comfortable"
      class="ml-auto"
      icon="$close"
      variant="plain"
      @click="$emit('close')"
    />

    <h3 class="text-h6 mb-4">
      Verify Your Account
    </h3>

    <div class="text-body-2">
      {{ OTPLabel }}
    </div>
  </div>


  <v-form>
    <v-otp-input
      v-model="OTPcode"
      :label="OTPLabel"
      variant="outlined"
      color="surface"
    />
  </v-form>

  <div class="d-flex justify-center">
    <v-btn
      class="my-4"
      color="purple"
      height="40"
      text="Verify"
      variant="flat"
      width="70%"
    />
  </div>

  <div class="text-caption">
    Didn't receive the code? <a
      href="#"
      @click.prevent="otp = ''"
    >Resend</a>
  </div>
</template>

<script setup>
import { computed, watch, ref } from "vue";

// const props = defineProps({
//     forgot: Boolean
// })
defineEmits('close')

const userEmail = localStorage.getItem("user_email");

const OTPcode = ref("");

const OTPLabel = computed(() => `Enter the OTP sent to email: ${userEmail.slice(0, 4)}*******  Please check your email and paste the code below`)




watch(OTPcode, (val) => {
    if (val.length >= 6) {
        console.log("RUN OTP!!");
    }
})

// watch(props.forgot, (newVal)=>{
//     forgotPwd.value = newVal;
// })

</script>

<style></style>