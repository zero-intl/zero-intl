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
});
