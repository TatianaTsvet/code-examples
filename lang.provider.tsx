import React, { useState, useEffect } from 'react';
import { IntlProvider } from 'react-intl';

import { LangContext } from '@ui-kit/lib/locales';
import { en, ru, es } from 'shared/lang/messages';
import localStorage from '@ui-kit/lib/local.storage';
import DateFormatterServiceProvider from './date.formatter.service.provider';

export const LangProvider = ({ children }) => {
  const [defaultLang] = useState(() => localStorage.getItem('localeLang') ?? navigator.language);
  const [lang, setLang] = useState(defaultLang.substring(0, 2));

  useEffect(() => {
    localStorage.setItem('localeLang', lang);
  }, [lang]);

  let messages;
  switch (lang) {
    case 'ru':
      messages = ru;
      break;
    case 'es':
      messages = es;
      break;
    case 'en':
    default:
      messages = en;
      break;
  }

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      <IntlProvider locale={lang} defaultLocale={lang} messages={messages}>
        <DateFormatterServiceProvider>{children}</DateFormatterServiceProvider>
      </IntlProvider>
    </LangContext.Provider>
  );
};
LangProvider.displayName = 'LangProvider';
