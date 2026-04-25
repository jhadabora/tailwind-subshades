let culoriParse: (color: any) => object|undefined;
let culoriRgb: (color: any) => { r: number, g: number, b: number }|undefined;
let culoriOklch: (color: any) => { l: number, c: number, h: number }|undefined;
let culoriFormatCss: (color: any) => string|undefined;
let culoriFormatHex: (color: any) => string|undefined;

try {
    const culori = await import('culori');
    culoriParse = culori.parse;
    const culoriFn = await import('culori/fn');
    culoriRgb = culoriFn.useMode(culoriFn.modeRgb);
    culoriOklch = culoriFn.useMode(culoriFn.modeOklch);
    culoriFormatCss = culoriFn.formatCss;
    culoriFormatHex = culoriFn.formatHex;
} catch (err) {
    //Ignore for now, throw an error in the functions that actually use it.
}

const culoriError = 'culori is not available, either install it or specify a formula in Tailwind Subshades config.'

export function rgbLerp(color1: { r: number, g: number, b: number }, color2: { r: number, g: number, b: number }, weight: number): { r: number, g: number, b: number } {
    const r = color1.r + (color2.r - color1.r) * weight
    const g = color1.g + (color2.g - color1.g) * weight
    const b = color1.b + (color2.b - color1.b) * weight
    return {r, g, b}
}

export function parseCuloriRgb(color: string): { r: number, g: number, b: number }|undefined {
    if (!culoriParse || !culoriRgb) {
        throw new Error(culoriError)
    }
    return culoriRgb(culoriParse(color))
}

export function outputCuloriHex(color: { r: number, g: number, b: number }): string {
    if (!culoriFormatHex) {
        throw new Error(culoriError)
    }
    return culoriFormatHex(culoriRgb(color))
}

export function outputCuloriOklch(color: { r: number, g: number, b: number }): string {
    if (!culoriFormatCss) {
        throw new Error(culoriError)
    }
    return culoriFormatCss(culoriOklch(color))
}

export function createFormula<O1 extends object, O2 extends object = O1>(parse: (color: string) => O1|undefined, interpolate: (color1: O1, color2: O1, weight: number) => O2, output: (color: O2) => string): (color1: string, color2: string, weight: number) => string|undefined {
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
