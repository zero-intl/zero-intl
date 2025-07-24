import { describe, it, expect } from 'vitest';
import { formatICUMessage, interpolateMessage, formatMessage } from "../src";
import { MessageDescriptor } from "../src";

describe('formatICUMessage', () => {
  describe('Simple variable interpolation', () => {
    it('should replace simple variables', () => {
      const result = formatICUMessage('Hello {name}!', { name: 'John' }, 'en');
      expect(result).toBe('Hello John!');
    });

    it('should handle multiple variables', () => {
      const result = formatICUMessage('Hello {name}, you have {count} messages',
        { name: 'Alice', count: 5 }, 'en');
      expect(result).toBe('Hello Alice, you have 5 messages');
    });

    it('should leave unmatched variables as is', () => {
      const result = formatICUMessage('Hello {name}!', {}, 'en');
      expect(result).toBe('Hello {name}!');
    });
  });

  describe('Plural formatting', () => {
    it('should handle basic plural rules', () => {
      const message = '{count, plural, =0 {No items} =1 {One item} other {# items}}';

      expect(formatICUMessage(message, { count: 0 }, 'en')).toBe('No items');
      expect(formatICUMessage(message, { count: 1 }, 'en')).toBe('One item');
      expect(formatICUMessage(message, { count: 5 }, 'en')).toBe('5 items');
    });

    it('should handle plural with exact matches', () => {
      const message = '{count, plural, =0 {No followers} =1 {One follower} other {# followers}}';

      expect(formatICUMessage(message, { count: 0 }, 'en')).toBe('No followers');
      expect(formatICUMessage(message, { count: 1 }, 'en')).toBe('One follower');
      expect(formatICUMessage(message, { count: 42 }, 'en')).toBe('42 followers');
    });

    it('should use locale-specific plural rules', () => {
      const message = '{count, plural, one {# item} other {# items}}';

      // English: 1 is 'one', others are 'other'
      expect(formatICUMessage(message, { count: 1 }, 'en')).toBe('1 item');
      expect(formatICUMessage(message, { count: 2 }, 'en')).toBe('2 items');

      // Polish has different plural rules
      expect(formatICUMessage(message, { count: 1 }, 'pl')).toBe('1 item');
      expect(formatICUMessage(message, { count: 2 }, 'pl')).toBe('2 items');
    });

    it('should handle nested content in plural rules', () => {
      const message = '{count, plural, =0 {No new messages} =1 {You have {count} new message} other {You have {count} new messages}}';

      expect(formatICUMessage(message, { count: 0 }, 'en')).toBe('No new messages');
      expect(formatICUMessage(message, { count: 1 }, 'en')).toBe('You have 1 new message');
      expect(formatICUMessage(message, { count: 3 }, 'en')).toBe('You have 3 new messages');
    });
  });

  describe('Select formatting', () => {
    it('should handle basic select rules', () => {
      const message = '{gender, select, male {He} female {She} other {They}} will arrive soon';

      expect(formatICUMessage(message, { gender: 'male' }, 'en')).toBe('He will arrive soon');
      expect(formatICUMessage(message, { gender: 'female' }, 'en')).toBe('She will arrive soon');
      expect(formatICUMessage(message, { gender: 'non-binary' }, 'en')).toBe('They will arrive soon');
    });

    it('should handle select with complex content', () => {
      const message = '{status, select, online {User is online and active} offline {User is offline} away {User is away} other {User status unknown}}';

      expect(formatICUMessage(message, { status: 'online' }, 'en')).toBe('User is online and active');
      expect(formatICUMessage(message, { status: 'offline' }, 'en')).toBe('User is offline');
      expect(formatICUMessage(message, { status: 'unknown' }, 'en')).toBe('User status unknown');
    });
  });

  describe('SelectOrdinal formatting', () => {
    it('should handle ordinal numbers', () => {
      const message = '{place, selectordinal, =1 {1st} =2 {2nd} =3 {3rd} other {#th}} place';

      expect(formatICUMessage(message, { place: 1 }, 'en')).toBe('1st place');
      expect(formatICUMessage(message, { place: 2 }, 'en')).toBe('2nd place');
      expect(formatICUMessage(message, { place: 3 }, 'en')).toBe('3rd place');
      expect(formatICUMessage(message, { place: 4 }, 'en')).toBe('4th place');
      // Note: 21, 22, etc. use the 'other' rule in English ordinals, so they become "th"
      expect(formatICUMessage(message, { place: 21 }, 'en')).toBe('21th place');
      expect(formatICUMessage(message, { place: 22 }, 'en')).toBe('22th place');
    });

    it('should handle ordinal numbers with proper English rules', () => {
      // This test shows how to properly handle English ordinals with all rules
      const message = '{place, selectordinal, =1 {1st} =2 {2nd} =3 {3rd} =21 {21st} =22 {22nd} =23 {23rd} other {#th}} place';

      expect(formatICUMessage(message, { place: 1 }, 'en')).toBe('1st place');
      expect(formatICUMessage(message, { place: 21 }, 'en')).toBe('21st place');
      expect(formatICUMessage(message, { place: 22 }, 'en')).toBe('22nd place');
      expect(formatICUMessage(message, { place: 23 }, 'en')).toBe('23rd place');
      expect(formatICUMessage(message, { place: 24 }, 'en')).toBe('24th place');
    });
  });

  describe('Nested ICU patterns', () => {
    it('should handle nested plural and select', () => {
      const message = '{count, plural, =0 {No items} other {{gender, select, male {He has} female {She has} other {They have}} {count} items}}';

      expect(formatICUMessage(message, { count: 0 }, 'en')).toBe('No items');
      expect(formatICUMessage(message, { count: 3, gender: 'male' }, 'en')).toBe('He has 3 items');
      expect(formatICUMessage(message, { count: 5, gender: 'female' }, 'en')).toBe('She has 5 items');
    });

    it('should handle complex nested structures', () => {
      const message = '{hasItems, select, true {{count, plural, =1 {You have one item} other {You have # items}}} false {You have no items}}';

      expect(formatICUMessage(message, { hasItems: 'false' }, 'en')).toBe('You have no items');
      expect(formatICUMessage(message, { hasItems: 'true', count: 1 }, 'en')).toBe('You have one item');
      expect(formatICUMessage(message, { hasItems: 'true', count: 5 }, 'en')).toBe('You have 5 items');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty values', () => {
      expect(formatICUMessage('', {}, 'en')).toBe('');
      expect(formatICUMessage('Hello world', {}, 'en')).toBe('Hello world');
    });

    it('should handle missing variables gracefully', () => {
      const message = '{count, plural, other {# items}}';
      expect(formatICUMessage(message, {}, 'en')).toBe('{count, plural, other {# items}}');
    });

    it('should handle malformed ICU patterns', () => {
      expect(formatICUMessage('{invalid', {}, 'en')).toBe('{invalid');
      expect(formatICUMessage('{count, invalid, other {test}}', { count: 1 }, 'en')).toBe('{count, invalid, other {test}}');
    });

    it('should handle special characters in content', () => {
      const message = '{count, plural, other {# items with "quotes" and {braces}}}';
      expect(formatICUMessage(message, { count: 3 }, 'en')).toBe('3 items with "quotes" and {braces}');
    });
  });
});

