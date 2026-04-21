import tailwindPlugin from "tailwindcss/plugin";
import type {TailwindPluginWithOptions} from "tailwindcss/plugin";
import {defaultConfig as commonDefaultConfig, determineSteps, generateConfig, SubshadesConfig} from "./common";
import {useMode, modeOklch, formatCss} from "culori/fn";

export interface Subshades4Config extends SubshadesConfig {}
export const defaultConfig: Subshades4Config = commonDefaultConfig

const oklch = useMode(modeOklch)

export const plugin: TailwindPluginWithOptions<Partial<Subshades4Config>> = tailwindPlugin.withOptions(
    (options: Partial<Subshades4Config> = {}) => function (api) {

    },
    (options: Partial<Subshades4Config> = {}) => {
        const config: SubshadesConfig = {...defaultConfig, ...options}
        const colors = {...config.default, ...config.custom}
        const steps = determineSteps(config.steps)
        const shades = generateConfig(colors, steps, config.extraShades, ((color: { mode: 'rgb', r: number, g: number, b: number }): string => formatCss(oklch(color))))
        console.log(options)
        return {
            theme: {
                extend: {
                    colors: ({ colors }) => {
                        console.log(colors)
                    }
                }
            }
        }
    }
)