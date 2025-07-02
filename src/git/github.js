import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
    auth: process.env.GITHUB_PAT,
});

/**
 * Creates a new private repository on GitHub.
 * @param {string} name The name of the repository.
 * @returns {string} The HTTPS clone URL with the PAT embedded.
 */
export async function createGitHubRepo(name) {
    const user = await octokit.users.getAuthenticated();
    const owner = user.data.login;

    await octokit.repos.createForAuthenticatedUser({
        name,
        private: true,
        description: 'Repository for AI Git Artist creations.',
        auto_init: false,
    });
    
    // Return the URL with the PAT for authentication
    return `https://${process.env.GITHUB_PAT}@github.com/${owner}/${name}.git`;
}