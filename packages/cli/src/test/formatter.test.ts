import { describe, it, expect } from 'vitest';
import { OutputFormatter } from '../formatter.js';
import { ExtractionResult } from '../types.js';

describe('OutputFormatter', () => {
  const mockResult: ExtractionResult = {
    messages: [
      {
        id: 'hello.world',
        defaultMessage: 'Hello World!',
        description: 'A greeting message',
        file: '/src/components/Hello.tsx',
        start: { line: 10, column: 5 },
        end: { line: 10, column: 45 }
      },
      {
        id: 'goodbye.world',
        defaultMessage: 'Goodbye World!',
        file: '/src/components/Goodbye.tsx',
        start: { line: 15, column: 8 },
        end: { line: 15, column: 50 }
      }
    ],
    totalFiles: 2,
    totalMessages: 2
  };

  describe('formatAsJson', () => {
    it('should format as JSON with all fields', () => {
      const result = OutputFormatter.formatAsJson(mockResult);
      const parsed = JSON.parse(result);

      expect(parsed.messages).toHaveLength(2);
      expect(parsed.messages[0]).toMatchObject({
        id: 'hello.world',
        defaultMessage: 'Hello World!',
        description: 'A greeting message',
        file: '/src/components/Hello.tsx'
      });
      expect(parsed.meta).toMatchObject({
        totalFiles: 2,
        totalMessages: 2
      });
      expect(parsed.meta.extractedAt).toBeDefined();
    });

    it('should remove defaultMessage when specified', () => {
      const result = OutputFormatter.formatAsJson(mockResult, true);
      const parsed = JSON.parse(result);

      expect(parsed.messages[0]).not.toHaveProperty('defaultMessage');
      expect(parsed.messages[0]).toHaveProperty('id');
      expect(parsed.messages[0]).toHaveProperty('file');
    });
  });

  describe('formatAsCsv', () => {
    it('should format as CSV with headers', () => {
      const result = OutputFormatter.formatAsCsv(mockResult);
      const lines = result.split('\n');

      expect(lines[0]).toBe('id,defaultMessage,description,file,line,column');
      expect(lines[1]).toBe('hello.world,Hello World!,A greeting message,/src/components/Hello.tsx,10,5');
      expect(lines[2]).toBe('goodbye.world,Goodbye World!,,/src/components/Goodbye.tsx,15,8');
    });

    it('should handle CSV escaping for values with commas', () => {
      const resultWithCommas: ExtractionResult = {
        messages: [{
          id: 'test.message',
          defaultMessage: 'Hello, World!',
          description: 'A message with, commas',
          file: '/test.tsx',
          start: { line: 1, column: 1 },
          end: { line: 1, column: 10 }
        }],
        totalFiles: 1,
        totalMessages: 1
      };

      const result = OutputFormatter.formatAsCsv(resultWithCommas);
      const lines = result.split('\n');

      expect(lines[1]).toBe('test.message,"Hello, World!","A message with, commas",/test.tsx,1,1');
    });

    it('should remove defaultMessage column when specified', () => {
      const result = OutputFormatter.formatAsCsv(mockResult, true);
      const lines = result.split('\n');

      expect(lines[0]).toBe('id,description,file,line,column');
      expect(lines[1]).toBe('hello.world,A greeting message,/src/components/Hello.tsx,10,5');
    });
  });

  describe('formatAsSimpleJson', () => {
    it('should format as simple key-value JSON', () => {
      const result = OutputFormatter.formatAsSimpleJson(mockResult);
      const parsed = JSON.parse(result);

      expect(parsed).toEqual({
        'hello.world': 'Hello World!',
        'goodbye.world': 'Goodbye World!'
      });
    });

    it('should use id as value when defaultMessage is missing', () => {
      const resultWithoutDefaults: ExtractionResult = {
        messages: [{
          id: 'no.default',
          file: '/test.tsx',
          start: { line: 1, column: 1 },
          end: { line: 1, column: 10 }
        }],
        totalFiles: 1,
        totalMessages: 1
      };

      const result = OutputFormatter.formatAsSimpleJson(resultWithoutDefaults);
      const parsed = JSON.parse(result);

      expect(parsed).toEqual({
        'no.default': 'no.default'
      });
    });
  });
});
