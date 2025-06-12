<template>
  <div class="container pr-4 pt-2">
    <label class="language-switcher">
      <input type="checkbox">
      <span class="slider round pr-1" />
      <span
        class="select-fr pl-1 cursor-pointer"
        @click="emitLocale('he')"
      >ער</span>
      <span
        class="select-en cursor-pointer pr-1"
        @click="emitLocale('en')"
      >EN</span>
    </label>
  </div>
</template>

<script setup>
import { defineEmits } from "vue";
const emit = defineEmits(["updateLocale"]);
const emitLocale = (lang) => emit("updateLocale", lang);
</script>

<style scoped>
@import url(https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,400i,700,700i);

.container {
  margin: 0;
  padding: 0;
  height: 30px;
  font-family: "Source Sans Pro", Arial, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
}

.language-switcher {
  position: relative;
  display: inline-block;
  width: 60px;
  /* Adjusted width */
  height: 30px;
  /* Adjusted height */
  transition: transform 0.17s cubic-bezier(0.26, 0.48, 0.08, 0.9);
}

.language-switcher input {
  opacity: 0;
  width: 0;
  height: 0;
}

.language-switcher .select-fr,
.language-switcher .select-en {
  position: absolute;
  font-size: 12px;
  /* Adjusted font size */
  top: 50%;
  transform: translateY(-50%);
  color: #fff;
  mix-blend-mode: difference;
}

.language-switcher .select-fr {
  left: 6px;
  /* Adjusted position */
}

.language-switcher .select-en {
  right: 6px;
  /* Adjusted position */
}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #1e3470;
  box-shadow: 0 3px 64px rgba(30, 52, 112, 0.1);
  transition: 0.4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 30px;
  /* Adjusted height */
  width: 30px;
  /* Adjusted width */
  left: 0;
  bottom: 0;
  background-color: white;
  box-shadow: 0 3px 64px rgba(30, 52, 112, 0.16);
  transition: 0.4s;
}

input:checked + .slider {
  background-color: #1e3470;
}

input:focus + .slider {
  box-shadow: none;
}

input:checked + .slider:before {
  transform: translateX(30px);
  /* Adjusted translation */
}

/* Rounded sliders */
.slider.round {
  border-radius: 30px;
  /* Adjusted border radius */
}

.slider.round:before {
  border-radius: 50%;
}
</style>
