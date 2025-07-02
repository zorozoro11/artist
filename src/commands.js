import inquirer from 'inquirer';
import ora from 'ora';
import { triagePrompt } from './ai/triage.js';
import { generateArt } from './ai/artist.js';
import { renderText } from './art/textRenderer.js';
import { getPattern } from './art/patternLibrary.js';
import { createRepo, getRepoPath, listRepos, removeRepo, setActiveRepo, getActiveRepo } from './utils/configManager.js';
import { createGitHubRepo } from './git/github.js';
import { initializeRepo, undoLastAction, wipeHistory } from './git/git.js';
import { getStartDate } from './utils/dateHelper.js';
import { displayPreview } from './utils/preview.js';
import { executeCommits } from './core/engine.js';
import { log, logError, logSuccess, logInfo, logWarning } from './utils/logger.js';

export const handleDraw = async (prompt, options) => {
    const spinner = ora('Initializing...').start();
    try {
        const repoName = options.repo || (await getActiveRepo());
        if (!repoName) {
            throw new Error("No repository selected. Use 'ai-git-artist repo use <name>' or specify with --repo <name>.");
        }
        spinner.text = `Verifying repository '${repoName}'...`;
        const repoPath = await getRepoPath(repoName);
        if (!repoPath) {
             throw new Error(`Repository '${repoName}' not found. Add it via 'repo create'.`);
        }

        spinner.text = '🧠 AI Triage: Analyzing your request...';
        const triageResult = await triagePrompt(prompt);
        logSuccess(`Triage complete: Intent is '${triageResult.intent}' with data '${triageResult.data}'.`);

        spinner.text = '🎨 Generating artwork coordinates...';
        let coordinates;
        switch (triageResult.intent) {
            case 'text':
                coordinates = renderText(triageResult.data);
                break;
            case 'known_shape':
                coordinates = getPattern(triageResult.data);
                if (!coordinates) throw new Error(`Shape '${triageResult.data}' not found in pattern library.`);
                break;
            case 'custom_shape':
                coordinates = await generateArt(triageResult.data);
                break;
            default:
                throw new Error(`Unknown intent classification: ${triageResult.intent}`);
        }
        spinner.succeed('Artwork coordinates generated.');

        const weekOffset = parseInt(options.offset, 10);
        const startDate = getStartDate();

        logInfo("\nArtwork Preview (Simulated GitHub Graph):");
        displayPreview(coordinates, weekOffset);
        
        const { confirm } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: `Ready to commit this artwork to '${repoName}'?`,
                default: true,
            },
        ]);

        if (confirm) {
            await executeCommits(coordinates, startDate, repoPath, weekOffset);
            logSuccess(`\n✅ Artwork successfully committed! Check your GitHub profile in a few minutes.`);
        } else {
            logInfo('Operation cancelled.');
        }

    } catch (error) {
        spinner.fail('Operation failed.');
        logError(error.message);
    }
};

export const handleRepo = async (action, name) => {
    try {
        switch (action) {
            case 'create':
                const spinner = ora(`Creating GitHub repository '${name}'...`).start();
                const repoUrl = await createGitHubRepo(name);
                spinner.text = 'Initializing local repository...';
                const localPath = await initializeRepo(name, repoUrl);
                await createRepo(name, localPath, repoUrl);
                spinner.succeed(`Successfully created and configured '${name}'.`);
                logInfo(`Set as active repository. You can now use 'ai-git-artist draw "..."'.`);
                break;
            case 'list':
                const repos = await listRepos();
                logInfo("Managed Repositories:");
                if (Object.keys(repos).length === 0) {
                    log("  No repositories configured.");
                } else {
                    const activeRepo = await getActiveRepo();
                    for (const repoName in repos) {
                        const isActive = repoName === activeRepo;
                        log(`  ${isActive ? '*' : ' '} ${repoName} -> ${repos[repoName].path}`);
                    }
                }
                break;
            case 'use':
                await setActiveRepo(name);
                logSuccess(`Default repository set to '${name}'.`);
                break;
            case 'remove':
                await removeRepo(name);
                logSuccess(`'${name}' removed from management list.`);
                break;
        }
    } catch (error) {
        logError(error.message);
    }
};

export const handleUndo = async (options) => {
     try {
        const repoName = options.repo || (await getActiveRepo());
        if (!repoName) throw new Error("No repository selected.");
        
        const { confirm } = await inquirer.prompt([{
            type: 'confirm',
            name: 'confirm',
            message: `Are you sure you want to undo the last action in '${repoName}'? This will reset the last batch of commits.`,
            default: false,
        }]);

        if (confirm) {
            const spinner = ora(`Undoing last action in '${repoName}'...`).start();
            await undoLastAction(repoName);
            spinner.succeed(`Successfully reverted the last action in '${repoName}'.`);
        } else {
            logInfo('Undo operation cancelled.');
        }
    } catch (error) {
        logError(error.message);
    }
};

export const handleWipe = async (options) => {
    try {
        const repoName = options.repo || (await getActiveRepo());
        if (!repoName) throw new Error("No repository selected.");
        
        logWarning(`DANGER ZONE: This will completely and irreversibly wipe the commit history for '${repoName}'.`);
        const { confirm1 } = await inquirer.prompt([{
            type: 'confirm', name: 'confirm1', message: 'Are you absolutely sure?', default: false,
        }]);

        if (!confirm1) {
            logInfo('Wipe operation cancelled.');
            return;
        }

        const { confirm2 } = await inquirer.prompt([{
            type: 'input', name: 'confirm2', message: `To confirm, please type the repository name ('${repoName}'):`,
        }]);

        if (confirm2 !== repoName) {
            logError('Repository name did not match. Wipe operation cancelled.');
            return;
        }

        const spinner = ora(`Wiping history for '${repoName}'...`).start();
        await wipeHistory(repoName);
        spinner.succeed(`History for '${repoName}' has been wiped. You have a fresh canvas.`);

    } catch (error) {
        logError(error.message);
    }
};