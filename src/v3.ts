import tailwindPlugin from "tailwindcss/plugin";
import type {TailwindPluginWithOptions} from "tailwindcss/plugin";
import {defaultConfig as commonDefaultConfig, determineSteps, generateConfig, SubshadesConfig} from "./common";
import {useMode, modeRgb, formatHex} from "culori/fn";

export interface Subshades3Config extends SubshadesConfig {}
export const defaultConfig: Subshades3Config = commonDefaultConfig

const rgb = useMode(modeRgb)

export const plugin: TailwindPluginWithOptions<Partial<Subshades3Config>> = tailwindPlugin.withOptions(
    (options: Partial<Subshades3Config> = {}) => function (api) {

    },
    (options: Partial<Subshades3Config> = {}) => {
        const config: SubshadesConfig = {...defaultConfig, ...options}
        const colors = {...config.default, ...config.custom}
        const steps = determineSteps(config.steps)
        const shades = generateConfig(colors, steps, config.extraShades, ((color: { mode: 'rgb', r: number, g: number, b: number }): string => formatHex(rgb(color))))
        return {
            theme: {
                extend: {
                    colors: shades
                }
            }
        }
    }
)