import React, { createContext, useContext } from 'react';
import { IntlShape, ZeroIntlProviderProps, TranslationFunction } from './types';
import { createIntl } from './utils';
import { formatRichTextMessage } from './richTextFormatter';

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

export function useTranslations(): TranslationFunction {
  const intl = useIntl();

  const t = function(id: string, values?: Record<string, any>, defaultMessage?: string): string {
    return intl.formatMessage({
      id,
      defaultMessage,
      values
    });
  } as TranslationFunction;

  // Add format method for Rich Text
  t.format = function(id: string, defaultMessage?: string, components?: Record<string, (chunks: React.ReactNode) => React.ReactNode>, values?: Record<string, any>) {
    const message = intl.messages[id] || defaultMessage || id;
    return formatRichTextMessage(message, intl.locale, values, components);
  };

  return t;
}
