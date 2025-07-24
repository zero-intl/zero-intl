# Zero Intl

A modern, lightweight React internationalization library inspired by FormatJS, built specifically for the newest browsers. Zero Intl leverages native browser APIs to deliver powerful i18n features with minimal bundle impact and maximum customization flexibility.

## Why Zero Intl?

**FormatJS Inspired, Modern Browser Optimized** - While FormatJS supports legacy browsers with polyfills and compatibility layers, Zero Intl takes a different approach. By targeting modern browsers (ES2022+), we eliminate the need for heavy polyfills and achieve a significantly smaller bundle size while maintaining familiar FormatJS-style APIs.

**Key Differentiators:**
- 📦 **Ultra Lightweight** - 10x smaller than FormatJS by using native browser APIs
- 🌲 **Full Tree Shaking** - Import only the features you actually use
- 🎨 **Maximum Customization** - Every aspect is customizable, from rendering to error handling
- ⚡ **Zero Dependencies** - No external dependencies, pure browser APIs
- 🚀 **Modern First** - Built for ES2018+ browsers, no legacy baggage

## Features

- 🚀 **Lightweight** - Minimal bundle size with zero dependencies
- 🌐 **Native ICU** - Uses browser's built-in `Intl.PluralRules` and `Intl` APIs
- ⚡ **TypeScript Ready** - Full type safety and IntelliSense support
- 🎯 **React Optimized** - Built specifically for React with hooks and context
- 🔄 **Smart Fallbacks** - Graceful fallbacks with default locale and messages
- 🎨 **Custom Rendering** - Complete control over how translations render
- 📦 **Tree Shakeable** - Import only what you need, when you need it
- 🔧 **Highly Customizable** - Every component and behavior can be customized

## Installation

Install zero-intl using your preferred package manager:

```bash
# npm
npm install @zero-intl/react
```

## Quick Start

### 1. Create Your Messages

Create your translation files. You can organize them however you prefer:

```tsx
// messages/en.ts
export const en = {
  'app.title': 'My Awesome App',
  'user.greeting': 'Hello, {name}!',
  'items.count': '{count, plural, =0 {no items} one {# item} other {# items}}',
  'user.profile': '{gender, select, male {Mr. {name}} female {Ms. {name}} other {{name}}}',
};

// messages/es.ts
export const es = {
  'app.title': 'Mi Aplicación Increíble',
  'user.greeting': '¡Hola, {name}!',
  'items.count': '{count, plural, =0 {ningún elemento} one {# elemento} other {# elementos}}',
  // Note: 'user.profile' is missing - will fallback to English
};
```

### 2. Setup the Provider

Wrap your app with `ZeroIntlProvider` at the root level:

```tsx
// App.tsx
import React from 'react';
import { ZeroIntlProvider } from 'zero-intl';
import { en } from './messages/en';
import { es } from './messages/es';

const messages = {
  en,
  es,
};

function App() {
  const [locale, setLocale] = React.useState('en');

  return (
    <ZeroIntlProvider 
      locale={locale}
      messages={messages[locale]}
      defaultLocale="en"
      defaultMessages={messages.en}
      onError={(error) => {
        console.warn('Translation missing:', error);
      }}
    >
      <YourAppContent />
      
      {/* Language switcher */}
      <div>
        <button onClick={() => setLocale('en')}>English</button>
        <button onClick={() => setLocale('es')}>Español</button>
      </div>
    </ZeroIntlProvider>
  );
}

export default App;
```

### 3. Use Translations in Components

Use the `useIntl` hook or `<T>` component to display translations:

```tsx
// components/UserProfile.tsx
import React from 'react';
import { useIntl, T } from 'zero-intl';

function UserProfile({ user }) {
  const intl = useIntl();

  return (
    <div>
      {/* Using the hook */}
      <h1>{intl.formatMessage({ 
        id: 'app.title' 
      })}</h1>
      
      {/* Using the component */}
      <p>
        <T 
          id="user.greeting" 
          values={{ name: user.name }} 
        />
      </p>
      
      {/* ICU plural formatting */}
      <p>
        <T 
          id="items.count" 
          values={{ count: user.items.length }} 
        />
      </p>
      
      {/* ICU select formatting */}
      <p>
        <T 
          id="user.profile" 
          values={{ 
            gender: user.gender, 
            name: user.lastName 
          }} 
        />
      </p>
    </div>
  );
}
```

## Configuration Options

### ZeroIntlProvider Props

| Prop              | Type                                       | Required | Description                                   |
|-------------------|--------------------------------------------|----------|-----------------------------------------------|
| `locale`          | `string`                                   | ✅        | Current locale (e.g., 'en', 'es', 'fr-CA')    |
| `messages`        | `Record<string, string>`                   | ✅        | Translation messages for current locale       |
| `children`        | `ReactNode`                                | ✅        | Your app components                           |
| `defaultLocale`   | `string`                                   | ❌        | Fallback locale when translations are missing |
| `defaultMessages` | `Record<string, string>`                   | ❌        | Fallback messages (usually English)           |
| `onError`         | `(error: string) => void`                  | ❌        | Called when translations are missing          |
| `onRender`        | `(record: TranslationRecord) => ReactNode` | ❌        | Custom rendering for debugging                |

### Environment-Specific Configuration

#### Development Mode with Debug Rendering

```tsx
const isDevelopment = process.env.NODE_ENV === 'development';

<ZeroIntlProvider
  locale={locale}
  messages={messages[locale]}
  defaultLocale="en"
  defaultMessages={messages.en}
  onError={(error) => {
    if (isDevelopment) {
      console.warn('🌐 Translation missing:', error);
    }
  }}
  onRender={isDevelopment ? (record) => (
    <span 
      data-translation-key={record.translationKey}
      title={`Key: ${record.translationKey} | Locale: ${record.locale}`}
      style={{ 
        outline: '1px dashed orange',
        outlineOffset: '2px'
      }}
    >
      {record.translation}
    </span>
  ) : undefined}
>
  <App />
</ZeroIntlProvider>
```

#### Production Mode

```tsx
<ZeroIntlProvider
  locale={locale}
  messages={messages[locale]}
  defaultLocale="en"
  defaultMessages={messages.en}
  onError={(error) => {
    // Send to error tracking service
    analytics.track('translation_missing', { error });
  }}
>
  <App />
</ZeroIntlProvider>
```

### Message Organization Patterns

#### Pattern 1: Namespace-based

```tsx
const messages = {
  'auth.login.title': 'Sign In',
  'auth.login.button': 'Log In',
  'auth.signup.title': 'Create Account',
  'dashboard.welcome': 'Welcome back, {name}!',
  'dashboard.stats.users': '{count, plural, one {# user} other {# users}}',
};
```

#### Pattern 2: Nested objects (flattened)

```tsx
// Define nested structure
const nestedMessages = {
  auth: {
    login: {
      title: 'Sign In',
      button: 'Log In',
    },
    signup: {
      title: 'Create Account',
    },
  },
  dashboard: {
    welcome: 'Welcome back, {name}!',
  },
};

// Flatten for zero-intl
const messages = flatten(nestedMessages); // Use a flatten utility
```
