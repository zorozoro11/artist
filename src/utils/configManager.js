import path from 'path';
import fs from 'fs/promises';
import xdg from 'xdg-basedir';

const CONFIG_DIR = path.join(xdg.config, 'ai-git-artist');
const CONFIG_FILE = path.join(CONFIG_DIR, 'repositories.json');

async function ensureConfig() {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
    try {
        await fs.access(CONFIG_FILE);
    } catch {
        await fs.writeFile(CONFIG_FILE, JSON.stringify({ repositories: {}, active: null }, null, 2));
    }
}

async function readConfig() {
    await ensureConfig();
    const data = await fs.readFile(CONFIG_FILE, 'utf-8');
    return JSON.parse(data);
}

async function writeConfig(config) {
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export async function createRepo(name, localPath, url) {
    const config = await readConfig();
    if (config.repositories[name]) {
        throw new Error(`Repository '${name}' is already being managed.`);
    }
    config.repositories[name] = { path: localPath, url };
    config.active = name; // Set the new repo as active
    await writeConfig(config);
}

export async function listRepos() {
    const config = await readConfig();
    return config.repositories;
}

export async function setActiveRepo(name) {
    const config = await readConfig();
    if (!config.repositories[name]) {
        throw new Error(`Repository '${name}' not found.`);
    }
    config.active = name;
    await writeConfig(config);
}

export async function getActiveRepo() {
    const config = await readConfig();
    return config.active;
}

export async function getRepoPath(name) {
    const config = await readConfig();
    return config.repositories[name]?.path;
}

export async function removeRepo(name) {
    const config = await readConfig();
    if (!config.repositories[name]) {
        throw new Error(`Repository '${name}' not found.`);
    }
    delete config.repositories[name];
    if (config.active === name) {
        config.active = null;
    }
    await writeConfig(config);
}