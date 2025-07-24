import React, { ReactNode } from 'react';
import IntlMessageFormat from 'intl-messageformat';
import { RichTextComponents } from './types';

/**
 * Formats a message with Rich Text components using FormatJS
 */
export function formatRichTextMessage(
  message: string,
  locale: string,
  values?: Record<string, any>,
  components?: RichTextComponents
): ReactNode {
  if (!components || Object.keys(components).length === 0) {
    // Fallback to regular string formatting if no components
    const formatter = new IntlMessageFormat(message, locale);
    return formatter.format(values) as string;
  }

  // Parse message into parts using a simple XML-like parser
  const parts = parseMessageToParts(message);

  return formatParts(parts, values, components);
}

interface MessagePart {
  type: 'text' | 'component' | 'variable';
  content: string;
  tagName?: string;
  children?: MessagePart[];
}

/**
 * Simple parser for XML-like tags in messages
 * Supports: "Hello <b>world</b>" and "Count: {count}"
 */
function parseMessageToParts(message: string): MessagePart[] {
  const parts: MessagePart[] = [];
  let currentIndex = 0;

  // Regex to match XML tags or ICU variables
  const tagRegex = /<(\w+)>(.*?)<\/\1>|{(\w+)}/g;
  let match;

  while ((match = tagRegex.exec(message)) !== null) {
    // Add text before the match
    if (match.index > currentIndex) {
      const textContent = message.slice(currentIndex, match.index);
      if (textContent) {
        parts.push({ type: 'text', content: textContent });
      }
    }

    if (match[3]) {
      // ICU variable like {count}
      parts.push({
        type: 'variable',
        content: match[3]
      });
    } else {
      // XML tag like <b>content</b>
      const tagName = match[1];
      const innerContent = match[2];

      parts.push({
        type: 'component',
        content: innerContent,
        tagName,
        children: parseMessageToParts(innerContent)
      });
    }

    currentIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (currentIndex < message.length) {
    const textContent = message.slice(currentIndex);
    if (textContent) {
      parts.push({ type: 'text', content: textContent });
    }
  }

  return parts;
}

/**
 * Formats parsed parts into React elements
 */
function formatParts(
  parts: MessagePart[],
  values?: Record<string, any>,
  components?: RichTextComponents
): ReactNode {
  return parts.map((part, index) => {
    switch (part.type) {
      case 'text':
        return part.content;

      case 'variable':
        return values?.[part.content] ?? `{${part.content}}`;

      case 'component':
        if (part.tagName && components?.[part.tagName]) {
          const Component = components[part.tagName];
          const children = part.children
            ? formatParts(part.children, values, components)
            : part.content;
          return React.createElement(React.Fragment, { key: index }, Component(children));
        }
        // Fallback: render as text if component not found
        return part.content;

      default:
        return null;
    }
  });
}
