/**
 * Rollup configuration for browser bundle
 * 
 * Bundles browser-specific code into a single ES module file.
 * The TypeScript plugin compiles on-the-fly, so the separate tsc step
 * in build:browser is mainly for type checking and declarations.
 */

import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/browser/index.ts',
  output: [
    {
      file: 'dist/browser/index.js',
      format: 'es',
      sourcemap: true,
      exports: 'named'
    },
    {
      file: 'dist/browser/index.umd.js',
      format: 'umd',
      name: 'MetaLogDbBrowser',
      sourcemap: true,
      exports: 'named'
    }
  ],
  plugins: [
    nodeResolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs({
      transformMixedEsModules: true,
      strictRequires: true
    }),
    typescript({
      tsconfig: 'tsconfig.browser.json',
      declaration: false,
      declarationMap: false,
      sourceMap: true,
      compilerOptions: {
        module: 'ES2020',
        target: 'ES2020'
      }
    })
  ],
  external: []
};

