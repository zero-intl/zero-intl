export interface MessageDescriptor {
  id: string;
  defaultMessage?: string;
  description?: string;
  values?: Record<string, any>;
}

export interface Message {
  id: string;
  defaultMessage?: string;
  description?: string;
}

export interface ICUFormatterOptions {
  locale: string;
  messages: Record<string, string>;
  defaultLocale?: string;
  defaultMessages?: Record<string, string>;
  onError?: (error: string) => void;
}
