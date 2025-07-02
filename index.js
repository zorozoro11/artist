#!/usr/bin/env node
import { Command } from 'commander';
import dotenv from 'dotenv';
import { handleDraw, handleRepo, handleUndo, handleWipe } from './src/commands.js';

/**
 * Main asynchronous function to run the CLI application.
 */
async function main() {
    // Load environment variables from .env file
    dotenv.config();

    const program = new Command();

    program
        .name('ai-git-artist')
        .description('A professional command-line tool that transforms GitHub contribution graphs into pixel art canvases using AI.')
        .version('1.0.0');

    program
        .command('draw')
        .description('Generate artwork on your GitHub contribution graph based on a prompt.')
        .argument('<prompt>', 'The creative instruction (e.g., "draw a heart", "write my name", "a cool rocket").')
        .option('--offset <weeks>', 'Number of weeks to offset the drawing from the start of the year.', '0')
        .option('--repo <name>', 'Specify the repository to draw in.')
        .action(handleDraw);

    const repoCommand = program.command('repo')
        .description('Manage the repositories used for storing git art.');

    repoCommand
        .command('create')
        .description('Create a new private repository on GitHub for your art.')
        .argument('<name>', 'The name of the repository.')
        .action((name) => handleRepo('create', name));

    repoCommand
        .command('list')
        .description('List all repositories managed by AI Git Artist.')
        .action(() => handleRepo('list'));

    repoCommand
        .command('use')
        .description('Set the default repository for drawing.')
        .argument('<name>', 'The name of the repository to set as default.')
        .action((name) => handleRepo('use', name));

    repoCommand
        .command('remove')
        .description('Remove a repository from the management list (does not delete on GitHub).')
        .argument('<name>', 'The name of the repository to remove.')
        .action((name) => handleRepo('remove', name));

    program
        .command('undo')
        .description('Revert the last drawing operation in a repository.')
        .option('--repo <name>', 'Specify the repository to undo in.')
        .action(handleUndo);

    program
        .command('wipe')
        .description('Completely and IRREVERSIBLY wipe the commit history of an art repository.')
        .option('--repo <name>', 'Specify the repository to wipe.')
        .action(handleWipe);

    try {
        // Use parseAsync to handle async actions properly and wait for them to complete.
        await program.parseAsync(process.argv);
    } catch (error) {
        console.error(`An unexpected error occurred: ${error.message}`);
        process.exit(1);
    }
}

// Execute the main function
main();