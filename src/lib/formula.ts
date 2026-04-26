const culoriError = 'culori is not available, either install it or specify a formula in Tailwind Subshades config.'
type CuloriRgb = { mode: 'rgb', r: number, g: number, b: number }

let culoriParse: (color: any) => object|undefined;
let culoriRgb: (color: any) => CuloriRgb|undefined;
let culoriOklch: (color: any) => CuloriRgb|undefined;
let culoriFormatCss: (color: any) => string|undefined;
let culoriSerializeHex: (color: any) => string|undefined;

import('culori').then(culori => {
    culoriParse = culori.parse;
}).catch(() => {})
import('culori/fn').then(culoriFn => {
    culoriRgb = culoriFn.useMode(culoriFn.modeRgb);
    culoriOklch = culoriFn.useMode(culoriFn.modeOklch);
    culoriFormatCss = culoriFn.formatCss;
    culoriSerializeHex = culoriFn.serializeHex;
}).catch(() => {})

export function rgbLerp(color1: CuloriRgb, color2: CuloriRgb, weight: number): CuloriRgb {
    const r = color1.r + (color2.r - color1.r) * weight
    const g = color1.g + (color2.g - color1.g) * weight
    const b = color1.b + (color2.b - color1.b) * weight
    return { mode: 'rgb', r, g, b }
}

export function parseCuloriRgb(color: string): CuloriRgb|undefined {
    if (!culoriParse || !culoriRgb) {
        throw new Error(culoriError)
    }
    return culoriRgb(culoriParse(color))
}

export function outputCuloriHex(color: CuloriRgb): string|undefined {
    if (!culoriSerializeHex || !culoriRgb) {
        throw new Error(culoriError)
    }
    return culoriSerializeHex(culoriRgb(color))
}

export function outputCuloriOklch(color: CuloriRgb): string|undefined {
    if (!culoriFormatCss || !culoriOklch) {
        throw new Error(culoriError)
    }
    return culoriFormatCss(culoriOklch(color))
}

export function createFormula<O1 extends object, O2 extends object = O1>(parse: (color: string) => O1|undefined, interpolate: (color1: O1, color2: O1, weight: number) => O2, output: (color: O2) => string|undefined): (color1: string, color2: string, weight: number) => string|undefined {
    return (color1: string, color2: string, weight: number) => {
        const parsed1 = parse(color1)
        if (parsed1 === undefined) {
            return
        }
        const parsed2 = parse(color2)
        if (parsed2 === undefined) {
            return
        }

        const result = interpolate(parsed1, parsed2, weight)
        return output(result)
    }
}

export const v3rgbLerp = createFormula(parseCuloriRgb, rgbLerp, outputCuloriHex)
export const v4rgbLerp = createFormula(parseCuloriRgb, rgbLerp, outputCuloriOklch)
