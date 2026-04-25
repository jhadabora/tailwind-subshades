import {assert, describe, expect, test} from "vitest";
import * as index from "../src/index";

describe('module structure', () => {
    test('exports named exports', () => {
        assert.hasAllKeys(index, [
            'v3',
            'v4',
            'lib',
            'libv3',
            'libv4',
        ])
        assert.isFunction(index.v3)
        assert.isFunction(index.v4)
        expect(typeof index.lib).toBe('object')
        expect(typeof index.libv3).toBe('object')
        expect(typeof index.libv4).toBe('object')
    })
})