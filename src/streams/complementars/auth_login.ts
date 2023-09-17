import authService from '../../services/auth.service';
import inquirer from 'inquirer';
import * as log from '../../console-logger';
import { type AccountData } from '../auth';
export async function AuthLogin(): Promise<AccountData> {
    const authenticationService = authService;
    log.warn('Faça o login antes de continuar');
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'email',
            message: 'Seu email:',
        },
        {
            type: 'input',
            name: 'password',
            message: 'Sua senha:',
        },
    ]);

    const authResponse = await authenticationService.login(
        answers.email,
        answers.password
    );
    const response = authResponse.response;

    if (authResponse.error) {
        return {
            error: true,
            error_message: authResponse.response,
        };
    }

    log.success(`Login realizado com sucesso`);
    log.success(`Seu plano: ${authResponse.response.plan_data.name}`);
    return {
        plan_data: {
            max_bots: response.plan_data.max_bots,
            max_connections: response.plan_data.max_connections,
            max_signals: response.plan_data.max_signals,
            name: response.plan_data.name,
        },
        user: {
            email: response.user.email,
            name: response.user.name,
        },
    };
}
