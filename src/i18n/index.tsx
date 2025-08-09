import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import localforage from 'localforage'

export type Language = 'en' | 'hi'

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    app_title: 'AI Farmers',
    home: 'Home',
    chatbot: 'Chatbot',
    images: 'Image Models',
    settings: 'Settings',
    weather: 'Weather',
    temp: 'Temp',
    humidity: 'Humidity',
    condition: 'Condition',
    market_prices: 'Market Prices',
    chat_ended: 'Chat ended',
    end_chat: 'End Chat',
    send: 'Send',
    summarizing: 'Summarizing…',
    analyzing: 'Analyzing…',
    language: 'Language',
    choose_language: 'Choose your language',
  },
  hi: {
    app_title: 'एआई फ़ार्मर्स',
    home: 'होम',
    chatbot: 'चैटबॉट',
    images: 'इमेज मॉडल',
    settings: 'सेटिंग्स',
    weather: 'मौसम',
    temp: 'तापमान',
    humidity: 'नमी',
    condition: 'स्थिति',
    market_prices: 'बाज़ार भाव',
    chat_ended: 'चैट समाप्त',
    end_chat: 'चैट समाप्त करें',
    send: 'भेजें',
    summarizing: 'सारांश बन रहा है…',
    analyzing: 'विश्लेषण हो रहा है…',
    language: 'भाषा',
    choose_language: 'अपनी भाषा चुनें',
  },
}

type I18nContextType = {
  lang: Language
  t: (key: string) => string
  setLang: (l: Language) => void
}

const I18nContext = createContext<I18nContextType>({ lang: 'en', t: (k) => k, setLang: () => {} })

const LANG_KEY = 'settings:language'

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en')

  useEffect(() => {
    localforage.getItem<Language>(LANG_KEY).then((saved) => {
      if (saved) setLangState(saved)
    })
  }, [])

  const setLang = (l: Language) => {
    setLangState(l)
    void localforage.setItem(LANG_KEY, l)
  }

  const t = useMemo(() => {
    const dict = TRANSLATIONS[lang]
    return (key: string) => dict[key] ?? key
  }, [lang])

  const value = useMemo(() => ({ lang, t, setLang }), [lang, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}

