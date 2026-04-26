import { createRequire } from 'node:module';

const culoriError = 'culori is not available, either install it or specify a formula in Tailwind Subshades config.';
type CuloriRgb = { mode: 'rgb'; r: number; g: number; b: number };

let culoriParse: (color: string) => { mode: string; [key: string]: string | number } | undefined;
let culoriRgb: (color: { mode: string; [key: string]: string | number } | undefined) => CuloriRgb | undefined;
let culoriHsl2Rgb: (color: { mode: string; [key: string]: string | number } | undefined) => CuloriRgb | undefined;
let culoriOklch: (color: { mode: string; [key: string]: string | number } | undefined) => CuloriRgb | undefined;
let culoriFormatCss: (color: { mode: string; [key: string]: string | number } | undefined) => string | undefined;
let culoriSerializeHex: (color: { mode: string; [key: string]: string | number } | undefined) => string | undefined;

const require = createRequire(import.meta.url);

if (process.env.TAILWIND_SUBSHADES_TEST_DISABLE_CULORI !== 'true') {
    try {
        const culori = require('culori');
        culoriParse = culori.parse;
        const culoriFn = require('culori/fn');
        culoriRgb = culoriFn.useMode(culoriFn.modeRgb);
        culoriOklch = culoriFn.useMode(culoriFn.modeOklch);
        culoriHsl2Rgb = culoriFn.convertHslToRgb;
        culoriFormatCss = culoriFn.formatCss;
        culoriSerializeHex = culoriFn.serializeHex;
    } catch {}
}

export function rgbLerp(color1: CuloriRgb, color2: CuloriRgb, weight: number): CuloriRgb | undefined {
    const r = color1.r + (color2.r - color1.r) * weight;
    const g = color1.g + (color2.g - color1.g) * weight;
    const b = color1.b + (color2.b - color1.b) * weight;
    return { mode: 'rgb', r, g, b };
}

export function parseCuloriRgb(color: string): CuloriRgb | undefined {
    if (!culoriParse || !culoriRgb || !culoriHsl2Rgb) {
        throw new Error(culoriError);
    }
    let parsed = culoriParse(color);
    if (parsed === undefined) {
        return;
    }
    if (parsed.mode === 'hsl') {
        parsed = culoriHsl2Rgb(parsed);
    }
    return culoriRgb(parsed);
}

export function outputCuloriHex(color: CuloriRgb): string | undefined {
    if (!culoriSerializeHex || !culoriRgb) {
        throw new Error(culoriError);
    }
    return culoriSerializeHex(culoriRgb(color));
}

export function outputCuloriOklch(color: CuloriRgb): string | undefined {
    if (!culoriFormatCss || !culoriOklch) {
        throw new Error(culoriError);
    }
    return culoriFormatCss(culoriOklch(color));
}

export function createFormula<O1 extends object, O2 extends object = O1>(
    parse: (color: string) => O1 | undefined,
    interpolate: (color1: O1, color2: O1, weight: number) => O2 | undefined,
    output: (color: O2) => string | undefined,
): (color1: string, color2: string, weight: number) => string | undefined {
    return (color1: string, color2: string, weight: number) => {
        const parsed1 = parse(color1);
        if (parsed1 === undefined) {
            return;
        }
        const parsed2 = parse(color2);
        if (parsed2 === undefined) {
            return;
        }

        const result = interpolate(parsed1, parsed2, weight);
        if (result === undefined) {
            return;
        }

        return output(result);
    };
}

export const v3rgbLerp = createFormula(parseCuloriRgb, rgbLerp, outputCuloriHex);
export const v4rgbLerp = createFormula(parseCuloriRgb, rgbLerp, outputCuloriOklch);
