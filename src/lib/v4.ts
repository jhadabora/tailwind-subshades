import { v4rgbLerp } from './formula';
import type { DefaultColors, SubshadesConfig } from './index';

export const defaultConfig = (colors: Partial<DefaultColors>): SubshadesConfig => ({
    default: colors,
    custom: {},
    ignore: [],
    steps: 50,
    extraShades: {
        0: colors.white ?? '#fff',
        1000: colors.black ?? '#000',
    },
    formula: v4rgbLerp,
});
