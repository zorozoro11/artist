import chalk from 'chalk';

const DENSITY_CHARS = {
    0: chalk.bgGray(' '), // Empty
    1: chalk.bgHex('#9be9a8')(' '), // Light Green
    2: chalk.bgHex('#40c463')(' '), // Medium Green
    3: chalk.bgHex('#30a14e')(' '), // Dark Green
    4: chalk.bgHex('#216e39')(' '), // Darkest Green
};

/**
 * Displays an ASCII art preview of the artwork in the terminal.
 * @param {Array<[number, number, number]>} coordinates - The artwork data.
 * @param {number} weekOffset - The number of weeks to shift the artwork.
 */
export function displayPreview(coordinates, weekOffset) {
    const grid = Array(7).fill(0).map(() => Array(52).fill(0));
    let maxWeek = 0;

    for (const [week, day, density] of coordinates) {
        const adjustedWeek = week + weekOffset;
        if (adjustedWeek < 52 && day < 7) {
            grid[day][adjustedWeek] = density;
            if (adjustedWeek > maxWeek) maxWeek = adjustedWeek;
        }
    }

    console.log('   ' + Array.from({ length: maxWeek + 2 }, (_, i) => (i % 5 === 0 ? String(i).padEnd(5, ' ') : '')).join(''));
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let day = 0; day < 7; day++) {
        let rowStr = `${days[day].padEnd(3)} `;
        for (let week = 0; week <= maxWeek + 1; week++) {
            rowStr += DENSITY_CHARS[grid[day][week]];
        }
        console.log(rowStr);
    }
    console.log(chalk.gray('\nThis is a simulation. Colors may vary slightly on GitHub.'));
}