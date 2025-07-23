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

## Commands

### Extract

Extract translation keys from source files:

```bash
zero-intl extract "src/**/*.{ts,tsx}" [options]
```

#### Options:

- `-o, --out-file <file>`: Output file path
- `-f, --format <format>`: Output format (`json`, `csv`, `simple-json`) - default: `json`
- `--remove-default-message`: Remove defaultMessage from output
- `--additional-components <components>`: Additional component names to extract (comma-separated)
- `--no-source-location`: Exclude source location information

#### Examples:

```bash
# Extract to console (JSON format)
zero-intl extract "src/**/*.{ts,tsx}"

# Extract to file
zero-intl extract "src/**/*.{ts,tsx}" -o messages.json

# Extract as CSV
zero-intl extract "src/**/*.{ts,tsx}" -f csv -o messages.csv

# Extract as simple key-value JSON
zero-intl extract "src/**/*.{ts,tsx}" -f simple-json -o messages.json

# Extract from custom components
zero-intl extract "src/**/*.{ts,tsx}" --additional-components "Translation,Translate"

# Remove default messages from output
zero-intl extract "src/**/*.{ts,tsx}" --remove-default-message
```

### Validate

Validate translation keys in source files:

```bash
zero-intl validate "src/**/*.{ts,tsx}" [options]
```

This command checks for:
- Duplicate translation IDs
- Missing default messages

#### Options:

- `--additional-components <components>`: Additional component names to validate (comma-separated)

#### Example:

```bash
zero-intl validate "src/**/*.{ts,tsx}"
```

## Output Formats

### JSON (default)

```json
{
  "messages": [
    {
      "id": "hello.world",
      "defaultMessage": "Hello World!",
      "description": "A greeting message",
      "file": "/src/components/Hello.tsx",
      "start": { "line": 10, "column": 5 },
      "end": { "line": 10, "column": 45 }
    }
  ],
  "meta": {
    "totalFiles": 1,
    "totalMessages": 1,
    "extractedAt": "2025-07-24T00:15:13.000Z"
  }
}
```

### CSV

```csv
id,defaultMessage,description,file,line,column
hello.world,Hello World!,A greeting message,/src/components/Hello.tsx,10,5
```

### Simple JSON

```json
{
  "hello.world": "Hello World!",
  "goodbye.world": "Goodbye World!"
}
```

## Supported Components

By default, the CLI extracts from `<T/>` components. You can specify additional component names using the `--additional-components` option.

## Integration with Build Tools

### npm scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "extract-messages": "zero-intl extract 'src/**/*.{ts,tsx}' -o src/messages.json",
    "validate-messages": "zero-intl validate 'src/**/*.{ts,tsx}'"
  }
}
```

### CI/CD

Add validation to your CI pipeline:

```yaml
- name: Validate translation keys
  run: npx @zero-intl/cli validate "src/**/*.{ts,tsx}"
```

## Limitations

- Variable references in JSX attributes are not resolved (e.g., `<T id={messageId} />`)
- Complex expressions are not evaluated
- Template literals are extracted as raw text
