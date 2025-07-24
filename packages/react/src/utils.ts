import { IntlShape, MessageDescriptor, RichTextComponents, TranslationRecord } from "./types";
import { ReactNode } from "react";
import { formatICUMessage, formatMessage as coreFormatMessage, interpolateMessage } from "@zero-intl/core";

// Re-export core utilities for backward compatibility
export { formatICUMessage, interpolateMessage };

export function formatMessage(
  messages: Record<string, string>,
  descriptor: MessageDescriptor,
  locale: string,
  defaultLocale?: string,
  defaultMessages?: Record<string, string>,
  onError?: (error: string) => void
): string {
  return coreFormatMessage(messages, descriptor, locale, defaultLocale, defaultMessages, onError);
}

export function createIntl(
  locale: string,
  messages: Record<string, string>,
  defaultLocale?: string,
  defaultMessages?: Record<string, string>,
  onError?: (error: string) => void,
  onRender?: (record: TranslationRecord) => ReactNode,
  defaultRichComponents?: RichTextComponents
): IntlShape {
  return {
    locale,
    messages,
    formatMessage: (descriptor: MessageDescriptor) =>
      formatMessage(messages, descriptor, locale, defaultLocale, defaultMessages, onError),
    onRender,
    defaultRichComponents
  };
}
