import { createRequire } from 'node:module';

const culoriError =
    'culori is not available, either install it or specify a formula in Tailwind Subshades config.';
type CuloriRgb = { mode: 'rgb'; r: number; g: number; b: number };

let culoriParse: (color: string) => { mode: string; [key: string]: string | number } | undefined;
let culoriRgb: (
    color: { mode: string; [key: string]: string | number } | undefined,
) => CuloriRgb | undefined;
let culoriHsl2Rgb: (
    color: { mode: string; [key: string]: string | number } | undefined,
) => CuloriRgb | undefined;
let culoriOklch: (
    color: { mode: string; [key: string]: string | number } | undefined,
) => CuloriRgb | undefined;
let culoriFormatCss: (
    color: { mode: string; [key: string]: string | number } | undefined,
) => string | undefined;
let culoriSerializeHex: (
    color: { mode: string; [key: string]: string | number } | undefined,
) => string | undefined;

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
    } catch {
        // Ignore any errors, these are given later when actually using a below Culori function.
    }
}

/**
 * Linearly interpolate each RGB channel between two colors.
 * @param color1 First color to interpolate from.
 * @param color2 Second color to interpolate to.
 * @param weight The amount of color2 that will be applied to color1 to get the returned color, between 0 and 1.
 * @returns The interpolated color.
 */
export function rgbLerp(color1: CuloriRgb, color2: CuloriRgb, weight: number): CuloriRgb {
    const r = color1.r + (color2.r - color1.r) * weight;
    const g = color1.g + (color2.g - color1.g) * weight;
    const b = color1.b + (color2.b - color1.b) * weight;
    return { mode: 'rgb', r, g, b };
}

/**
 * Parse a supported color string into a Culori RGB object.
 * @param color The color string to parse.
 * @throws {Error} If Culori is not installed.
 * @returns The parsed Culori RGB object, or undefined if parsing fails.
 */
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

/**
 * Output a Culori RGB object as a CSS color hex string.
 * @param color The Culori RGB object to format.
 * @throws {Error} If Culori is not installed.
 * @returns The CSS color hex string e.g. "#rrggbb", or undefined if outputting fails.
 */
export function outputCuloriHex(color: CuloriRgb): string | undefined {
    if (!culoriSerializeHex || !culoriRgb) {
        throw new Error(culoriError);
    }
    return culoriSerializeHex(culoriRgb(color));
}

/**
 * Output a Culori RGB object as a CSS color oklch string.
 * @param color The Culori RGB object to format.
 * @throws {Error} If Culori is not installed.
 * @returns The CSS color oklch string e.g. "oklch(l c h)", or undefined if outputting fails.
 */
export function outputCuloriOklch(color: CuloriRgb): string | undefined {
    if (!culoriFormatCss || !culoriOklch) {
        throw new Error(culoriError);
    }
    return culoriFormatCss(culoriOklch(color));
}

/**
 * Create a formula function that can be used in the `formula` option of the Tailwind Subshades plugin.
 * Takes three functions that are run in sequence to create a new color.
 * @param parse The first function that receives a CSS color string of any format and returns a parsed color object.
 * @param interpolate The second function that receives two parsed color objects and a weight between 0 and 1 and returns a (potentially different) final color object.
 * @param output The third function that receives the final color object and returns a CSS color string of the chosen format.
 * @returns A function that takes a CSS color string of any format, a weight between 0 and 1, and returns a CSS color string of any format. Composed of the given parameters.
 */
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

/**
 * A function that interpolates the RGB channels of two colors and returns a CSS color hex string.
 * @param color1 First color to parse and interpolate from.
 * @param color2 Second color to parse and interpolate to.
 * @param weight The amount of color2 that will be applied to color1 to get the returned color, between 0 and 1.
 * @returns The interpolated CSS color hex string.
 */
export const v3rgbLerp = createFormula(parseCuloriRgb, rgbLerp, outputCuloriHex);

/**
 * A function that interpolates the RGB channels of two colors and returns a CSS color oklch string.
 * @param color1 First color to parse and interpolate from.
 * @param color2 Second color to parse and interpolate to.
 * @param weight The amount of color2 that will be applied to color1 to get the returned color, between 0 and 1.
 * @returns The interpolated CSS color oklch string.
 */
export const v4rgbLerp = createFormula(parseCuloriRgb, rgbLerp, outputCuloriOklch);
