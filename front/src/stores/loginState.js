import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { useRouter } from "vue-router";

const router = useRouter();

export const useLoginStore = defineStore("loginState", () => {

  const token = ref(null);
  const userName = ref("");
  const userInfo = ref({});
  const theme = ref("light");

  // ========== ACTIONS ==========
 function login(payload) {
    token.value = payload.token;       // ✅ assign string to ref
    userName.value = payload.name || "";
    userInfo.value = payload.info || {};
    localStorage.setItem('email', payload.info.email)
  }


  function logout() {
    token.value = null;
    userName.value = "";
    userInfo.value = {};
    localStorage.removeItem('email')
  }
  

  const isLoggedIn = computed(() => !!token.value);

  return { token, userName, userInfo, theme, login, logout, isLoggedIn };
}, 
{
  persist: {
    storage: localStorage,     // persist automatically
    paths: ["token", "userName", "userInfo", "theme"] // saves only what matters
  }
});

let inactivityTimer;

export function setupAutoLogout() {
  resetTimer();

  // Reset timer on any interaction
  ["mousemove", "keydown", "click", "scroll", "touchstart"].forEach(evt => {
    window.addEventListener(evt, resetTimer, { passive: true });
  });
}

function resetTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    const login = useLoginStore();

    if (login.token) { 
      console.log("🔒 Auto-logout after 10 min inactivity");
       window.dispatchEvent(
        new CustomEvent("token-warning", {
          detail: {
            title: "Logged Out",
            message: "You were logged out due to inactivity."
          }
        })
      );

      login.logout();
      router.push('/register')
    }
  }, 10 * 60 * 1000); // 10 minutes
}