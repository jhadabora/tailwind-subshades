import { parseColor } from 'tailwindcss/lib/util/color'

export function generateShades(shades: { [key: string]: string }, colors: DefaultColors, passthrough: boolean = false, step: number = 25) {
    const additions: { [key: string]: string } = {}
    const numbers = Object.keys(shades).map(Number)
    for (let i = step; i <= 1000 - step; i += step) {
        if (shades[i]) {
            continue
        }

        const prevShade = Math.max(0, ...numbers.filter(n => n < i))
        const nextShade = Math.min(1000, ...numbers.filter(n => n > i))

        const prevParse = parseColor(shades[prevShade] ?? colors['white'])
        const nextParse = parseColor(shades[nextShade] ?? colors['black'])
        if (!prevParse || !nextParse) {
            continue
        }
        const prevColor = prevParse["color"].map(Number)
        const nextColor = nextParse["color"].map(Number)
        const factor = (i - prevShade) / (nextShade - prevShade)
        const finalColor = [Math.floor(prevColor[0] + ((nextColor[0] - prevColor[0]) * factor)), Math.floor(prevColor[1] + ((nextColor[1] - prevColor[1]) * factor)), Math.floor(prevColor[2] + ((nextColor[2] - prevColor[2]) * factor)),]

        additions[i] = `#${finalColor[0].toString(16).padStart(2, '0')}${finalColor[1].toString(16).padStart(2, '0')}${finalColor[2].toString(16).padStart(2, '0')}`
    }
    if (passthrough) {
        Object.assign(additions, shades)
    }
    return additions
}
