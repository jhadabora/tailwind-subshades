import {DefaultColors, SubshadesConfig} from "./index";
import {useMode, formatCss, modeOklch} from "culori/fn";

const oklch = useMode(modeOklch)

export const defaultConfig = (colors: Partial<DefaultColors>): SubshadesConfig => ({
    default: colors,
    custom: {},
    ignore: [],
    steps: 50,
    extraShades: {
        0: colors['white'] ?? '#fff',
        1000: colors['black'] ?? '#000',
    },
    output: (color) => formatCss(oklch(color)),
})
