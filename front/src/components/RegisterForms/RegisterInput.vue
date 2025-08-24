<template>
  <v-text-field
    v-model="inputData"
    variant="outlined"
    :type="showPwdStat ? 'text' : 'password'"
    :append-inner-icon="showPwdIcon"
    :rules="rule"
    :label="props.label"
    :prepend-inner-icon="icon"
    class="mb-2 register-input light"
    @click:append-inner="showPwdStat = !showPwdStat"
    @input="emitData"
  />
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
  user_name: [(value) => !!value || "Required field"],
});

const rule = computed(() => rules[props.type] || []);

const props = defineProps({
  type: String,
  label: String,
  pwd1: String,
});

const emit = defineEmits(["input"]);

const iconList = {
  email: "mdi-email-outline",
  pwd: "mdi-lock-outline",
  pwd2: "mdi-lock",
  user_name: "mdi-account-circle-outline"
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
  const isValid = rule.value.length === 0 || rule.value.every(rule => rule(inputData.value) === true);
  if (isValid) {
    emit("input", inputData.value);
  }

  if (props.type === "email") {
    localStorage.setItem("user_email", inputData.value);
  }
};

</script>

<style>
</style>
