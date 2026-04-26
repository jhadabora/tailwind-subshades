import * as util from '../../src/lib/util';
import {colorDarkBlue, colorMalachite, steps50} from '../util';
import defaultColors from 'tailwindcss/colors';
import { assert, describe, expect, test } from 'vitest';

describe('module structure', () => {
    test('exports named exports', () => {
        assert.hasAllKeys(util, ['determineSteps', 'mergeColors']);
    });
});

describe('determineSteps', () => {
    test.for([100, 50, 25, 10, 1])('expands divisble %i to an array of numbers', (value) => {
        const range = util.determineSteps(value);
        expect(range[0]).toBe(value);
        expect(range[range.length - 1]).toBe(1000 - value);
        expect(range).toStrictEqual(
            [...Array(1000 / value - 1).keys()].map((n) => (n + 1) * value),
        );
    });

    test.for([33, 66, 97, 92, 11, 17])('expands non-divisble %i within 0-1000', (value) => {
        const range = util.determineSteps(value);
        expect(range[0]).toBe(value);
        expect(range[range.length - 1]).toBeLessThan(1000);
        expect(range).toStrictEqual(
            [...Array(Math.ceil(1000 / value) - 1).keys()].map((n) => (n + 1) * value),
        );
    });

    test.for([1001, 1000, 0, -1, -1001])('returns empty array for invalid %i', (value) => {
        expect(util.determineSteps(value)).toStrictEqual([]);
    });

    test.for([steps50, [500], [0, 1000], [-10, 1010], []])('returns array in place', (values) => {
        expect(util.determineSteps(values)).toStrictEqual(values);
    });
});

describe('mergeColors', () => {
    test('merges two objects of different colors', () => {
        const merged = util.mergeColors(
            {
                red: defaultColors.red,
                green: defaultColors.green,
            },
            {
                blue: defaultColors.blue,
            },
            {
                pink: defaultColors.pink,
            },
        );
        expect(merged).toStrictEqual({
            red: defaultColors.red,
            green: defaultColors.green,
            blue: defaultColors.blue,
            pink: defaultColors.pink,
        });
    });

    test('merges shades of the same color', () => {
        const merged = util.mergeColors(
            {
                red: {
                    100: defaultColors.red[100],
                    300: defaultColors.red[300],
                },
            },
            {
                red: {
                    200: defaultColors.red[200],
                },
            },
            {
                red: {
                    fourhundred: defaultColors.red[400],
                },
            },
        );
        expect(merged).toStrictEqual({
            red: {
                100: defaultColors.red[100],
                200: defaultColors.red[200],
                300: defaultColors.red[300],
                fourhundred: defaultColors.red[400],
            },
        });
    });

    test('later items take precedence', () => {
        const merged = util.mergeColors(
            {
                red: defaultColors.orange,
                malachite: { 400: colorMalachite[400], 500: colorMalachite[600] },
                named: { DEFAULT: 'black' },
            },
            {
                red: defaultColors.red,
                malachite: { 500: colorMalachite[500] },
                named: { DEFAULT: colorDarkBlue },
            },
        );
        expect(merged).toStrictEqual({
            red: defaultColors.red,
            malachite: { 400: colorMalachite[400], 500: colorMalachite[500] },
            named: { DEFAULT: colorDarkBlue },
        });
    });

    test('later non-shaded items replace', () => {
        const malachiteFn = (_props: object) => colorMalachite[500];
        const merged = util.mergeColors(
            {
                black: defaultColors.red,
                malachite: { 400: colorMalachite[400], 500: colorMalachite[500] },
                named: { DEFAULT: colorDarkBlue },
            },
            {
                black: defaultColors.black,
                malachite: malachiteFn,
                named: colorDarkBlue,
            },
        );
        expect(merged).toStrictEqual({
            black: defaultColors.black,
            malachite: malachiteFn,
            named: colorDarkBlue,
        });
    });

    test('earlier non-shaded items are replaced', () => {
        const malachiteFn = (_props: object) => colorMalachite[500];
        const merged = util.mergeColors(
            {
                black: defaultColors.black,
                malachite: malachiteFn,
                named: colorDarkBlue,
            },
            {
                black: defaultColors.red,
                malachite: { 400: colorMalachite[400], 500: colorMalachite[500] },
                named: { DEFAULT: colorDarkBlue },
            },
        );
        expect(merged).toStrictEqual({
            black: defaultColors.red,
            malachite: { 400: colorMalachite[400], 500: colorMalachite[500] },
            named: { DEFAULT: colorDarkBlue },
        });
    });
});
