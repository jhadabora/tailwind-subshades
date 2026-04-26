import { determineSteps, mergeColors } from './util';
import type defaultColors from 'tailwindcss/colors';
import type { TailwindPluginWithOptionsFn } from 'tailwindcss/plugin';
import tailwindPlugin from 'tailwindcss/plugin';
import type { TailwindColorValue } from 'tailwindcss/tailwind-config';

const deprecatedColors = ['lightBlue', 'warmGray', 'trueGray', 'coolGray', 'blueGray'];
const colorToken = /^--color-([\w-]+)-(\d+)$/;

export type DefaultColors = typeof defaultColors;

export interface SubshadesConfig extends Partial<Record<`--color-${string}-${number}`, string>> {
    default: { [name: string]: TailwindColorValue };
    custom: { [name: string]: TailwindColorValue };
    ignore: string[] | string;
    steps: number | number[];
    extraShades: { [shade: string | number]: string };
    formula: (color1: string, color2: string, weight: number) => string | undefined;
}

export function generateConfig(
    colors: { [p: string]: TailwindColorValue },
    steps: number[],
    extra: { [p: number]: string },
    formula: (color1: string, color2: string, weight: number) => string | undefined,
): { [p: string]: { [p: number]: string } } {
    const ret: { [name: string]: { [shade: number]: string } } = {};
    for (const [name, color] of Object.entries(colors)) {
        if (typeof color !== 'object') {
            continue;
        }
        const shades = { ...extra, ...color };
        ret[name] = generateShades(shades, steps, formula);
    }
    return ret;
}

export function generateShades(
    original: { [shade: string | number]: string },
    steps: number[],
    formula: (color1: string, color2: string, weight: number) => string | undefined,
): { [shade: number]: string } {
    const additions: { [shade: number]: string } = {};
    const shades = Object.keys(original)
        .map(Number)
        .filter((n) => !Number.isNaN(n));
    if (shades.length <= 0) {
        return {};
    }

    for (const step of steps) {
        if (original[step]) {
            continue;
        }

        const prevShade = Math.max(...shades.filter((n) => n < step));
        const nextShade = Math.min(...shades.filter((n) => n > step));
        const prevColor = original[prevShade];
        const nextColor = original[nextShade];
        if (!prevColor || !nextColor) {
            continue;
        }

        const weight = (step - prevShade) / (nextShade - prevShade);
        const result = formula(prevColor, nextColor, weight);
        if (!result) {
            continue;
        }
        additions[step] = result;
    }
    return additions;
}

export function createPlugin(
    defaultConfig: (colors: Partial<DefaultColors>) => SubshadesConfig,
): TailwindPluginWithOptionsFn<Partial<SubshadesConfig>> {
    return tailwindPlugin.withOptions(
        (_options: Partial<SubshadesConfig> = {}) =>
            (_api) => {},
        (options: Partial<SubshadesConfig> = {}) => {
            return {
                theme: {
                    extend: {
                        colors: ({ colors }: { colors: DefaultColors }) => {
                            const defaultColors = Object.fromEntries(
                                Object.keys(colors)
                                    .filter((key) => !deprecatedColors.includes(key))
                                    .map((key) => [key, colors[key as keyof typeof colors]]),
                            );
                            const defaults = defaultConfig(defaultColors);
                            const config: SubshadesConfig = { ...defaults, ...options };

                            if (config.ignore === '*') {
                                config.default = {};
                            } else if (config.ignore) {
                                if (!Array.isArray(config.ignore)) {
                                    config.ignore = [config.ignore];
                                }
                                config.default = Object.fromEntries(
                                    Object.keys(config.default)
                                        .filter((key) => !config.ignore.includes(key))
                                        .map((key) => [
                                            key,
                                            config.default[key as keyof typeof config.default],
                                        ]),
                                );
                            }

                            const passthrough: { [name: string]: { [shade: number]: string } } = {};
                            const tokens = Object.keys(config)
                                .map((key) => key.match(colorToken))
                                .filter(Boolean) as RegExpMatchArray[];
                            for (const [token, name, shade] of tokens) {
                                passthrough[name] ??= {};
                                passthrough[name][Number(shade)] = config[
                                    token as keyof typeof config
                                ] as string;
                            }

                            const all = mergeColors(config.default, passthrough, config.custom);
                            const steps = determineSteps(config.steps);
                            return mergeColors(
                                generateConfig(all, steps, config.extraShades, config.formula),
                                passthrough,
                            );
                        },
                    },
                },
            };
        },
    );
}
