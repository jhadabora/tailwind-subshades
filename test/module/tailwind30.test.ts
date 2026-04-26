import v3 from '../../src/v3';
import { colorMalachite } from '../util';
import postcss from 'postcss';
import pkg from 'tailwindcss30/package.json';
import { assert, describe, expect, test, vi } from 'vitest';

const tailwindcss = await import('tailwindcss30');
vi.mock('tailwindcss', async () => tailwindcss);

describe(`Tailwind ${pkg.version} via PostCSS`, () => {
    test('generates with default colors', async () => {
        const { css } = await postcss([
            tailwindcss.default({
                content: [{ raw: 'bg-red-500 bg-red-550' }],
                plugins: [v3],
                corePlugins: { preflight: false },
            }),
        ]).process('@tailwind utilities;', { from: undefined });
        assert.isNotEmpty(css);

        const declarations = css.split('}').filter(Boolean);
        const bgRed500 = declarations.find((d) => d.includes('.bg-red-500 '));
        const bgRed550 = declarations.find((d) => d.includes('.bg-red-550 '));
        for (const declaration of [bgRed500, bgRed550]) {
            expect(declaration).contain('--tw-bg-opacity:');
            expect(declaration).contain('background-color: rgb(');
            expect(declaration).contain('/ var(--tw-bg-opacity');
        }
    });

    test('generates with custom colors', async () => {
        const { css } = await postcss([
            tailwindcss.default({
                content: [{ raw: 'bg-malachite-500 bg-malachite-550' }],
                theme: {
                    extend: {
                        colors: {
                            malachite: colorMalachite,
                        },
                    },
                },
                plugins: [
                    v3({
                        custom: { malachite: colorMalachite },
                    }),
                ],
                corePlugins: { preflight: false },
            }),
        ]).process('@tailwind utilities;', { from: undefined });
        assert.isNotEmpty(css);

        const declarations = css.split('}').filter(Boolean);
        const bgRed500 = declarations.find((d) => d.includes('.bg-malachite-500 '));
        const bgRed550 = declarations.find((d) => d.includes('.bg-malachite-550 '));
        for (const declaration of [bgRed500, bgRed550]) {
            expect(declaration).contain('--tw-bg-opacity:');
            expect(declaration).contain('background-color: rgb(');
            expect(declaration).contain('/ var(--tw-bg-opacity');
        }
    });
});
