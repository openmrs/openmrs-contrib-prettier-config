import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import config from '../index.cjs';
import { fixtures } from './fixtures.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
const prettierVersion = require('prettier/package.json').version;
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function run(command, args, cwd, expectedStatus = 0) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' });
  assert.ifError(result.error);
  assert.equal(result.status, expectedStatus, `${command} ${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
  return result.stdout.trim();
}

test('packed artifact supports consumer config discovery, overrides and ignores', () => {
  const temporary = mkdtempSync(join(tmpdir(), 'openmrs-prettier-'));
  try {
    const [packed] = JSON.parse(run(npm, ['pack', '--json', '--pack-destination', temporary], root));
    assert.deepEqual(packed.files.map(({ path }) => path).sort(), [
      'LICENSE',
      'README.md',
      'index.cjs',
      'package.json',
    ]);
    const consumer = join(temporary, 'consumer');
    mkdirSync(consumer);
    writeFileSync(join(consumer, 'package.json'), JSON.stringify({ name: 'packed-config-consumer', private: true }));
    // Reuse cached tarballs, but allow registry metadata requests after a clean npm ci.
    run(
      npm,
      [
        'install',
        '--prefer-offline',
        '--ignore-scripts',
        '--no-audit',
        '--no-fund',
        join(temporary, packed.filename),
        `prettier@${prettierVersion}`,
      ],
      consumer,
    );
    const cli = join(consumer, 'node_modules/prettier/bin/prettier.cjs');
    assert.deepEqual(
      JSON.parse(
        run(process.execPath, ['-e', "console.log(JSON.stringify(require('@openmrs/prettier-config')))"], consumer),
      ),
      config,
    );
    assert.deepEqual(
      JSON.parse(
        run(
          process.execPath,
          [
            '--input-type=module',
            '-e',
            "import config from '@openmrs/prettier-config'; console.log(JSON.stringify(config))",
          ],
          consumer,
        ),
      ),
      config,
    );

    const ignore = join(consumer, '.prettierignore');
    writeFileSync(ignore, '**/ignored.ts\n');
    const variants = [
      ['commonjs', 'prettier.config.cjs', "module.exports = require('@openmrs/prettier-config');\n", ''],
      ['esm', 'prettier.config.mjs', "import config from '@openmrs/prettier-config';\nexport default config;\n", ''],
      ['json', '.prettierrc', '"@openmrs/prettier-config"\n', ''],
      [
        'workspace',
        'prettier.config.cjs',
        "module.exports = require('@openmrs/prettier-config');\n",
        'packages/example/src',
      ],
    ];
    for (const [name, filename, contents, nested] of variants) {
      const directory = join(consumer, name);
      const source = join(directory, nested || 'src');
      mkdirSync(source, { recursive: true });
      const configPath = join(directory, filename);
      writeFileSync(configPath, contents);
      for (const fixture of fixtures) writeFileSync(join(source, fixture.filepath), fixture.input);
      writeFileSync(join(source, 'ignored.ts'), 'function {');
      const target = join(source, fixtures[0].filepath);
      for (const cwd of [directory, source]) {
        const discovered = run(process.execPath, [cli, '--find-config-path', target], cwd);
        assert.equal(resolve(cwd, discovered), configPath);
      }
      const args = [cli, '.', '--ignore-path', ignore];
      run(process.execPath, [...args, '--check'], source, 1);
      run(process.execPath, [...args, '--write'], source);
      run(process.execPath, [...args, '--check'], source);
      for (const fixture of fixtures)
        assert.equal(readFileSync(join(source, fixture.filepath), 'utf8'), fixture.expected);
      assert.equal(readFileSync(join(source, 'ignored.ts'), 'utf8'), 'function {');
    }

    const overridden = join(consumer, 'override');
    mkdirSync(overridden);
    writeFileSync(
      join(overridden, 'prettier.config.cjs'),
      "module.exports = { ...require('@openmrs/prettier-config'), bracketSameLine: true };\n",
    );
    const jsxPath = join(overridden, 'example.tsx');
    writeFileSync(
      jsxPath,
      '<PatientCard identifier="a-long-patient-identifier" description="a-long-encounter-description" location="a-long-location-description">Patient</PatientCard>',
    );
    run(process.execPath, [cli, jsxPath, '--write'], overridden);
    assert.match(readFileSync(jsxPath, 'utf8'), /location="a-long-location-description">/);
    run(process.execPath, [cli, jsxPath, '--check'], overridden);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});
