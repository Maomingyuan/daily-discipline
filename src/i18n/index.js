import { reactive } from 'vue'
import en from './locales/en.json'
import zh from './locales/zh.json'

const messages = { en, zh }

const i18n = reactive({
  locale: localStorage.getItem('locale') || 'en',
  messages,
  t(key) {
    return this.messages[this.locale][key] || key
  },
  setLocale(locale) {
    this.locale = locale
    localStorage.setItem('locale', locale)
  }
})

export default i18n
