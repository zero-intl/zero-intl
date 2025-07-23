import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { ZeroIntlProvider, useIntl } from '../context'
import { T } from '../T'

// Test component that uses useIntl hook
function TestComponent() {
  const intl = useIntl()

  return (
    <div>
      <div data-testid="locale">{intl.locale}</div>
      <div data-testid="simple-message">
        {intl.formatMessage({ id: 'hello', values: { name: 'World' } })}
      </div>
      <div data-testid="plural-message">
        {intl.formatMessage({ id: 'items', values: { count: 5 } })}
      </div>
      <div data-testid="missing-message">
        {intl.formatMessage({ id: 'nonexistent', defaultMessage: 'Default text' })}
      </div>
    </div>
  )
}

describe('ZeroIntlProvider', () => {
  const messages = {
    'hello': 'Hello, {name}!',
    'items': '{count, plural, one {# item} other {# items}}',
    'welcome': 'Welcome to our app'
  }

  const defaultMessages = {
    'hello': 'Hi, {name}!',
    'items': '{count, plural, one {# thing} other {# things}}',
    'default-only': 'This exists only in default locale'
  }

  it('should provide locale and messages to children', () => {
    render(
      <ZeroIntlProvider locale="en" messages={messages}>
        <TestComponent />
      </ZeroIntlProvider>
    )

    expect(screen.getByTestId('locale')).toHaveTextContent('en')
    expect(screen.getByTestId('simple-message')).toHaveTextContent('Hello, World!')
    expect(screen.getByTestId('plural-message')).toHaveTextContent('5 items')
  })

  it('should fallback to default locale when key is missing', () => {
    render(
      <ZeroIntlProvider
        locale="es"
        messages={{}}
        defaultLocale="en"
        defaultMessages={defaultMessages}
      >
        <TestComponent />
      </ZeroIntlProvider>
    )

    expect(screen.getByTestId('simple-message')).toHaveTextContent('Hi, World!')
    expect(screen.getByTestId('plural-message')).toHaveTextContent('5 things')
  })

  it('should use defaultMessage prop when translation is missing', () => {
    render(
      <ZeroIntlProvider locale="en" messages={{}}>
        <TestComponent />
      </ZeroIntlProvider>
    )

    expect(screen.getByTestId('missing-message')).toHaveTextContent('Default text')
  })

  it('should call onError when translation is missing', () => {
    const onError = vi.fn()

    render(
      <ZeroIntlProvider locale="en" messages={{}} onError={onError}>
        <TestComponent />
      </ZeroIntlProvider>
    )

    expect(onError).toHaveBeenCalledWith(
      expect.stringContaining('Missing message for key: hello')
    )
  })

  it('should use custom onRender function', () => {
    const onRender = vi.fn((record) => (
      <span data-testid="custom-render" data-key={record.translationKey}>
        {record.translation}
      </span>
    ))

    render(
      <ZeroIntlProvider locale="en" messages={messages} onRender={onRender}>
        <T id="welcome" />
      </ZeroIntlProvider>
    )

    expect(onRender).toHaveBeenCalledWith({
      translationKey: 'welcome',
      translation: 'Welcome to our app',
      locale: 'en',
      values: undefined
    })

    const customElement = screen.getByTestId('custom-render')
    expect(customElement).toHaveTextContent('Welcome to our app')
    expect(customElement).toHaveAttribute('data-key', 'welcome')
  })
})

describe('useIntl', () => {
  it('should throw error when used outside provider', () => {
    function ComponentWithoutProvider() {
      useIntl()
      return null
    }

    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<ComponentWithoutProvider />)
    }).toThrow('useIntl must be used within a ZeroIntlProvider')

    consoleSpy.mockRestore()
  })

  it('should return intl object with correct interface', () => {
    const messages = { test: 'Test message' }
    let intlObject: any

    function TestComponent() {
      intlObject = useIntl()
      return null
    }

    render(
      <ZeroIntlProvider locale="en" messages={messages}>
        <TestComponent />
      </ZeroIntlProvider>
    )

    expect(intlObject).toHaveProperty('locale', 'en')
    expect(intlObject).toHaveProperty('messages', messages)
    expect(intlObject).toHaveProperty('formatMessage')
    expect(typeof intlObject.formatMessage).toBe('function')
  })
})

