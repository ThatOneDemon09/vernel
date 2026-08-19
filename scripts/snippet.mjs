/**
 * Bundles the whole tool into one file you can paste into a devtools console, so
 * it can be run against a page you do not control.
 *
 * Deliberately separate from `npm run build`: dist/ stays tsc-only, ESM and
 * unbundled. The output is committed so it can be copied from the repo without
 * a toolchain — regenerate it with `npm run snippet` after changing src/.
 */
import { build } from 'esbuild';

const ENABLE = `
/* vernel — paste-into-console build. Alt+V toggles; vernelInstance.destroy() removes it. */
globalThis.vernelInstance?.destroy();
globalThis.vernelInstance = vernel.default({ baseline: 8 });
globalThis.vernelInstance.enable();
`.trim();

await build({
  entryPoints: ['src/index.ts'],
  outfile: 'vernel.snippet.js',
  bundle: true,
  format: 'iife',
  globalName: 'vernel',
  target: 'es2022',
  minify: true,
  legalComments: 'none',
  footer: { js: `\n${ENABLE}\n` },
});

console.log('wrote vernel.snippet.js');
