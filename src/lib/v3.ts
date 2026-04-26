import { v3rgbLerp } from './formula';
import type { DefaultColors, SubshadesConfig } from './index';

/**
 * A function that generates a default Tailwind Subshades config, intended for Tailwind v3.
 * @param colors The default colors to use for shades, provided by Tailwind.
 * @returns A default Tailwind Subshades config that mixes colors outputting to RGB hex, with given colors as defaults.
 */
export const defaultConfig = (colors: Partial<DefaultColors>): SubshadesConfig => ({
    default: colors,
    custom: {},
    ignore: [],
    steps: 50,
    extraShades: {
        0: colors.white ?? '#fff',
        1000: colors.black ?? '#000',
    },
    formula: v3rgbLerp,
});
