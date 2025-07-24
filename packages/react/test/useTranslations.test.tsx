import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ZeroIntlProvider, useTranslations, T } from '../src';

const messages = {
  'hello': 'Hello',
  'greeting': 'Hello, {name}!',
  'items': '{count, plural, =0 {No items} =1 {One item} other {# items}}'
};

function TestComponent() {
  const t = useTranslations();

  return (
    <div>
      <span data-testid="simple">{t('hello')}</span>
      <span data-testid="with-values">{t('greeting', { name: 'John' })}</span>
      <span data-testid="with-default">{t('missing.key', {}, 'Default message')}</span>
      <span data-testid="plural">{t('items', { count: 0 })}</span>
    </div>
  );
}

describe('useTranslations', () => {
  it('should return a t function that formats messages', () => {
    render(
      <ZeroIntlProvider locale="en" messages={messages}>
        <TestComponent />
      </ZeroIntlProvider>
    );

    expect(screen.getByTestId('simple')).toHaveTextContent('Hello');
    expect(screen.getByTestId('with-values')).toHaveTextContent('Hello, John!');
    expect(screen.getByTestId('with-default')).toHaveTextContent('Default message');
    expect(screen.getByTestId('plural')).toHaveTextContent('No items');
  });

  it('should work with T component using useTranslations internally', () => {
    render(
      <ZeroIntlProvider locale="en" messages={messages}>
        <div>
          <T id="hello" data-testid="t-simple" />
          <T id="greeting" values={{ name: 'Alice' }} data-testid="t-values" />
        </div>
      </ZeroIntlProvider>
    );

    expect(screen.getByTestId('t-simple')).toHaveTextContent('Hello');
    expect(screen.getByTestId('t-values')).toHaveTextContent('Hello, Alice!');
  });
});
