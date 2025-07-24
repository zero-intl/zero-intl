import React from 'react';
import { ZeroIntlProvider, useTranslations } from '@zero-intl/react';

const messages = {
  'followers': '{count, plural, =0 {No followers} =1 {One follower} other {# followers}}',
  'bio': 'Check out my <b>awesome</b> profile with <link>custom link</link>!',
  'welcome': 'Welcome <strong>{name}</strong>, you have <em>{count}</em> notifications',
  'rich.text': 'This is <b>bold</b>, <i>italic</i> and <link>a link</link>',
  'nested': 'Click <button>here <icon>📋</icon> to copy</button>'
};

function UserProfile({ user }: { user: { name: string, followers: any[], bio: string } }) {
  const t = useTranslations();

  return (
    <div>
      {/* Zwykłe formatowanie zwracające string */}
      <p>{t('followers', { count: user.followers.length })}</p>

      {/* Rich Text formatowanie zwracające ReactNode */}
      <div>
        {t.format('bio', "my default <b>message</b>", {
          b: (chunks) => <b style={{ color: 'red' }}>{chunks}</b>,
          link: (chunks) => <a href="/profile" className="custom-link">{chunks}</a>
        })}
      </div>

      {/* Więcej zaawansowanych przykładów */}
      <div>
        {t.format('welcome', 'Welcome <strong>{name}</strong>!', {
          strong: (chunks) => <strong className="highlight">{chunks}</strong>,
          em: (chunks) => <em className="notification-count">{chunks}</em>
        }, {
          name: user.name,
          count: 5
        })}
      </div>

      {/* Zagnieżdżone komponenty */}
      <div>
        {t.format('nested', undefined, {
          button: (chunks) => (
            <button className="copy-btn" onClick={() => navigator.clipboard.writeText('copied!')}>
              {chunks}
            </button>
          ),
          icon: (chunks) => <span className="icon">{chunks}</span>
        })}
      </div>

      {/* Przykład z różnymi tagami */}
      <div>
        {t.format('rich.text', undefined, {
          b: (chunks) => <strong className="bold">{chunks}</strong>,
          i: (chunks) => <em className="italic">{chunks}</em>,
          link: (chunks) => <a href="#" className="link">{chunks}</a>
        })}
      </div>
    </div>
  );
}

function App() {
  const user = {
    name: 'John Doe',
    followers: [1, 2, 3],
    bio: 'Developer'
  };

  return (
    <ZeroIntlProvider locale="en" messages={messages}>
      <UserProfile user={user} />
    </ZeroIntlProvider>
  );
}

// Przykład zaawansowanych komponentów
function AdvancedExample() {
  const t = useTranslations();

  const richComponents = {
    // Komponent z własnymi props
    button: (chunks: React.ReactNode) => (
      <button
        className="btn btn-primary"
        onClick={() => alert('Clicked!')}
      >
        {chunks}
      </button>
    ),

    // Komponent z ikonami
    icon: (chunks: React.ReactNode) => (
      <span className="icon" role="img" aria-label="icon">
        {chunks}
      </span>
    ),

    // Link z routing
    link: (chunks: React.ReactNode) => (
      <a
        href="/custom-route"
        className="text-blue-500 hover:underline"
        onClick={(e) => {
          e.preventDefault();
          // Handle routing
        }}
      >
        {chunks}
      </a>
    ),

    // Komponent z kolorami
    highlight: (chunks: React.ReactNode) => (
      <span
        className="bg-yellow-200 px-1 rounded"
        style={{ backgroundColor: '#fef08a' }}
      >
        {chunks}
      </span>
    )
  };

  return (
    <div className="p-4">
      <h2>Advanced Rich Text Examples</h2>

      {/* Przykład 1: Button w tekście */}
      <p>
        {t.format(
          'action.message',
          'Click <button>this button</button> to continue',
          richComponents
        )}
      </p>

      {/* Przykład 2: Multiple komponenty */}
      <p>
        {t.format(
          'complex.message',
          'Check out our <highlight>special offer</highlight> and <link>learn more</link>!',
          richComponents
        )}
      </p>

      {/* Przykład 3: Z wartościami */}
      <p>
        {t.format(
          'user.notification',
          'Hello <highlight>{username}</highlight>, you have {count} new messages!',
          richComponents,
          { username: 'Alice', count: 3 }
        )}
      </p>
    </div>
  );
}

export { App, AdvancedExample };
