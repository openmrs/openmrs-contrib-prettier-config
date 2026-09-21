# @openmrs/prettier-config

Shared Prettier options for OpenMRS O3 frontend repositories. The package contains a plain configuration object and has no runtime dependencies or build step. It supports Prettier 3; consumers install their own formatter.

## Installation

After version 1.0.0 is published:

```sh
npm install --save-dev @openmrs/prettier-config@^1.0.0
npm install --save-dev --save-exact prettier@3.9.8
```

For Yarn:

```sh
yarn add --dev @openmrs/prettier-config@^1.0.0
yarn add --dev --exact prettier@3.9.8
```

Keep Prettier pinned exactly and commit your lockfile. The peer range allows compatible Prettier 3 releases; it does not make different formatter versions produce identical output.

## Configuration

Keep your existing `prettier.config.js` in a CommonJS project:

```js
module.exports = require('@openmrs/prettier-config');
```

In an ESM project, use `prettier.config.mjs`:

```js
import config from '@openmrs/prettier-config';

export default config;
```

Alternatively, put this JSON string in `.prettierrc`:

```json
"@openmrs/prettier-config"
```

Use one active configuration per location. Keep wrappers at their existing paths when scripts explicitly reference those paths. A CommonJS wrapper in a project with `"type": "module"` needs a `.cjs` extension.

The shared options are:

```js
{
  bracketSpacing: true,
  printWidth: 120,
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
}
```

Preserve local exceptions with an override, for example:

```js
module.exports = {
  ...require('@openmrs/prettier-config'),
  bracketSameLine: true,
};
```

## Repository integration

Keep `.prettierignore`, `.editorconfig`, source globs and lint-staged tasks local. This package shares options, not ignore rules or commit hooks. Configuration discovery walks up from the formatted file. Ignore-file discovery depends on the working directory; when running in a nested workspace, pass the root ignore file explicitly where needed:

```sh
prettier src --check --ignore-path ../../.prettierignore
```

Configure your editor's Prettier integration to use the repository's installed formatter and configuration. Editor formatting and lint-staged commit-time formatting are separate integrations.

During migration, compare old and shared configurations using the same formatter first. Review formatter upgrades separately, preserve existing overrides, and measure existing formatting failures before adding broader checks. The shared ESLint configuration's `eslint-config-prettier` integration disables conflicting lint rules; it does not provide these formatting options.

## Development

```sh
npm ci
npm test
npm run test:package
npm pack --dry-run --json
```

The package tests install a tarball into a disposable consumer outside this repository. They prefer npm's local cache but allow network requests for missing registry metadata or tarballs. They cover CommonJS, ESM, JSON-string configuration, nested discovery, local overrides and root ignores. Formatting fixtures cover TypeScript, TSX, SCSS, JSON and Markdown. CI tests Prettier 3.9.8 and 3.0.0 on Node 24.

## Releases

Changes to options that alter existing formatting require a major release. Documentation and equivalent packaging fixes can be patches. Review consumer formatter upgrades separately even when these options stay unchanged.

Before the first release, maintainers need to establish the default branch, verify npm organization publishing access, and configure this repository's `NPM_AUTH_TOKEN` secret. Secrets from other repositories are not assumed to be available here. Validate the packed package in the Core and patient-management pilots before publishing 1.0.0.

The workflow publishes only for an intentionally published GitHub release in the OpenMRS repository, after all verification jobs pass. The release tag must match `package.json` (for example `v1.0.0`). Publication uses public access and provenance. Publishing a GitHub release triggers npm publication; do not create a release for a preview.

After publication, verify the registry version and install it in a clean consumer before merging adoption changes. Local tarball dependencies are for pilots only.

See [Prettier's shared configuration documentation](https://prettier.io/docs/sharing-configurations) and [installation guidance](https://prettier.io/docs/install).
