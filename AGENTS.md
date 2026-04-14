# AI Agent Instructions — @zero-intl/react

> This document is designed for AI coding agents (GitHub Copilot, Cursor, Cline, etc.) to correctly use the `@zero-intl/react` internationalization library in React projects.

## Overview

`@zero-intl/react` is a lightweight React i18n library inspired by FormatJS. It uses native browser `Intl` APIs instead of polyfills, resulting in a very small bundle size. Messages are flat `Record<string, string>` objects with ICU MessageFormat syntax support.

**Packages:**
- `@zero-intl/react` — React components, hooks, and provider (depends on `@zero-intl/core`)
- `@zero-intl/core` — Core formatting utilities (ICU plural/select, interpolation)
- `@zero-intl/cli` — CLI tool to extract translation keys from source code

## Installation

```bash
npm install @zero-intl/react
```

`@zero-intl/core` is installed automatically as a dependency. React >=16.8.0 is a peer dependency.

---

## Exports from `@zero-intl/react`

```ts
// Components
export { ZeroIntlProvider } from '@zero-intl/react'; // Context provider — REQUIRED at app root
export { T } from '@zero-intl/react';                // Declarative translation component

// Hooks
export { useIntl } from '@zero-intl/react';           // Low-level hook returning IntlShape
export { useTranslations } from '@zero-intl/react';   // High-level hook returning t() function

// Utility functions (rarely needed directly)
export { formatMessage, interpolateMessage, createIntl, formatICUMessage } from '@zero-intl/react';
export { formatRichTextMessage } from '@zero-intl/react';

// Types
export type {
  Message,
  MessageDescriptor,
  TranslationRecord,
  IntlShape,
  ZeroIntlProviderProps,
  TProps,
  RichTextComponents,
  RichTextMessageDescriptor,
  TranslationFunction,
} from '@zero-intl/react';
```

---

## Message Format

Messages are a flat `Record<string, string>`. Keys use dot-notation namespacing. Values support ICU MessageFormat syntax.

```ts
const messages: Record<string, string> = {
  // Simple text
  'app.title': 'My Application',

  // Variable interpolation — use {variableName}
  'user.greeting': 'Hello, {name}!',

  // ICU plural — use {var, plural, ...rules}
  'items.count': '{count, plural, =0 {No items} =1 {One item} other {# items}}',

  // ICU select — use {var, select, ...rules}
  'user.role': '{role, select, admin {Administrator} editor {Editor} other {User}}',

  // ICU selectordinal — use {var, selectordinal, ...rules}
  'ranking': '{place, selectordinal, one {#st} two {#nd} few {#rd} other {#th}} place',

  // Rich text with XML-like tags — tags map to component functions
  'legal.terms': 'I agree to the <terms>Terms of Service</terms> and <privacy>Privacy Policy</privacy>',

  // Mixed: variables + rich text tags
  'welcome.rich': 'Welcome <b>{name}</b>, you have <em>{count}</em> notifications',
};
```

### Key rules:
- `{variable}` — simple variable interpolation
- `{var, plural, =0 {...} one {...} other {...}}` — ICU plural (uses `Intl.PluralRules`)
- `{var, select, value1 {...} value2 {...} other {...}}` — ICU select
- `<tagName>content</tagName>` — rich text tag, mapped to a React component via `values` or `components`
- `#` inside plural/selectordinal rules is replaced with the numeric value

---

## 1. Provider Setup — `ZeroIntlProvider`

**REQUIRED** — Wrap your application (or a subtree) with `ZeroIntlProvider`. All hooks and components must be descendants of this provider.

