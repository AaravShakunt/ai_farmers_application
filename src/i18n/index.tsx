import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import localforage from 'localforage'

export type Language = 'en' | 'hi' | 'kn'

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    app_title: 'Farmers.AI',
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
    welcome: 'Welcome to Farmers.AI',
    select_language: 'Please select your preferred language',
    continue: 'Continue',
    loading: 'Loading...',
    no_data: 'No data available',
    no_prices: 'No prices available',
    per_kg: 'per kg',
    rupees: '₹',
    // New Home Page Translations
    quick_actions: 'Quick Actions',
    ai_advisor: 'AI Advisor',
    gov_schemes: 'Gov Schemes',
    weather_alert: 'Weather Alert',
    high_temp_warning: 'High temperature may affect crops',
    updated_now: 'Updated now',
    search_crops: 'Search crops...',
    crop_analysis: 'Crop Analysis',
    analyze_crop_health: 'Analyze crop health',
    financial_aid: 'Financial Aid',
    loans_subsidies: 'Loans & Subsidies',
    todays_tasks: "Today's Tasks",
    check_irrigation: 'Check irrigation system',
    apply_fertilizer: 'Apply fertilizer to wheat field',
    // Government Schemes Translations
    government_schemes: 'Government Schemes',
    ministry_agriculture: 'Ministry of Agriculture & Farmers Welfare',
    updated: 'Updated',
    urgent_notice: 'URGENT NOTICE',
    crop_insurance_deadline: 'Crop Insurance Scheme Registration Deadline',
    apply_before: 'Apply before',
    new: 'NEW',
    urgent: 'URGENT',
    subsidy: 'Subsidy',
    loan: 'Loan',
    insurance: 'Insurance',
    training: 'Training',
    max_benefit: 'Max Benefit',
    deadline: 'Deadline',
    apply_now: 'Apply Now',
    view_all_schemes: 'View All Schemes',
    official_website: 'Official Website',
    helpline: 'Helpline',
    eligibility: 'Eligibility',
    // Header Navigation Translations
    smart_farming: 'Smart Farming Solutions',
    farmer_name: 'Rajesh Kumar',
    location: 'Karnataka, India',
    logout: 'Logout',
    // Tasks Page Translations
    tasks: 'Tasks',
    my_plots: 'My Plots',
    manage_your_farming_plots: 'Manage your farming plots',
    add_plot: 'Add Plot',
    total_plots: 'Total Plots',
    total_area: 'Total Area',
    active_plots: 'Active Plots',
    crop: 'Crop',
    area: 'Area',
    soil_type: 'Soil Type',
    irrigation: 'Irrigation',
    planted_on: 'Planted On',
    expected_harvest: 'Expected Harvest',
    last_consultation: 'Last Consultation',
    query: 'Query',
    workflow: 'Workflow',
    no_workflow: 'No Workflow',
    add_new_plot: 'Add New Plot',
    plot_name: 'Plot Name',
    select_crop: 'Select Crop',
    select_soil_type: 'Select Soil Type',
    select_irrigation: 'Select Irrigation',
    irrigation_type: 'Irrigation Type',
    planting_date: 'Planting Date',
    cancel: 'Cancel',
    // Workflow Page Translations
    loading_workflow: 'Loading workflow...',
    no_workflow_available: 'No Workflow Available',
    no_workflow_description: 'Start a chat consultation to generate a personalized workflow for this plot.',
    back_to_plots: 'Back to Plots',
    ask_ai: 'Ask AI',
    last_updated: 'Last Updated',
    completed: 'Completed',
    complete: 'Complete',
    due: 'Due',
    estimated_time: 'Estimated Time',
    category: 'Category',
    tools_required: 'Tools Required',
    notes: 'Notes',
    get_more_advice: 'Get More Advice',
    mark_all_complete: 'Mark All Complete',
    // Voice Input Translations
    start_recording: 'Start voice recording',
    stop_recording: 'Stop voice recording',
    listening: 'Listening',
    voice_not_supported: 'Voice recognition is not supported in your browser',
    recording_stopped: 'Recording stopped',
    speak_now: 'Speak now',
    microphone_access_denied: 'Please allow microphone access in your browser and try again',
    allow_microphone: 'Allow Microphone Access',
    loading_voice_model: 'Loading voice model',
    processing: 'Processing',
    offline_mode: 'Offline mode',
    online_mode: 'Online mode',
    offline_recording: 'Recording offline',
    recording_audio: 'Recording audio',
    voice_offline_unavailable: 'Voice input unavailable offline',
    voice_requires_internet: 'Voice recognition requires internet connection',
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
    welcome: 'एआई फ़ार्मर्स में आपका स्वागत है',
    select_language: 'कृपया अपनी पसंदीदा भाषा चुनें',
    continue: 'जारी रखें',
    loading: 'लोड हो रहा है...',
    no_data: 'कोई डेटा उपलब्ध नहीं',
    no_prices: 'कोई भाव उपलब्ध नहीं',
    per_kg: 'प्रति किलो',
    rupees: '₹',
    // New Home Page Translations
    quick_actions: 'त्वरित कार्य',
    ai_advisor: 'एआई सलाहकार',
    gov_schemes: 'सरकारी योजनाएं',
    weather_alert: 'मौसम चेतावनी',
    high_temp_warning: 'अधिक तापमान फसलों को प्रभावित कर सकता है',
    updated_now: 'अभी अपडेट किया गया',
    search_crops: 'फसलें खोजें...',
    crop_analysis: 'फसल विश्लेषण',
    analyze_crop_health: 'फसल स्वास्थ्य का विश्लेषण करें',
    financial_aid: 'वित्तीय सहायता',
    loans_subsidies: 'ऋण और सब्सिडी',
    todays_tasks: 'आज के कार्य',
    check_irrigation: 'सिंचाई प्रणाली की जांच करें',
    apply_fertilizer: 'गेहूं के खेत में खाद डालें',
    // Government Schemes Translations
    government_schemes: 'सरकारी योजनाएं',
    ministry_agriculture: 'कृषि एवं किसान कल्याण मंत्रालय',
    updated: 'अपडेट किया गया',
    urgent_notice: 'तत्काल सूचना',
    crop_insurance_deadline: 'फसल बीमा योजना पंजीकरण की अंतिम तिथि',
    apply_before: 'इससे पहले आवेदन करें',
    new: 'नई',
    urgent: 'तत्काल',
    subsidy: 'सब्सिडी',
    loan: 'ऋण',
    insurance: 'बीमा',
    training: 'प्रशिक्षण',
    max_benefit: 'अधिकतम लाभ',
    deadline: 'अंतिम तिथि',
    apply_now: 'अभी आवेदन करें',
    view_all_schemes: 'सभी योजनाएं देखें',
    official_website: 'आधिकारिक वेबसाइट',
    helpline: 'हेल्पलाइन',
    eligibility: 'पात्रता',
    // Header Navigation Translations
    smart_farming: 'स्मार्ट कृषि समाधान',
    farmer_name: 'राजेश कुमार',
    location: 'कर्नाटक, भारत',
    logout: 'लॉगआउट',
    // Voice Input Translations
    start_recording: 'वॉयस रिकॉर्डिंग शुरू करें',
    stop_recording: 'वॉयस रिकॉर्डिंग बंद करें',
    listening: 'सुन रहा है',
    voice_not_supported: 'आपके ब्राउज़र में वॉयस रिकग्निशन समर्थित नहीं है',
    recording_stopped: 'रिकॉर्डिंग बंद',
    speak_now: 'अब बोलें',
    microphone_access_denied: 'कृपया अपने ब्राउज़र में माइक्रोफोन एक्सेस की अनुमति दें और फिर से कोशिश करें',
    allow_microphone: 'माइक्रोफोन एक्सेस की अनुमति दें',
    loading_voice_model: 'वॉयस मॉडल लोड हो रहा है',
    processing: 'प्रोसेसिंग',
    offline_mode: 'ऑफलाइन मोड',
    online_mode: 'ऑनलाइन मोड',
    offline_recording: 'ऑफलाइन रिकॉर्डिंग',
    recording_audio: 'ऑडियो रिकॉर्ड कर रहा है',
    voice_offline_unavailable: 'ऑफलाइन वॉयस इनपुट उपलब्ध नहीं',
    voice_requires_internet: 'वॉयस रिकग्निशन के लिए इंटरनेट कनेक्शन चाहिए',
  },
  kn: {
    app_title: 'ಎಐ ರೈತರು',
    home: 'ಮುಖ್ಯ',
    chatbot: 'ಚಾಟ್‌ಬಾಟ್',
    images: 'ಚಿತ್ರ ಮಾದರಿಗಳು',
    settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    weather: 'ಹವಾಮಾನ',
    temp: 'ತಾಪಮಾನ',
    humidity: 'ಆರ್ದ್ರತೆ',
    condition: 'ಸ್ಥಿತಿ',
    market_prices: 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು',
    chat_ended: 'ಚಾಟ್ ಮುಗಿದಿದೆ',
    end_chat: 'ಚಾಟ್ ಮುಗಿಸಿ',
    send: 'ಕಳುಹಿಸಿ',
    summarizing: 'ಸಾರಾಂಶ ಮಾಡುತ್ತಿದೆ…',
    analyzing: 'ವಿಶ್ಲೇಷಣೆ ಮಾಡುತ್ತಿದೆ…',
    language: 'ಭಾಷೆ',
    choose_language: 'ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ',
    welcome: 'ಎಐ ರೈತರಿಗೆ ಸ್ವಾಗತ',
    select_language: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ',
    continue: 'ಮುಂದುವರಿಸಿ',
    loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    no_data: 'ಯಾವುದೇ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ',
    no_prices: 'ಯಾವುದೇ ಬೆಲೆಗಳು ಲಭ್ಯವಿಲ್ಲ',
    per_kg: 'ಪ್ರತಿ ಕಿಲೋ',
    rupees: '₹',
    // New Home Page Translations
    quick_actions: 'ತ್ವರಿತ ಕ್ರಿಯೆಗಳು',
    ai_advisor: 'ಎಐ ಸಲಹೆಗಾರ',
    gov_schemes: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು',
    weather_alert: 'ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ',
    high_temp_warning: 'ಹೆಚ್ಚಿನ ತಾಪಮಾನ ಬೆಳೆಗಳ ಮೇಲೆ ಪರಿಣಾಮ ಬೀರಬಹುದು',
    updated_now: 'ಈಗ ಅಪ್‌ಡೇಟ್ ಮಾಡಲಾಗಿದೆ',
    search_crops: 'ಬೆಳೆಗಳನ್ನು ಹುಡುಕಿ...',
    crop_analysis: 'ಬೆಳೆ ವಿಶ್ಲೇಷಣೆ',
    analyze_crop_health: 'ಬೆಳೆ ಆರೋಗ್ಯವನ್ನು ವಿಶ್ಲೇಷಿಸಿ',
    financial_aid: 'ಆರ್ಥಿಕ ಸಹಾಯ',
    loans_subsidies: 'ಸಾಲಗಳು ಮತ್ತು ಸಬ್ಸಿಡಿಗಳು',
    todays_tasks: 'ಇಂದಿನ ಕಾರ್ಯಗಳು',
    check_irrigation: 'ನೀರಾವರಿ ವ್ಯವಸ್ಥೆಯನ್ನು ಪರಿಶೀಲಿಸಿ',
    apply_fertilizer: 'ಗೋಧಿ ಹೊಲಕ್ಕೆ ಗೊಬ್ಬರ ಹಾಕಿ',
    // Government Schemes Translations
    government_schemes: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು',
    ministry_agriculture: 'ಕೃಷಿ ಮತ್ತು ರೈತ ಕಲ್ಯಾಣ ಸಚಿವಾಲಯ',
    updated: 'ಅಪ್‌ಡೇಟ್ ಮಾಡಲಾಗಿದೆ',
    urgent_notice: 'ತುರ್ತು ಸೂಚನೆ',
    crop_insurance_deadline: 'ಬೆಳೆ ವಿಮಾ ಯೋಜನೆ ನೋಂದಣಿ ಅಂತಿಮ ದಿನಾಂಕ',
    apply_before: 'ಮೊದಲು ಅರ್ಜಿ ಸಲ್ಲಿಸಿ',
    new: 'ಹೊಸ',
    urgent: 'ತುರ್ತು',
    subsidy: 'ಸಬ್ಸಿಡಿ',
    loan: 'ಸಾಲ',
    insurance: 'ವಿಮೆ',
    training: 'ತರಬೇತಿ',
    max_benefit: 'ಗರಿಷ್ಠ ಲಾಭ',
    deadline: 'ಅಂತಿಮ ದಿನಾಂಕ',
    apply_now: 'ಈಗ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ',
    view_all_schemes: 'ಎಲ್ಲಾ ಯೋಜನೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
    official_website: 'ಅಧಿಕೃತ ವೆಬ್‌ಸೈಟ್',
    helpline: 'ಸಹಾಯವಾಣಿ',
    eligibility: 'ಅರ್ಹತೆ',
    // Header Navigation Translations
    smart_farming: 'ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಪರಿಹಾರಗಳು',
    farmer_name: 'ರಾಜೇಶ್ ಕುಮಾರ್',
    location: 'ಕರ್ನಾಟಕ, ಭಾರತ',
    logout: 'ಲಾಗ್‌ಔಟ್',
    // Voice Input Translations
    start_recording: 'ಧ್ವನಿ ರೆಕಾರ್ಡಿಂಗ್ ಪ್ರಾರಂಭಿಸಿ',
    stop_recording: 'ಧ್ವನಿ ರೆಕಾರ್ಡಿಂಗ್ ನಿಲ್ಲಿಸಿ',
    listening: 'ಕೇಳುತ್ತಿದೆ',
    voice_not_supported: 'ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ',
    recording_stopped: 'ರೆಕಾರ್ಡಿಂಗ್ ನಿಲ್ಲಿದೆ',
    speak_now: 'ಈಗ ಮಾತನಾಡಿ',
    microphone_access_denied: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಮೈಕ್ರೋಫೋನ್ ಪ್ರವೇಶವನ್ನು ಅನುಮತಿಸಿ ಮತ್ತು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
    allow_microphone: 'ಮೈಕ್ರೋಫೋನ್ ಪ್ರವೇಶವನ್ನು ಅನುಮತಿಸಿ',
    loading_voice_model: 'ಧ್ವನಿ ಮಾದರಿ ಲೋಡ್ ಆಗುತ್ತಿದೆ',
    processing: 'ಪ್ರಕ್ರಿಯೆಗೊಳಿಸುತ್ತಿದೆ',
    offline_mode: 'ಆಫ್‌ಲೈನ್ ಮೋಡ್',
    online_mode: 'ಆನ್‌ಲೈನ್ ಮೋಡ್',
    offline_recording: 'ಆಫ್‌ಲೈನ್ ರೆಕಾರ್ಡಿಂಗ್',
    recording_audio: 'ಆಡಿಯೋ ರೆಕಾರ್ಡ್ ಮಾಡುತ್ತಿದೆ',
    voice_offline_unavailable: 'ಆಫ್‌ಲೈನ್ ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಲಭ್ಯವಿಲ್ಲ',
    voice_requires_internet: 'ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆಗೆ ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕ ಅಗತ್ಯ',
  },
}

type I18nContextType = {
  lang: Language
  t: (key: string) => string
  setLang: (l: Language) => void
  isLanguageSelected: boolean
}

const I18nContext = createContext<I18nContextType>({ 
  lang: 'en', 
  t: (k) => k, 
  setLang: () => {}, 
  isLanguageSelected: false 
})

const LANG_KEY = 'settings:language'

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en')
  const [isLanguageSelected, setIsLanguageSelected] = useState(false)

  useEffect(() => {
    // Clear language selection for testing - comment out for production
    localforage.removeItem(LANG_KEY)
    
    localforage.getItem<Language>(LANG_KEY).then((saved) => {
      if (saved) {
        setLangState(saved)
        setIsLanguageSelected(true)
      }
    })
  }, [])

  const setLang = (l: Language) => {
    setLangState(l)
    setIsLanguageSelected(true)
    void localforage.setItem(LANG_KEY, l)
  }

  const t = useMemo(() => {
    const dict = TRANSLATIONS[lang]
    return (key: string) => dict[key] ?? key
  }, [lang])

  const value = useMemo(() => ({ lang, t, setLang, isLanguageSelected }), [lang, t, isLanguageSelected])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}
