import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { ZeroIntlProvider, useIntl } from '../src/context'
import { T } from '../src/T'

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

describe('T component with React components in values', () => {
  it('should render T component with function components in values prop', () => {
    const messages = {
      'poweredBySimpleLocalize': 'Powered by <a>SimpleLocalize.io</a>'
    };

    render(
      <ZeroIntlProvider locale="en" messages={messages}>
        <T
          id="poweredBySimpleLocalize"
          defaultMessage="Powered by <a>SimpleLocalize.io</a>"
          values={{
            a: (chunk: React.ReactNode) => (
              <a
                href="https://simplelocalize.io"
                target="_blank"
                rel="noreferrer noopener nofollow"
                className="text-muted text-link--on-hover"
              >
                {chunk}
              </a>
            )
          }}
        />
      </ZeroIntlProvider>
    );

    const linkElement = screen.getByRole('link', { name: 'SimpleLocalize.io' });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', 'https://simplelocalize.io');
    expect(linkElement).toHaveAttribute('target', '_blank');
    expect(linkElement).toHaveAttribute('rel', 'noreferrer noopener nofollow');
    expect(linkElement).toHaveClass('text-muted', 'text-link--on-hover');
    expect(screen.getByText('Powered by')).toBeInTheDocument();
  });

  it('should render T component with JSX elements in values prop', () => {
    const messages = {
      'poweredBySimpleLocalize': 'Powered by {link}'
    };

    render(
      <ZeroIntlProvider locale="en" messages={messages}>
        <T
          id="poweredBySimpleLocalize"
          defaultMessage="Powered by {link}"
          values={{
            link: (
              <a
                href="https://simplelocalize.io"
                target="_blank"
                rel="noreferrer noopener nofollow"
                className="text-muted text-link--on-hover"
              >
                SimpleLocalize.io
              </a>
            )
          }}
        />
      </ZeroIntlProvider>
    );

    const linkElement = screen.getByRole('link', { name: 'SimpleLocalize.io' });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', 'https://simplelocalize.io');
    expect(linkElement).toHaveAttribute('target', '_blank');
    expect(linkElement).toHaveAttribute('rel', 'noreferrer noopener nofollow');
    expect(linkElement).toHaveClass('text-muted', 'text-link--on-hover');
    expect(screen.getByText(/Powered by/)).toBeInTheDocument();
  });

  it('should render T component with mixed values (components and primitives)', () => {
    const messages = {
      'welcomeMessage': 'Welcome {name}, visit <link>our website</link> for {count} resources'
    };

    render(
      <ZeroIntlProvider locale="en" messages={messages}>
        <T
          id="welcomeMessage"
          defaultMessage="Welcome {name}, visit <link>our website</link> for {count} resources"
          values={{
            name: 'John',
            count: 42,
            link: (chunk: React.ReactNode) => (
              <a href="https://example.com" className="primary-link">
                {chunk}
              </a>
            )
          }}
        />
      </ZeroIntlProvider>
    );

    expect(screen.getByText(/Welcome/)).toBeInTheDocument();
    expect(screen.getByText(/John/)).toBeInTheDocument();
    expect(screen.getByText(/visit/)).toBeInTheDocument();
    expect(screen.getByText(/for/)).toBeInTheDocument();
    expect(screen.getByText(/42/)).toBeInTheDocument();
    expect(screen.getByText(/resources/)).toBeInTheDocument();

    const linkElement = screen.getByRole('link', { name: 'our website' });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', 'https://example.com');
    expect(linkElement).toHaveClass('primary-link');
  });

  it('should render T component with multiple React components', () => {
    const messages = {
      'termsMessage': 'I agree to the <terms>Terms of Service</terms> and <privacy>Privacy Policy</privacy>'
    };

    render(
      <ZeroIntlProvider locale="en" messages={messages}>
        <T
          id="termsMessage"
          defaultMessage="I agree to the <terms>Terms of Service</terms> and <privacy>Privacy Policy</privacy>"
          values={{
            terms: (chunk: React.ReactNode) => (
              <a href="/terms" className="terms-link">
                {chunk}
              </a>
            ),
            privacy: (chunk: React.ReactNode) => (
              <a href="/privacy" className="privacy-link">
                {chunk}
              </a>
            )
          }}
        />
      </ZeroIntlProvider>
    );

    expect(screen.getByText(/I agree to the/)).toBeInTheDocument();
    expect(screen.getByText(/and/)).toBeInTheDocument();

    const termsLink = screen.getByRole('link', { name: 'Terms of Service' });
    expect(termsLink).toBeInTheDocument();
    expect(termsLink).toHaveAttribute('href', '/terms');
    expect(termsLink).toHaveClass('terms-link');

    const privacyLink = screen.getByRole('link', { name: 'Privacy Policy' });
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute('href', '/privacy');
    expect(privacyLink).toHaveClass('privacy-link');
  });

  it('should fallback to regular formatting when no React components are present', () => {
    const messages = {
      'simpleMessage': 'Hello {name}, you have {count} messages'
    };

    render(
      <ZeroIntlProvider locale="en" messages={messages}>
        <T
          id="simpleMessage"
          defaultMessage="Hello {name}, you have {count} messages"
          values={{
            name: 'Alice',
            count: 5
          }}
        />
      </ZeroIntlProvider>
    );

    expect(screen.getByText('Hello Alice, you have 5 messages')).toBeInTheDocument();
  });

  it('should handle nested components properly', () => {
    const messages = {
      'nestedMessage': 'Click <button>here <icon>→</icon></button> to continue'
    };

    render(
      <ZeroIntlProvider locale="en" messages={messages}>
        <T
          id="nestedMessage"
          defaultMessage="Click <button>here <icon>→</icon></button> to continue"
          values={{
            button: (chunk: React.ReactNode) => (
              <button className="cta-button" type="button">
                {chunk}
              </button>
            ),
            icon: (chunk: React.ReactNode) => (
              <span className="icon" aria-hidden="true">
                {chunk}
              </span>
            )
          }}
        />
      </ZeroIntlProvider>
    );

    expect(screen.getByText(/Click/)).toBeInTheDocument();
    expect(screen.getByText(/to continue/)).toBeInTheDocument();

    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).toHaveClass('cta-button');

    const iconElement = screen.getByText('→');
    expect(iconElement).toBeInTheDocument();
    expect(iconElement).toHaveClass('icon');
    expect(iconElement).toHaveAttribute('aria-hidden', 'true');
  });

  it('should use defaultMessage when message is not found in messages object', () => {
    const messages = {}; // Empty messages

    render(
      <ZeroIntlProvider locale="en" messages={messages}>
        <T
          id="missingKey"
          defaultMessage="Default <link>message</link> here"
          values={{
            link: (chunk: React.ReactNode) => (
              <a href="/default" className="default-link">
                {chunk}
              </a>
            )
          }}
        />
      </ZeroIntlProvider>
    );

    expect(screen.getByText(/Default/)).toBeInTheDocument();
    expect(screen.getByText(/here/)).toBeInTheDocument();

    const linkElement = screen.getByRole('link', { name: 'message' });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', '/default');
    expect(linkElement).toHaveClass('default-link');
  });
});
