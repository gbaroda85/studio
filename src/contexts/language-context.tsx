
'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'en' | 'hi' | 'es';

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

const translations = {
  en: {
    welcome: 'Welcome to ShrinkRay',
    english: 'English',
    hindi: 'Hindi',
    spanish: 'Spanish',
    language: 'Language',
    tagline: 'Your all-in-one tool for file manipulation. Fast, private, and easy to use. All processing is done directly in your browser.',
  },
  hi: {
    welcome: 'श्रिंकरे में आपका स्वागत है',
    english: 'अंग्रेज़ी',
    hindi: 'हिंदी',
    spanish: 'स्पेनिश',
    language: 'भाषा',
    tagline: 'फ़ाइल हेरफेर के लिए आपका ऑल-इन-वन टूल। तेज़, निजी और उपयोग में आसान। सभी प्रोसेसिंग सीधे आपके ब्राउज़र में की जाती है।',
  },
  es: {
    welcome: 'Bienvenido a ShrinkRay',
    english: 'Inglés',
    hindi: 'Hindi',
    spanish: 'Español',
    language: 'Idioma',
    tagline: 'Su herramienta todo en uno para la manipulación de archivos. Rápido, privado y fácil de usar. Todo el procesamiento se realiza directamente en su navegador.',
  },
};


const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string) => {
    const langDict = translations[language] as Record<string, string>;
    return langDict[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
