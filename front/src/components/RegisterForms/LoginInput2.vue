<template>
  <v-text-field
    v-model="inputData"
    flat
    bg-color="grey-lighten-3"
    :placeholder="props.placeholder"
    variant="solo"
    density="compact"
    :type="showPwdStat? 'text' : 'password'"
    :rules="rule"
    :prepend-inner-icon="icon"
    :append-inner-icon="showPwdIcon"
    @click:append-inner="showPwdStat = !showPwdStat"
    @input="emitData"
  />
</template>

<!-- eslint-disable vue/require-default-prop -->
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
  pwd1: String,
  placeholder: String,
  pwd: Boolean,
  icon: String
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

<style></style>
