import { describe, it, expect } from 'vitest'
import { formatICUMessage, interpolateMessage, formatMessage } from '../utils'

describe('formatICUMessage', () => {
  describe('simple variable interpolation', () => {
    it('should replace simple variables', () => {
      const message = 'Hello, {name}!'
      const values = { name: 'John' }
      const result = formatICUMessage(message, values, 'en')
      expect(result).toBe('Hello, John!')
    })

    it('should handle multiple variables', () => {
      const message = '{greeting}, {name}! You have {count} messages.'
      const values = { greeting: 'Hi', name: 'Alice', count: 5 }
      const result = formatICUMessage(message, values, 'en')
      expect(result).toBe('Hi, Alice! You have 5 messages.')
    })

    it('should leave undefined variables unchanged', () => {
      const message = 'Hello, {name}! You have {count} messages.'
      const values = { name: 'Bob' }
      const result = formatICUMessage(message, values, 'en')
      expect(result).toBe('Hello, Bob! You have {count} messages.')
    })
  })

  describe('plural formatting', () => {
    it('should handle exact matches', () => {
      const message = '{count, plural, =0 {no items} =1 {one item} other {# items}}'

      expect(formatICUMessage(message, { count: 0 }, 'en')).toBe('no items')
      expect(formatICUMessage(message, { count: 1 }, 'en')).toBe('one item')
      expect(formatICUMessage(message, { count: 5 }, 'en')).toBe('5 items')
    })

    it('should handle plural rules', () => {
      const message = '{count, plural, one {# item} other {# items}}'

      expect(formatICUMessage(message, { count: 1 }, 'en')).toBe('1 item')
      expect(formatICUMessage(message, { count: 2 }, 'en')).toBe('2 items')
      expect(formatICUMessage(message, { count: 0 }, 'en')).toBe('0 items')
    })

    it('should replace # with the actual number', () => {
      const message = '{count, plural, other {You have # notifications}}'
      expect(formatICUMessage(message, { count: 42 }, 'en')).toBe('You have 42 notifications')
    })

    it('should handle complex plural messages', () => {
      const message = '{count, plural, =0 {No new messages} one {# new message} other {# new messages}}'

      expect(formatICUMessage(message, { count: 0 }, 'en')).toBe('No new messages')
      expect(formatICUMessage(message, { count: 1 }, 'en')).toBe('1 new message')
      expect(formatICUMessage(message, { count: 3 }, 'en')).toBe('3 new messages')
    })
  })

  describe('select formatting', () => {
    it('should handle basic select statements', () => {
      const message = '{gender, select, male {he} female {she} other {they}}'

      expect(formatICUMessage(message, { gender: 'male' }, 'en')).toBe('he')
      expect(formatICUMessage(message, { gender: 'female' }, 'en')).toBe('she')
      expect(formatICUMessage(message, { gender: 'unknown' }, 'en')).toBe('they')
    })

    it('should handle select with embedded variables', () => {
      const message = '{gender, select, male {Mr. {name}} female {Ms. {name}} other {{name}}}'
      const values = { gender: 'male', name: 'Smith' }

      expect(formatICUMessage(message, values, 'en')).toBe('Mr. Smith')
    })

    it('should fall back to other when no match found', () => {
      const message = '{status, select, active {Online} other {Offline}}'

      expect(formatICUMessage(message, { status: 'inactive' }, 'en')).toBe('Offline')
      expect(formatICUMessage(message, { status: 'pending' }, 'en')).toBe('Offline')
    })
  })

  describe('selectordinal formatting', () => {
    it('should handle ordinal numbers', () => {
      const message = '{rank, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}'

      expect(formatICUMessage(message, { rank: 1 }, 'en')).toBe('1st')
      expect(formatICUMessage(message, { rank: 2 }, 'en')).toBe('2nd')
      expect(formatICUMessage(message, { rank: 3 }, 'en')).toBe('3rd')
      expect(formatICUMessage(message, { rank: 4 }, 'en')).toBe('4th')
      expect(formatICUMessage(message, { rank: 21 }, 'en')).toBe('21st')
      expect(formatICUMessage(message, { rank: 22 }, 'en')).toBe('22nd')
      expect(formatICUMessage(message, { rank: 23 }, 'en')).toBe('23rd')
      expect(formatICUMessage(message, { rank: 24 }, 'en')).toBe('24th')
    })

    it('should handle exact matches in selectordinal', () => {
      const message = '{rank, selectordinal, =1 {Winner!} =2 {Runner-up!} other {#th place}}'

      expect(formatICUMessage(message, { rank: 1 }, 'en')).toBe('Winner!')
      expect(formatICUMessage(message, { rank: 2 }, 'en')).toBe('Runner-up!')
      expect(formatICUMessage(message, { rank: 5 }, 'en')).toBe('5th place')
    })
  })

  describe('complex messages', () => {
    it('should handle multiple ICU formatters in one message', () => {
      const message = '{name} {action, select, like {likes} other {liked}} {count, plural, one {this post} other {these posts}}'
      const values = { name: 'Alice', action: 'like', count: 2 }

      expect(formatICUMessage(message, values, 'en')).toBe('Alice likes these posts')
    })

    it('should handle nested variable replacement', () => {
      const message = '{gender, select, male {Mr. {name} has {count, plural, one {# item} other {# items}}} other {{name} has {count, plural, one {# item} other {# items}}}}'
      const values = { gender: 'male', name: 'John', count: 3 }

      expect(formatICUMessage(message, values, 'en')).toBe('Mr. John has 3 items')
    })
  })

  describe('edge cases', () => {
    it('should handle empty values object', () => {
      const message = 'Hello, world!'
      const result = formatICUMessage(message, {}, 'en')
      expect(result).toBe('Hello, world!')
    })

    it('should handle undefined values parameter', () => {
      const message = 'Hello, world!'
      const result = formatICUMessage(message, undefined as any, 'en')
      expect(result).toBe('Hello, world!')
    })

    // it('should handle malformed ICU syntax gracefully', () => {
    //   const message = '{count, plural, broken syntax}'
    //   const result = formatICUMessage(message, { count: 1 }, 'en')
    //   expect(result).toBe('{count, plural, broken syntax}')
    // })
  })
})

