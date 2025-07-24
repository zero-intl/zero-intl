# @zero-intl/cli

A command-line tool for extracting translation keys from zero-intl `<T/>` components.

## Installation

```bash
npm install -g @zero-intl/cli
```

Or use with npx:

```bash
npx @zero-intl/cli extract "src/**/*.{ts,tsx}"
```

## Usage

Extract translation keys from source files:

```bash
zero-intl extract "src/**/*.{ts,tsx}" [options]
```

### Options:

- `-o, --output <file>`: Output file path (default: `source-translations.json`)

### Examples:

```bash
# Extract to default file (source-translations.json)
zero-intl extract "src/**/*.{ts,tsx}"

# Extract to custom file
zero-intl extract "src/**/*.{ts,tsx}" --output my-translations.json
zero-intl extract "src/**/*.{ts,tsx}" -o my-translations.json
```

## Output Format

The CLI outputs JSON in a clean key-value format:

```json
{
  "apiKeys.authCodeName": {
    "defaultMessage": "Auth Code",
    "file": "pages/console/api-keys.tsx"
  },
  "welcome.title": {
    "defaultMessage": "Welcome to Zero Intl!",
    "file": "src/components/Welcome.tsx",
    "description": "Main welcome title"
  }
}
```

## Supported Components

The CLI extracts translation keys from `<T/>` components with the following props:

- `id` (required): The translation key
- `defaultMessage` (optional): Default message text
- `description` (optional): Description for translators

Example component usage:

```tsx
import { T } from '@zero-intl/react';

function MyComponent() {
  return (
    <div>
      <T id="welcome.message" defaultMessage="Welcome!" />
      <T 
        id="user.greeting" 
        defaultMessage="Hello, {name}!" 
        description="Greeting for logged-in users"
      />
    </div>
  );
}
```

## Integration with Build Tools

Add extraction to your CI pipeline:

```yaml
- name: Extract translation keys
  run: npx @zero-intl/cli extract "src/**/*.{ts,tsx}" --output translations.json
```

## Features

- **Fast extraction**: Processes TypeScript and TSX files efficiently
- **Clean output**: Simple JSON format without metadata clutter
- **Default output**: Automatically saves to `source-translations.json`
- **Error handling**: Graceful handling of malformed files
