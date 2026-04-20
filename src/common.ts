import defaultColors from "tailwindcss/colors"
import {TailwindColorValue} from "tailwindcss/tailwind-config";
import type {ConvertFn} from "culori/require";
import {formatCss, modeRgb, useMode} from "culori/fn";

export interface SubshadesConfig {
    default: { [name: string]: TailwindColorValue },
    custom: { [name: string]: TailwindColorValue },
    steps: number|number[],
    extraShades: { [shade: string|number]: string }
}

const deprecatedColors = ['lightBlue', 'warmGray', 'trueGray', 'coolGray', 'blueGray']
export const defaultConfig: SubshadesConfig = {
    default: Object.fromEntries(
        Object.keys(defaultColors)
            .filter(key => !deprecatedColors.includes(key))
            .map(key => [key, defaultColors[key as keyof typeof defaultColors]])
    ),
    custom: {},
    steps: 50,
    extraShades: {
        0: defaultColors['white'],
        1000: defaultColors['black'],
    }
}

export function determineSteps(steps: number|number[]): number[] {
    if (Array.isArray(steps)) {
        return steps
    }
    const output = []
    for (let i = steps; i < 1000; i += steps) {
        output.push(i)
    }
    return output
}

export function generateConfig(colors: { [p: string]: TailwindColorValue }, steps: number[], extra: { [p: number]: string }, output: ConvertFn<any>): { [p: string]: { [p: number]: string } } {
    const ret: { [name: string]: { [shade: number]: string } } = {}
    for (const [name, color] of Object.entries(colors)) {
        if (typeof color !== 'object') {
            continue
        }
        const shades = {...extra, ...color}
        ret[name] = generateShades(shades, steps, output)
    }
    return ret
}

const rgb = useMode(modeRgb)

export function generateShades(original: { [shade: string|number]: string }, steps: number[], output: ConvertFn<any>): { [shade: number]: string } {
    const additions: { [shade: number]: string } = {}
    const shades = Object.keys(original).map(Number).filter(n => !isNaN(n))
    if (shades.length <= 0) {
        return {}
    }

    for (const step of steps) {
        if (original[step]) {
            continue
        }

        const prevShade = Math.max(0, ...shades.filter(n => n < step))
        const nextShade = Math.min(1000, ...shades.filter(n => n > step))

        const prevParse = rgb(original[prevShade])
        const nextParse = rgb(original[nextShade])
        if (!prevParse || !nextParse) {
            continue
        }

        const factor = (step - prevShade) / (nextShade - prevShade)
        const result = formatCss(output({
            mode: 'rgb',
            r: prevParse.r + ((nextParse.r - prevParse.r) * factor),
            g: prevParse.g + ((nextParse.g - prevParse.g) * factor),
            b: prevParse.b + ((nextParse.b - prevParse.b) * factor),
        }))
        if (result) {
            additions[step] = result
        }
    }
    return additions
}