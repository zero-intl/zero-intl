import React, { createContext, useContext } from 'react';
import { IntlShape, ZeroIntlProviderProps, TranslationFunction, NamespacedTranslationFunction } from './types';
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
  defaultRichComponents,
  children,
}: ZeroIntlProviderProps) {
  const intl = createIntl(locale, messages, defaultLocale, defaultMessages, onError, onRender, defaultRichComponents);

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

export function useTranslations(): TranslationFunction;
export function useTranslations(namespace: string): NamespacedTranslationFunction;
export function useTranslations(namespace?: string): TranslationFunction | NamespacedTranslationFunction {
  const intl = useIntl();

  function createTranslationFunction(ns?: string) {
    function t(id: string, options?: { defaultMessage?: string } & Record<string, any>): string {
      let defaultMessage: string | undefined;
      let values: Record<string, any> | undefined;

      if (options) {
        // Extract defaultMessage and use the rest as values
        const { defaultMessage: dm, ...restValues } = options;
        defaultMessage = dm;
        values = restValues;
      }

      // Add namespace prefix if provided
      const fullId = ns ? `${ns}.${id}` : id;

      return intl.formatMessage({
        id: fullId,
        defaultMessage,
        values
      });
    }

    // Add format method for Rich Text
    t.format = function(id: string, defaultMessage?: string, components?: Record<string, (chunks: React.ReactNode) => React.ReactNode>, values?: Record<string, any>) {
      // Add namespace prefix if provided
      const fullId = ns ? `${ns}.${id}` : id;
      const message = intl.messages[fullId] || defaultMessage || fullId;

      // Merge default rich components with provided components
      // Provided components take precedence over default ones
      const mergedComponents = {
        ...intl.defaultRichComponents,
        ...components
      };

      return formatRichTextMessage(message, intl.locale, values, mergedComponents);
    };

    return t;
  }

  return createTranslationFunction(namespace);
}
