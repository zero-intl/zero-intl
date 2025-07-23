import { Command } from 'commander';
import { MessageExtractor } from './extractor.js';
import { FileScanner } from './scanner.js';
import { OutputFormatter } from './formatter.js';
import { ExtractionOptions, ExtractionResult } from './types.js';

const program = new Command();

program
  .name('@zero-intl/cli')
  .description('Extract translation keys from zero-intl <T/> components')
  .version('0.0.1');

program
  .command('extract')
  .description('Extract translation keys from source files')
  .argument('<patterns...>', 'File patterns to scan (e.g., "src/**/*.{ts,tsx}")')
  .option('-o, --out-file <file>', 'Output file path')
  .option('-f, --format <format>', 'Output format (json, csv, simple-json)', 'json')
  .option('--remove-default-message', 'Remove defaultMessage from output', false)
  .option('--additional-components <components>', 'Additional component names to extract (comma-separated)', '')
  .option('--no-source-location', 'Exclude source location information')
  .action(async (patterns: string[], options) => {
    try {
      const extractionOptions: ExtractionOptions = {
        pattern: patterns,
        outFile: options.outFile,
        format: options.format as 'json' | 'csv' | 'simple-json',
        removeDefaultMessage: options.removeDefaultMessage,
        additionalComponentNames: options.additionalComponents
          ? options.additionalComponents.split(',').map((s: string) => s.trim())
          : [],
        extractSourceLocation: options.sourceLocation !== false
      };

      console.log('🔍 Scanning files...');
      const result = await extractMessages(extractionOptions);

      OutputFormatter.printSummary(result);

      if (result.totalMessages === 0) {
        console.log('ℹ️  No translation keys found.');
        return;
      }

      const output = formatOutput(result, extractionOptions);

      if (extractionOptions.outFile) {
        OutputFormatter.writeToFile(output, extractionOptions.outFile);
      } else {
        console.log('\n📄 Extracted messages:');
        console.log(output);
      }
    } catch (error) {
      console.error('❌ Extraction failed:', error);
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate translation keys in source files')
  .argument('<patterns...>', 'File patterns to scan')
  .option('--additional-components <components>', 'Additional component names to validate (comma-separated)', '')
  .action(async (patterns: string[], options) => {
    try {
      console.log('🔍 Validating translation keys...');

      const extractionOptions: ExtractionOptions = {
        pattern: patterns,
        additionalComponentNames: options.additionalComponents
          ? options.additionalComponents.split(',').map((s: string) => s.trim())
          : []
      };

      const result = await extractMessages(extractionOptions);

      // Validation logic
      const duplicates = findDuplicateIds(result.messages);
      const missingDefaults = result.messages.filter(m => !m.defaultMessage);

      let hasErrors = false;

      if (duplicates.length > 0) {
        console.log('\n❌ Duplicate translation IDs found:');
        duplicates.forEach(dup => {
          console.log(`   "${dup.id}" found in:`);
          dup.locations.forEach(loc => {
            console.log(`     - ${loc.file}:${loc.line}:${loc.column}`);
          });
        });
        hasErrors = true;
      }

      if (missingDefaults.length > 0) {
        console.log('\n⚠️  Translation keys without default messages:');
        missingDefaults.forEach(msg => {
          console.log(`   "${msg.id}" in ${msg.file}:${msg.start.line}:${msg.start.column}`);
        });
      }

      if (!hasErrors && missingDefaults.length === 0) {
        console.log('✅ All translation keys are valid!');
      } else if (hasErrors) {
        process.exit(1);
      }

      OutputFormatter.printSummary(result);
    } catch (error) {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    }
  });

async function extractMessages(options: ExtractionOptions): Promise<ExtractionResult> {
  const scanner = new FileScanner();
  const extractor = new MessageExtractor(options.additionalComponentNames);

  const files = await scanner.scanFiles(options.pattern);

  if (files.length === 0) {
    console.log('⚠️  No files found matching the provided patterns.');
    return { messages: [], totalFiles: 0, totalMessages: 0 };
  }

  console.log(`📁 Found ${files.length} files to process`);

  const allMessages = files.flatMap(file => {
    try {
      return extractor.extractFromFile(file);
    } catch (error) {
      console.warn(`⚠️  Failed to process ${file}:`, error);
      return [];
    }
  });

  return {
    messages: allMessages,
    totalFiles: files.length,
    totalMessages: allMessages.length
  };
}

function formatOutput(result: ExtractionResult, options: ExtractionOptions): string {
  switch (options.format) {
    case 'csv':
      return OutputFormatter.formatAsCsv(result, options.removeDefaultMessage);
    case 'simple-json':
      return OutputFormatter.formatAsSimpleJson(result);
    case 'json':
    default:
      return OutputFormatter.formatAsJson(result, options.removeDefaultMessage);
  }
}

function findDuplicateIds(messages: any[]) {
  const idMap = new Map<string, any[]>();

  messages.forEach(msg => {
    if (!idMap.has(msg.id)) {
      idMap.set(msg.id, []);
    }
    idMap.get(msg.id)!.push({
      file: msg.file,
      line: msg.start.line,
      column: msg.start.column
    });
  });

  return Array.from(idMap.entries())
    .filter(([, locations]) => locations.length > 1)
    .map(([id, locations]) => ({ id, locations }));
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

program.parse();
