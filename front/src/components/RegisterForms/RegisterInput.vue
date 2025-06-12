<template>
  <v-text-field
    variant="outlined"
    :type="showPwdStat ? 'text' : 'password'"
    :append-inner-icon="showPwdIcon"
    :rules="rule"
    :label="props.label"
    :prepend-inner-icon="icon"
    @click:append-inner="showPwdStat = !showPwdStat"
    class="mb-2"
    v-model="inputData"
    @input="emitData"
  >
  </v-text-field>
</template>

<script setup>
import { ref, reactive, computed } from "vue";


const rules = reactive({
  email: [
    (value) => !!value || "Required field",
    (value) => (value || "").length <= 30 || "Max 20 characters",
    (value) => {
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return pattern.test(value) || "Invalid e-mail.";
    },
  ],
  pwd: [(value) => !!value || "Required field"],
  pwd2: [
    (value) => !!value || "Required field",
    (value) => value === props.pwd1 || "Passwords don't match",
  ],
  name: [(value) => !!value || "Required field"],
});

const rule = computed(() => rules[props.type]);

const props = defineProps({
  type: String,
  label: String,
  pwd1: String,
});

const emit = defineEmits(["input"]);

const iconList = {
  email: "mdi-account-outline",
  pwd: "mdi-lock-outline",
  pwd2: "mdi-lock",
};
const icon = computed(() => iconList[props.type]);

const showPwdStat = ref(props.type.includes("pwd") ? false : true);
const showPwdIcon = computed(() =>
  props.type.includes("pwd")
    ? showPwdStat.value
      ? "mdi-eye"
      : "mdi-eye-off"
    : ""
);

const inputData = ref("");

const emitData = () => {
  if (rule.value.every((rule) => rule(inputData.value) === true)) {
    emit("input", inputData.value);
  }
  if (props.type === "email") {
    localStorage.setItem("user_email", inputData.value);
  }
};
</script>

<style>
/* Change the white to any color */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 30px rgb(186, 186, 186) inset !important;
  color: rgb(77, 76, 76);
}
</style>
