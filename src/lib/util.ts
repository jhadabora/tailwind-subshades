import type { TailwindColorValue } from 'tailwindcss/tailwind-config';

/**
 * Simple function that expands a step size into an array of Tailwind color steps between 0 and 1000.
 * When provided with an array of steps, it returns the array in-place.
 * @param steps The size of steps to generate between 0-1000 (exclusive), or an array of steps to use as-is.
 * @returns An array of steps that can be used by the Tailwind Subshades plugin.
 */
export function determineSteps(steps: number | number[]): number[] {
    if (Array.isArray(steps)) {
        return steps;
    }
    if (steps <= 0 || steps > 1000) {
        return [];
    }
    const output = [];
    for (let i = steps; i < 1000; i += steps) {
        output.push(i);
    }
    return output;
}

/**
 * Deeply merges multiple Tailwind theme color configs into a single object.
 * Objects of colors containing shades are deeply merged, string and functions replace or get replaced.
 * Colors or shades from later specified parameters take precedence over earlier parameters.
 * @param sources Tailwind theme color configs containing multiple object, string, or function colors, keyed by name.
 * @returns A merged Tailwind theme color config with all provided colors.
 */
export function mergeColors(...sources: { [name: string]: TailwindColorValue }[]): {
    [name: string]: TailwindColorValue;
} {
    const result: { [name: string]: TailwindColorValue } = {};

    for (const source of sources) {
        for (const key in source) {
            const resultValue = result[key];
            const sourceValue = source[key];

            if (
                typeof resultValue === 'object' &&
                resultValue !== null &&
                !Array.isArray(resultValue) &&
                typeof resultValue !== 'function' &&
                typeof sourceValue === 'object' &&
                sourceValue !== null &&
                !Array.isArray(sourceValue) &&
                typeof sourceValue !== 'function'
            ) {
                result[key] = { ...resultValue, ...sourceValue };
            } else {
                result[key] = sourceValue;
            }
        }
    }

    return result;
}
