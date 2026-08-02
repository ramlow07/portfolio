import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', label: 'EN', flag: '🇺🇸' },
    { code: 'ptbr', label: 'PT', flag: '🇧🇷' },
    { code: 'de', label: 'DE', flag: '🇩🇪' },
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-switcher">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`lang-btn ${i18n.language === lang.code ? 'active' : ''}`}
          aria-label={`Switch to ${lang.label}`}
        >
          <span className="lang-flag">{lang.flag}</span>
          <span className="lang-label">{lang.label}</span>
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
