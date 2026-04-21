import defaultColors from "tailwindcss/colors"
import tailwindPlugin from "tailwindcss/plugin";
import type {TailwindPluginWithOptions} from "tailwindcss/plugin";
import {TailwindColorValue} from "tailwindcss/tailwind-config";
import {modeRgb, useMode} from "culori/fn";

export type DefaultColors = typeof defaultColors

export interface SubshadesConfig extends Partial<Record<`--color-${string}-${number}`, string>> {
    default: { [name: string]: TailwindColorValue },
    custom: { [name: string]: TailwindColorValue },
    ignore: string[] | string,
    steps: number|number[],
    extraShades: { [shade: string|number]: string },
    output: (color: { mode: 'rgb', r: number, g: number, b: number }) => string,
}

const deprecatedColors = ['lightBlue', 'warmGray', 'trueGray', 'coolGray', 'blueGray']

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

export function generateConfig(colors: { [p: string]: TailwindColorValue }, steps: number[], extra: { [p: number]: string }, output: (rgb: { mode: 'rgb', r: number, g: number, b: number }) => string): { [p: string]: { [p: number]: string } } {
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

export function generateShades(original: { [shade: string|number]: string }, steps: number[], output: (rgb: { mode: 'rgb', r: number, g: number, b: number }) => string): { [shade: number]: string } {
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
        const result = output({
            mode: 'rgb',
            r: prevParse.r + ((nextParse.r - prevParse.r) * factor),
            g: prevParse.g + ((nextParse.g - prevParse.g) * factor),
            b: prevParse.b + ((nextParse.b - prevParse.b) * factor),
        })
        if (result) {
            additions[step] = result
        }
    }
    return additions
}

export function createPlugin(defaultConfig: (colors: Partial<DefaultColors>) => SubshadesConfig): TailwindPluginWithOptions<Partial<SubshadesConfig>> {
    return tailwindPlugin.withOptions(
        (options: Partial<SubshadesConfig> = {}) => function (api) {},
        (options: Partial<SubshadesConfig> = {}) => {
            return {
                theme: {
                    extend: {
                        colors: ({ colors }) => {
                            const defaultColors = Object.fromEntries(
                                Object.keys(colors)
                                    .filter(key => !deprecatedColors.includes(key))
                                    .map(key => [key, colors[key as keyof typeof colors]])
                            )
                            const defaults = defaultConfig(defaultColors)
                            const config: SubshadesConfig = {...defaults, ...options}

                            if (config.ignore === '*') {
                                config.default = {}
                            } else if (config.ignore) {
                                if (!Array.isArray(config.ignore)) {
                                    config.ignore = [config.ignore]
                                }
                                config.default = Object.fromEntries(
                                    Object.keys(config.default)
                                        .filter(key => !config.ignore.includes(key))
                                        .map(key => [key, config.default[key as keyof typeof config.default]])
                                )
                            }

                            const all = {...config.default, ...config.custom}
                            const steps = determineSteps(config.steps)
                            console.log(generateConfig(all, steps, config.extraShades, config.output))
                            return generateConfig(all, steps, config.extraShades, config.output)
                        }
                    }
                }
            }
        }
    )
}