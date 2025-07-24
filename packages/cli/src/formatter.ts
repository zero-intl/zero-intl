import { writeFileSync } from 'fs';
import { ExtractionResult } from './types.js';

export function formatAsJson(result: ExtractionResult): string {
  const messagesMap: Record<string, { defaultMessage?: string; file: string; description?: string }> = {};

  result.messages.forEach(message => {
    messagesMap[message.id] = {
      ...(message.defaultMessage && { defaultMessage: message.defaultMessage }),
      file: message.file,
      ...(message.description && { description: message.description })
    };
  });

  return JSON.stringify(messagesMap, null, 2);
}

export function writeToFile(content: string, filePath: string): void {
  writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ Extracted messages saved to: ${filePath}`);
}

export function printSummary(result: ExtractionResult): void {
  console.log('\n📊 Extraction Summary:');
  console.log(`   Files processed: ${result.totalFiles}`);
  console.log(`   Messages found: ${result.totalMessages}`);

  if (result.totalMessages > 0) {
    const uniqueIds = new Set(result.messages.map(m => m.id));
    if (uniqueIds.size !== result.totalMessages) {
      console.log(`   ⚠️  Duplicate IDs found: ${result.totalMessages - uniqueIds.size}`);
    }

    const missingDefaults = result.messages.filter(m => !m.defaultMessage).length;
    if (missingDefaults > 0) {
      console.log(`   ⚠️  Missing default messages: ${missingDefaults}`);
    }
  }
}
