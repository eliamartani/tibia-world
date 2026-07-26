import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import pt from './locales/pt.json'
import pl from './locales/pl.json'
import es from './locales/es.json'
import de from './locales/de.json'

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('language') || 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    pt,
    pl,
    es,
    de,
  },
}) as any

export default i18n
