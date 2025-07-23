import { IntlShape, MessageDescriptor, TranslationRecord } from './types';
import { ReactNode } from 'react';

// ICU message formatting using native browser Intl API
export function formatICUMessage(
  message: string,
  values: Record<string, any> = {},
  locale: string
): string {
  // Handle plural formatting: {count, plural, =0 {no items} one {# item} other {# items}}
  message = message.replace(
    /\{(\w+),\s*plural,\s*(.+?)\}/g,
    (match, key, rules) => {
      const value = values[key];
      if (value === undefined) return match;

      const pluralRules = new Intl.PluralRules(locale);
      const rule = pluralRules.select(Number(value));

      // Parse rules like "=0 {no items} one {# item} other {# items}"
      const rulePattern = /(?:(=\d+|zero|one|two|few|many|other)\s*\{([^}]*)\})/g;
      let ruleMatch;
      let result = '';

      // First check for exact matches (=0, =1, etc.)
      const exactPattern = new RegExp(`=?${value}\\s*\\{([^}]*)\\}`, 'i');
      const exactMatch = rules.match(exactPattern);
      if (exactMatch) {
        result = exactMatch[1];
      } else {
        // Check for plural rule matches
        while ((ruleMatch = rulePattern.exec(rules)) !== null) {
          const [, ruleName, ruleText] = ruleMatch;
          if (ruleName === rule || (ruleName === 'other' && !result)) {
            result = ruleText;
            if (ruleName === rule) break;
          }
        }
      }

      // Replace # with the actual number
      return result.replace(/#/g, String(value));
    }
  );

  // Handle select formatting: {gender, select, male {he} female {she} other {they}}
  message = message.replace(
    /\{(\w+),\s*select,\s*(.+?)\}/g,
    (match, key, rules) => {
      const value = values[key];
      if (value === undefined) return match;

      // Parse select rules
      const rulePattern = /(\w+)\s*\{([^}]*)\}/g;
      let ruleMatch;
      let result = '';

      while ((ruleMatch = rulePattern.exec(rules)) !== null) {
        const [, option, text] = ruleMatch;
        if (option === String(value) || (option === 'other' && !result)) {
          result = text;
          if (option === String(value)) break;
        }
      }

      return result;
    }
  );

  // Handle selectordinal formatting: {rank, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}
  message = message.replace(
    /\{(\w+),\s*selectordinal,\s*(.+?)\}/g,
    (match, key, rules) => {
      const value = values[key];
      if (value === undefined) return match;

      const ordinalRules = new Intl.PluralRules(locale, { type: 'ordinal' });
      const rule = ordinalRules.select(Number(value));

      // Parse ordinal rules
      const rulePattern = /(?:(=\d+|zero|one|two|few|many|other)\s*\{([^}]*)\})/g;
      let ruleMatch;
      let result = '';

      // First check for exact matches
      const exactPattern = new RegExp(`=?${value}\\s*\\{([^}]*)\\}`, 'i');
      const exactMatch = rules.match(exactPattern);
      if (exactMatch) {
        result = exactMatch[1];
      } else {
        // Check for ordinal rule matches
        while ((ruleMatch = rulePattern.exec(rules)) !== null) {
          const [, ruleName, ruleText] = ruleMatch;
          if (ruleName === rule || (ruleName === 'other' && !result)) {
            result = ruleText;
            if (ruleName === rule) break;
          }
        }
      }

      // Replace # with the actual number
      return result.replace(/#/g, String(value));
    }
  );

  // Handle simple variable interpolation: {name}
  message = message.replace(/\{(\w+)\}/g, (match, key) => {
    const value = values[key];
    return value !== undefined ? String(value) : match;
  });

  return message;
}

// Legacy function for backward compatibility
export function interpolateMessage(
  message: string,
  values?: Record<string, any>
): string {
  if (!values) return message;

  return message.replace(/\{(\w+)\}/g, (match, key) => {
    const value = values[key];
    return value !== undefined ? String(value) : match;
  });
}

export function formatMessage(
  messages: Record<string, string>,
  descriptor: MessageDescriptor,
  locale: string,
  defaultLocale?: string,
  defaultMessages?: Record<string, string>,
  onError?: (error: string) => void
): string {
  const { id, defaultMessage, values } = descriptor;

  let message = messages[id];

  if (!message) {
    // Try to fallback to default locale if provided
    if (defaultLocale && defaultMessages && locale !== defaultLocale) {
      message = defaultMessages[id];
    }

    // If still no message, use defaultMessage prop
    if (!message && defaultMessage) {
      message = defaultMessage;
    }

    // If still no message, log error and return key
    if (!message) {
      const errorMsg = `Missing message for key: ${id} in locale: ${locale}${
        defaultLocale ? ` and default locale: ${defaultLocale}` : ''
      }`;
      if (onError) {
        onError(errorMsg);
      }
      return id; // Fallback to key
    }
  }

  // Use ICU message formatting instead of simple interpolation
  return formatICUMessage(message, values, locale);
}

export function createIntl(
  locale: string,
  messages: Record<string, string>,
  defaultLocale?: string,
  defaultMessages?: Record<string, string>,
  onError?: (error: string) => void,
  onRender?: (record: TranslationRecord) => ReactNode
): IntlShape {
  return {
    locale,
    messages,
    formatMessage: (descriptor: MessageDescriptor) =>
      formatMessage(messages, descriptor, locale, defaultLocale, defaultMessages, onError),
    onRender,
  };
}
