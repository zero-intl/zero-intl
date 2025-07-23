# Zero Intl

A lightweight React internationalization library inspired by FormatJS and next-intl.

## Installation

```bash
npm install zero-intl
```

## Usage

### 1. Setup the Provider

Wrap your app with `ZeroIntlProvider`:

```tsx
import React from 'react';
import { ZeroIntlProvider } from 'zero-intl';

const messages = {
  'welcome': 'Welcome to our app!',
  'hello': 'Hello, {name}!',
  'itemCount': 'You have {count} items in your cart',
};

const defaultMessages = {
  'welcome': 'Welcome!',
  'hello': 'Hello, {name}!',
  'itemCount': 'You have {count} items',
  'missing.key': 'This key exists in default locale',
};

function App() {
  return (
    <ZeroIntlProvider 
      locale="es" 
      messages={messages}
      defaultLocale="en"
      defaultMessages={defaultMessages}
      onError={(error) => console.error(error)}
    >
      <YourAppContent />
    </ZeroIntlProvider>
  );
}
```

**Default Locale Fallback**: If a translation key is missing in the current locale, the library will automatically try to find it in the `defaultMessages` (if `defaultLocale` is provided). This ensures users always see some text instead of raw translation keys.

### 2. Custom Rendering with onRender

You can customize how translations are rendered by providing an `onRender` function to the provider. This is useful for debugging, adding visual indicators, or wrapping translations in custom elements:

```tsx
import React from 'react';
import { ZeroIntlProvider, TranslationRecord } from 'zero-intl';

function App() {
  const handleRender = (record: TranslationRecord) => {
    // Custom rendering for debugging - shows translation keys
    return (
      <span 
        data-key={record.translationKey}
        data-locale={record.locale}
        title={`Key: ${record.translationKey}`}
        style={{ outline: '1px dashed blue' }}
      >
        {record.translation}
      </span>
    );
  };

  return (
    <ZeroIntlProvider 
      locale="en" 
      messages={messages}
      onRender={handleRender}
      onError={(error) => console.error(error)}
    >
      <YourAppContent />
    </ZeroIntlProvider>
  );
}
```

The `onRender` function receives a `TranslationRecord` object with:
- `translationKey: string` - The original translation key
- `translation: string` - The formatted translation text
- `locale: string` - The current locale
- `values?: Record<string, any>` - The interpolation values (if any)

### 3. Using the useIntl Hook

Use the `useIntl` hook to format messages programmatically:

```tsx
import React from 'react';
import { useIntl } from 'zero-intl';

function MyComponent() {
  const intl = useIntl();

  return (
    <div>
      <h1>{intl.formatMessage({ id: 'welcome' })}</h1>
      <p>{intl.formatMessage({ 
        id: 'hello', 
        values: { name: 'John' } 
      })}</p>
      <p>{intl.formatMessage({ 
        id: 'itemCount', 
        values: { count: 5 } 
      })}</p>
    </div>
  );
}
```

### 4. Using the T Component

Use the `<T>` component for declarative message formatting:

```tsx
import React from 'react';
import { T } from 'zero-intl';

function MyComponent() {
  return (
    <div>
      <h1><T id="welcome" /></h1>
      <p><T id="hello" values={{ name: 'John' }} /></p>
      <p><T id="itemCount" values={{ count: 5 }} /></p>
      
      {/* With default message fallback */}
      <p><T id="missing.key" defaultMessage="Default text" /></p>
      
      {/* With render prop */}
      <T id="hello" values={{ name: 'Jane' }}>
        {(message) => <strong>{message}</strong>}
      </T>
    </div>
  );
}
```

## API Reference

### ZeroIntlProvider Props

- `locale: string` - Current locale (e.g., 'en', 'es', 'fr')
- `messages: Record<string, string>` - Translation messages object
- `defaultLocale?: string` - Default locale (optional)
- `defaultMessages?: Record<string, string>` - Default messages object (optional)
- `onError?: (error: string) => void` - Error handler for missing translations
- `children: ReactNode` - Child components
- `onRender?: (record: TranslationRecord) => ReactNode` - Custom render function for translations

### useIntl()

Returns an object with:
- `locale: string` - Current locale
- `messages: Record<string, string>` - Current messages
- `formatMessage(descriptor: MessageDescriptor): string` - Format message function

### MessageDescriptor

- `id: string` - Message key
- `defaultMessage?: string` - Fallback message
- `values?: Record<string, any>` - Variables for interpolation

