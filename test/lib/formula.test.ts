import {assert, describe, expect, test, vi} from "vitest";
import * as formula from "../../src/lib/formula";

describe('module structure', () => {
    test('exports named exports', () => {
        assert.hasAllKeys(formula, [
            'rgbLerp',
            'parseCuloriRgb',
            'outputCuloriHex',
            'outputCuloriOklch',
            'createFormula',
            'v3rgbLerp',
            'v4rgbLerp',
        ])
    })
})

describe('rgbLerp', () => {
    test.for([
        [0.25,1.0,0.2,0.75,0.0,0.4,0.5,0.5,0.5,0.3],
        [0.75,0.0,0.4,0.25,1.0,0.2,0.5,0.5,0.5,0.3],
        [0.0,0.0,0.0,1.0,1.0,1.0,0.25,0.25,0.25,0.25],
        [0.0,0.0,0.0,1.0,1.0,1.0,1.25,1.25,1.25,1.25],
        [0.0,0.0,0.0,1.0,1.0,1.0,-1.25,-1.25,-1.25,-1.25],
        [-1.0,-1.0,-1.0,4.0,4.0,4.0,0.5,1.5,1.5,1.5],
    ])('returns (%f,%f,%f), (%f,%f,%f), %f -> %f,%f,%f', (values) => {
        const result = formula.rgbLerp(
            {mode: 'rgb', r: values[0], g: values[1], b: values[2]},
            {mode: 'rgb', r: values[3], g: values[4], b: values[5]},
            values[6]
        )
        expect(result.mode).toBe('rgb')
        expect(result.r).toBeCloseTo(values[7])
        expect(result.g).toBeCloseTo(values[8])
        expect(result.b).toBeCloseTo(values[9])
    })
})

describe('parseCuloriFgb', () => {
    test.for([
        ['#000000', 0.0, 0.0, 0.0],
        ['#ff0000', 1.0, 0.0, 0.0],
        ['#00ff00', 0.0, 1.0, 0.0],
        ['#0000ff', 0.0, 0.0, 1.0],
        ['#8000ff', 0.5, 0.0, 1.0],
        ['#ffffff', 1.0, 1.0, 1.0],
    ] as [string, number, number, number][])('returns rgb hex color %s -> (%f,%f,%f)', ([color, r, g, b]) => {
        const result = formula.parseCuloriRgb(color)
        assert.isDefined(result)
        expect(result.mode).toBe('rgb')
        expect(result.r).toBeCloseTo(r)
        expect(result.g).toBeCloseTo(g)
        expect(result.b).toBeCloseTo(b)
    })

    test.for([
        ['#ffffff', 1.0, 1.0, 1.0],
        ['#f00', 1.0, 0.0, 0.0],
        ['rgb(255, 255, 0)', 1.0, 1.0, 0.0],
        ['oklch(0.8664 0.294827 142.5)', 0.0, 1.0, 0.0],
        ['hsl(180, 100%, 50%)', 0.0, 1.0, 1.0],
        ['blue', 0.0, 0.0, 1.0],
    ] as [string, number, number, number][])('returns other format color %s -> (%f,%f,%f)', ([color, r, g, b]) => {
        const result = formula.parseCuloriRgb(color)
        assert.isDefined(result)
        expect(result.mode).toBe('rgb')
        expect(result.r).toBeCloseTo(r)
        expect(result.g).toBeCloseTo(g)
        expect(result.b).toBeCloseTo(b)
    })

    test.for([
        ['oklch(0.8716 0.47 140)'],
        ['oklch(0.6245 0.2152 250)'],
    ])('returns a valid color for out of rgb bounds color %s', ([color]) => {
        const result = formula.parseCuloriRgb(color)
        assert.isDefined(result)
        expect(result.mode).toBe('rgb')
        assert.isNotNaN(result.r)
        assert.isNotNaN(result.g)
        assert.isNotNaN(result.b)
    })
});

describe('outputCuloriHex', () => {
    test.for([
        [0.0, 0.0, 0.0, '#000000'],
        [1.0, 0.0, 0.0, '#ff0000'],
        [0.0, 1.0, 0.0, '#00ff00'],
        [0.0, 0.0, 1.0, '#0000ff'],
        [0.5, 0.0, 1.0, '#8000ff'],
        [1.0, 1.0, 1.0, '#ffffff'],
    ] as [number, number, number, string][])('returns rgb hex color (%f,%f,%f) -> %s', ([r, g, b, hex]) => {
        const result = formula.outputCuloriHex({mode: 'rgb', r, g, b})
        assert.isDefined(result)
        expect(result).toBe(hex)
    })

    test.for([
        [2.0, 2.0, 2.0, '#ffffff'],
        [2.0, 0.0, 0.0, '#ff0000'],
        [0.0, 0.5, -2.0, '#008000'],
    ] as [number, number, number, string][])('returns rgb hex color with out of bounds rgb (%f,%f,%f) -> %s', ([r, g, b, hex]) => {
        const result = formula.outputCuloriHex({mode: 'rgb', r, g, b})
        assert.isDefined(result)
        expect(result).toBe(hex)
    })
})

