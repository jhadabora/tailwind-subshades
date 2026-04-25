import {assert, describe, test, expect} from 'vitest'
import tsv4 from '../src/v4'
import tsv3 from '../src/v3'

import * as impindex from '../dist/index.cjs';
import impv4 from '../dist/v4.cjs';
import impv3 from '../dist/v3.cjs';
import * as implibindex from '../dist/lib/index.cjs';
import * as implibv3 from '../dist/lib/v3.cjs';
import * as implibv4 from '../dist/lib/v4.cjs';

const reqindex = require('../dist/index.cjs')
const reqv4 = require('../dist/v4.cjs')
const reqv3 = require('../dist/v3.cjs')
const reqlibindex = require('../dist/lib/index.cjs')
const reqlibv3 = require('../dist/lib/v3.cjs')
const reqlibv4 = require('../dist/lib/v4.cjs')

describe('require', () => {
    test('index', () => {
        assert.containsAllKeys(reqindex, ['v3', 'v4', 'lib', 'libv3', 'libv4'])
    })

    test('v4 plugin', () => {
        assert.isFunction(reqv4)
        expect(Object.keys(reqv4)).toEqual(Object.keys(tsv4))
    })

    test('v3 plugin', () => {
        assert.isFunction(reqv3)
        expect(Object.keys(reqv3)).toEqual(Object.keys(tsv3))
    })

    test('index lib', () => {
        assert.containsAllKeys(reqlibindex, [
            'determineSteps',
            'generateConfig',
            'generateShades',
            'mergeColors',
            'createPlugin',
        ])
    })

    test('v4 lib', () => {
        assert.containsAllKeys(reqlibv3, ['defaultConfig'])
    })

    test('v3 lib', () => {
        assert.containsAllKeys(reqlibv4, ['defaultConfig'])
    })
});

describe('import', () => {
    test('index', () => {
        assert.containsAllKeys(impindex, ['v3', 'v4', 'lib', 'libv3', 'libv4'])
    })

    test('v4 plugin', () => {
        assert.isFunction(impv4)
        expect(Object.keys(impv4)).toEqual(Object.keys(tsv4))
    })

    test('v3 plugin', () => {
        assert.isFunction(impv3)
        expect(Object.keys(impv3)).toEqual(Object.keys(tsv3))
    })

    test('index lib', () => {
        assert.containsAllKeys(implibindex, [
            'determineSteps',
            'generateConfig',
            'generateShades',
            'mergeColors',
            'createPlugin',
        ])
    })

    test('v4 lib', () => {
        assert.containsAllKeys(implibv3, ['defaultConfig'])
    })

    test('v3 lib', () => {
        assert.containsAllKeys(implibv4, ['defaultConfig'])
    })
});
