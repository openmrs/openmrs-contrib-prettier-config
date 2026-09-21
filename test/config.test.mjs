import assert from 'node:assert/strict';
import { test } from 'node:test';
import { format } from 'prettier';
import config from '../index.cjs';
import { fixtures } from './fixtures.mjs';

test('exports the six shared O3 options', () => {
  assert.deepEqual(config, {
    bracketSpacing: true,
    printWidth: 120,
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'all',
  });
});

for (const { filepath, input, expected } of fixtures) {
  test(`formats ${filepath} with stable output`, async () => {
    const options = { ...config, filepath };
    assert.equal(await format(input, options), expected);
    assert.equal(await format(expected, options), expected);
  });
}

test('consumers can preserve the JSX bracket exception without changing shared options', async () => {
  const input =
    '<PatientCard identifier="a-long-patient-identifier" description="a-long-encounter-description" location="a-long-location-description">Patient</PatientCard>';
  const baseline = await format(input, { ...config, parser: 'babel' });
  const overridden = await format(input, { ...config, parser: 'babel', bracketSameLine: true });
  assert.match(baseline, /location="a-long-location-description"\n>/);
  assert.match(overridden, /location="a-long-location-description">/);
  assert.equal(config.bracketSameLine, undefined);
});
