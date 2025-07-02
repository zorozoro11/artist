import moment from 'moment';
import ora from 'ora';
import { commit, push, prepareUndoPoint } from '../git/git.js';
import { getRepoPath } from '../utils/configManager.js';
import { logError } from '../utils/logger.js';

const DENSITY_MAP = {
    1: { min: 1, max: 3 },   // Light Green
    2: { min: 4, max: 7 },   // Medium Green
    3: { min: 8, max: 12 },  // Dark Green
    4: { min: 13, max: 20 }, // Darkest Green
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Executes the commit sequence based on the generated coordinates.
 * @param {Array<[number, number, number]>} coordinates - The artwork data.
 * @param {string} startDate - The ISO string for the first Sunday of the year.
 * @param {string} repoPath - The local path to the repository.
 * @param {number} weekOffset - The number of weeks to shift the artwork.
 */
export async function executeCommits(coordinates, startDate, repoPath, weekOffset) {
    const repoName = repoPath.split(/[\/\\]/).pop(); // Cross-platform path split
    const spinner = ora().start();
    
    try {
        spinner.text = `Preparing repository '${repoName}'...`;
        await prepareUndoPoint(repoName);
        spinner.succeed(`Undo point saved for '${repoName}'.`);
        
        spinner.start(`Creating ${coordinates.length} pixels of artwork...`);
        let commitsMade = 0;

        for (let i = 0; i < coordinates.length; i++) {
            const [week, day, density] = coordinates[i];
            const targetDate = moment(startDate)
                .add(week + weekOffset, 'weeks')
                .add(day, 'days');

            const densityRange = DENSITY_MAP[density] || DENSITY_MAP[1];
            const numCommits = getRandomInt(densityRange.min, densityRange.max);
            
            for (let j = 0; j < numCommits; j++) {
                // Add a few seconds to each commit to ensure unique timestamps
                const commitDate = targetDate.clone().add(j, 'seconds').toISOString();
                const commitMessage = `feat: draw pixel at [${week + weekOffset}, ${day}] - density ${density} - commit ${j + 1}/${numCommits}`;
                await commit(commitMessage, commitDate, repoPath);
            }
            commitsMade += numCommits;
            spinner.text = `Committing artwork... [${i + 1}/${coordinates.length}] pixels done. Total commits: ${commitsMade}`;
        }
        spinner.succeed('All local commits created.');

        spinner.start('Pushing artwork to GitHub...');
        await push(repoPath);
        spinner.succeed('Artwork successfully pushed to GitHub.');

    } catch (error) {
        spinner.fail('Failed during commit execution.');
        logError(error.message);
        throw error;
    }
}