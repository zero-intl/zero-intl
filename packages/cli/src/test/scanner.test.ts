import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { FileScanner } from '../scanner.js';

describe('FileScanner', () => {
  const testDir = join(process.cwd(), 'test-fixtures-scanner');

  beforeEach(() => {
    mkdirSync(testDir, { recursive: true });
    mkdirSync(join(testDir, 'src'), { recursive: true });
    mkdirSync(join(testDir, 'components'), { recursive: true });
    mkdirSync(join(testDir, 'node_modules'), { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('should find TypeScript and TSX files', async () => {
    // Create test files
    writeFileSync(join(testDir, 'src', 'component.tsx'), 'export const Component = () => <div />;');
    writeFileSync(join(testDir, 'src', 'utils.ts'), 'export const util = () => {};');
    writeFileSync(join(testDir, 'components', 'Button.tsx'), 'export const Button = () => <button />;');
    writeFileSync(join(testDir, 'README.md'), '# README');

    const scanner = new FileScanner();
    const files = await scanner.scanFiles([join(testDir, '**/*.{ts,tsx}')]);

    expect(files).toHaveLength(3);
    expect(files.some(f => f.includes('component.tsx'))).toBe(true);
    expect(files.some(f => f.includes('utils.ts'))).toBe(true);
    expect(files.some(f => f.includes('Button.tsx'))).toBe(true);
    expect(files.some(f => f.includes('README.md'))).toBe(false);
  });

  it('should ignore node_modules and build directories', async () => {
    writeFileSync(join(testDir, 'src', 'component.tsx'), 'export const Component = () => <div />;');
    writeFileSync(join(testDir, 'node_modules', 'package.ts'), 'export const pkg = {};');

    const scanner = new FileScanner();
    const files = await scanner.scanFiles([join(testDir, '**/*.{ts,tsx}')]);

    expect(files).toHaveLength(1);
    expect(files[0]).toContain('component.tsx');
    expect(files.some(f => f.includes('node_modules'))).toBe(false);
  });

  it('should handle multiple patterns', async () => {
    writeFileSync(join(testDir, 'src', 'component.tsx'), 'export const Component = () => <div />;');
    writeFileSync(join(testDir, 'components', 'Button.jsx'), 'export const Button = () => <button />;');

    const scanner = new FileScanner();
    const files = await scanner.scanFiles([
      join(testDir, 'src/**/*.tsx'),
      join(testDir, 'components/**/*.jsx')
    ]);

    expect(files).toHaveLength(2);
    expect(files.some(f => f.includes('component.tsx'))).toBe(true);
    expect(files.some(f => f.includes('Button.jsx'))).toBe(true);
  });

  it('should return empty array for non-existent patterns', async () => {
    const scanner = new FileScanner();
    const files = await scanner.scanFiles([join(testDir, 'non-existent/**/*.ts')]);

    expect(files).toHaveLength(0);
  });
});
