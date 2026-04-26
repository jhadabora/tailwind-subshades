import {DefaultColors, SubshadesConfig} from "./index";
import {v4rgbLerp} from "./formula";

export const defaultConfig = (colors: Partial<DefaultColors>): SubshadesConfig => ({
    default: colors,
    custom: {},
    ignore: [],
    steps: 50,
    extraShades: {
        0: colors['white'] ?? '#fff',
        1000: colors['black'] ?? '#000',
    },
    formula: v4rgbLerp,
})
