import { Command } from 'commander';
import { MessageExtractor } from './extractor.js';
import { FileScanner } from './scanner.js';
import { formatAsJson, writeToFile, printSummary } from './formatter.js';
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
  .option('-o, --output <file>', 'Output file path', 'source-messages.json')
  .action(async (patterns: string[], options) => {
    try {
      const extractionOptions: ExtractionOptions = {
        pattern: patterns,
        outputFile: options.output
      };

      console.log('🔍 Scanning files...');
      const result = await extractMessages(extractionOptions);


      if (result.totalMessages === 0) {
        console.log('ℹ️  No translation keys found.');
        return;
      }

      printSummary(result);
      const output = formatAsJson(result);
      writeToFile(output, extractionOptions.outputFile!);
    } catch (error) {
      console.error('❌ Extraction failed:', error);
      process.exit(1);
    }
  });

async function extractMessages(options: ExtractionOptions): Promise<ExtractionResult> {
  const scanner = new FileScanner();
  const extractor = new MessageExtractor();

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

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

program.parse();
