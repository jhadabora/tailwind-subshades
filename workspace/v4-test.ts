import {assert, describe, expect, test} from "vitest";
import v4 from "../src/v4";
import {colorMalachite} from "../test/util";
import type {default as PostCSS} from "postcss";

export default (postcss: ReturnType<typeof PostCSS>, version: string) => {
    describe(`Tailwind ${version} via PostCSS`, () => {
        test('generates with default colors', async () => {
            const {css} = await postcss.process(`
            @layer theme, base, components, utilities;
            @import "tailwindcss/theme.css" layer(theme);
            @import "tailwindcss/utilities.css" layer(utilities);
                
            @plugin "../.." {}
            @source "../safelist.txt"
            `, {from: './*'});
            assert.isNotEmpty(css)

            const start = css.indexOf('@layer utilities {')
            expect(start).greaterThan(-1)

            const declarations = css.substring(start).split('}').filter(Boolean)
            expect(declarations[0]).contain(`.bg-red-500`)
            expect(declarations[0]).contain('background-color: var(--color-red-500')
            expect(declarations[1]).contain(`.bg-red-550`)
            expect(declarations[1]).contain('background-color: oklch(')
        })

        test('generates with custom colors', async () => {
            const {css} = await postcss.process(`
            @layer theme, base, components, utilities;
            @import "tailwindcss/theme.css" layer(theme);
            @import "tailwindcss/utilities.css" layer(utilities);
                
            @plugin "../.." {
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
            @source "../safelist.txt"
            `, {from: './*'});
            assert.isNotEmpty(css)
            const start = css.indexOf('@layer utilities {')
            expect(start).greaterThan(-1)

            const declarations = css.substring(start).split('}').filter(Boolean)
            for (const [key, shade] of ['400', '500', '550'].entries()) {
                expect(declarations[key]).contain(`.bg-malachite-${shade}`)
            }
            expect(declarations[0]).contain('background-color: #5ed44a;')
            expect(declarations[1]).contain('background-color: oklch(0.6998 0.2095 141.12);')
            expect(declarations[2]).contain('background-color: oklch(')
        })

        test('generates with opacity tokens', async () => {
            const {css} = await postcss.process(`
            @layer theme, base, components, utilities;
            @import "tailwindcss/theme.css" layer(theme);
            @import "tailwindcss/utilities.css" layer(utilities);
                
            @plugin "../.." {
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
            @source "../safelist_opacity.txt"
            `, {from: './*'});
            assert.isNotEmpty(css)
            const start = css.indexOf('@layer utilities {')
            expect(start).greaterThan(-1)

            const declarations = css.substring(start).split('}').filter(Boolean)
            for (const [key, shade] of ['400', '500', '550'].entries()) {
                expect(declarations[key]).contain(`.bg-malachite-${shade}\\/50`)
                expect(declarations[key]).contain('background-color: color-mix(')
                expect(declarations[key]).contain('in oklab')
                expect(declarations[key]).contain('50%, transparent')
            }
            expect(declarations[0]).contain('#5ed44a')
            expect(declarations[1]).contain('oklch(0.6998 0.2095 141.12)')
            expect(declarations[2]).contain('oklch(')
        })
    })
}