```tsx
import { ZeroIntlProvider } from '@zero-intl/react';

function App() {
  return (
    <ZeroIntlProvider
      locale="en"                        // REQUIRED: current locale string (e.g. "en", "pl", "fr-CA")
      messages={messages}                // REQUIRED: Record<string, string> for the current locale
      defaultLocale="en"                 // Optional: fallback locale
      defaultMessages={enMessages}       // Optional: fallback messages (used when key missing in `messages`)
      onError={(error) => {              // Optional: called when a translation key is missing
        console.warn(error);
      }}
      onRender={(record) => (            // Optional: custom rendering wrapper (useful for debugging)
        <span data-i18n-key={record.translationKey}>
          {record.translation}
        </span>
      )}
      defaultRichComponents={{           // Optional: default rich text component mappings
        b: (chunks) => <strong>{chunks}</strong>,
        i: (chunks) => <em>{chunks}</em>,
        link: (chunks) => <a href="#">{chunks}</a>,
      }}
    >
      <YourApp />
    </ZeroIntlProvider>
  );
}
```

### `ZeroIntlProviderProps` interface:

| Prop                   | Type                                         | Required | Description                                                    |
|------------------------|----------------------------------------------|----------|----------------------------------------------------------------|
| `locale`               | `string`                                     | ✅       | Current locale (e.g. `"en"`, `"pl"`)                           |
| `messages`             | `Record<string, string>`                     | ✅       | Translation messages for the current locale                    |
| `children`             | `ReactNode`                                  | ✅       | Child components                                               |
| `defaultLocale`        | `string`                                     | ❌       | Fallback locale when a key is missing                          |
| `defaultMessages`      | `Record<string, string>`                     | ❌       | Fallback messages (usually the primary language)               |
| `onError`              | `(error: string) => void`                    | ❌       | Called when a translation key is completely missing             |
| `onRender`             | `(record: TranslationRecord) => ReactNode`   | ❌       | Custom render wrapper for every translation                    |
| `defaultRichComponents`| `Record<string, (chunks: ReactNode) => ReactNode>` | ❌ | Default rich text tag-to-component mappings                    |

---

## 2. `<T>` Component — Declarative Translations

The `<T>` component renders a translated message. It is the **primary and recommended** way to display translations.

### Basic usage

```tsx
import { T } from '@zero-intl/react';

// Simple text
<T id="app.title" />

// With fallback if key is missing
<T id="app.title" defaultMessage="My Application" />

// Variable interpolation
<T id="user.greeting" values={{ name: 'Alice' }} />

// ICU plural
<T id="items.count" values={{ count: 5 }} />

// ICU select
<T id="user.role" values={{ role: 'admin' }} />
```

### Rich text — XML tags mapped to React components

When a message contains `<tag>content</tag>`, pass component functions in `values`:

```tsx
// Message: 'I agree to the <terms>Terms</terms> and <privacy>Privacy Policy</privacy>'
<T
  id="legal.terms"
  values={{
    terms: (chunks: React.ReactNode) => <a href="/terms">{chunks}</a>,
    privacy: (chunks: React.ReactNode) => <a href="/privacy">{chunks}</a>,
  }}
/>

// Message: 'Click <a>here</a> to learn more'
<T
  id="cta.link"
  values={{
    a: (chunks: React.ReactNode) => (
      <a href="https://example.com" target="_blank" rel="noopener noreferrer">
        {chunks}
      </a>
    ),
  }}
/>

// Message: 'This is <b>bold</b> and <i>italic</i>'
<T
  id="rich.text"
  values={{
    b: (chunks: React.ReactNode) => <strong>{chunks}</strong>,
    i: (chunks: React.ReactNode) => <em>{chunks}</em>,
  }}
/>
```

### Mixed values — primitives + component functions

```tsx
// Message: 'Welcome {name}, visit <link>our website</link> for {count} resources'
<T
  id="welcomeMessage"
  values={{
    name: 'John',           // primitive — simple interpolation
    count: 42,              // primitive — simple interpolation
    link: (chunks: React.ReactNode) => (  // function — rich text component
      <a href="https://example.com">{chunks}</a>
    ),
  }}
/>
```

### JSX elements as values (non-wrapping)

You can also pass a JSX element directly (not as a function). Use `{variable}` syntax (not XML tags) in the message:

