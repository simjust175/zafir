import { defineStore } from "pinia";

export const setLogin = defineStore(
    "loginState",
    () => {
        //State
        //Actions
        const split = (txt) => txt.split(" ")

        const enhanceText = (txt) => {
            if (!txt) return null
            if (txt.includes("_")) { txt = txt.replace("_", " ") }
            txt = split(txt)
            return txt.map(name => name.charAt(0).toUpperCase() + name.slice(1)).join(" ")
        }
        //Returns
        return {
            enhanceText
        };
    },
    {
        persist: true,
    }
);
