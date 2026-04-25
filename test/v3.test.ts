import {describe, expect, test} from "vitest";
import v3 from "../src/v3";
import defaultColors from "tailwindcss/colors";
import {createPlugin} from "../src/lib";
import {defaultConfig} from "../src/lib/v3";

describe('v3 plugin', () => {
    const config = { steps: 10 }
    const plugin = v3(config)

    test('matches createPlugin plugin signature', () => {
        const defaultPlugin = createPlugin(defaultConfig)
        expect(Object.keys(v3)).toStrictEqual(Object.keys(defaultPlugin))
        expect(Object.keys(plugin)).toStrictEqual(Object.keys(defaultPlugin(config)))
    })

    test('generates hex colors', () => {
        const generated = plugin.config.theme.extend.colors({colors: {red: defaultColors.red}})
        for (const color of Object.values(generated.red)) {
            expect(color).match(/^#[0-9a-f]{6}$/i)
        }
    })
})