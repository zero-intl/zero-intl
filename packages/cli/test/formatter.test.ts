import { describe, it, expect } from 'vitest';
import { formatAsJson } from '../src/formatter.js';
import { ExtractionResult } from '../src/types.js';

describe('formatAsJson', () => {
  const mockResult: ExtractionResult = {
    messages: [
      {
        id: 'hello.world',
        defaultMessage: 'Hello World!',
        description: 'A greeting message',
        file: '/src/components/Hello.tsx'
      },
      {
        id: 'goodbye.world',
        defaultMessage: 'Goodbye World!',
        file: '/src/components/Goodbye.tsx'
      }
    ],
    totalFiles: 2,
    totalMessages: 2
  };

  it('should format as JSON with new structure', () => {
    const result = formatAsJson(mockResult);
    const parsed = JSON.parse(result);

    expect(parsed).toHaveProperty('hello.world');
    expect(parsed).toHaveProperty('goodbye.world');

    expect(parsed['hello.world']).toEqual({
      defaultMessage: 'Hello World!',
      description: 'A greeting message',
      file: '/src/components/Hello.tsx'
    });

    expect(parsed['goodbye.world']).toEqual({
      defaultMessage: 'Goodbye World!',
      file: '/src/components/Goodbye.tsx'
    });
  });

  it('should handle messages without defaultMessage', () => {
    const resultWithoutDefaults: ExtractionResult = {
      messages: [{
        id: 'no.default',
        file: '/test.tsx'
      }],
      totalFiles: 1,
      totalMessages: 1
    };

    const result = formatAsJson(resultWithoutDefaults);
    const parsed = JSON.parse(result);

    expect(parsed['no.default']).toEqual({
      file: '/test.tsx'
    });
    expect(parsed['no.default']).not.toHaveProperty('defaultMessage');
  });

  it('should handle messages without description', () => {
    const resultWithoutDescription: ExtractionResult = {
      messages: [{
        id: 'no.description',
        defaultMessage: 'Test message',
        file: '/test.tsx'
      }],
      totalFiles: 1,
      totalMessages: 1
    };

    const result = formatAsJson(resultWithoutDescription);
    const parsed = JSON.parse(result);

    expect(parsed['no.description']).toEqual({
      defaultMessage: 'Test message',
      file: '/test.tsx'
    });
    expect(parsed['no.description']).not.toHaveProperty('description');
  });
});
