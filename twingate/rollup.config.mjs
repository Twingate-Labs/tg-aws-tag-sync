import pkg from './package.json' assert { type: 'json' };
import terser from '@rollup/plugin-terser';

export default {
  input: 'app.mjs',
  output: {
    file: '../inline.mjs',
    compact: true,
    format: 'es'
  },
  plugins: [terser()],
  // Mark package dependencies as "external". Rest of configuration omitted.
  external: Object.keys(pkg.dependencies)
};