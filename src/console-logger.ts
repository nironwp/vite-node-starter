import chalk from 'chalk';

export const info = (message?: any, ...optionalParams: any[]) => {
    console.log(chalk.blue(`[INFO] ${message}`), ...optionalParams);
};

export const warn = (message?: any, ...optionalParams: any[]) => {
    console.log(chalk.yellow(`[AVISO] ${message}`), ...optionalParams);
};

export const error = (message?: any, ...optionalParams: any[]) => {
    console.log(chalk.red(`[ERRO] ${message}`), ...optionalParams);
};

export const success = (message?: any, ...optionalParams: any[]) => {
    console.log(chalk.green(`[SUCESSO] ${message}`), ...optionalParams);
};