### T Component Props

- `id: string` - Message key
- `defaultMessage?: string` - Fallback message
- `values?: Record<string, any>` - Variables for interpolation
- `children?: (formattedMessage: string) => ReactNode` - Render prop

### TranslationRecord

- `translationKey: string` - The original translation key
- `translation: string` - The formatted translation text
- `locale: string` - The current locale
- `values?: Record<string, any>` - The interpolation values (if any)

## Message Interpolation

Zero Intl supports both simple variable interpolation and advanced ICU message formatting using the browser's native Intl API:

### Simple Variable Interpolation

```tsx
// Message: "Hello, {name}! You have {count} new messages."
const message = intl.formatMessage({
  id: 'greeting',
  values: { name: 'Alice', count: 3 }
});
// Result: "Hello, Alice! You have 3 new messages."
```

### ICU Plural Formatting

Handle pluralization using the browser's native `Intl.PluralRules`:

```tsx
// Messages
const messages = {
  'items': '{count, plural, =0 {no items} one {# item} other {# items}}',
  'notifications': '{count, plural, =0 {No notifications} =1 {One notification} other {# notifications}}'
};

// Usage
<T id="items" values={{ count: 0 }} />     // "no items"
<T id="items" values={{ count: 1 }} />     // "1 item"
<T id="items" values={{ count: 5 }} />     // "5 items"

<T id="notifications" values={{ count: 0 }} />  // "No notifications"
<T id="notifications" values={{ count: 1 }} />  // "One notification"
<T id="notifications" values={{ count: 3 }} />  // "3 notifications"
```

### ICU Select Formatting

Handle conditional text based on string values:

```tsx
// Messages
const messages = {
  'welcome': '{gender, select, male {Welcome, Mr. {name}} female {Welcome, Ms. {name}} other {Welcome, {name}}}',
  'pronoun': '{gender, select, male {he} female {she} other {they}}'
};

// Usage
<T id="welcome" values={{ gender: 'male', name: 'John' }} />    // "Welcome, Mr. John"
<T id="welcome" values={{ gender: 'female', name: 'Jane' }} />  // "Welcome, Ms. Jane"
<T id="welcome" values={{ gender: 'other', name: 'Alex' }} />   // "Welcome, Alex"
```

### ICU SelectOrdinal Formatting

Handle ordinal numbers using the browser's native `Intl.PluralRules` with ordinal type:

```tsx
// Messages
const messages = {
  'position': '{rank, selectordinal, one {#st place} two {#nd place} few {#rd place} other {#th place}}',
  'floor': 'Go to the {floor, selectordinal, one {#st} two {#nd} few {#rd} other {#th}} floor'
};

// Usage
<T id="position" values={{ rank: 1 }} />   // "1st place"
<T id="position" values={{ rank: 2 }} />   // "2nd place"
<T id="position" values={{ rank: 3 }} />   // "3rd place"
<T id="position" values={{ rank: 4 }} />   // "4th place"

<T id="floor" values={{ floor: 21 }} />    // "Go to the 21st floor"
<T id="floor" values={{ floor: 22 }} />    // "Go to the 22nd floor"
```

### Complex ICU Messages

You can combine multiple ICU formatters in a single message:

```tsx
const messages = {
  'complex': '{name} {action, select, like {likes} other {liked}} {count, plural, one {this post} other {these posts}} {time, selectordinal, one {for the #st time} two {for the #nd time} other {for the #th time}}'
};

// Usage
<T 
  id="complex" 
  values={{ 
    name: 'Alice', 
    action: 'like', 
    count: 2, 
    time: 3 
  }} 
/>
// Result: "Alice likes these posts for the 3rd time"
```

### Supported ICU Features

- **Plural**: `{count, plural, =0 {none} one {singular} other {plural}}`
  - Uses browser's `Intl.PluralRules` for locale-aware pluralization
  - Supports exact matches with `=0`, `=1`, etc.
  - Supports plural categories: `zero`, `one`, `two`, `few`, `many`, `other`
  - Use `#` as placeholder for the number

- **Select**: `{value, select, option1 {text1} option2 {text2} other {default}}`
  - Simple string-based conditional formatting
  - Always provide an `other` option as fallback

- **SelectOrdinal**: `{rank, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}`
  - Uses browser's `Intl.PluralRules` with ordinal type
  - Handles ordinal numbers (1st, 2nd, 3rd, etc.) in a locale-aware manner
  - Use `#` as placeholder for the number
