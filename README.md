# Tailwind Subshades

Ever thought Tailwind green-500 was too dark, but green-400 was too light?

This package provides a plugin for your Tailwind config that automatically generates Tailwind color shades between the default colors provided by Tailwind, and even your custom colors too!

## Dependencies

- [Node](https://nodejs.org) >=20.19.0
- [Tailwind](https://tailwindcss.com/) v3 or v4

> Tested in a Next.js environment with:
>- Tailwind v3 (CJS, ESM and TS configs)
>- Tailwind v4 (CSS, CJS, ESM and TS configs)

### Optional Dependencies

- [culori](https://culorijs.org/) ^4.0.1 - used as the default color mixing formula if a [custom function](#color-mixing-formula) is not specified.

## Installation

```sh
$ npm install tailwind-subshades
```

Substitute `npm` for your package manager of choice.

## Quick Start

### Tailwind v4

In your Tailwind v4 CSS file:

```css
@import "tailwindcss";

@plugin "tailwind-subshades" {
    /* Generate shades 25-975 in intervals of 25. */
    steps: 25;
    
    /* Move your custom colors from @theme to this declaration to generate additional shades. */
    --color-malachite-50: #f4fcf1;
    --color-malachite-100: #e2fade;
    --color-malachite-200: #c7f4be;
    --color-malachite-300: #99e98c;
    --color-malachite-400: #5ed44a;
    --color-malachite-500: oklch(0.6998 0.2095 141.12);
    --color-malachite-600: #309b1e;
    --color-malachite-700: #287a1b;
    --color-malachite-800: #23611a;
    --color-malachite-900: #1d5017;
    --color-malachite-950: #0b2c07;
}
```

With the configuration above, you can now use classes like `bg-malachite-550`, `text-blue-25`, and `hover:border-purple-675/50` in your code.

The plugin adds these generated shades to the `theme.extend.colors` path in your Tailwind config, so any utilities that use theme colors will support the extended colors.

Colors with only one shade, such as `white`, `black`, and `current` will be ignored.

---

Here's an image of the available shades using the above config:

<img width="3065" height="1750" alt="image" src="https://github.com/user-attachments/assets/b2d0bb9c-b432-4e9d-afa1-7f64d9a08d52" />

### Tailwind v3

In your existing tailwind.config.js (or tailwind.config.ts) file:

```js
import subshades from "tailwind-subshades/v3";

let myCustomColors = {}
export default {
    theme: {
        extend: {
            colors: myCustomColors = {
                'malachite': {
                    '50': '#f4fcf1',
                    '100': '#e2fade',
                    '200': '#c7f4be',
                    '300': '#99e98c',
                    '400': '#5ed44a',
                    '500': '#40bc2b',
                    '600': '#309b1e',
                    '700': '#287a1b',
                    '800': '#23611a',
                    '900': '#1d5017',
                    '950': '#0b2c07',
                }
            },
        },
    },
    plugins: [subshades({
        custom: myCustomColors,
        steps: 25, //Generate shades 25-975 in intervals of 25.
    })],
}
```

## Configuration

The plugin accepts the following options:

| Key         | Type                                                                                                               | Default                                                                                                  | Description                                                                                                                                                                                             |
|-------------|--------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| custom      | [Object of TailwindColors in theme config](https://v3.tailwindcss.com/docs/customizing-colors#color-object-syntax) | `{}`                                                                                                     | Your custom Tailwind colors that you want intermediate color shades generated for. Only colors with numeric shades are extended by the plugin.                                                          |
| steps       | `integer\|integer[]`                                                                                               | 50                                                                                                       | The interval of shades to generate between 0 and 1000 (exclusive). You can also pass an array of numbers to generate those shades specifically.                                                         |
| default     | [Object of TailwindColors in theme config](https://v3.tailwindcss.com/docs/customizing-colors#color-object-syntax) | Object of Tailwind default colors                                                                        | The default colors in the Tailwind palette. You can override this with a pruned or empty object to stop the plugin generating intermediate shades for the default colors.                               |
| ignore      | `string[]\|'*'`                                                                                                    | `[]`                                                                                                     | A list of colors to ignore from the default Tailwind palette. You can use the string '*' to stop the plugin generating intermediate shades for all of the default colors.                               |
| extraShades | `{ integer: string }`                                                                                              | `{0: "#fff", 1000: "#000"}`                                                                              | These shades are added to each color internally by the plugin to generate lighter colors than the first defined shade (usually 50), and darker colors than the last defined shade (usually 900 or 950). |
| formula     | `(string, string, 0.0..1.0) => string`                                                                             | Linear interpolation of both colors (parsed, converted and formatted by [culori](https://culorijs.org/)) | See [Color Mixing Formula](#color-mixing-formula) for more details.                                                                                                |

Color tokens in the form '--color-\${name}-\${shade}' are also accepted as "passthrough" colors in a Tailwind v4 config, see [here](#tailwind-v4).

### Example Configurations

#### Only Generate Shades for Custom Colors

```css
@import "tailwindcss";

@plugin "tailwind-subshades" {
    ignore: "*";
    steps: 20;

    --color-dark-blue-500: #00c;
}
```

```js
import subshades from "tailwind-subshades/v3";

export default {
    theme: {
        extend: {
            colors: { 'dark-blue': { '500': '#00c' } },
        },
    },
    plugins: [subshades({
        default: {},
        custom: { 'dark-blue': { '500': '#00c' } },
        steps: 20,
    })],
}
```

#### Array of Shades

```css
@import "tailwindcss";

@plugin "tailwind-subshades" {
    steps: 25, 450, 550, 625, 993;
}
```

```js
import subshades from "tailwind-subshades/v3";

export default {
    plugins: [subshades({
        steps: [25, 450, 550, 625, 993],
    })],
}
```

#### CommonJS Require

```js
const subshades = require("tailwind-subshades/v3");

module.exports = {
    plugins: [subshades({})],
}
```

#### Legacy Tailwind Config in v4

```typescript
// @config "tailwind.config.ts"

import type { Config } from 'tailwindcss'
import subshades from "tailwind-subshades/v4"

let myCustomColors = {}
export default {
    theme: {
        extend: myCustomColors = {
            ...
        },
    },
    plugins: [subshades({
        custom: myCustomColors,
        steps: 25,
    })],
} satisfies Config
```

#### Set Color Boundaries

Currently only possible in tailwind.config.*

```js
import subshades from "tailwind-subshades";

export default {
    theme: {
        extend: {
            colors: { 'dark-blue': { '500': '#00c' } },
        },
    },
    plugins: [subshades({
        default: {},
        custom: { 'dark-blue': { '500': '#00c' } },
        extraShades: { 0: "#f80", 900: "#f0f", 1000: "#ff0" },
        steps: 25,
    })],
}
```

Instead of going from white to blue to black, these shades will be generated:
- <500 - orange to the original color
- 500-900 - original color to pink
- \>900 - pink to yellow

Keep in mind that the 900 shade in `extraShades` is treated as already defined in the Tailwind config, so won't be added to the config by the plugin.

### Color Mixing Formula

You can specify a custom formula for the plugin to use to mix the colors together to generate shades.

All formulas have the parameters two nearby colors defined in the Tailwind config and the ratio of the shade to generate between 0.0 and 1.0.

Formulas have three main jobs:
- Parse the colors into a format that can be used by the formula.
- Calculate the shade between the two colors using the ratio/weight float.
- Convert the interpolated color back into the format required by Tailwind.

#### Default Formula

The default formula uses [culori](https://culorijs.org/) to generate the colors.

The two closest defined shades of a color are broken down into their RGB components via [parse](https://culorijs.org/api/#parse) and [rgb](https://culorijs.org/api/#color-spaces).

Then the components are linearly interpolated between these shades to get the resulting shade.

Then that resulting color is converted back into RGB hex (Tailwind v3) or OKLCH (Tailwind v4).

#### Using a Custom Formula

If you want to remove the dependency on [culori](https://culorijs.org/) or change the shades generated by the plugin, you need to specify a function in your tailwind.config.* file.

Below is an example of a custom formula created with the plugin code, following the three steps mentioned above.

```typescript
// @config "tailwind.config.ts"

import type { Config } from 'tailwindcss'
import subshades from "tailwind-subshades/v4"
import {createFormula} from "tailwind-subshades/lib/formula"

function parse(color: string): {foo: string}|undefined {
    // Defined custom and default color shades are given here - in whatever CSS format specified in your config.
    if (color === '#f00') return {foo: 'red'}
    if (color === '#0f0') return {foo: 'green'}
    if (color === '#00f') return {foo: 'blue'}
    // If you can't parse a color, return undefined to stop generating all shades directly before or after this shade.
    return undefined
}

function mix(color1: {foo: string}, color2: {foo: string}, weight: number): {bar: number}|undefined {
    if (color1.foo === 'red' && color2.foo === 'green') return {bar: 1}
    if (color2.foo === 'red' && color1.foo === 'green') return {bar: 1}
    if (color1.foo === 'green' && color2.foo === 'blue') return {bar: 2}
    if (color2.foo === 'green' && color1.foo === 'blue') return {bar: 2}
    if (color1.foo === 'red' && color2.foo === 'blue') return {bar: 3}
    if (color2.foo === 'red' && color1.foo === 'blue') return {bar: 3}
    // If you can't mix a color, return undefined to not add this shade to the config.
    return undefined
}

function output(color: {bar: number}): string|undefined {
    if (color.bar === 1) return '#ff0'
    if (color.bar === 2) return '#0ff'
    if (color.bar === 3) return 'fuschia'
    // If you can't output a color, return undefined to not add this shade to the config.
    return undefined
}

export default {
    plugins: [subshades({
        formula: createFormula(parse, mix, output),
    })],
} satisfies Config
```

You can also provide a simpler function to the plugin:

```typescript
// @config "tailwind.config.ts"

import type { Config } from 'tailwindcss'
import subshades from "tailwind-subshades/v4"

export default {
    plugins: [subshades({
        formula: (color1: string, color2: string, weight: number): string|undefined => {
            if (color1 === '#f00' && color2 === black && weight === 0.5) return '#800000'
            if (color1 === '#f00' && color2 === black && weight === 0.25) return '#400000'
            return undefined
        },
    })],
} satisfies Config
```

## FAQ

### How are colors generated?
See the [default color mixing formula](#default-formula) for a breakdown of the steps taken to generate colors.

If the shade is before the first defined shade, Tailwind default `white` is used at the start of the interpolation.
If the shade is after the last defined shade, Tailwind default `black` is used at the end of the interpolation.

### Do I need a package for this at all?
Probably not! The actual code to do this is quite simple, the necessary parts could easily put it as a single file in your own project. This package exists for convenience.
