import React, { useState } from 'react';
import { ZeroIntlProvider, T, useIntl, useTranslations } from '@zero-intl/react';

// English messages
const messagesEn = {
  'welcome.title': 'Welcome to Zero Intl!',
  'welcome.subtitle': 'A modern internationalization library',
  'user.greeting': 'Hello, {name}!',
  'items.count': '{count, plural, =0 {No items} =1 {One item} other {# items}}',
  'rich.text': 'Click <link>here</link> to learn more',
  'rich.bold': 'This is <b>bold</b> and <i>italic</i> text',
};

// Polish messages
const messagesPl = {
  'welcome.title': 'Witaj w Zero Intl!',
  'welcome.subtitle': 'Nowoczesna biblioteka do internacjonalizacji',
  'user.greeting': 'Cześć, {name}!',
  'items.count': '{count, plural, =0 {Brak elementów} =1 {Jeden element} few {# elementy} many {# elementów} other {# elementów}}',
  'rich.text': 'Kliknij <link>tutaj</link> aby dowiedzieć się więcej',
  'rich.bold': 'To jest <b>pogrubiony</b> i <i>kursywa</i> tekst',
};

function TranslationsDemo() {
  const intl = useIntl();
  const t = useTranslations();
  const [count, setCount] = useState(1);

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1>
        <T id="welcome.title" />
      </h1>

      <p>
        <T id="welcome.subtitle" />
      </p>

      <hr />

      <h2>Variable interpolation:</h2>
      <p>
        <T id="user.greeting" values={{ name: 'Jakub' }} />
      </p>

      <hr />

      <h2>Pluralization:</h2>
      <p>
        <T id="items.count" values={{ count }} />
      </p>
      <div>
        <button onClick={() => setCount(Math.max(0, count - 1))}>-</button>
        <span style={{ margin: '0 10px' }}>{count}</span>
        <button onClick={() => setCount(count + 1)}>+</button>
      </div>

      <hr />

      <h2>Rich Text (with components):</h2>
      <p>
        <T
          id="rich.text"
          values={{
            link: (chunks: React.ReactNode) => <a href="#" style={{ color: 'blue' }}>{chunks}</a>
          }}
        />
      </p>
      <p>
        <T
          id="rich.bold"
          values={{
            b: (chunks: React.ReactNode) => <strong>{chunks}</strong>,
            i: (chunks: React.ReactNode) => <em>{chunks}</em>
          }}
        />
      </p>

      <hr />

      <h2>Using useIntl hook:</h2>
      <p>
        {intl.formatMessage({ id: 'user.greeting', values: { name: 'Hook User' } })}
      </p>

      <hr />

      <h2>Using useTranslations hook:</h2>
      <p>{t('welcome.title')}</p>

      <hr />

      <h2>Missing translation (fallback):</h2>
      <p>
        <T id="missing.key" defaultMessage="This is the default message" />
      </p>

      <hr />

      <h2>Locale info:</h2>
      <p>Current locale: <strong>{intl.locale}</strong></p>
    </div>
  );
}

function ComponentWithoutProvider() {
  const t = useTranslations();
  return (
    <div style={{ padding: '20px', background: '#fff3cd', margin: '20px' }}>
      <h3>Component without Provider (testing fallback):</h3>
      <p>{t('some.key')}</p>
    </div>
  );
}

export default function App() {
  const [locale, setLocale] = useState<'en' | 'pl'>('en');
  const messages = locale === 'en' ? messagesEn : messagesPl;

  return (
    <div>
      <div style={{ padding: '20px', background: '#f0f0f0' }}>
        <h3>Language switcher:</h3>
        <button
          onClick={() => setLocale('en')}
          style={{ fontWeight: locale === 'en' ? 'bold' : 'normal', marginRight: '10px' }}
        >
          🇬🇧 English
        </button>
        <button
          onClick={() => setLocale('pl')}
          style={{ fontWeight: locale === 'pl' ? 'bold' : 'normal' }}
        >
          🇵🇱 Polski
        </button>
      </div>

      <ZeroIntlProvider locale={locale} messages={messages}>
        <TranslationsDemo />
      </ZeroIntlProvider>

      <ComponentWithoutProvider />
    </div>
  );
}
