import postcss from "postcss";
import {assert, describe, expect, test} from "vitest";
import v3 from "../src/v3";
import {colorMalachite} from "../test/util";

export default (tailwindcss: (config: object) => { postcssPlugin: 'tailwindcss'; plugins: string[]; }, version: string) => {
    describe(`Tailwind ${version} via PostCSS`, () => {
        test('generates with default colors', async () => {
            const {css} = await postcss([tailwindcss({
                content: [{raw: "bg-red-500 bg-red-550"}],
                plugins: [v3],
                corePlugins: { preflight: false },
            })]).process('@tailwind utilities;', { from: undefined });
            assert.isNotEmpty(css)

            const declarations = css.split('}').filter(Boolean)
            expect(declarations.length).toBe(2)
            for (const [key, shade] of ['500', '550'].entries()) {
                expect(declarations[key]).contain(`.bg-red-${shade}`)
                expect(declarations[key]).contain('--tw-bg-opacity:')
                expect(declarations[key]).contain('background-color: rgb(')
                expect(declarations[key]).contain('/ var(--tw-bg-opacity')
            }
        })

        test('generates with custom colors', async () => {
            const {css} = await postcss([tailwindcss({
                content: [{raw: "bg-malachite-500 bg-malachite-550"}],
                theme: { extend: { colors: {
                            malachite: colorMalachite
                        } } },
                plugins: [v3({
                    custom: {malachite: colorMalachite}
                })],
                corePlugins: { preflight: false },
            })]).process('@tailwind utilities;', { from: undefined });
            assert.isNotEmpty(css)

            const declarations = css.split('}').filter(Boolean)
            expect(declarations.length).toBe(2)
            for (const [key, shade] of ['500', '550'].entries()) {
                expect(declarations[key]).contain(`.bg-malachite-${shade}`)
                expect(declarations[key]).contain('--tw-bg-opacity:')
                expect(declarations[key]).contain('background-color: rgb(')
                expect(declarations[key]).contain('/ var(--tw-bg-opacity')
            }
        })
    })
}