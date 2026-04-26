import {assert, describe, expect, test} from "vitest";
import defaultColors from "tailwindcss/colors"
import * as libv4 from "../../src/lib/v4";
import {v4rgbLerp} from "../../src/lib/formula";

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
        expect(config.formula).toBe(v4rgbLerp)
    })
})