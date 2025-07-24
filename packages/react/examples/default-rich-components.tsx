import React from 'react';
import { ZeroIntlProvider, useTranslations } from '@zero-intl/react';

const messages = {
  'welcome.message': 'Welcome to our <b>amazing</b> platform!',
  'user.bio': 'Check out my <link>profile</link> and <b>follow</b> me',
  'cta.message': 'Click <button>here</button> to get started',
  'feature.highlight': 'This feature is <highlight>new</highlight> and <b>exciting</b>!'
};

// Define default rich components at the provider level
const defaultRichComponents = {
  b: (chunks: React.ReactNode) => <strong className="font-bold text-blue-600">{chunks}</strong>,
  link: (chunks: React.ReactNode) => <a href="#" className="text-blue-500 hover:underline">{chunks}</a>,
  highlight: (chunks: React.ReactNode) => <span className="bg-yellow-200 px-1 rounded">{chunks}</span>
};

function ExampleComponent() {
  const t = useTranslations();

  return (
    <div className="space-y-4">
      {/* Uses default rich components (b and link) */}
      <p>
        {t.format('welcome.message')}
      </p>

      {/* Uses default rich components (link and b) */}
      <p>
        {t.format('user.bio')}
      </p>

      {/* Override default component and add new one */}
      <p>
        {t.format('cta.message', undefined, {
          button: (chunks) => (
            <button className="bg-green-500 text-white px-4 py-2 rounded">
              {chunks}
            </button>
          )
        })}
      </p>

      {/* Mix of default (b, highlight) components */}
      <p>
        {t.format('feature.highlight')}
      </p>

      {/* Override default component (b) while keeping others */}
      <p>
        {t.format('feature.highlight', undefined, {
          b: (chunks) => <em className="text-red-500 italic">{chunks}</em>
        })}
      </p>
    </div>
  );
}

function App() {
  return (
    <ZeroIntlProvider
      locale="en"
      messages={messages}
      defaultRichComponents={defaultRichComponents}
    >
      <div className="p-8">
        <h1 className="text-2xl mb-6">Default Rich Components Example</h1>
        <ExampleComponent />
      </div>
    </ZeroIntlProvider>
  );
}

export default App;
