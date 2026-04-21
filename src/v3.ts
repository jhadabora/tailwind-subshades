import {createPlugin, DefaultColors, SubshadesConfig,} from "./common";
import {useMode, modeRgb, formatHex, formatCss} from "culori/fn";
import defaultColors from "tailwindcss/colors";

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

export const plugin = createPlugin(defaultConfig)

export default plugin