```tsx
// Message: 'Powered by {link}'
<T
  id="poweredBy"
  values={{
    link: <a href="https://example.com">Example.com</a>,
  }}
/>
```

### Children render prop

```tsx
<T id="user.greeting" values={{ name: 'Bob' }}>
  {(message) => <strong>{message}</strong>}
</T>
```

### `TProps` interface:

| Prop             | Type                                    | Required | Description                                |
|------------------|-----------------------------------------|----------|--------------------------------------------|
| `id`             | `string`                                | ✅       | Translation key                            |
| `defaultMessage` | `string`                                | ❌       | Fallback if key is missing everywhere      |
| `values`         | `Record<string, any>`                   | ❌       | Interpolation values and/or component functions |
| `children`       | `(message: ReactNode) => ReactNode`     | ❌       | Render prop for custom rendering           |

---

## 3. `useTranslations` Hook — Recommended Imperative API

Returns a `t()` function. This is the **recommended hook** for most use cases.

### Without namespace (global keys)

```tsx
import { useTranslations } from '@zero-intl/react';

function MyComponent() {
  const t = useTranslations();

  return (
    <div>
      {/* Simple translation */}
      <h1>{t('app.title')}</h1>

      {/* With variable interpolation — pass values as second argument */}
      <p>{t('user.greeting', { name: 'Alice' })}</p>

      {/* With fallback message */}
      <p>{t('missing.key', { defaultMessage: 'Fallback text' })}</p>

      {/* ICU plural */}
      <p>{t('items.count', { count: 3 })}</p>
    </div>
  );
}
```

### With namespace

When you pass a namespace string, all keys are automatically prefixed with `namespace.`:

```tsx
function NavigationMenu() {
  const t = useTranslations('navigation');

  return (
    <nav>
      <a href="/">{t('home')}</a>        {/* Resolves to 'navigation.home' */}
      <a href="/about">{t('about')}</a>  {/* Resolves to 'navigation.about' */}
    </nav>
  );
}
```

### Rich text via `t.format()`

The `t` function has a `.format()` method for rich text rendering that returns `ReactNode`:

```tsx
function MyComponent() {
  const t = useTranslations();

  return (
    <div>
      {/* t.format(id, defaultMessage?, components?, values?) */}

      {/* Basic rich text */}
      {t.format('welcome.message')}

      {/* With explicit components */}
      {t.format('user.bio', undefined, {
        link: (chunks) => <a href="/profile">{chunks}</a>,
        b: (chunks) => <strong>{chunks}</strong>,
      })}

      {/* With default message and components */}
      {t.format(
        'cta.action',
        'Click <button>here</button> to continue',
        { button: (chunks) => <button className="cta">{chunks}</button> }
      )}

      {/* With components AND values */}
      {t.format(
        'user.welcome',
        'Hello <b>{name}</b>, you have {count} messages',
        {
          b: (chunks) => <strong>{chunks}</strong>,
        },
        { name: 'Alice', count: 5 }
      )}
    </div>
  );
}
```

### `t.format()` signature:

```ts
t.format(
  id: string,
  defaultMessage?: string,
  components?: Record<string, (chunks: React.ReactNode) => React.ReactNode>,
  values?: Record<string, any>
): ReactNode
```

### `t()` signature:

```ts
// Simple
t(id: string): string

// With options (values + optional defaultMessage)
t(id: string, options: { defaultMessage?: string } & Record<string, any>): string
```

**IMPORTANT:** `t()` returns `string`. `t.format()` returns `ReactNode`. Use `t.format()` when you need rich text (XML tags in messages).

---

## 4. `useIntl` Hook — Low-Level API

Returns the full `IntlShape` object. Use this when you need direct access to locale, messages, or the `formatMessage` method.

```tsx
import { useIntl } from '@zero-intl/react';

function MyComponent() {
  const intl = useIntl();

  // Access current locale
  console.log(intl.locale); // "en"

  // Format a message imperatively
  const greeting = intl.formatMessage({
    id: 'user.greeting',
    defaultMessage: 'Hello, {name}!',
    values: { name: 'World' },
  });

  return <p>{greeting}</p>;
}
```

