import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useLoginStore = defineStore("loginState", () => {

  const token = ref(null);
  const userName = ref("");
  const userInfo = ref({});
  const theme = ref("light");

  function login(payload) {
    token.value = payload.token;
    userName.value = payload.name || "";
    userInfo.value = payload.info || {};
    localStorage.setItem("email", payload.info.email);
  }

  function logout() {
    token.value = null;
    userName.value = "";
    userInfo.value = {};
    localStorage.removeItem("email");
  }

  const isLoggedIn = computed(() => !!token.value);

  return { token, userName, userInfo, theme, login, logout, isLoggedIn };
}, {
  persist: {
    storage: localStorage,
    paths: ["token", "userName", "userInfo", "theme"]
  }
});


// ===================================================
// AUTO LOGOUT (router-safe)

let inactivityTimer;

export function setupAutoLogout(router) {
  resetTimer(router);

  ["mousemove", "keydown", "click", "scroll", "touchstart"].forEach(evt => {
    window.addEventListener(evt, () => resetTimer(router), { passive: true });
  });
}

function resetTimer(router) {
  clearTimeout(inactivityTimer);

  inactivityTimer = setTimeout(() => {
    const login = useLoginStore();
    login.logout();
    
    if (login.token) {
      window.dispatchEvent(new CustomEvent("token-warning", {
        detail: {
          title: "Logged Out",
          message: "You were logged out due to inactivity."
        }
      }));


      router.push("/register"); // ✔ now works safely
    }

  }, 10 * 60 * 1000);
}