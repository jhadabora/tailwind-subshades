import {assert, describe, expect, test} from "vitest";
import defaultColors from "tailwindcss/colors"
import {defaultConfig} from "../../src/lib/v3";

describe('defaultConfig', () => {
    const config = defaultConfig(defaultColors)

    test('returns a config object', () => {
        assert.isFunction(defaultConfig)
        expect(config.default).toBe(defaultColors)
        expect(config.custom).toStrictEqual({})
        expect(config.ignore).toStrictEqual([])
        expect(config.extraShades).toStrictEqual({0: defaultColors.white, 1000: defaultColors.black})
        expect(config.steps).toStrictEqual(50)
        assert.isFunction(config.output)
    })

    test('formats rgb to hex', () => {
        expect(config.output({ mode: 'rgb', r: 1, g: 0.5, b: 0 }).toLowerCase()).toBe('#ff8000')
    })

    test('formats out of bounds rgb values', () => {
        expect(config.output({ mode: 'rgb', r: 2, g: 1, b: -1 }).toLowerCase()).toBe('#ffff00')
    })
})