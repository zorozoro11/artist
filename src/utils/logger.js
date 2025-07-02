import chalk from 'chalk';

export const log = console.log;

export const logError = (message) => {
    log(chalk.red.bold('Error:'), chalk.red(message));
};

export const logSuccess = (message) => {
    log(chalk.green.bold('Success:'), chalk.green(message));
};

export const logInfo = (message) => {
    log(chalk.blue.bold('Info:'), chalk.blue(message));
};

export const logWarning = (message) => {
    log(chalk.yellow.bold('Warning:'), chalk.yellow(message));
};