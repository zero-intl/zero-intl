import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ZeroIntlProvider, useTranslations } from '../src';

const messages = {
  'simple': 'Hello world',
  'with.bold': 'This is <b>bold</b> text',
  'with.link': 'Click <link>here</link> to continue',
  'complex': 'Welcome <strong>{name}</strong>, you have <em>{count}</em> messages',
  'nested': 'Click <button>Save <icon>💾</icon></button> now',
  'multiple.tags': 'This is <b>bold</b> and <i>italic</i> text'
};

function TestComponent() {
  const t = useTranslations();

  return (
    <div>
      {/* Basic string translation */}
      <span data-testid="simple">{t('simple')}</span>

      {/* Rich Text with bold */}
      <div data-testid="bold">
        {t.format('with.bold', undefined, {
          b: (chunks) => <strong className="bold">{chunks}</strong>
        })}
      </div>

      {/* Rich Text with custom link */}
      <div data-testid="link">
        {t.format('with.link', undefined, {
          link: (chunks) => <a href="/test" className="link">{chunks}</a>
        })}
      </div>

      {/* Rich Text with variables */}
      <div data-testid="complex">
        {t.format('complex', undefined, {
          strong: (chunks) => <strong>{chunks}</strong>,
          em: (chunks) => <em>{chunks}</em>
        }, {
          name: 'John',
          count: 5
        })}
      </div>

      {/* Nested components */}
      <div data-testid="nested">
        {t.format('nested', undefined, {
          button: (chunks) => <button className="save-btn">{chunks}</button>,
          icon: (chunks) => <span className="icon">{chunks}</span>
        })}
      </div>

      {/* Multiple tags */}
      <div data-testid="multiple">
        {t.format('multiple.tags', undefined, {
          b: (chunks) => <b>{chunks}</b>,
          i: (chunks) => <i>{chunks}</i>
        })}
      </div>

      {/* Fallback to default message */}
      <div data-testid="fallback">
        {t.format('missing.key', 'Default <b>message</b>', {
          b: (chunks) => <strong>{chunks}</strong>
        })}
      </div>
    </div>
  );
}

describe('useTranslations Rich Text', () => {
  it('should return string for basic t() function', () => {
    render(
      <ZeroIntlProvider locale="en" messages={messages}>
        <TestComponent />
      </ZeroIntlProvider>
    );

    expect(screen.getByTestId('simple')).toHaveTextContent('Hello world');
  });

  it('should format Rich Text with custom components', () => {
    render(
      <ZeroIntlProvider locale="en" messages={messages}>
        <TestComponent />
      </ZeroIntlProvider>
    );

    const boldElement = screen.getByTestId('bold');
    expect(boldElement).toContainHTML('<strong class="bold">bold</strong>');
    expect(boldElement).toHaveTextContent('This is bold text');
  });

  it('should render custom link components', () => {
    render(
      <ZeroIntlProvider locale="en" messages={messages}>
        <TestComponent />
      </ZeroIntlProvider>
    );

    const linkElement = screen.getByTestId('link');
    const link = linkElement.querySelector('a');
    expect(link).toHaveAttribute('href', '/test');
    expect(link).toHaveClass('link');
    expect(link).toHaveTextContent('here');
  });

  it('should handle variables in Rich Text', () => {
    render(
      <ZeroIntlProvider locale="en" messages={messages}>
        <TestComponent />
      </ZeroIntlProvider>
    );

    const complexElement = screen.getByTestId('complex');
    expect(complexElement).toContainHTML('<strong>John</strong>');
    expect(complexElement).toContainHTML('<em>5</em>');
    expect(complexElement).toHaveTextContent('Welcome John, you have 5 messages');
  });

  it('should handle nested components', () => {
    render(
      <ZeroIntlProvider locale="en" messages={messages}>
        <TestComponent />
      </ZeroIntlProvider>
    );

    const nestedElement = screen.getByTestId('nested');
    const button = nestedElement.querySelector('button');
    const icon = nestedElement.querySelector('.icon');

    expect(button).toHaveClass('save-btn');
    expect(icon).toHaveTextContent('💾');
    expect(button).toContainElement(icon);
  });

  it('should handle multiple tags in one message', () => {
    render(
      <ZeroIntlProvider locale="en" messages={messages}>
        <TestComponent />
      </ZeroIntlProvider>
    );

    const multipleElement = screen.getByTestId('multiple');
    expect(multipleElement).toContainHTML('<b>bold</b>');
    expect(multipleElement).toContainHTML('<i>italic</i>');
    expect(multipleElement).toHaveTextContent('This is bold and italic text');
  });

  it('should fallback to default message when key is missing', () => {
    render(
      <ZeroIntlProvider locale="en" messages={messages}>
        <TestComponent />
      </ZeroIntlProvider>
    );

    const fallbackElement = screen.getByTestId('fallback');
    expect(fallbackElement).toContainHTML('<strong>message</strong>');
    expect(fallbackElement).toHaveTextContent('Default message');
  });

  it('should handle missing components gracefully', () => {
    function TestMissingComponent() {
      const t = useTranslations();
      return (
        <div data-testid="missing-component">
          {t.format('with.bold', undefined, {})} {/* No components provided */}
        </div>
      );
    }

    render(
      <ZeroIntlProvider locale="en" messages={messages}>
        <TestMissingComponent />
      </ZeroIntlProvider>
    );

    const element = screen.getByTestId('missing-component');
    // Should render as plain text when component is missing
    expect(element).toHaveTextContent('This is bold text');
  });
});
