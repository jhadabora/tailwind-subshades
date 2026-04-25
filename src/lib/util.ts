import {TailwindColorValue} from "tailwindcss/tailwind-config";

export function determineSteps(steps: number|number[]): number[] {
    if (Array.isArray(steps)) {
        return steps
    }
    if (steps <= 0 || steps > 1000) {
        return []
    }
    const output = []
    for (let i = steps; i < 1000; i += steps) {
        output.push(i)
    }
    return output
}

export function mergeColors(...sources: { [name: string]: TailwindColorValue }[]): { [name: string]: TailwindColorValue } {
    const result: { [name: string]: TailwindColorValue } = {}

    for (const source of sources) {
        for (const key in source) {
            const resultValue = result[key]
            const sourceValue = source[key]

            if (
                typeof resultValue === 'object' && resultValue !== null && !Array.isArray(resultValue) && typeof resultValue !== 'function' &&
                typeof sourceValue === 'object' && sourceValue !== null && !Array.isArray(sourceValue) && typeof sourceValue !== 'function'
            ) {
                result[key] = {...resultValue, ...sourceValue}
            } else {
                result[key] = sourceValue
            }
        }
    }

    return result
}