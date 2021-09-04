import esbuild from 'rollup-plugin-esbuild';
import resolve from '@rollup/plugin-node-resolve';
import pkg from './package.json';

const isProd = process.env.NODE_ENV === 'production';

export default {
    input: 'src/cli.ts',
    plugins: [
        resolve({
            preferBuiltins: true
        }),
        esbuild({
            minify: isProd,
        }),
    ],
    output: [{
        esm: {
            file: pkg.module,
            format: 'es',
        },
        cjs: {
            file: pkg.main,
            format: 'cjs',
        },
    }],
    external: [...Object.keys(pkg.dependencies), 'https', 'path']
}