describe('interpolateMessage (legacy)', () => {
  it('should replace simple variables', () => {
    const message = 'Hello, {name}!'
    const values = { name: 'John' }
    const result = interpolateMessage(message, values)
    expect(result).toBe('Hello, John!')
  })

  it('should handle no values', () => {
    const message = 'Hello, world!'
    const result = interpolateMessage(message)
    expect(result).toBe('Hello, world!')
  })
})

describe('formatMessage', () => {
  const messages = {
    'hello': 'Hello, {name}!',
    'items': '{count, plural, one {# item} other {# items}}',
    'missing': 'This key exists'
  }

  const defaultMessages = {
    'hello': 'Hi, {name}!',
    'default-only': 'Only in default locale',
    'missing': 'Default version'
  }

  it('should format messages from current locale', () => {
    const result = formatMessage(
      messages,
      { id: 'hello', values: { name: 'Alice' } },
      'es',
      'en',
      defaultMessages
    )
    expect(result).toBe('Hello, Alice!')
  })

  it('should fallback to default locale when key is missing', () => {
    const result = formatMessage(
      {},
      { id: 'default-only' },
      'es',
      'en',
      defaultMessages
    )
    expect(result).toBe('Only in default locale')
  })

  it('should use defaultMessage when both locales missing the key', () => {
    const result = formatMessage(
      {},
      { id: 'nonexistent', defaultMessage: 'Fallback text' },
      'es',
      'en',
      {}
    )
    expect(result).toBe('Fallback text')
  })

  it('should return key when all fallbacks fail', () => {
    const result = formatMessage(
      {},
      { id: 'nonexistent' },
      'es',
      'en',
      {}
    )
    expect(result).toBe('nonexistent')
  })

  it('should call onError when translation is missing', () => {
    let errorMessage = ''
    const onError = (error: string) => { errorMessage = error }

    formatMessage(
      {},
      { id: 'missing-key' },
      'es',
      'en',
      {},
      onError
    )

    expect(errorMessage).toContain('Missing message for key: missing-key')
    expect(errorMessage).toContain('locale: es')
    expect(errorMessage).toContain('default locale: en')
  })

  it('should not fallback to default locale if current locale is same as default', () => {
    const result = formatMessage(
      {},
      { id: 'default-only' },
      'en',
      'en',
      defaultMessages
    )
    expect(result).toBe('default-only') // Should return key, not default message
  })
})
