import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Prisma workspace tooling', () => {
  it('generates the Prisma client on install for clean checkouts', () => {
    const packageJson = JSON.parse(
      readFileSync(resolve(__dirname, '../../../../../package.json'), 'utf8'),
    ) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts?.postinstall).toContain('prisma:generate');
  });
});
