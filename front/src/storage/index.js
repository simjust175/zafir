import { createStore } from "vuex";

const store = createStore({
  state() {
    return {
      loggedInStat: false,
      userEmail: "",
      lang: "he",
      dbContent: []
    };
  },
  mutations: {
    updateLoggedIn(state, payload) {
      console.log("🪵👉");
      state.loggedInStat = payload.loggedStat;
      state.userEmail = payload.userEmail;
    },
    updateUserInfo(state, userEmail) {
      state.loggedInStat = userEmail;
    },
    updateDbContent(state, amountArray) {
      console.log("called store: ", amountArray);
      state.dbContent = [...amountArray];
    },
    updateLang(state, lang) {
      console.log("LANGUEGE UPDATE", lang);
      state.lang = lang;
    }
  },
  // actions:{

  // }
});

export default store;