describe('interpolateMessage', () => {
  it('should replace simple variables', () => {
    expect(interpolateMessage('Hello {name}!', { name: 'John' })).toBe('Hello John!');
  });

  it('should handle multiple variables', () => {
    expect(interpolateMessage('Hello {name}, you are {age} years old',
      { name: 'Alice', age: 25 })).toBe('Hello Alice, you are 25 years old');
  });

  it('should handle missing values', () => {
    expect(interpolateMessage('Hello {name}!', {})).toBe('Hello {name}!');
    expect(interpolateMessage('Hello {name}!')).toBe('Hello {name}!');
  });

  it('should convert values to strings', () => {
    expect(interpolateMessage('Count: {count}', { count: 42 })).toBe('Count: 42');
    expect(interpolateMessage('Flag: {flag}', { flag: true })).toBe('Flag: true');
  });
});

describe('formatMessage', () => {
  const messages = {
    'welcome': 'Welcome, {name}!',
    'items.count': '{count, plural, =0 {No items} =1 {One item} other {# items}}',
    'nested.key': 'Hello {user.name}!'
  };

  const defaultMessages = {
    'welcome': 'Welcome!',
    'fallback.key': 'This is a fallback message'
  };

  it('should format basic messages', () => {
    const descriptor: MessageDescriptor = {
      id: 'welcome',
      values: { name: 'John' }
    };

    const result = formatMessage(messages, descriptor, 'en');
    expect(result).toBe('Welcome, John!');
  });

  it('should handle ICU patterns', () => {
    const descriptor: MessageDescriptor = {
      id: 'items.count',
      values: { count: 5 }
    };

    const result = formatMessage(messages, descriptor, 'en');
    expect(result).toBe('5 items');
  });

  it('should use default message when key is missing', () => {
    const descriptor: MessageDescriptor = {
      id: 'missing.key',
      defaultMessage: 'Default message with {value}',
      values: { value: 'test' }
    };

    const result = formatMessage(messages, descriptor, 'en');
    expect(result).toBe('Default message with test');
  });

  it('should fallback to default locale', () => {
    const descriptor: MessageDescriptor = {
      id: 'fallback.key'
    };

    const result = formatMessage({}, descriptor, 'fr', 'en', defaultMessages);
    expect(result).toBe('This is a fallback message');
  });

  it('should call onError for missing messages', () => {
    const errors: string[] = [];
    const onError = (error: string) => errors.push(error);

    const descriptor: MessageDescriptor = {
      id: 'missing.key'
    };

    const result = formatMessage(messages, descriptor, 'en', undefined, undefined, onError);
    expect(result).toBe('missing.key');
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('Missing message for key: missing.key');
  });

  it('should prefer message over default message', () => {
    const descriptor: MessageDescriptor = {
      id: 'welcome',
      defaultMessage: 'This should not be used',
      values: { name: 'Alice' }
    };

    const result = formatMessage(messages, descriptor, 'en');
    expect(result).toBe('Welcome, Alice!');
  });

  it('should handle empty values', () => {
    const descriptor: MessageDescriptor = {
      id: 'welcome',
      values: {}
    };

    const result = formatMessage(messages, descriptor, 'en');
    expect(result).toBe('Welcome, {name}!');
  });
});