### `IntlShape` interface:

```ts
interface IntlShape {
  locale: string;
  messages: Record<string, string>;
  defaultLocale?: string;
  defaultMessages?: Record<string, string>;
  formatMessage: (descriptor: MessageDescriptor) => string;
  onError?: (error: string) => void;
  onRender?: (record: TranslationRecord) => ReactNode;
  defaultRichComponents?: RichTextComponents;
}
```

### `MessageDescriptor` interface:

```ts
interface MessageDescriptor {
  id: string;
  defaultMessage?: string;
  description?: string;
  values?: Record<string, any>;
}
```

---

## 5. Fallback Chain

When a translation key is looked up, the following fallback chain is used:

1. **`messages[id]`** — translation in the current locale
2. **`defaultMessages[id]`** — translation in the default locale (if `defaultLocale` and `defaultMessages` are provided)
3. **`defaultMessage` prop** — the `defaultMessage` passed to `<T>`, `t()`, or `formatMessage()`
4. **`id` itself** — the translation key string is rendered as-is
5. **`onError` callback** — called when steps 1–3 all fail (before rendering the key)

---

## 6. Common Patterns

### Language switcher

```tsx
function App() {
  const [locale, setLocale] = useState('en');
  const allMessages = { en: enMessages, pl: plMessages, es: esMessages };

  return (
    <ZeroIntlProvider locale={locale} messages={allMessages[locale]}>
      <button onClick={() => setLocale('en')}>English</button>
      <button onClick={() => setLocale('pl')}>Polski</button>
      <YourApp />
    </ZeroIntlProvider>
  );
}
```

### Debug mode with `onRender`

```tsx
const isDev = process.env.NODE_ENV === 'development';

<ZeroIntlProvider
  locale={locale}
  messages={messages}
  onRender={isDev ? (record) => (
    <span
      data-i18n-key={record.translationKey}
      title={`Key: ${record.translationKey} | Locale: ${record.locale}`}
      style={{ outline: '1px dashed orange' }}
    >
      {record.translation}
    </span>
  ) : undefined}
>
```

### Default rich components at provider level

Define common formatting tags once at the provider level. They are automatically available in all `t.format()` calls and can be overridden per-call.

```tsx
<ZeroIntlProvider
  locale="en"
  messages={messages}
  defaultRichComponents={{
    b: (chunks) => <strong>{chunks}</strong>,
    i: (chunks) => <em>{chunks}</em>,
    link: (chunks) => <a href="#">{chunks}</a>,
    highlight: (chunks) => <mark>{chunks}</mark>,
  }}
>
```

Then in components, no need to pass `b`, `i`, etc. again:

```tsx
const t = useTranslations();
// Message: 'This is <b>bold</b> text' — uses default b component
t.format('some.key');

// Override default for this call only:
t.format('some.key', undefined, {
  b: (chunks) => <span className="custom-bold">{chunks}</span>,
});
```

---

## 7. Translation Key Extraction (CLI)

Use `@zero-intl/cli` to extract translation keys from source code:

```bash
npx @zero-intl/cli extract "src/**/*.{ts,tsx}" --output source-messages.json
```

The CLI extracts `id`, `defaultMessage`, and `description` from:
- `<T id="..." defaultMessage="..." description="..." />` components
- `t('key', { defaultMessage: '...' })` function calls

---

## 8. Do's and Don'ts

### ✅ DO:
- Always wrap your app with `<ZeroIntlProvider>`
- Use flat `Record<string, string>` for messages
- Use dot-notation for key namespacing: `'section.subsection.key'`
- Use `<T>` component for JSX rendering (it handles both plain text and rich text)
- Use `useTranslations()` for the hook-based API
- Use `t.format()` when the message contains `<tag>` rich text
- Pass component functions as `(chunks: React.ReactNode) => React.ReactNode` for rich text
- Provide `defaultMessage` for important user-facing strings

