import React from 'react';
import { T } from '@zero-intl/react';

export function TestComponent() {
  return (
    <div>
      <h1>
        <T id="welcome.title" defaultMessage="Welcome to Zero Intl" description="Main welcome title" />
      </h1>
      <p>
        <T id="welcome.subtitle" defaultMessage="A lightweight internationalization library" />
      </p>
      <button>
        <T id="actions.get_started" defaultMessage="Get Started" />
      </button>
      <footer>
        <T id="footer.copyright" defaultMessage="© 2025 Zero Intl" />
      </footer>
    </div>
  );
}
