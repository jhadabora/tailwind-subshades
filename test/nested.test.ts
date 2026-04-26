import { assert, describe, expect, test } from 'vitest';
import * as lib from '../src/lib';
import nested from '../src/nested';

describe('module structure', () => {
    test('exports nested objects', () => {
        assert.hasAllKeys(nested, ['v3', 'v4', 'lib']);
        assert.isFunction(nested.v3);
        assert.isFunction(nested.v4);
        assert.isObject(nested.lib);
        assert.containsAllKeys(nested.lib, Object.keys(lib));
        assert.containsAllKeys(nested.lib, ['v3', 'v4', 'util', 'formula']);
        expect(typeof nested.lib.v3).toBe('object');
        expect(typeof nested.lib.v4).toBe('object');
        expect(typeof nested.lib.util).toBe('object');
        expect(typeof nested.lib.formula).toBe('object');
    });
});
