"use client";
import React, { createContext, useContext, useState, useEffect, useMemo } from "react";

export const SUPPORTED_LANGUAGES = [
  "English",
  "Tamil",
  "Telugu",
  "Hindi",
  "Malayalam",
  "Kannada"
];

const TRANSLATIONS = {
  English: {
    dashboard: "Dashboard",
    calendar: "Calendar",
    posts: "Posts",
    campaigns: "Campaigns",
    accounts: "Accounts",
    analytics: "Analytics",
    reports: "Reports",
    notifications: "Notifications",
    add_post: "Add Post",
    dark_mode: "Dark Mode",
    language: "Language",
    logout: "Log Out",
    welcome_back: "Welcome Back",
    publishing_calendar: "Publishing Calendar",
    search_placeholder: "Search...",
    total_posts: "Total Posts",
    scheduled_posts: "Scheduled Posts",
    active_campaigns: "Active Campaigns",
    connected_accounts: "Connected Accounts"
  },
  Tamil: {
    dashboard: "முகப்புப்பலகை",
    calendar: "நாட்காட்டி",
    posts: "பதிவுகள்",
    campaigns: "பிரச்சாரங்கள்",
    accounts: "கணக்குகள்",
    analytics: "பகுப்பாய்வு",
    reports: "அறிக்கைகள்",
    notifications: "அறிவிப்புகள்",
    add_post: "புதிய பதிவு",
    dark_mode: "இருண்ட பயன்முறை",
    language: "மொழி",
    logout: "வெளியேறு",
    welcome_back: "மீண்டும் வருக",
    publishing_calendar: "வெளியீட்டு நாட்காட்டி",
    search_placeholder: "தேடு...",
    total_posts: "மொத்த பதிவுகள்",
    scheduled_posts: "திட்டமிடப்பட்ட பதிவுகள்",
    active_campaigns: "செயலில் உள்ள பிரச்சாரங்கள்",
    connected_accounts: "இணைக்கப்பட்ட கணக்குகள்"
  },
  Telugu: {
    dashboard: "డ్యాష్‌బోర్డ్",
    calendar: "క్యాలెండర్",
    posts: "పోస్ట్‌లు",
    campaigns: "ప్రచారాలు",
    accounts: "ఖాతాలు",
    analytics: "విశ్లేషణలు",
    reports: "నివేదికలు",
    notifications: "నోటిఫికేషన్‌లు",
    add_post: "పోస్ట్ జోడించండి",
    dark_mode: "డార్క్ మోడ్",
    language: "భాష",
    logout: "లాగ్ అవుట్",
    welcome_back: "తిరిగి స్వాగతం",
    publishing_calendar: "ప్రచురణ క్యాలెండర్",
    search_placeholder: "శోధించండి...",
    total_posts: "మొత్తం పోస్ట్‌లు",
    scheduled_posts: "షెడ్యూల్ చేసిన పోస్ట్‌లు",
    active_campaigns: "క్రియాశీల ప్రచారాలు",
    connected_accounts: "కనెక్ట్ చేయబడిన ఖాతాలు"
  },
  Hindi: {
    dashboard: "डैशबोर्ड",
    calendar: "कैलेंडर",
    posts: "पोस्ट",
    campaigns: "अभियान",
    accounts: "खाते",
    analytics: "एनालिटिक्स",
    reports: "रिपोर्ट्स",
    notifications: "सूचनाएं",
    add_post: "पोस्ट जोड़ें",
    dark_mode: "डार्क मोड",
    language: "भाषा",
    logout: "लॉग आउट",
    welcome_back: "वापसी पर स्वागत है",
    publishing_calendar: "प्रकाशन कैलेंडर",
    search_placeholder: "खोजें...",
    total_posts: "कुल पोस्ट",
    scheduled_posts: "शेड्यूल किए गए पोस्ट",
    active_campaigns: "सक्रिय अभियान",
    connected_accounts: "जुड़े हुए खाते"
  },
  Malayalam: {
    dashboard: "ഡാഷ്‌ബോർഡ്",
    calendar: "കലണ്ടർ",
    posts: "പോസ്റ്റുകൾ",
    campaigns: "പ്രചാരണങ്ങൾ",
    accounts: "അക്കൗണ്ടുകൾ",
    analytics: "വിശകലനം",
    reports: "റിപ്പോർട്ടുകൾ",
    notifications: "അറിയിപ്പുകൾ",
    add_post: "പോസ്റ്റ് ചേർക്കുക",
    dark_mode: "ഡാർക്ക് മോഡ്",
    language: "ഭാഷ",
    logout: "ലോഗ് ഔട്ട്",
    welcome_back: "തിരികെ സ്വാഗതം",
    publishing_calendar: "പ്രസിദ്ധീകരണ കലണ്ടർ",
    search_placeholder: "തിരയുക...",
    total_posts: "മൊത്തം പോസ്റ്റുകൾ",
    scheduled_posts: "ഷെഡ്യൂൾ ചെയ്ത പോസ്റ്റുകൾ",
    active_campaigns: "സജീവ പ്രചാരണങ്ങൾ",
    connected_accounts: "ബന്ധിപ്പിച്ച അക്കൗണ്ടുകൾ"
  },
  Kannada: {
    dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    calendar: "ಕ್ಯಾಲೆಂಡರ್",
    posts: "ಪೋಸ್ಟ್‌ಗಳು",
    campaigns: "ಪ್ರಚಾರಗಳು",
    accounts: "ಖಾತೆಗಳು",
    analytics: "ವಿಶ್ಲೇಷಣೆ",
    reports: "ವರದಿಗಳು",
    notifications: "ಅಧಿಸೂಚನೆಗಳು",
    add_post: "ಪೋಸ್ಟ್ ಸೇರಿಸಿ",
    dark_mode: "ಡಾರ್ಕ್ ಮೋಡ್",
    language: "ಭಾಷೆ",
    logout: "ಲಾಗ್ ಔಟ್",
    welcome_back: "ಮರಳಿ ಸುಸ್ವಾಗತ",
    publishing_calendar: "ಪ್ರಕಟಣೆ ಕ್ಯಾಲೆಂಡರ್",
    search_placeholder: "ಹುಡುಕಿ...",
    total_posts: "ಒಟ್ಟು ಪೋಸ್ಟ್‌ಗಳು",
    scheduled_posts: "ನಿಗದಿತ ಪೋಸ್ಟ್‌ಗಳು",
    active_campaigns: "ಸಕ್ರಿಯ ಪ್ರಚಾರಗಳು",
    connected_accounts: "ಸಂಪರ್ಕಿತ ಖಾತೆಗಳು"
  }
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState("English");

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("app_language");
      if (savedLang && TRANSLATIONS[savedLang]) {
        setLanguageState(savedLang);
      }
    } catch (e) {
      console.error("Language load error:", e);
    }
  }, []);

  const setLanguage = (newLang) => {
    if (TRANSLATIONS[newLang]) {
      setLanguageState(newLang);
      try {
        localStorage.setItem("app_language", newLang);
      } catch (e) {}
    }
  };

  /**
   * Helper to translate key based on active language
   */
  const t = (key, fallback) => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.English;
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    const defaultDict = TRANSLATIONS.English;
    if (defaultDict && defaultDict[key]) {
      return defaultDict[key];
    }
    return fallback || key;
  };

  const contextValue = useMemo(() => {
    return {
      language,
      setLanguage,
      t,
      supportedLanguages: SUPPORTED_LANGUAGES
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: "English",
      setLanguage: () => {},
      t: (key, fallback) => fallback || key,
      supportedLanguages: SUPPORTED_LANGUAGES
    };
  }
  return context;
}
