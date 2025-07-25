import React, { ReactNode } from "react";
import { RichTextComponents } from "./types";

/**
 * Formats a message with Rich Text components using custom parser
 */
export function formatRichTextMessage(
  message: string,
  locale: string,
  values?: Record<string, any>,
  components?: RichTextComponents
): ReactNode {
  // Always use custom parser for rich text formatting
  const parts = parseMessageToParts(message);
  return formatParts(parts, values, components);
}

interface MessagePart {
  type: "text" | "component" | "variable";
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
        parts.push({ type: "text", content: textContent });
      }
    }

    if (match[3]) {
      // ICU variable like {count}
      parts.push({
        type: "variable",
        content: match[3]
      });
    } else {
      // XML tag like <b>content</b>
      const tagName = match[1];
      const innerContent = match[2];

      parts.push({
        type: "component",
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
      parts.push({ type: "text", content: textContent });
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
      case "text":
        return part.content;

      case "variable":
        const value = values?.[part.content];
        if (value !== undefined) {
          // If the value is a React element, return it directly
          if (React.isValidElement(value)) {
            return React.cloneElement(value, { key: index });
          }
          // Otherwise convert to string
          return String(value);
        }
        return `{${part.content}}`;

      case "component":
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
