import { FONT } from './font.js';

/**
 * Renders a string of text into artwork coordinates.
 * @param {string} text The text to render.
 * @returns {Array<[number, number, number]>}
 */
export function renderText(text) {
    const upperText = text.toUpperCase();
    const coordinates = [];
    let currentWeekOffset = 0;

    for (const char of upperText) {
        const charMatrix = FONT[char] || FONT['?']; // Fallback to question mark
        if (!charMatrix) continue;

        const charHeight = charMatrix.length;
        const charWidth = charMatrix[0].length;

        for (let day = 0; day < charHeight; day++) {
            if (day >= 7) continue; // Skip rows beyond GitHub's height
            for (let w = 0; w < charWidth; w++) {
                if (charMatrix[day][w] === 1) {
                    // Density of 4 for text to make it stand out
                    coordinates.push([currentWeekOffset + w, day, 4]);
                }
            }
        }
        // Move to the next position, adding 1 col for spacing
        currentWeekOffset += charWidth + 1;
    }
    return coordinates;
}