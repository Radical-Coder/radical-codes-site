import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const pkgPath = resolve(__dirname, '../package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

describe('package.json – structure and scripts', () => {
  it('name is "radical-codes-site"', () => {
    expect(pkg.name).toBe('radical-codes-site');
  });

  it('build script invokes vite build', () => {
    expect(pkg.scripts.build).toBe('vite build');
  });

  it('dev script binds to 0.0.0.0', () => {
    expect(pkg.scripts.dev).toContain('--host 0.0.0.0');
  });

  it('check script runs build then npm audit', () => {
    expect(pkg.scripts.check).toContain('npm run build');
    expect(pkg.scripts.check).toContain('npm audit');
    expect(pkg.scripts.check).toContain('--audit-level=high');
  });

  it('test script is defined', () => {
    expect(pkg.scripts.test).toBeTruthy();
  });
});

describe('package.json – dependency placement', () => {
  it('vite is in devDependencies (not in dependencies)', () => {
    expect(pkg.devDependencies).toHaveProperty('vite');
    expect(pkg.dependencies).toBeUndefined();
  });

  it('vite version satisfies ^8.0.x range', () => {
    const viteVersion = pkg.devDependencies.vite;
    expect(viteVersion).toMatch(/^\^8\./);
  });

  it('package is marked private', () => {
    expect(pkg.private).toBe(true);
  });
});