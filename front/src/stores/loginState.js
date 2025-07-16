import { ref } from "vue";
import { defineStore } from "pinia";

export const setLogin = defineStore(
  "loginState",
  () => {
    // state
    const token = ref(null);
    const userName = ref("");
    const userInfo = ref({});
    const theme = ref('light')

    //Returns
    return {
      token,
      userName,
      userInfo,
      theme
    };
  },
  {
    persist: true,
  }
);
