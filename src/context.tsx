import React, { createContext, useContext } from 'react';
import { IntlShape, ZeroIntlProviderProps } from './types';
import { createIntl } from './utils';

const IntlContext = createContext<IntlShape | null>(null);

export function ZeroIntlProvider({
  locale,
  messages,
  defaultLocale,
  defaultMessages,
  onError,
  onRender,
  children,
}: ZeroIntlProviderProps) {
  const intl = createIntl(locale, messages, defaultLocale, defaultMessages, onError, onRender);

  return (
    <IntlContext.Provider value={intl}>
      {children}
    </IntlContext.Provider>
  );
}

export function useIntl(): IntlShape {
  const context = useContext(IntlContext);

  if (!context) {
    throw new Error('useIntl must be used within a ZeroIntlProvider');
  }

  return context;
}
