import { writeFileSync } from 'fs';
import { ExtractedMessage, ExtractionResult } from './types.js';

export class OutputFormatter {
  static formatAsJson(result: ExtractionResult, removeDefaultMessage = false): string {
    const messages = removeDefaultMessage
      ? result.messages.map(({ defaultMessage, ...msg }) => msg)
      : result.messages;

    const output = {
      messages,
      meta: {
        totalFiles: result.totalFiles,
        totalMessages: result.totalMessages,
        extractedAt: new Date().toISOString()
      }
    };

    return JSON.stringify(output, null, 2);
  }

  static formatAsCsv(result: ExtractionResult, removeDefaultMessage = false): string {
    const headers = removeDefaultMessage
      ? ['id', 'description', 'file', 'line', 'column']
      : ['id', 'defaultMessage', 'description', 'file', 'line', 'column'];

    const rows = result.messages.map(msg => {
      const row = [
        this.escapeCsvValue(msg.id),
        ...(removeDefaultMessage ? [] : [this.escapeCsvValue(msg.defaultMessage || '')]),
        this.escapeCsvValue(msg.description || ''),
        msg.file,
        msg.start.line.toString(),
        msg.start.column.toString()
      ];
      return row.join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  static formatAsSimpleJson(result: ExtractionResult): string {
    const messagesMap = result.messages.reduce((acc, msg) => {
      acc[msg.id] = msg.defaultMessage || msg.id;
      return acc;
    }, {} as Record<string, string>);

    return JSON.stringify(messagesMap, null, 2);
  }

  static writeToFile(content: string, filePath: string): void {
    writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Extracted messages saved to: ${filePath}`);
  }

  private static escapeCsvValue(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  static printSummary(result: ExtractionResult): void {
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
}