describe('outputCuloriOklch', () => {
    test.for([
        [0.0, 0.0, 0.0, 0.0, 0.0, NaN],
        [1.0, 1.0, 1.0, 1.0, 0.0, NaN],
        [1.0, 0.0, 0.0, 0.628, 0.2577, 29.23],
        [0.0, 1.0, 0.0, 0.8664, 0.294827, 142.4953],
        [0.0, 0.0, 1.0, 0.452, 0.313214, 264.052],
        [0.5, 0.0, 1.0, 0.5299, 0.29309616075862427, 293.7740455594946],
    ])('returns oklch color (%f,%f,%f) -> oklch(%f,%f,%f)', ([r, g, b, l, c, h]) => {
        const result = formula.outputCuloriOklch({mode: 'rgb', r, g, b})
        assert.isDefined(result)
        assert(result.startsWith('oklch('))
        assert(result.endsWith(')'))
        const components = result.slice(6, -1).split(' ')
        expect(components).length(3)
        if (isNaN(l)) {
            expect(components[0]).toBe('none')
        } else {
            expect(Number(components[0])).toBeCloseTo(l)
        }
        if (isNaN(c)) {
            expect(components[1]).toBe('none')
        } else {
            expect(Number(components[1])).toBeCloseTo(c)
        }
        if (isNaN(h)) {
            expect(components[2]).toBe('none')
        } else {
            expect(Number(components[2])).toBeCloseTo(h)
        }
    })

    test.for([
        [-1.0, -1.0, -1.0, -1.0, 0.0, NaN],
        [2.0, 2.0, 2.0, 1.7047, 0.0, NaN],
        [0.5, 0.5, 2.0, 0.8685268639518622, 0.46920999925424367, 271.069835332346],
    ])('returns oklch color with out of bounds rgb (%f,%f,%f) -> oklch(%f,%f,%f)', ([r, g, b, l, c, h]) => {
        const result = formula.outputCuloriOklch({mode: 'rgb', r, g, b})
        assert.isDefined(result)
        assert(result.startsWith('oklch('))
        assert(result.endsWith(')'))
        const components = result.slice(6, -1).split(' ')
        expect(components).length(3)
        if (isNaN(l)) {
            expect(components[0]).toBe('none')
        } else {
            expect(Number(components[0])).toBeCloseTo(l)
        }
        if (isNaN(c)) {
            expect(components[1]).toBe('none')
        } else {
            expect(Number(components[1])).toBeCloseTo(c)
        }
        if (isNaN(h)) {
            expect(components[2]).toBe('none')
        } else {
            expect(Number(components[2])).toBeCloseTo(h)
        }
    })
})

describe('createFormula', () => {
    test('runs all functions', () => {
        const parse = vi.fn((color: string) => ({mock: true}))
        const interpolate = vi.fn((color1: {mock: boolean}, color2: {mock: boolean}, weight: number) => ({mock2: true}))
        const output = vi.fn((color: {mock2: boolean}) => 'mock3')

        const fn = formula.createFormula(parse, interpolate, output)
        assert.isFunction(fn)

        const result = fn('color1', 'color2', 0.67)
        expect(result).toBe('mock3')

        expect(parse).toHaveBeenCalledTimes(2)
        expect(parse).toHaveBeenCalledWith('color1')
        expect(parse).toHaveBeenCalledWith('color2')
        expect(parse).toHaveReturnedWith({mock: true})

        expect(interpolate).toHaveBeenCalledTimes(1)
        expect(interpolate).toHaveBeenCalledWith({mock: true}, {mock: true}, 0.67)
        expect(interpolate).toHaveReturnedWith({mock2: true})

        expect(output).toHaveBeenCalledTimes(1)
        expect(output).toHaveBeenCalledWith({mock2: true})
        expect(output).toHaveReturnedWith('mock3')
    })
})

describe('v3rgbLerp', () => {
    test.for([
        ['#000000', '#f00', 0.5, '#800000'],
        ['#000000', '#f00', 0.25, '#400000'],
        ['blue', 'white', 0.5, '#8080ff'],
        ['oklch(0.628 0.2577 29.23)', 'oklch(0.5305 0.2931 293.94)', 0.5, '#c00080'],
    ] as [string, string, number, string][])('returns %s, %s, %f -> %s', ([color1, color2, weight, result]) => {
        const actual = formula.v3rgbLerp(color1, color2, weight)
        expect(actual).toBe(result)
    })
})

describe('v4rgbLerp', () => {
    test.for([
        ['#000000', '#f00', 0.5, 0.3767, 0.154577, 29.2339],
        ['#000000', '#f00', 0.25, 0.2333, 0.0957, 29.23],
        ['blue', 'white', 0.5, 0.6614, 0.1837, 280.0844393817972],
        ['oklch(0.628 0.2577 29.23)', 'oklch(0.5305 0.2931 293.94)', 0.5, 0.5333, 0.223083, 349.3417912956248],
    ] as [string, string, number, number, number, number][])('returns %s, %s, %f -> oklch(%f %f %f)', ([color1, color2, weight, l, c, h]) => {
        const actual = formula.v4rgbLerp(color1, color2, weight)
        assert.isDefined(actual)
        assert(actual.startsWith('oklch('))
        assert(actual.endsWith(')'))
        const components = actual.slice(6, -1).split(' ')
        expect(components).length(3)
        if (isNaN(l)) {
            expect(components[0]).toBe('none')
        } else {
            expect(Number(components[0])).toBeCloseTo(l)
        }
        if (isNaN(c)) {
            expect(components[1]).toBe('none')
        } else {
            expect(Number(components[1])).toBeCloseTo(c)
        }
        if (isNaN(h)) {
            expect(components[2]).toBe('none')
        } else {
            expect(Number(components[2])).toBeCloseTo(h)
        }
    })
})