describe('T Component', () => {
  const messages = {
    'hello': 'Hello, {name}!',
    'items': '{count, plural, one {# item} other {# items}}',
    'gender': '{gender, select, male {Mr. {name}} female {Ms. {name}} other {{name}}}',
    'rank': '{rank, selectordinal, one {#st place} two {#nd place} few {#rd place} other {#th place}}'
  }

  it('should render simple messages', () => {
    render(
      <ZeroIntlProvider locale="en" messages={messages}>
        <T id="hello" values={{ name: 'Alice' }} />
      </ZeroIntlProvider>
    )

    expect(screen.getByText('Hello, Alice!')).toBeInTheDocument()
  })

  // it('should render plural messages', () => {
  //   render(
  //     <ZeroIntlProvider locale="en" messages={messages}>
  //       <div>
  //         <T id="items" values={{ count: 1 }} />
  //         <T id="items" values={{ count: 5 }} />
  //       </div>
  //     </ZeroIntlProvider>
  //   )
  //
  //   expect(screen.getByText('1 item')).toBeInTheDocument()
  //   expect(screen.getByText('5 items')).toBeInTheDocument()
  // })

  // it('should render select messages', () => {
  //   render(
  //     <ZeroIntlProvider locale="en" messages={messages}>
  //       <div>
  //         <T id="gender" values={{ gender: 'male', name: 'John' }} />
  //         <T id="gender" values={{ gender: 'female', name: 'Jane' }} />
  //         <T id="gender" values={{ gender: 'other', name: 'Alex' }} />
  //       </div>
  //     </ZeroIntlProvider>
  //   )
  //
  //   expect(screen.getByText('Mr. John')).toBeInTheDocument()
  //   expect(screen.getByText('Ms. Jane')).toBeInTheDocument()
  //   expect(screen.getByText('Alex')).toBeInTheDocument()
  // })

  // it('should render selectordinal messages', () => {
  //   render(
  //     <ZeroIntlProvider locale="en" messages={messages}>
  //       <div>
  //         <T id="rank" values={{ rank: 1 }} />
  //         <T id="rank" values={{ rank: 2 }} />
  //         <T id="rank" values={{ rank: 3 }} />
  //         <T id="rank" values={{ rank: 4 }} />
  //       </div>
  //     </ZeroIntlProvider>
  //   )
  //
  //   expect(screen.getByText('1st place')).toBeInTheDocument()
  //   expect(screen.getByText('2nd place')).toBeInTheDocument()
  //   expect(screen.getByText('3rd place')).toBeInTheDocument()
  //   expect(screen.getByText('4th place')).toBeInTheDocument()
  // })

  it('should use defaultMessage when key is missing', () => {
    render(
      <ZeroIntlProvider locale="en" messages={{}}>
        <T id="missing" defaultMessage="Fallback text" />
      </ZeroIntlProvider>
    )

    expect(screen.getByText('Fallback text')).toBeInTheDocument()
  })

  it('should render with children render prop', () => {
    render(
      <ZeroIntlProvider locale="en" messages={messages}>
        <T id="hello" values={{ name: 'Bob' }}>
          {(message) => <strong data-testid="strong-message">{message}</strong>}
        </T>
      </ZeroIntlProvider>
    )

    const strongElement = screen.getByTestId('strong-message')
    expect(strongElement).toHaveTextContent('Hello, Bob!')
    expect(strongElement.tagName).toBe('STRONG')
  })

  it('should use onRender when provided', () => {
    const onRender = vi.fn((record) => (
      <div data-testid="custom-wrapper" data-key={record.translationKey}>
        [{record.translation}]
      </div>
    ))

    render(
      <ZeroIntlProvider locale="en" messages={messages} onRender={onRender}>
        <T id="hello" values={{ name: 'Charlie' }} />
      </ZeroIntlProvider>
    )

    expect(onRender).toHaveBeenCalledWith({
      translationKey: 'hello',
      translation: 'Hello, Charlie!',
      locale: 'en',
      values: { name: 'Charlie' }
    })

    const customElement = screen.getByTestId('custom-wrapper')
    expect(customElement).toHaveTextContent('[Hello, Charlie!]')
    expect(customElement).toHaveAttribute('data-key', 'hello')
  })

  it('should render translation key when message is missing and no fallbacks', () => {
    render(
      <ZeroIntlProvider locale="en" messages={{}}>
        <T id="nonexistent" />
      </ZeroIntlProvider>
    )

    expect(screen.getByText('nonexistent')).toBeInTheDocument()
  })

  // it('should handle complex nested ICU messages', () => {
  //   const complexMessages = {
  //     'complex': '{name} {action, select, like {likes} other {liked}} {count, plural, one {this post} other {these posts}} {time, selectordinal, one {for the #st time} two {for the #nd time} other {for the #th time}}'
  //   }
  //
  //   render(
  //     <ZeroIntlProvider locale="en" messages={complexMessages}>
  //       <T
  //         id="complex"
  //         values={{
  //           name: 'Alice',
  //           action: 'like',
  //           count: 2,
  //           time: 3
  //         }}
  //       />
  //     </ZeroIntlProvider>
  //   )
  //
  //   expect(screen.getByText('Alice likes these posts for the 3rd time')).toBeInTheDocument()
  // })
})
