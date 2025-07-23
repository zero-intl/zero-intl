# Zero Intl

A lightweight, customizable internationalization library for React inspired by FormatJS, but targeting modern browsers for enhanced performance and tree-shaking capabilities.

## 🚀 Features

- **🪶 Lightweight**: Minimal bundle size with excellent tree-shaking support
- **⚡ Modern**: Built for modern browsers using native browser APIs
- **🎨 Customizable**: Flexible rendering with custom `onRender` functions
- **🔧 Developer Experience**: Comprehensive CLI for message extraction and validation
- **🌍 ICU Support**: Native browser support for ICU message formatting (plural, select, selectordinal)
- **📦 Monorepo**: Separate packages for React components and CLI tools
- **✅ TypeScript**: Full TypeScript support with excellent type safety

## 📦 Packages

This monorepo contains two main packages:

| Package                                | Description                                             | Version                                               |
|----------------------------------------|---------------------------------------------------------|-------------------------------------------------------|
| [`@zero-intl/react`](./packages/react) | React components and hooks for internationalization     | ![npm](https://img.shields.io/npm/v/@zero-intl/react) |
| [`@zero-intl/cli`](./packages/cli)     | CLI tool for extracting and validating translation keys | ![npm](https://img.shields.io/npm/v/@zero-intl/cli)   |

## 🚀 Quick Start

### Installation

```bash
# Install the React library
npm install @zero-intl/react

# Install the CLI (optional, for development)
npm install -g @zero-intl/cli
```

### Basic Usage

```tsx
import React from 'react';
import { ZeroIntlProvider, T, useIntl } from '@zero-intl/react';

const messages = {
  'welcome.title': 'Welcome to Zero Intl!',
  'welcome.subtitle': 'A modern internationalization library',
  'user.greeting': 'Hello, {name}!'
};

function App() {
  return (
    <ZeroIntlProvider 
      locale="en" 
      messages={messages}
      defaultLocale="en"
    >
      <WelcomeComponent />
    </ZeroIntlProvider>
  );
}

function WelcomeComponent() {
  const intl = useIntl();
  
  return (
    <div>
      <h1>
        <T id="welcome.title" defaultMessage="Welcome to Zero Intl!" />
      </h1>
      <p>
        <T id="welcome.subtitle" defaultMessage="A modern internationalization library" />
      </p>
      <p>
        {intl.formatMessage({
          id: 'user.greeting',
          defaultMessage: 'Hello, {name}!',
          values: { name: 'John' }
        })}
      </p>
    </div>
  );
}
```

### Custom Rendering

```tsx
function App() {
  return (
    <ZeroIntlProvider 
      locale="en" 
      messages={messages}
      onRender={(record) => (
        <span data-translation-key={record.translationKey}>
          {record.translation}
        </span>
      )}
    >
      <YourApp />
    </ZeroIntlProvider>
  );
}
```

### ICU Message Formatting

Zero Intl supports native browser ICU formatting:

```tsx
const messages = {
  'items.count': '{count, plural, =0 {No items} =1 {One item} other {# items}}',
  'user.gender': '{gender, select, male {He} female {She} other {They}} will arrive soon',
  'ranking': '{place, selectordinal, =1 {1st} =2 {2nd} =3 {3rd} other {#th}} place'
};

function ItemCounter({ count }: { count: number }) {
  return (
    <T 
      id="items.count" 
      defaultMessage="{count, plural, =0 {No items} =1 {One item} other {# items}}"
      values={{ count }}
    />
  );
}
```

## 🛠️ CLI Usage

Extract translation keys from your source code:

```bash
# Extract all translation keys
zero-intl extract "src/**/*.{ts,tsx}" -o messages.json

# Extract as CSV
zero-intl extract "src/**/*.{ts,tsx}" -f csv -o messages.csv

# Extract as simple key-value JSON
zero-intl extract "src/**/*.{ts,tsx}" -f simple-json -o translations.json

# Validate translation keys
zero-intl validate "src/**/*.{ts,tsx}"

# Extract from custom components
zero-intl extract "src/**/*.{ts,tsx}" --additional-components "Translation,Translate"
```

## 🔧 Development

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher

### Setup

```bash
# Clone the repository
git clone https://github.com/zero-intl/zero-intl.git
cd zero-intl

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test

# Run tests in CI mode
npm run test:ci
```

### Package Development

```bash
# Build specific package
npm run build -w @zero-intl/react
npm run build -w @zero-intl/cli

# Test specific package
npm run test -w @zero-intl/react
npm run test -w @zero-intl/cli

# Development mode (with watch)
npm run dev -w @zero-intl/react
```

## 📖 Documentation

### React Library

The `@zero-intl/react` package provides:

- **ZeroIntlProvider**: Context provider for internationalization
- **T Component**: Declarative component for displaying translated messages
- **useIntl Hook**: Hook for imperative message formatting
- **ICU Support**: Native browser support for plural, select, and selectordinal

[Read the full React documentation →](./packages/react/README.md)

### CLI Tool

The `@zero-intl/cli` package provides:

- **Message Extraction**: Extract translation keys from source code
- **Validation**: Check for duplicate keys and missing default messages
- **Multiple Formats**: Output as JSON, CSV, or simple key-value JSON
- **Custom Components**: Support for custom translation components

[Read the full CLI documentation →](./packages/cli/README.md)

## 🎯 Design Philosophy

Zero Intl is designed with the following principles:

1. **Modern First**: Target modern browsers to leverage native APIs and reduce bundle size
2. **Tree-Shakable**: Only include what you use in your final bundle
3. **Customizable**: Provide flexible APIs for different use cases
4. **Developer Experience**: Excellent tooling and TypeScript support
5. **Performance**: Minimal runtime overhead and optimal bundle size

## 🆚 Comparison with FormatJS

| Feature          | Zero Intl                      | FormatJS                       |
|------------------|--------------------------------|--------------------------------|
| Bundle Size      | Smaller (modern browsers only) | Larger (broader compatibility) |
| Tree Shaking     | Excellent                      | Good                           |
| Custom Rendering | Built-in onRender support      | Requires custom components     |
| CLI Tools        | Dedicated package              | Separate installation          |
| ICU Support      | Native browser APIs            | Polyfilled                     |
| Browser Support  | Modern browsers (ES2020+)      | Broader compatibility          |
| TypeScript       | Full support                   | Full support                   |

## 📋 API Reference

### ZeroIntlProvider Props

```typescript
interface ZeroIntlProviderProps {
  locale: string;
  messages: Record<string, string>;
  defaultLocale?: string;
  onRender?: (record: TranslationRecord) => React.ReactNode;
  children: React.ReactNode;
}
```

### T Component Props

```typescript
interface TProps {
  id: string;
  defaultMessage?: string;
  values?: Record<string, any>;
  children?: (formattedMessage: string) => React.ReactNode;
}
```

### useIntl Hook

```typescript
interface IntlShape {
  locale: string;
  formatMessage: (descriptor: MessageDescriptor) => string;
  onRender?: (record: TranslationRecord) => React.ReactNode;
}
```

## 🧪 Testing

The project includes comprehensive test suites for both packages:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:ci

# Run specific package tests
npm run test -w @zero-intl/react
npm run test -w @zero-intl/cli
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [FormatJS](https://formatjs.io/) for the API design
- Thanks to the React team for the excellent Context API
- Built with modern tools: TypeScript, Vitest, tsup

## 📞 Support

- 📄 [Documentation](https://github.com/zero-intl/zero-intl#readme)
- 🐛 [Issue Tracker](https://github.com/zero-intl/zero-intl/issues)
- 💬 [Discussions](https://github.com/zero-intl/zero-intl/discussions)

---

Made with ❤️ for the modern web
