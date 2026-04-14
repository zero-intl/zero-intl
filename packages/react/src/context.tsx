import React, { createContext, useContext, useMemo } from 'react';
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
}: Readonly<ZeroIntlProviderProps>) {
  const intl = useMemo(
    () => createIntl(locale, messages, defaultLocale, defaultMessages, onError, onRender, defaultRichComponents),
    [locale, messages, defaultLocale, defaultMessages, onError, onRender, defaultRichComponents]
  );

  return (
    <IntlContext.Provider value={intl}>
      {children}
    </IntlContext.Provider>
  );
}

// Default fallback intl shape when no provider is present
const createFallbackIntl = (): IntlShape => ({
  locale: 'en',
  messages: {},
  defaultLocale: 'en',
  defaultMessages: {},
  formatMessage: (descriptor) => {
    console.warn(`[zero-intl] Missing ZeroIntlProvider. Rendering key: "${descriptor.id}"`);
    return descriptor.id;
  },
  onError: undefined,
  onRender: undefined,
  defaultRichComponents: undefined,
});

export function useIntl(): IntlShape {
  const context = useContext(IntlContext);

  if (!context) {
    console.warn('[zero-intl] useIntl must be used within a ZeroIntlProvider. Using fallback.');
    return createFallbackIntl();
  }

  return context;
}

export function useTranslations(): TranslationFunction;
export function useTranslations(namespace: string): NamespacedTranslationFunction;
export function useTranslations(namespace?: string): TranslationFunction | NamespacedTranslationFunction {
  const intl = useIntl();

  return useMemo(() => {
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
      const fullId = namespace ? `${namespace}.${id}` : id;

      return intl.formatMessage({
        id: fullId,
        defaultMessage,
        values
      });
    }

    // Add format method for Rich Text
    t.format = function(id: string, defaultMessage?: string, components?: Record<string, (chunks: React.ReactNode) => React.ReactNode>, values?: Record<string, any>) {
      // Add namespace prefix if provided
      const fullId = namespace ? `${namespace}.${id}` : id;
      const message = intl.messages[fullId]
        || (intl.defaultMessages?.[fullId])
        || defaultMessage
        || fullId;

      // Merge default rich components with provided components
      // Provided components take precedence over default ones
      const mergedComponents = {
        ...intl.defaultRichComponents,
        ...components
      };

      return formatRichTextMessage(message, values, mergedComponents);
    };

    return t;
  }, [intl, namespace]);
}
