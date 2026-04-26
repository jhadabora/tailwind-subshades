import {assert, describe, expect, test, vi} from "vitest";
import postcss from "postcss";
import pkg from 'tailwindcss4x/package.json';

const tailwindcss = await import('tailwindcss4x');
vi.mock('tailwindcss', async () => tailwindcss);
const tailwindpost = await import('tailwindpostcss4x');
vi.mock('@tailwindcss/postcss', async () => tailwindpost);
const pcss = postcss([tailwindpost.default({})])

describe(`Tailwind ${pkg.version} via PostCSS`, () => {
    test('generates with default colors', async () => {
        const {css} = await pcss.process(`
            @layer theme, base, components, utilities;
            @import "tailwindcss/theme.css" layer(theme);
            @import "tailwindcss/utilities.css" layer(utilities);
                
            @plugin "." {}
            `, {from: './*'});
        assert.isNotEmpty(css)

        const start = css.indexOf('@layer utilities {')
        expect(start).greaterThan(-1)

        const declarations = css.substring(start).split('}').filter(Boolean)
        const bgRed500 = declarations.find(d => d.includes('.bg-red-500 '))
        expect(bgRed500).contain('background-color: var(--color-red-500')
        const bgRed550 = declarations.find(d => d.includes('.bg-red-550 '))
        expect(bgRed550).contain('background-color: oklch(')
    })

    test('generates with custom colors', async () => {
        const {css} = await pcss.process(`
            @layer theme, base, components, utilities;
            @import "tailwindcss/theme.css" layer(theme);
            @import "tailwindcss/utilities.css" layer(utilities);
                
            @plugin "." {
                --color-malachite-50: #f4fcf1;
                --color-malachite-100: #e2fade;
                --color-malachite-200: #c7f4be;
                --color-malachite-300: #99e98c;
                --color-malachite-400: #5ed44a;
                --color-malachite-500: oklch(0.6998 0.2095 141.12);
                --color-malachite-600: #309b1e;
                --color-malachite-700: #287a1b;
                --color-malachite-800: #23611a;
                --color-malachite-900: #1d5017;
                --color-malachite-950: #0b2c07;
            }
            `, {from: './*'});
        assert.isNotEmpty(css)
        const start = css.indexOf('@layer utilities {')
        expect(start).greaterThan(-1)

        const declarations = css.substring(start).split('}').filter(Boolean)

        const bgMalachite400 = declarations.find(d => d.includes('.bg-malachite-400 '))
        const bgMalachite500 = declarations.find(d => d.includes('.bg-malachite-500 '))
        const bgMalachite550 = declarations.find(d => d.includes('.bg-malachite-550 '))
        expect(bgMalachite400).contain('background-color: #5ed44a;')
        expect(bgMalachite500).contain('background-color: oklch(0.6998 0.2095 141.12);')
        expect(bgMalachite550).contain('background-color: oklch(')
    })

    test('generates with opacity tokens', async () => {
        const {css} = await pcss.process(`
            @layer theme, base, components, utilities;
            @import "tailwindcss/theme.css" layer(theme);
            @import "tailwindcss/utilities.css" layer(utilities);
                
            @plugin "." {
                --color-malachite-50: #f4fcf1;
                --color-malachite-100: #e2fade;
                --color-malachite-200: #c7f4be;
                --color-malachite-300: #99e98c;
                --color-malachite-400: #5ed44a;
                --color-malachite-500: oklch(0.6998 0.2095 141.12);
                --color-malachite-600: #309b1e;
                --color-malachite-700: #287a1b;
                --color-malachite-800: #23611a;
                --color-malachite-900: #1d5017;
                --color-malachite-950: #0b2c07;
            }
            `, {from: './*'});
        assert.isNotEmpty(css)
        const start = css.indexOf('@layer utilities {')
        expect(start).greaterThan(-1)

        const declarations = css.substring(start).split('}').filter(Boolean)
        const bgMalachite400 = declarations.find(d => d.includes('.bg-malachite-400\\/50 '))
        const bgMalachite500 = declarations.find(d => d.includes('.bg-malachite-500\\/50 '))
        const bgMalachite550 = declarations.find(d => d.includes('.bg-malachite-550\\/50 '))
        for (const declaration of [bgMalachite400, bgMalachite500, bgMalachite550]) {
            expect(declaration).contain('background-color: color-mix(')
            expect(declaration).contain('in oklab')
            expect(declaration).contain('50%, transparent')
        }
        expect(bgMalachite400).contain('#5ed44a')
        expect(bgMalachite500).contain('oklch(0.6998 0.2095 141.12)')
        expect(bgMalachite550).contain('oklch(')
    })
})
