import { determineSteps, mergeColors } from './util';
import type defaultColors from 'tailwindcss/colors';
// @ts-expect-error This type isn't exposed by tailwindcss, but we can still use it from @types.
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

/**
 * [Generate shades]{@link generateShades} for multiple Tailwind theme config colors.
 * @param colors Tailwind theme config colors. Colors that aren't given in object format with numeric shades will be ignored.
 * @param steps An array of shade steps to generate for each color. Shades that already exist in a color will be skipped.
 * @param extra Any extra shades to add to each color before generating shades. Usually used to add white as shade 0 and black as shade 1000.
 * @param formula A [color mixing formula]{@link createFormula} function that takes three colors and a weight between 0 and 1 and returns a new color.
 * @returns An object of Tailwind theme config colors with only generated shades for each color, keyed by color name.
 */
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

/**
 * Generate intermediate shades for a color object with numeric shades.
 * @param original A color object in Tailwind theme config color object format with numeric shades.
 * @param steps An array of shade steps to generate for each color. Shades that already exist in a color will be skipped.
 * @param formula A [color mixing formula]{@link createFormula} function that takes three colors and a weight between 0 and 1 and returns a new color.
 * @returns A Tailwind theme config color object with only generated shades for the given original color.
 */
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

/**
 * Create a Tailwind plugin that generates shades for each color in the provided config.
 * Takes a default config function that is passed the default Tailwind colors at runtime to provide a default config, that is then replaced by options the user specifies in their Tailwind config when installing the plugin.
 * @param defaultConfig A function that takes default Tailwind theme config colors, and returns a Tailwind Subshades default config.
 * @returns A Tailwind plugin creator that supports Tailwind Subshades config options.
 */
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
