import { IntlShape, MessageDescriptor, TranslationRecord } from './types';
import { ReactNode } from 'react';

// ICU message formatting using native browser Intl API
export function formatICUMessage(
  message: string,
  values: Record<string, any> = {},
  locale: string
): string {
  let result = message;
  let hasChanged = true;

  // Keep processing until no more ICU patterns are found (handle nested ICU)
  while (hasChanged) {
    hasChanged = false;
    const newResult = processICUPatterns(result, values, locale);
    if (newResult !== result) {
      result = newResult;
      hasChanged = true;
    }
  }

  // Handle simple variable interpolation: {name}
  result = result.replace(/\{(\w+)\}/g, (match, key) => {
    const value = values[key];
    return value !== undefined ? String(value) : match;
  });

  return result;
}

function processICUPatterns(message: string, values: Record<string, any>, locale: string): string {
  let result = '';
  let i = 0;

  while (i < message.length) {
    if (message[i] === '{') {
      // Try to parse an ICU pattern starting here
      const icuResult = parseICUAtPosition(message, i, values, locale);
      if (icuResult.success) {
        result += icuResult.replacement;
        i = icuResult.endIndex + 1;
      } else {
        result += message[i];
        i++;
      }
    } else {
      result += message[i];
      i++;
    }
  }

  return result;
}

function parseICUAtPosition(
  message: string,
  startIndex: number,
  values: Record<string, any>,
  locale: string
): { success: boolean; replacement: string; endIndex: number } {
  let i = startIndex + 1; // Skip opening brace

  // Read variable name
  let varName = '';
  while (i < message.length && /\w/.test(message[i])) {
    varName += message[i];
    i++;
  }

  // Skip whitespace
  while (i < message.length && /\s/.test(message[i])) i++;

  // Check for comma (ICU format)
  if (i >= message.length || message[i] !== ',') {
    return { success: false, replacement: '', endIndex: startIndex };
  }
  i++; // Skip comma

  // Skip whitespace
  while (i < message.length && /\s/.test(message[i])) i++;

  // Read ICU type (plural, select, selectordinal)
  let icuType = '';
  while (i < message.length && /\w/.test(message[i])) {
    icuType += message[i];
    i++;
  }

  if (!['plural', 'select', 'selectordinal'].includes(icuType)) {
    return { success: false, replacement: '', endIndex: startIndex };
  }

  // Skip whitespace and comma
  while (i < message.length && /\s,/.test(message[i])) i++;

  // Parse rules until closing brace
  const { rules, endIndex } = parseICURulesAtPosition(message, i);
  if (endIndex === -1) {
    return { success: false, replacement: '', endIndex: startIndex };
  }

  // Process the ICU pattern
  const value = values[varName];
  if (value === undefined) {
    return { success: false, replacement: '', endIndex: startIndex };
  }

  let replacement = '';
  switch (icuType) {
    case 'plural':
      replacement = formatPlural(Number(value), rules, locale);
      break;
    case 'select':
      replacement = formatSelect(String(value), rules);
      break;
    case 'selectordinal':
      replacement = formatSelectOrdinal(Number(value), rules, locale);
      break;
  }

  return { success: true, replacement, endIndex };
}

function parseICURulesAtPosition(message: string, startIndex: number): { rules: Record<string, string>; endIndex: number } {
  const rules: Record<string, string> = {};
  let i = startIndex;

  while (i < message.length) {
    // Skip whitespace
    while (i < message.length && /\s/.test(message[i])) i++;

    if (i >= message.length) break;

    // If we hit a closing brace, we're done
    if (message[i] === '}') {
      return { rules, endIndex: i };
    }

    // Read rule name
    let ruleName = '';
    while (i < message.length && message[i] !== '{' && !/\s/.test(message[i]) && message[i] !== '}') {
      ruleName += message[i];
      i++;
    }

    // Skip whitespace
    while (i < message.length && /\s/.test(message[i])) i++;

    // Expect opening brace for rule content
    if (i >= message.length || message[i] !== '{') {
      if (message[i] === '}') {
        return { rules, endIndex: i };
      }
      continue;
    }
    i++; // Skip opening brace

    // Read rule content with proper brace matching
    let ruleContent = '';
    let braceDepth = 1;
    while (i < message.length && braceDepth > 0) {
      if (message[i] === '{') {
        braceDepth++;
        ruleContent += message[i];
      } else if (message[i] === '}') {
        braceDepth--;
        if (braceDepth > 0) {
          ruleContent += message[i];
        }
      } else {
        ruleContent += message[i];
      }
      i++;
    }

    if (ruleName) {
      rules[ruleName] = ruleContent;
    }
  }

  return { rules, endIndex: -1 };
}

function formatPlural(value: number, rules: Record<string, string>, locale: string): string {
  // Check for exact matches first (=0, =1, etc.)
  const exactKey = `=${value}`;
  if (rules[exactKey]) {
    return rules[exactKey].replace(/#/g, String(value));
  }

  // Use Intl.PluralRules for locale-aware pluralization
  const pluralRules = new Intl.PluralRules(locale);
  const rule = pluralRules.select(value);

  if (rules[rule]) {
    return rules[rule].replace(/#/g, String(value));
  }

  // Fallback to 'other'
  if (rules.other) {
    return rules.other.replace(/#/g, String(value));
  }

  return String(value);
}

function formatSelect(value: string, rules: Record<string, string>): string {
  if (rules[value]) {
    return rules[value];
  }

  // Fallback to 'other'
  return rules.other || String(value);
}

function formatSelectOrdinal(value: number, rules: Record<string, string>, locale: string): string {
  // Check for exact matches first (=1, =2, etc.)
  const exactKey = `=${value}`;
  if (rules[exactKey]) {
    return rules[exactKey].replace(/#/g, String(value));
  }

  // Use Intl.PluralRules with ordinal type
  const ordinalRules = new Intl.PluralRules(locale, { type: 'ordinal' });
  const rule = ordinalRules.select(value);

  if (rules[rule]) {
    return rules[rule].replace(/#/g, String(value));
  }

  // Fallback to 'other'
  if (rules.other) {
    return rules.other.replace(/#/g, String(value));
  }

  return String(value);
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
