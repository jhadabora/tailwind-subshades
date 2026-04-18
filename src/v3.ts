import tailwindPlugin from "tailwindcss/plugin";
import {generateShades} from "./common";
import type {TailwindPluginWithoutOptions} from "tailwindcss/plugin";

export const plugin: TailwindPluginWithoutOptions = tailwindPlugin(function() {}, {
    theme: {
        extend: {
            colors: ({ colors }) => {
                console.log('v3', colors)
                const additions: { [key: string]: { [key: number]: string } } = {}
                for (const [name, shades] of Object.entries(colors)) {
                    if (typeof shades !== 'object') {
                        continue
                    }

                    const descriptor = Object.getOwnPropertyDescriptor(colors, name)
                    if (descriptor && typeof descriptor.get === "function") {
                        continue
                    }

                    additions[name] = generateShades(shades, colors, false)
                }
                return additions
            },
        },
    },
})
