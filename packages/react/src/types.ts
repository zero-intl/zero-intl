import { ReactNode } from 'react';

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
}

export interface ZeroIntlProviderProps {
  locale: string;
  messages: Record<string, string>;
  defaultLocale?: string;
  defaultMessages?: Record<string, string>;
  onError?: (error: string) => void;
  onRender?: (record: TranslationRecord) => ReactNode;
  children: ReactNode;
}

export interface TProps {
  id: string;
  defaultMessage?: string;
  values?: Record<string, any>;
  children?: (formattedMessage: string) => ReactNode;
}
