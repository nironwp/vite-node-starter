export default function convertColorsToString(colors: number | number[]) {
    let string = '';

    if (Array.isArray(colors)) {
        for (const color of colors) {
            string += convertUniqueColor(color);
        }
    } else {
        string += convertUniqueColor(colors);
    }

    return string;
}

export function convertUniqueColor(color: number) {
    if (color === 1) {
        return '🟡';
    } else if (color === 2) {
        return '🔵';
    } else {
        return '⚪';
    }
}
