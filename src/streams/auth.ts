import authService from '../services/auth.service';
import { AuthLogin } from './complementars/auth_login';
import inquirer from 'inquirer';
import * as log from '../console-logger';

export interface AccountData {
    error?: boolean;
    error_message?: string;
    error_success_message?: string;
    plan_data?: {
        name: string;
        max_bots: number;
        max_connections: number;
        max_signals: number;
    };
    user?: {
        email: string;
        name: string;
    };
}

export default async function AuthStream(): Promise<AccountData | undefined> {
    const authenticationService = authService;

    const emails = authenticationService.getAccounts();
    console.log(emails);
    if (emails.length === 0) {
        return await AuthLogin();
    } else {
        const select = await inquirer.prompt([
            {
                choices: ['login', 'selecionar conta'],
                name: 'option_select',
                type: 'checkbox',
                message: 'O que deseja fazer:',
            },
        ]);
        if (select.option_select === 'login') {
            return await AuthLogin();
        } else {
            const accountSelected = await inquirer.prompt([
                {
                    name: 'account',
                    type: 'checkbox',
                    message: 'Selecione uma conta para prosseguir:',
                    choices: emails,
                },
            ]);

            const conta = await authService.readUserData(
                accountSelected.account[0]
            );

            if (!conta) {
                return {
                    error: true,
                    error_message: 'Erro ao ler dados sobre essa conta',
                };
            }

            if (accountSelected.account.length === 0) {
                return {
                    error: true,
                    error_message: 'Selecione uma conta para prosseguir',
                };
            }

            const choiceToAccount = await inquirer.prompt([
                {
                    name: 'options_to_account',
                    message: 'O que deseja fazer',
                    type: 'checkbox',
                    choices: ['deslogar', 'usar'],
                },
            ]);
            if (choiceToAccount.options_to_account[0] === 'deslogar') {
                log.success(`Você deslogou da conta ${conta.user.email}`);
                await authService.logoutAccount(conta.user.email);
                return {
                    error: true,
                };
            }

            if (choiceToAccount.options_to_account[0] === 'usar') {
                log.info(`Agora usando ${conta.user.email}`);

                return {
                    error: false,
                    plan_data: conta.plan_data,
                    user: conta.user,
                };
            }
        }
    }
}
