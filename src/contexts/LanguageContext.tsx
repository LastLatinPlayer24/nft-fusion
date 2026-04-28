import * as React from 'react';

export type Language = 'en' | 'es' | 'fr' | 'it' | 'pt';

type LanguageProviderProps = {
  children: React.ReactNode;
  defaultLanguage?: Language;
  storageKey?: string;
};

type LanguageProviderState = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

const initialState: LanguageProviderState = {
  language: 'en',
  setLanguage: () => null,
  t: (key: string) => key,
};

const LanguageProviderContext = React.createContext<LanguageProviderState>(initialState);

export function LanguageProvider({
  children,
  defaultLanguage = 'es',
  storageKey = 'app-language',
  ...props
}: LanguageProviderProps) {
  const [language, setLanguage] = React.useState<Language>(
    () => (localStorage.getItem(storageKey) as Language) || defaultLanguage
  );
  const [translations, setTranslations] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const loadTranslations = async () => {
      try {
        const translationModule = await import(`../translations/${language}.ts`);
        setTranslations(translationModule.default);
      } catch (error) {
        console.error(`Failed to load translations for ${language}:`, error);
        // Fallback to English
        if (language !== 'en') {
          const fallbackModule = await import('../translations/en.ts');
          setTranslations(fallbackModule.default);
        }
      }
    };

    loadTranslations();
  }, [language]);

  const t = React.useCallback((key: string): string => {
    return translations[key] || key;
  }, [translations]);

  const value = {
    language,
    setLanguage: (language: Language) => {
      localStorage.setItem(storageKey, language);
      setLanguage(language);
    },
    t,
  };

  return (
    <LanguageProviderContext.Provider {...props} value={value}>
      {children}
    </LanguageProviderContext.Provider>
  );
}

export const useLanguage = () => {
  const context = React.useContext(LanguageProviderContext);

  if (context === undefined)
    throw new Error('useLanguage must be used within a LanguageProvider');

  return context;
};
