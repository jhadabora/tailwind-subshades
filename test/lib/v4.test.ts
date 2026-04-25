import {assert, describe, expect, test} from "vitest";
import defaultColors from "tailwindcss/colors"
import {converter, parse} from "culori";
import * as libv4 from "../../src/lib/v4";

describe('module structure', () => {
    test('exports named exports', () => {
        assert.hasAllKeys(libv4, ['defaultConfig'])
    })
})

describe('v4 defaultConfig', () => {
    const config = libv4.defaultConfig(defaultColors)

    test('returns a config object', () => {
        assert.isFunction(libv4.defaultConfig)
        expect(config.default).toBe(defaultColors)
        expect(config.custom).toStrictEqual({})
        expect(config.ignore).toStrictEqual([])
        expect(config.extraShades).toStrictEqual({0: defaultColors.white, 1000: defaultColors.black})
        expect(config.steps).toStrictEqual(50)
        assert.isFunction(config.output)
    })

    test('formats rgb to oklch', () => {
        const oklch = parse(config.output({ mode: 'rgb', r: 1, g: 0.5, b: 0 }))
        const rgb = converter('rgb')(oklch)
        assert.isDefined(rgb)
        expect(rgb.r).toBeCloseTo(1.0)
        expect(rgb.g).toBeCloseTo(0.5)
        expect(rgb.b).toBeCloseTo(0.0)
    })

    test('formats out of bounds rgb values', () => {
        const color1 = config.output({ mode: 'rgb', r: 2, g: 1, b: -1 })
        const color2 = config.output({ mode: 'rgb', r: 1.5, g: 1, b: -1 })
        expect(color1).not.toBe(color2)
    })
})