import {DefaultColors, SubshadesConfig} from "./index";
import {useMode, modeRgb, formatHex} from "culori/fn";

const rgb = useMode(modeRgb)

export const defaultConfig = (colors: Partial<DefaultColors>): SubshadesConfig => ({
    default: colors,
    custom: {},
    ignore: [],
    steps: 50,
    extraShades: {
        0: colors['white'] ?? '#fff',
        1000: colors['black'] ?? '#000',
    },
    output: (color) => formatHex(rgb(color)),
})
