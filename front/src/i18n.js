import { createI18n } from "vue-i18n";
import en from "@/Locals/en.json"
import he from "@/Locals/he.json"

function loadLocaleMessages(){
    const locales = [{en: en}, {he: he}];
    const messages = {}
    locales.forEach((lang => {
        console.log("lang =", lang);
        const key = Object.keys(lang)
        messages[key] = lang[key]
    }))
}

export default createI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages: loadLocaleMessages()
})