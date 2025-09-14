import { defineStore } from "pinia";
import { useTheme } from "vuetify"
import { ref, computed } from "vue";

export const globalFunctions = defineStore(
    "globalFunctions",
    () => {
        const split = (txt) => txt.split(" ")

        const enhanceText = (txt) => {
            if (!txt) return null
            if (txt.includes("_")) { txt = txt.replace("_", " ") }
            txt = split(txt)
            return txt.map(name => name.charAt(0).toUpperCase() + name.slice(1)).join(" ")
        }

        const theme = useTheme()
        const themeColor = computed(() =>
            theme.global.name.value === "dark" ? "bg-grey-darken-3" : "bg-grey-lighten-4"
        )
        const add = ref(null)
        //Returns
        return {
            enhanceText,
            themeColor,
            add
        };
    }
);