### ❌ DON'T:
- Don't use `useIntl` or `<T>` outside of a `<ZeroIntlProvider>` (it will show a console warning and return fallback)
- Don't nest messages — keep them as flat `Record<string, string>`
- Don't use `t()` (returns `string`) when you need rich text with React components — use `t.format()` instead
- Don't use HTML in message strings — use XML-like tags (e.g. `<b>text</b>`) that map to React components
- Don't forget to pass `values` when the message contains `{variable}` placeholders

---

## 9. TypeScript Types Quick Reference

```ts
// Message record (what you pass to the provider)
type Messages = Record<string, string>;

// Rich text component mapping
type RichTextComponents = Record<string, (chunks: ReactNode) => ReactNode>;

// Translation record (passed to onRender callback)
interface TranslationRecord {
  translationKey: string;
  translation: string;
  locale: string;
  values?: Record<string, any>;
}

// T component props
interface TProps {
  id: string;
  defaultMessage?: string;
  values?: Record<string, any>;
  children?: (message: ReactNode) => ReactNode;
}

// Provider props
interface ZeroIntlProviderProps {
  locale: string;
  messages: Record<string, string>;
  defaultLocale?: string;
  defaultMessages?: Record<string, string>;
  onError?: (error: string) => void;
  onRender?: (record: TranslationRecord) => ReactNode;
  defaultRichComponents?: RichTextComponents;
  children: ReactNode;
}
```

---

## 10. Complete Example

```tsx
import React, { useState } from 'react';
import { ZeroIntlProvider, T, useTranslations } from '@zero-intl/react';

const en = {
  'app.title': 'My App',
  'user.greeting': 'Hello, {name}!',
  'items.count': '{count, plural, =0 {No items} =1 {One item} other {# items}}',
  'legal.terms': 'I agree to the <terms>Terms</terms> and <privacy>Privacy Policy</privacy>',
  'cta.link': 'Visit <link>our website</link> for more info',
};

const pl = {
  'app.title': 'Moja Aplikacja',
  'user.greeting': 'Cześć, {name}!',
  'items.count': '{count, plural, =0 {Brak} =1 {Jeden element} few {# elementy} many {# elementów} other {# elementów}}',
  'legal.terms': 'Akceptuję <terms>Regulamin</terms> i <privacy>Politykę Prywatności</privacy>',
  'cta.link': 'Odwiedź <link>naszą stronę</link> aby dowiedzieć się więcej',
};

function Content() {
  const t = useTranslations();

  return (
    <div>
      {/* Simple */}
      <h1>{t('app.title')}</h1>

      {/* Variable interpolation */}
      <p>{t('user.greeting', { name: 'Alice' })}</p>

      {/* Plural */}
      <p>{t('items.count', { count: 5 })}</p>

      {/* Rich text via <T> component */}
      <p>
        <T
          id="legal.terms"
          values={{
            terms: (chunks: React.ReactNode) => <a href="/terms">{chunks}</a>,
            privacy: (chunks: React.ReactNode) => <a href="/privacy">{chunks}</a>,
          }}
        />
      </p>

      {/* Rich text via t.format() */}
      <p>
        {t.format('cta.link', undefined, {
          link: (chunks) => <a href="https://example.com">{chunks}</a>,
        })}
      </p>
    </div>
  );
}

export default function App() {
  const [locale, setLocale] = useState<'en' | 'pl'>('en');
  const messages = locale === 'en' ? en : pl;

  return (
    <ZeroIntlProvider
      locale={locale}
      messages={messages}
      defaultLocale="en"
      defaultMessages={en}
      onError={(error) => console.warn('i18n:', error)}
    >
      <button onClick={() => setLocale('en')}>EN</button>
      <button onClick={() => setLocale('pl')}>PL</button>
      <Content />
    </ZeroIntlProvider>
  );
}
```
