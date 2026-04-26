import * as React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage, type Language } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();

  const languages = [
    { code: 'en' as Language, name: t('language.english'), flag: '🇺🇸' },
    { code: 'es' as Language, name: t('language.spanish'), flag: '🇪🇸' },
    { code: 'fr' as Language, name: t('language.french'), flag: '🇫🇷' },
    { code: 'it' as Language, name: t('language.italian'), flag: '🇮🇹' },
    { code: 'pt' as Language, name: t('language.portuguese'), flag: '🇵🇹' },
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <Select value={language} onValueChange={setLanguage}>
      <SelectTrigger className="w-[120px] md:w-[160px] h-9">
        <div className="flex items-center space-x-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage?.flag}</span>
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <div className="flex items-center space-x-2">
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
