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
    <div class="input-box">
      <login-input-2
        placeholder="Username"
        icon="mdi-account"
        type="email"
        :pwd="false"
        @input="credentials.user_email = $event"
      />
    </div>
    <div class="input-box">
      <login-input-2
        v-model="credentials.pwd"
        placeholder="Password"
        icon="mdi-lock"
        :pwd="true"
        type="pwd"
        @input="credentials.pwd = $event"
      />
    </div>

    <div class="forgot-link">
      <p
        class="cursor-pointer text-blue-darken-4 text-body-2 text-right"
        @click="emitForgot"
      >
        Forgot password?
      </p>
    </div>

    <button
      class="btn"
      @click.prevent="login"
    >
      Login
    </button>
  </v-form>
  <!-- <p>or login with social platforms</p>
  <div class="social-icons">
    <a href="#"><i class="bx bxl-google"></i></a>
    <a href="#"><i class="bx bxl-facebook"></i></a>
    <a href="#"><i class="bx bxl-github"></i></a>
    <a href="#"><i class="bx bxl-linkedin"></i></a>
  </div> -->
</template>

<script setup>
import LoginInput2 from "./LoginInput2.vue";
import { ref, reactive, watch } from "vue";
import { useRouter } from "vue-router";
import { setLogin } from "@/stores/loginState.js";

const router = useRouter();
const loginState = setLogin();

const alertActivate = ref(false);
const toggleAlert = ref(false);
const formData = ref("");

const credentials = reactive({
  user_email: "",
  pwd: "",
});

const emit = defineEmits(["forgot", "loggedIn"]);

const validate = async () => {
  const { valid } = await formData.value.validate();
  return valid;
};

const login = async () => {
  const isValid = await validate();
  if (!isValid) return;

  try {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/register/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const { newToken } = await res.json();
    const token = newToken?.newToken?.token;
    const userId = newToken?.user_id;
    const userName = newToken?.user_name;

    if (!token) {
      alertActivate.value = true;
      return;
    }

    // Save to store
    loginState.setLogin({
      token,
      email: credentials.user_email,
      user: userName,
    });

    // Save to localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("user_email", credentials.user_email);
    localStorage.setItem("user_name", userName);
    localStorage.setItem("id", userId);

    emit("loggedIn");
    router.push("/");
  } catch (err) {
    console.error("❌ Login failed:", err);
    alertActivate.value = true;
  }
};

const emitForgot = () => {
  if (!credentials.user_email) {
    toggleAlert.value = true;
    return;
  }
  toggleAlert.value = false;
  emit("forgot");
};

watch(credentials.pwd, () => {
  if (credentials.pwd.length > 0) {
    toggleAlert.value = false;
  }
});
</script>

<style scoped>
.input-box {
  position: relative;
  margin: 20px 0;
}

.input-box input#input {
  width: 100%;
  padding: 13px 50px 13px 20px;
  background: #eee;
  border-radius: 8px;
  border: none;
  outline: none;
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.input-box input#input::placeholder {
  color: #888;
  font-weight: 400;
}

.input-box i {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
}

.btn {
  width: 100%;
  height: 48px;
  background: #7494ec;
  text-align: center;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #fff;
  font-weight: 600;
}
</style>
