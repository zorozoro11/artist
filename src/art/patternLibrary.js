// 2D arrays representing shapes. 1 = pixel on (density 3), 0 = off.
const PATTERNS = {
    'heart': [
        [0,1,1,0,1,1,0],
        [1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1],
        [0,1,1,1,1,1,0],
        [0,0,1,1,1,0,0],
        [0,0,0,1,0,0,0],
    ],
    'star': [
        [0,0,0,1,0,0,0],
        [0,0,1,1,1,0,0],
        [1,1,1,1,1,1,1],
        [0,0,1,1,1,0,0],
        [0,1,0,1,0,1,0],
        [1,0,0,0,0,0,1],
    ],
    'smiley': [
        [0,1,1,1,1,1,0],
        [1,0,1,1,1,0,1],
        [1,1,0,1,0,1,1],
        [1,1,1,1,1,1,1],
        [1,0,1,0,1,0,1],
        [1,0,0,0,0,0,1],
        [0,1,1,1,1,1,0],
    ],
    'arrow': [
        [0,0,1,0,0],
        [0,1,1,1,0],
        [1,1,1,1,1],
        [0,0,1,0,0],
        [0,0,1,0,0],
        [0,0,1,0,0],
        [0,0,1,0,0],
    ],
    'plus': [
        [0,0,1,0,0],
        [0,0,1,0,0],
        [1,1,1,1,1],
        [0,0,1,0,0],
        [0,0,1,0,0],
    ]
};

/**
 * Converts a pattern into the coordinate format [week, day, density].
 * @param {string} patternName The name of the pattern.
 * @returns {Array<[number, number, number]>|null}
 */
export function getPattern(patternName) {
    const pattern = PATTERNS[patternName.toLowerCase()];
    if (!pattern) return null;

    const coordinates = [];
    // The pattern array is structured as [row][col] but we need [week][day]
    // which corresponds to [col][row].
    const height = pattern.length;
    if (height === 0) return [];

    for (let day = 0; day < height; day++) { // day is our 'y' or row
        // Ensure day is within GitHub's 0-6 range
        if (day >= 7) continue;

        for (let week = 0; week < pattern[day].length; week++) { // week is our 'x' or column
            if (pattern[day][week] === 1) {
                // Default density of 3 for known patterns for a strong look
                coordinates.push([week, day, 3]);
            }
        }
    }
    return coordinates;
}