import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { MessageExtractor } from '../src/extractor.js';

describe('MessageExtractor', () => {
  const testDir = join(process.cwd(), 'test-fixtures');

  beforeEach(() => {
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('should extract basic T component with id and defaultMessage', () => {
    const testFile = join(testDir, 'basic.tsx');
    const content = `
import React from 'react';
import { T } from '@zero-intl/react';

function Component() {
  return (
    <div>
      <T id="hello.world" defaultMessage="Hello World!" />
    </div>
  );
}
`;
    writeFileSync(testFile, content);

    const extractor = new MessageExtractor();
    const messages = extractor.extractFromFile(testFile);

    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      id: 'hello.world',
      defaultMessage: 'Hello World!',
      file: testFile
    });
  });

  it('should extract T component with description', () => {
    const testFile = join(testDir, 'with-description.tsx');
    const content = `
import { T } from '@zero-intl/react';

export default function Page() {
  return <T id="user.greeting" defaultMessage="Welcome back!" description="Greeting message for returning users" />;
}
`;
    writeFileSync(testFile, content);

    const extractor = new MessageExtractor();
    const messages = extractor.extractFromFile(testFile);

    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      id: 'user.greeting',
      defaultMessage: 'Welcome back!',
      description: 'Greeting message for returning users',
      file: testFile
    });
  });

  it('should extract multiple T components from the same file', () => {
    const testFile = join(testDir, 'multiple.tsx');
    const content = `
import { T } from '@zero-intl/react';

function HomePage() {
  return (
    <div>
      <h1><T id="home.title" defaultMessage="Welcome" /></h1>
      <p><T id="home.subtitle" defaultMessage="Get started today" /></p>
      <button><T id="home.cta" defaultMessage="Sign Up" /></button>
    </div>
  );
}
`;
    writeFileSync(testFile, content);

    const extractor = new MessageExtractor();
    const messages = extractor.extractFromFile(testFile);

    expect(messages).toHaveLength(3);
    expect(messages.map(m => m.id)).toEqual(['home.title', 'home.subtitle', 'home.cta']);
  });

  it('should handle T components with only id', () => {
    const testFile = join(testDir, 'id-only.tsx');
    const content = `
import { T } from '@zero-intl/react';

function Component() {
  return <T id="simple.key" />;
}
`;
    writeFileSync(testFile, content);

    const extractor = new MessageExtractor();
    const messages = extractor.extractFromFile(testFile);

    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      id: 'simple.key',
      file: testFile
    });
    expect(messages[0]).not.toHaveProperty('defaultMessage');
  });

  it('should handle JSX expressions with string literals', () => {
    const testFile = join(testDir, 'expressions.tsx');
    const content = `
import { T } from '@zero-intl/react';

function Component() {
  return <T id={'dynamic.key'} defaultMessage={'Dynamic message'} />;
}
`;
    writeFileSync(testFile, content);

    const extractor = new MessageExtractor();
    const messages = extractor.extractFromFile(testFile);

    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      id: 'dynamic.key',
      defaultMessage: 'Dynamic message',
      file: testFile
    });
  });

  it('should ignore components without id', () => {
    const testFile = join(testDir, 'no-id.tsx');
    const content = `
import { T } from '@zero-intl/react';

function Component() {
  return <T defaultMessage="No ID here" />;
}
`;
    writeFileSync(testFile, content);

    const extractor = new MessageExtractor();
    const messages = extractor.extractFromFile(testFile);

    expect(messages).toHaveLength(0);
  });

  it('should handle self-closing and regular JSX elements', () => {
    const testFile = join(testDir, 'element-types.tsx');
    const content = `
import { T } from '@zero-intl/react';

function Component() {
  return (
    <div>
      <T id="self.closing" defaultMessage="Self closing" />
      <T id="regular.element" defaultMessage="Regular element"></T>
    </div>
  );
}
`;
    writeFileSync(testFile, content);

    const extractor = new MessageExtractor();
    const messages = extractor.extractFromFile(testFile);

    expect(messages).toHaveLength(2);
    expect(messages.map(m => m.id)).toEqual(['self.closing', 'regular.element']);
  });

  // New tests for t() function extraction
  it('should extract basic t function calls', () => {
    const testFile = join(testDir, 't-function-basic.tsx');
    const content = `
import React from 'react';
import { useTranslations } from '@zero-intl/react';

function Component() {
  const t = useTranslations();
  
  return (
    <div>
      <h1>{t('hello.world')}</h1>
    </div>
  );
}
`;
    writeFileSync(testFile, content);

    const extractor = new MessageExtractor();
    const messages = extractor.extractFromFile(testFile);

    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      id: 'hello.world',
      file: testFile
    });
    expect(messages[0]).not.toHaveProperty('defaultMessage');
  });

  it('should extract t function calls with defaultMessage', () => {
    const testFile = join(testDir, 't-function-with-default.tsx');
    const content = `
import React from 'react';
import { useTranslations } from '@zero-intl/react';

function Component() {
  const t = useTranslations();
  
  return (
    <div>
      <p>{t('greeting', { defaultMessage: 'Hello, world!' })}</p>
    </div>
  );
}
`;
    writeFileSync(testFile, content);

    const extractor = new MessageExtractor();
    const messages = extractor.extractFromFile(testFile);

    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      id: 'greeting',
      defaultMessage: 'Hello, world!',
      file: testFile
    });
  });

  it('should extract t function calls with description', () => {
    const testFile = join(testDir, 't-function-with-description.tsx');
    const content = `
import React from 'react';
import { useTranslations } from '@zero-intl/react';

function Component() {
  const t = useTranslations();
  
  return (
    <div>
      <label>{t('username', { 
        defaultMessage: 'Username', 
        description: 'Label for username input field' 
      })}</label>
    </div>
  );
}
`;
    writeFileSync(testFile, content);

    const extractor = new MessageExtractor();
    const messages = extractor.extractFromFile(testFile);

    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      id: 'username',
      defaultMessage: 'Username',
      description: 'Label for username input field',
      file: testFile
    });
  });

  //TODO: Not yet supported, help needed
  it.skip('should extract namespaced t function calls', () => {
    const testFile = join(testDir, 't-function-namespaced.tsx');
    const content = `
import React from 'react';
import { useTranslations } from '@zero-intl/react';

function Component() {
  const userT = useTranslations('user');
  const adminT = useTranslations('admin');
  
  return (
    <div>
      <h2>{userT('profile.title', { defaultMessage: 'Navigation' })}</h2>
      <h2>{adminT('dashboard.title')}</h2>
    </div>
  );
}
`;
    writeFileSync(testFile, content);

    const extractor = new MessageExtractor();
    const messages = extractor.extractFromFile(testFile);

    expect(messages).toHaveLength(2);
    expect(messages[0]).toMatchObject({
      id: 'profile.title',
      defaultMessage: 'Navigation',
      file: testFile
    });
    expect(messages[1]).toMatchObject({
      id: 'dashboard.title',
      file: testFile
    });
  });

  it('should extract multiple t function calls from the same file', () => {
    const testFile = join(testDir, 't-function-multiple.tsx');
    const content = `
import React from 'react';
import { useTranslations } from '@zero-intl/react';

function Component() {
  const t = useTranslations();
  
  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('greeting', { defaultMessage: 'Hello!' })}</p>
      <button>{t('actions.submit', { defaultMessage: 'Submit' })}</button>
    </div>
  );
}
`;
    writeFileSync(testFile, content);

    const extractor = new MessageExtractor();
    const messages = extractor.extractFromFile(testFile);

    expect(messages).toHaveLength(3);
    expect(messages.map(m => m.id)).toEqual(['welcome', 'greeting', 'actions.submit']);
  });

  it('should extract both T components and t function calls from the same file', () => {
    const testFile = join(testDir, 'mixed-extraction.tsx');
    const content = `
import React from 'react';
import { T, useTranslations } from '@zero-intl/react';

function Component() {
  const t = useTranslations();
  
  return (
    <div>
      <T id="jsx.component" defaultMessage="JSX Component" />
      <p>{t('function.call', { defaultMessage: 'Function Call' })}</p>
    </div>
  );
}
`;
    writeFileSync(testFile, content);

    const extractor = new MessageExtractor();
    const messages = extractor.extractFromFile(testFile);

    expect(messages).toHaveLength(2);
    expect(messages.find(m => m.id === 'jsx.component')).toMatchObject({
      id: 'jsx.component',
      defaultMessage: 'JSX Component',
      file: testFile
    });
    expect(messages.find(m => m.id === 'function.call')).toMatchObject({
      id: 'function.call',
      defaultMessage: 'Function Call',
      file: testFile
    });
  });

  it('should ignore non-t function calls', () => {
    const testFile = join(testDir, 'non-t-functions.tsx');
    const content = `
import React from 'react';

function Component() {
  const translate = (key) => key;
  const format = (key) => key;
  
  return (
    <div>
      <p>{translate('not.extracted')}</p>
      <p>{format('also.not.extracted')}</p>
    </div>
  );
}
`;
    writeFileSync(testFile, content);

    const extractor = new MessageExtractor();
    const messages = extractor.extractFromFile(testFile);

    expect(messages).toHaveLength(0);
  });

  it('should ignore t function calls without string literals', () => {
    const testFile = join(testDir, 't-function-dynamic.tsx');
    const content = `
import React from 'react';
import { useTranslations } from '@zero-intl/react';

function Component() {
  const t = useTranslations();
  const dynamicKey = 'dynamic.key';
  
  return (
    <div>
      <p>{t(dynamicKey)}</p>
      <p>{t(\`template.\${key}\`)}</p>
    </div>
  );
}
`;
    writeFileSync(testFile, content);

    const extractor = new MessageExtractor();
    const messages = extractor.extractFromFile(testFile);

    expect(messages).toHaveLength(0);
  });

  // New tests for T components with values prop containing JSX expressions
  it('should extract T component with values prop containing JSX function components', () => {
    const testFile = join(testDir, 't-with-jsx-values.tsx');
    const content = `
import React from 'react';
import { T } from '@zero-intl/react';

function Component() {
  return (
    <T id="poweredByXYZ" defaultMessage="Powered by <a>XYZ</a>" values={{
      a: (chunk: React.ReactNode) => (
        <a href="https://example.com" target="_blank" rel="noreferrer noopener nofollow"
           className="text-muted text-link--on-hover">
          {chunk}
        </a>
      )
    }} />
  );
}
`;
    writeFileSync(testFile, content);

    const extractor = new MessageExtractor();
    const messages = extractor.extractFromFile(testFile);

    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      id: 'poweredByXYZ',
      defaultMessage: 'Powered by <a>XYZ</a>',
      file: testFile
    });
    // Should not extract the values prop content as it contains JSX expressions
    expect(messages[0]).not.toHaveProperty('values');
  });

  it('should extract T component with values prop containing JSX elements', () => {
    const testFile = join(testDir, 't-with-jsx-element-values.tsx');
    const content = `
import React from 'react';
import { T } from '@zero-intl/react';

function Component() {
  return (
    <T id="poweredByXYZ" defaultMessage="Powered by {link}" values={{
      link: <a href="https://example.com" target="_blank" rel="noreferrer noopener nofollow"
            className="text-muted text-link--on-hover">
        XYZ
      </a>
    }} />
  );
}
`;
    writeFileSync(testFile, content);

    const extractor = new MessageExtractor();
    const messages = extractor.extractFromFile(testFile);

    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      id: 'poweredByXYZ',
      defaultMessage: 'Powered by {link}',
      file: testFile
    });
    // Should not extract the values prop content as it contains JSX expressions
    expect(messages[0]).not.toHaveProperty('values');
  });

  it('should extract T component with complex values prop containing multiple JSX expressions', () => {
    const testFile = join(testDir, 't-with-complex-jsx-values.tsx');
    const content = `
import React from 'react';
import { T } from '@zero-intl/react';

function Component() {
  return (
    <T id="complex.message" defaultMessage="Visit <link1>our website</link1> or <link2>contact us</link2>" values={{
      link1: (chunk: React.ReactNode) => (
        <a href="https://example.com" className="primary-link">
          {chunk}
        </a>
      ),
      link2: (chunk: React.ReactNode) => (
        <a href="mailto:contact@example.com" className="contact-link">
          {chunk}
        </a>
      )
    }} />
  );
}
`;
    writeFileSync(testFile, content);

    const extractor = new MessageExtractor();
    const messages = extractor.extractFromFile(testFile);

    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      id: 'complex.message',
      defaultMessage: 'Visit <link1>our website</link1> or <link2>contact us</link2>',
      file: testFile
    });
  });

  it('should extract T component with mixed values prop containing both simple values and JSX', () => {
    const testFile = join(testDir, 't-with-mixed-values.tsx');
    const content = `
import React from 'react';
import { T } from '@zero-intl/react';

function Component() {
  const userName = 'John';
  
  return (
    <T id="welcome.message" defaultMessage="Welcome {name}, visit <link>our help center</link>" values={{
      name: userName,
      count: 42,
      link: (chunk: React.ReactNode) => (
        <a href="/help" className="help-link">
          {chunk}
        </a>
      )
    }} />
  );
}
`;
    writeFileSync(testFile, content);

    const extractor = new MessageExtractor();
    const messages = extractor.extractFromFile(testFile);

    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      id: 'welcome.message',
      defaultMessage: 'Welcome {name}, visit <link>our help center</link>',
      file: testFile
    });
  });

  it('should extract T component with description and JSX values', () => {
    const testFile = join(testDir, 't-with-description-and-jsx.tsx');
    const content = `
import React from 'react';
import { T } from '@zero-intl/react';

function Component() {
  return (
    <T 
      id="footer.powered.by" 
      defaultMessage="Powered by <brand>XYZ</brand>" 
      description="Footer text with link to XYZ website"
      values={{
        brand: (chunk: React.ReactNode) => (
          <a href="https://example.com" target="_blank" rel="noopener noreferrer">
            {chunk}
          </a>
        )
      }} 
    />
  );
}
`;
    writeFileSync(testFile, content);

    const extractor = new MessageExtractor();
    const messages = extractor.extractFromFile(testFile);

    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      id: 'footer.powered.by',
      defaultMessage: 'Powered by <brand>XYZ</brand>',
      description: 'Footer text with link to XYZ website',
      file: testFile
    });
  });

  it('should extract multiple T components with JSX values from the same file', () => {
    const testFile = join(testDir, 'multiple-t-with-jsx.tsx');
    const content = `
import React from 'react';
import { T } from '@zero-intl/react';

function Component() {
  return (
    <div>
      <T id="header.title" defaultMessage="Welcome to <brand>ZeroIntl</brand>" values={{
        brand: (chunk: React.ReactNode) => <strong>{chunk}</strong>
      }} />
      
      <T id="footer.copyright" defaultMessage="© 2023 <company>Example Corp</company>" values={{
        company: (chunk: React.ReactNode) => <em>{chunk}</em>
      }} />
      
      <T id="simple.message" defaultMessage="Simple message without values" />
    </div>
  );
}
`;
    writeFileSync(testFile, content);

    const extractor = new MessageExtractor();
    const messages = extractor.extractFromFile(testFile);

    expect(messages).toHaveLength(3);
    expect(messages[0]).toMatchObject({
      id: 'header.title',
      defaultMessage: 'Welcome to <brand>ZeroIntl</brand>',
      file: testFile
    });
    expect(messages[1]).toMatchObject({
      id: 'footer.copyright',
      defaultMessage: '© 2023 <company>Example Corp</company>',
      file: testFile
    });
    expect(messages[2]).toMatchObject({
      id: 'simple.message',
      defaultMessage: 'Simple message without values',
      file: testFile
    });
  });

  it('should extract T component with inline JSX values', () => {
    const testFile = join(testDir, 't-with-inline-jsx.tsx');
    const content = `
import React from 'react';
import { T } from '@zero-intl/react';

function Component() {
  return (
    <T 
      id="terms.agreement" 
      defaultMessage="I agree to the <terms>Terms of Service</terms> and <privacy>Privacy Policy</privacy>" 
      values={{
        terms: (chunk: React.ReactNode) => <a href="/terms">{chunk}</a>,
        privacy: (chunk: React.ReactNode) => <a href="/privacy">{chunk}</a>
      }} 
    />
  );
}
`;
    writeFileSync(testFile, content);

    const extractor = new MessageExtractor();
    const messages = extractor.extractFromFile(testFile);

    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      id: 'terms.agreement',
      defaultMessage: 'I agree to the <terms>Terms of Service</terms> and <privacy>Privacy Policy</privacy>',
      file: testFile
    });
  });
});
