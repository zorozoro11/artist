import simpleGit from 'simple-git';
import fs from 'fs/promises';
import path from 'path';
import { getRepoPath } from '../utils/configManager.js';

/**
 * Initializes a new local git repository, adds remote, and makes an initial commit.
 * @param {string} repoName - The name of the repository.
 * @param {string} remoteUrl - The full HTTPS url for the remote (including PAT).
 * @returns {string} The local path to the repository.
 */
export async function initializeRepo(repoName, remoteUrl) {
    const localPath = path.join(process.cwd(), repoName);
    await fs.mkdir(localPath, { recursive: true });
    
    const repoGit = simpleGit(localPath);
    await repoGit.init();
    await repoGit.addRemote('origin', remoteUrl);
    
    // Create an initial README and commit
    await fs.writeFile(path.join(localPath, 'README.md'), `# ${repoName}\n\nThis repository is used by AI Git Artist.`);
    await repoGit.add('README.md');
    await repoGit.commit('Initial commit by AI Git Artist', { '--date': new Date().toISOString() });
    await repoGit.push(['-u', 'origin', 'main']);

    return localPath;
}

export async function commit(message, date, repoPath) {
    // We modify a file to ensure the commit is not empty
    const filePath = path.join(repoPath, 'data.json');
    const data = { date, message, random: Math.random() };
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    
    const repoGit = simpleGit(repoPath);
    await repoGit.add(filePath).commit(message, { '--date': date });
}

export async function push(repoPath) {
    await simpleGit(repoPath).push('origin', 'main', ['--force']);
}

export async function prepareUndoPoint(repoName) {
    const repoPath = await getRepoPath(repoName);
    const repoGit = simpleGit(repoPath);
    const log = await repoGit.log(['-1', '--pretty=%H']);
    const lastHash = log.latest.hash;
    
    const undoFilePath = path.join(repoPath, '.git', 'undo_point.hash');
    await fs.writeFile(undoFilePath, lastHash);
}

export async function undoLastAction(repoName) {
    const repoPath = await getRepoPath(repoName);
    const repoGit = simpleGit(repoPath);
    const undoFilePath = path.join(repoPath, '.git', 'undo_point.hash');

    try {
        const restoreHash = await fs.readFile(undoFilePath, 'utf-8');
        await repoGit.reset(['--hard', restoreHash]);
        await push(repoPath); // Force push to overwrite remote history
        await fs.unlink(undoFilePath); // Clean up
    } catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error("No undo point found. Cannot undo.");
        }
        throw error;
    }
}

export async function wipeHistory(repoName) {
    const repoPath = await getRepoPath(repoName);
    const repoGit = simpleGit(repoPath);
    
    // 1. Create a new orphan branch
    await repoGit.checkout(['--orphan', 'fresh-start']);
    
    // 2. Remove all files from the new branch
    await repoGit.rm(['-rf', '.']);

    // 3. Create a new root commit
    const readmePath = path.join(repoPath, 'README.md');
    await fs.writeFile(readmePath, `# ${repoName}\n\nHistory wiped and reset by AI Git Artist.`);
    await repoGit.add(readmePath);
    await repoGit.commit('chore: repository history wiped', { '--date': new Date().toISOString() });

    // 4. Delete the old main branch
    await repoGit.branch(['-D', 'main']);

    // 5. Rename the new branch to main
    await repoGit.branch(['-m', 'main']);

    // 6. Force push the new history to the remote
    await repoGit.push(['-f', 'origin', 'main']);
}