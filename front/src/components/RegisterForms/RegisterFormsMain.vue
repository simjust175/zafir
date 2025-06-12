<template>
  <v-form ref="formData">
    <alert-prop
      :alert="alertActivate"
      type="error"
      label="User name or password are incorrect"
      :closable="true"
    />
    <alert-prop
      label="Email must be provided"
      type="error"
      :alert="toggleAlert"
    />
    <register-input
      label="Enter Email"
      type="email"
      @input="credentials.user_email = $event"
    />

    <p
      class="cursor-pointer text-blue-darken-4 text-body-2 text-right"
      @click="emitForgot"
    >
      Forgot password?
    </p>
    <register-input
      v-model="credentials.pwd"
      label="Enter Pwd"
      type="pwd"
      @input="credentials.pwd = $event"
    />
    <v-btn
      class="my-4"
      size="large"
      color="primary"
      block
      @click.prevent="login"
    >
      Sign-in
    </v-btn>
  </v-form>
</template>

<script setup>
import { ref, reactive, watch, defineEmits } from "vue";
import { useRouter } from "vue-router";
import store from "@/storage";

const alertActivate = ref(false)
const router = useRouter()
const formData = ref("");
const toggleAlert = ref(false);
const credentials = reactive({
    user_email: "",
    pwd: ""
});

const emit = defineEmits(["forgot", "loggedIn"]);

const validate = async () => {
    const { valid } = await formData.value.validate();
    if (valid) return true;
}

const login = async () => {
    // const isValid = await validate();
     // if (!isValid) return null;
    const res = await fetch("http://localhost:3443/register/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
    });
    try {
        const {  newToken: {user_id, newToken: { token} } } = await res.json();
        console.log("userid", user_id);
        if (!token) return alertActivate.value = true;
        localStorage.setItem("token", token);
        localStorage.setItem("id", user_id);
        emit("loggedIn");
        store.commit("updateUserInfo", user_email);
        store.commit("updateLoggedIn", true);
        router.push("/");
    } catch (error) {
        alertActivate.value = true;
    }

}

//forgot
const emitForgot = async () => {
    console.log("creeds", credentials.user_email);
    if (!credentials.user_email) {
        toggleAlert.value = true
    } else {
        toggleAlert.value = false
        emit("forgot");
    }
};

watch(credentials.pwd, (newVal) => {
    console.log("newVal");
    if (newVal.length > 0) {
        toggleAlert.value = false
    }
})

</script>

<style></style>