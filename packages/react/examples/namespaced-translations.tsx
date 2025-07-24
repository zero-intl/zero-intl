import React from 'react';
import { ZeroIntlProvider, useTranslations } from '@zero-intl/react';

const messages = {
  // Common namespace
  'common.hello': 'Hello',
  'common.goodbye': 'Goodbye',
  'common.welcome': 'Welcome, {name}!',
  'common.loading': 'Loading...',

  // Navigation namespace
  'navigation.home': 'Home',
  'navigation.about': 'About',
  'navigation.contact': 'Contact',
  'navigation.profile': 'Profile',

  // Error namespace
  'errors.notFound': 'Page not found',
  'errors.serverError': 'Server error occurred',
  'errors.validation': 'Please check your input',

  // User namespace with rich text
  'user.bio': 'Check out my <link>profile</link>',
  'user.followers': '{count, plural, =0 {No followers} =1 {One follower} other {# followers}}',
};

function CommonExample() {
  // Namespaced translation - 'common' prefix will be added automatically
  const t = useTranslations('common');

  return (
    <div className="space-y-2">
      <h3>Common Namespace Examples:</h3>
      <p>{t('hello')}</p> {/* Resolves to 'common.hello' */}
      <p>{t('goodbye')}</p> {/* Resolves to 'common.goodbye' */}
      <p>{t('welcome', { name: 'John' })}</p> {/* Resolves to 'common.welcome' */}
      <p>{t('loading')}</p> {/* Resolves to 'common.loading' */}
    </div>
  );
}

function NavigationExample() {
  const t = useTranslations('navigation');

  return (
    <nav className="space-x-4">
      <span>Navigation: </span>
      <a href="#">{t('home')}</a> {/* Resolves to 'navigation.home' */}
      <a href="#">{t('about')}</a> {/* Resolves to 'navigation.about' */}
      <a href="#">{t('contact')}</a> {/* Resolves to 'navigation.contact' */}
      <a href="#">{t('profile')}</a> {/* Resolves to 'navigation.profile' */}
    </nav>
  );
}

function ErrorExample() {
  const t = useTranslations('errors');

  return (
    <div className="space-y-2 text-red-600">
      <h3>Error Messages:</h3>
      <p>{t('notFound')}</p> {/* Resolves to 'errors.notFound' */}
      <p>{t('serverError')}</p> {/* Resolves to 'errors.serverError' */}
      <p>{t('validation')}</p> {/* Resolves to 'errors.validation' */}
    </div>
  );
}

function UserExample() {
  const t = useTranslations('user');

  return (
    <div className="space-y-2">
      <h3>User Namespace with Rich Text:</h3>
      <p>
        {t.format('bio', undefined, {
          link: (chunks) => <a href="/profile" className="text-blue-500">{chunks}</a>
        })} {/* Resolves to 'user.bio' */}
      </p>
      <p>{t('followers', { count: 42 })}</p> {/* Resolves to 'user.followers' */}
    </div>
  );
}

function GlobalExample() {
  // No namespace - uses full keys
  const t = useTranslations();

  return (
    <div className="space-y-2">
      <h3>Global (No Namespace):</h3>
      <p>{t('common.hello')}</p> {/* Must use full key */}
      <p>{t('navigation.home')}</p> {/* Must use full key */}
      <p>{t('errors.notFound')}</p> {/* Must use full key */}
    </div>
  );
}

function App() {
  return (
    <ZeroIntlProvider
      locale="en"
      messages={messages}
      defaultRichComponents={{
        link: (chunks) => <a href="#" className="underline">{chunks}</a>
      }}
    >
      <div className="p-8 space-y-6">
        <h1 className="text-3xl font-bold">Namespaced Translations Example</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border p-4 rounded">
            <CommonExample />
          </div>

          <div className="border p-4 rounded">
            <NavigationExample />
          </div>

          <div className="border p-4 rounded">
            <ErrorExample />
          </div>

          <div className="border p-4 rounded">
            <UserExample />
          </div>
        </div>

        <div className="border p-4 rounded">
          <GlobalExample />
        </div>
      </div>
    </ZeroIntlProvider>
  );
}

export default App;
