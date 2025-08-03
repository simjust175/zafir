import { ref } from "vue";
import { defineStore } from "pinia";

export const setLogin = defineStore("loginState", () => {
  // State
  const token = ref(null);
  const userName = ref("");
  const user = ref("");
  const userInfo = ref({});
  const theme = ref("light");

  // Actions
  function setLogin({ token: userToken, name, info }) {
    token.value = userToken;
    user.value = name || "";
    userName.value = name || "";
    userInfo.value = info || {};

    // Optional: persist in localStorage
    localStorage.setItem("token", userToken);
    localStorage.setItem("user_email", name);
  }

  function logout() {
    token.value = null;
    userName.value = "";
    user.value = "";
    userInfo.value = {};
    localStorage.removeItem("token");
    localStorage.removeItem("user_email");
  }

  function initializeFromLocalStorage() {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user_email");

    if (storedToken) token.value = storedToken;
    if (storedUser) userName.value = storedUser;
  }

  function setTheme(newTheme) {
    theme.value = newTheme;
  }

  return {
    token,
    userName,
    user,
    userInfo,
    theme,
    setLogin,
    logout,
    initializeFromLocalStorage,
    setTheme
  };
},
{
  persist: true
});