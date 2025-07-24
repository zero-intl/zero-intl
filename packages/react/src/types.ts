import { ReactNode } from 'react';

// Rich Text formatting types
export type RichTextComponents = Record<string, (chunks: ReactNode) => ReactNode>;

export interface RichTextMessageDescriptor {
  id: string;
  defaultMessage?: string;
  description?: string;
  values?: Record<string, any>;
  components?: RichTextComponents;
}

// Enhanced translation function interface
export interface TranslationFunction {
  (id: string): string;
  (id: string, options: { defaultMessage?: string } & Record<string, any>): string;
  format: (id: string, defaultMessage?: string, components?: RichTextComponents, values?: Record<string, any>) => ReactNode;
}

export interface NamespacedTranslationFunction {
  (id: string): string;
  (id: string, options: { defaultMessage?: string } & Record<string, any>): string;
  format: (id: string, defaultMessage?: string, components?: RichTextComponents, values?: Record<string, any>) => ReactNode;
}

export interface Message {
  id: string;
  defaultMessage?: string;
  description?: string;
}

export interface MessageDescriptor {
  id: string;
  defaultMessage?: string;
  description?: string;
  values?: Record<string, any>;
}

export interface TranslationRecord {
  translationKey: string;
  translation: string;
  locale: string;
  values?: Record<string, any>;
}

export interface IntlShape {
  locale: string;
  messages: Record<string, string>;
  formatMessage: (descriptor: MessageDescriptor) => string;
  onRender?: (record: TranslationRecord) => ReactNode;
  defaultRichComponents?: RichTextComponents;
}

export interface ZeroIntlProviderProps {
  locale: string;
  messages: Record<string, string>;
  defaultLocale?: string;
  defaultMessages?: Record<string, string>;
  onError?: (error: string) => void;
  onRender?: (record: TranslationRecord) => ReactNode;
  defaultRichComponents?: RichTextComponents;
  children: ReactNode;
}

export interface TProps {
  id: string;
  defaultMessage?: string;
  values?: Record<string, any>;
}
