# Tailwind Subshades

Ever thought Tailwind green-500 was too dark, but green-400 was too light?

This package provides a plugin for your Tailwind config that automatically generates Tailwind color shades between the default colors provided by Tailwind, and even your custom colors too!

## Dependencies

[Tailwind](https://tailwindcss.com/) v3 or v4
[Node](https://nodejs.org) >=12.20.0
[culori](https://culorijs.org/) ^4.0.1

> Tested to work in both Tailwind v3 and v4 for both CJS and ESM configs in a Next.js environment.

## Installation

```sh
$ npm install tailwind-subshades
```

Substitute `npm` for your package manager of choice.

## Quick Start

In your existing tailwind.config.js (or tailwind.config.ts) file:

```js
import subshades from "tailwind-subshades";

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
    plugins: [subshades.v3({
        custom: myCustomColors,
        steps: 25, //Generate shades 25-975 in intervals of 25.
    })],
}
```

With the configuration above, you can now use classes like `bg-malachite-550`, `text-blue-25`, and `hover:border-purple-675/50` in your code.

The plugin adds these generated shades to the `theme.extend.colors` path in your Tailwind config, so any utilities that use theme colors will support the extended colors.

Colors with only one shade, such as `white`, `black`, and `current` will be ignored.

## Configuration

The plugin accepts the following options:

| Key         | Default                           | Description                                                                                                                                                                                             |
|-------------|-----------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| custom      | `{}`                              | Your custom Tailwind colors that you want intermediate color shades generated for. Only colors with numeric shades are extended by the plugin.                                                          |
| steps       | 50                                | The interval of shades to generate between 0 and 1000 (exclusive). You can also pass an array of numbers to generate those shades specifically.                                                         |
| default     | Object of Tailwind default colors | The default colors in the Tailwind palette. You can override this to stop the plugin generating intermediate shades for the default colors.                                                             |
| extraShades | `{0: "#fff", 1000: "#000"}`       | These shades are added to each color internally by the plugin to generate lighter colors than the first defined shade (usually 50), and darker colors than the last defined shade (usually 900 or 950). |

### Example Configurations

#### CommonJS Require

```js
const subshades = require("tailwind-subshades");

module.exports = {
    plugins: [subshades.v3({})],
}
```

#### Only Generate Shades for Custom Colors

```js
import subshades from "tailwind-subshades";

export default {
    theme: {
        extend: {
            colors: { 'dark-blue': { '500': '#00c' } },
        },
    },
    plugins: [subshades.v3({
        default: {},
        custom: { 'dark-blue': { '500': '#00c' } },
        steps: 20,
    })],
}
```

#### Array of Shades

```js
export default {
    plugins: [subshades.v3({
        steps: [25, 450, 550, 625, 993],
    })],
}
```

#### Set Color Boundaries

```js
import subshades from "tailwind-subshades";

export default {
    theme: {
        extend: {
            colors: { 'dark-blue': { '500': '#00c' } },
        },
    },
    plugins: [subshades.v3({
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

## FAQ

### How are colors generated?
The plugin uses [culori](https://culorijs.org/) to generate the colors by breaking them down into their RGB components and linearly interpolating the two closest defined shades, and then converting the result back into RGB hex (Tailwind v3) or OKLCH (Tailwind v4).

If the shade is before the first defined shade, Tailwind default `white` is used at the start of the interpolation.
If the shade is after the last defined shade, Tailwind default `black` is used at the end of the interpolation.

### Why depend on culori?
This dependency allows you to use any color format supported by culori for your custom colors in your Tailwind config.

The package uses `culori/fn`, so bundle size is hopefully as small as possible.

### Do I need a package for this at all?
Probably not! The code is very simple, you could easily put it as a single file in your own project. This package exists for convenience.
