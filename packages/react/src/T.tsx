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

  // Check if the message contains XML-like tags (e.g., <a>)
  const message = intl.messages[id] || defaultMessage || id;
  const containsXmlTags = /<([a-zA-Z0-9_]+)>.*?<\/[a-zA-Z0-9_]+>/.test(message);

  let formattedMessage: React.ReactNode;

  if (hasRichTextValues || containsXmlTags) {
    // Use rich text formatting for React components or if message contains tags
    // Convert JSX elements to component functions for consistency
    const components: Record<string, (chunks: React.ReactNode) => React.ReactNode> = {};
    const allValues: Record<string, any> = { ...values };

    if (values) {
      Object.entries(values).forEach(([key, value]) => {
        if (typeof value === 'function') {
          components[key] = value;
        } else if (React.isValidElement(value)) {
          // If the value is a React element, treat it as a function returning the element
          components[key] = () => value;
        }
      });
    }

    // If a tag is present in the message but not in values, provide a fallback that renders its children as plain text
    const tagRegex = /<([a-zA-Z0-9_]+)>.*?<\/[a-zA-Z0-9_]+>/g;
    let match;
    const tagNames = new Set<string>();
    while ((match = tagRegex.exec(message)) !== null) {
      tagNames.add(match[1]);
    }
    tagNames.forEach(tag => {
      if (!components[tag]) {
        components[tag] = (chunks: React.ReactNode) => <React.Fragment>{chunks}</React.Fragment>;
      }
    });

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
