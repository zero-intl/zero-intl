import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ZeroIntlProvider, useTranslations } from '../src/context';
import { T } from '../src/T';

function TestTranslationsComponent() {
  const t = useTranslations();

  return (
    <div>
      <div data-testid="simple">{t('simple')}</div>
      <div data-testid="with-values">{t('hello', { name: 'John' })}</div>
      <div data-testid="with-default">{t('missing.key', { defaultMessage: 'Default message' })}</div>
      <div data-testid="plural">{t('items', { count: 0 })}</div>
    </div>
  );
}

function TestWithTComponent() {
  const t = useTranslations();

  return (
    <div>
      <div data-testid="t-simple">
        <T id="simple" />
      </div>
      <div data-testid="t-values">
        <T id="hello" values={{ name: 'Alice' }} />
      </div>
    </div>
  );
}

describe('useTranslations', () => {
  const messages = {
    'simple': 'Hello',
    'hello': 'Hello, {name}!',
    'items': '{count, plural, one {# item} other {# items} =0 {No items}}'
  };

  it('should return a t function that formats messages', () => {
    render(
      <ZeroIntlProvider locale="en" messages={messages}>
        <TestTranslationsComponent />
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
        <TestWithTComponent />
      </ZeroIntlProvider>
    );

    expect(screen.getByTestId('t-simple')).toHaveTextContent('Hello');
    expect(screen.getByTestId('t-values')).toHaveTextContent('Hello, Alice!');
  });
});
