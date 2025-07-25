import React from "react";
import { useIntl, useTranslations } from "./context";
import { TProps } from "./types";
import { formatRichTextMessage } from "./richTextFormatter";

export function T({ id, defaultMessage, values, children }: TProps) {
  const t = useTranslations();
  const intl = useIntl();

  // Check if values contains React components (functions or JSX elements)
  const hasRichTextValues = values && Object.values(values).some(value =>
    typeof value === 'function' || React.isValidElement(value)
  );

  let formattedMessage: React.ReactNode;

  if (hasRichTextValues) {
    // Use rich text formatting for React components
    const message = intl.messages[id] || defaultMessage || id;

    // Convert JSX elements to component functions for consistency
    const components: Record<string, (chunks: React.ReactNode) => React.ReactNode> = {};
    const allValues: Record<string, any> = { ...values }; // Keep all values including JSX elements

    if (values) {
      Object.entries(values).forEach(([key, value]) => {
        if (typeof value === 'function') {
          components[key] = value;
        } else if (React.isValidElement(value)) {
          components[key] = () => value;
        }
        // Keep the original value in allValues for variable substitution
      });
    }

    formattedMessage = formatRichTextMessage(message, intl.locale, allValues, components);
  } else {
    // Use regular string formatting
    formattedMessage = defaultMessage || values
      ? t(id, { defaultMessage, ...values })
      : t(id);
  }

  // Handle children render prop
  if (typeof children === 'function') {
    formattedMessage = children(formattedMessage);
  }

  if (intl.onRender) {
    const translationRecord = {
      translationKey: id,
      translation: typeof formattedMessage === 'string' ? formattedMessage : id,
      locale: intl.locale,
      values
    };
    return <>{intl.onRender(translationRecord)}</>;
  }

  return <>{formattedMessage}</>;
}
