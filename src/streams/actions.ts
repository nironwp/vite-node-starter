import inquirer from 'inquirer';
import actionsService from '../services/actions.service';
import listToNumberedList from '../utils/listToNumberedList';
import * as log from '../console-logger';
import createConnectionForBot from './complementars/create_bot';
import manageStrategies from './complementars/manage_strategies';
import botService from '../services/bot.service';
import authService from '../services/auth.service';
import { create } from 'mendes-bot';
import doubleStrategieBet from './complementars/double_strategie_bet';
export default async function ActionsStream(email: string) {
    const actions = await inquirer.prompt([
        {
            name: 'action',
            type: 'list',
            message: 'O que deseja fazer agora:',
            choices: ['Configurar bots', 'Modificar scripts 🔒'],
        },
    ]);

    if (actions.action === 'Configurar bots') {
        const optionsBot = await inquirer.prompt([
            {
                name: 'choice_bots',
                message: 'O que deseja fazer',
                choices: ['gerenciar bots', 'adicionar bot'],
                type: 'list',
            },
        ]);

        if (optionsBot.choice_bots === 'adicionar bot') {
            log.info('Hora de criar um bot');

            const datacreateConnectionForBot = await createConnectionForBot(
                email
            );

            if (datacreateConnectionForBot.error) {
                log.error(datacreateConnectionForBot.response);
                return;
            }
        }
        let bots = await actionsService.getUserBots(email);
        if (typeof bots === 'boolean') {
            return false;
        }

        if (bots.length === 0) {
            log.info(
                'Notamos que você não tem nenhum bot criado, vamos criar um!'
            );
            const datacreateConnectionForBot = await createConnectionForBot(
                email
            );

            if (datacreateConnectionForBot.error) {
                log.error(datacreateConnectionForBot.response);
                return;
            }
        }

        bots = await actionsService.getUserBots(email);
        if (typeof bots === 'boolean') {
            return false;
        }

        const promptUseBots = listToNumberedList(
            bots.map((bot) => `${bot.name} [${bot.signalType}] `)
        );
        const select = await inquirer.prompt([
            {
                name: 'bot_number',
                message: `Qual bot deseja usar\n ${promptUseBots}:\n`,
                type: 'number',
            },
        ]);

        const selectedBot = bots[select.bot_number - 1];
        const botOption = await inquirer.prompt({
            name: 'action',
            type: 'list',
            message: `O que deseja fazer:`,
            choices: ['deletar bot', 'iniciar bot', 'gerenciar estratégias'],
        });

        if (botOption.action === 'gerenciar estratégias') {
            const gerentData = await manageStrategies({
                email,
                selectedBot,
            });

            if (gerentData.error) {
                log.error(gerentData.response);
                return;
            }
        }

        if (botOption.action === 'deletar bot') {
            const userData = await authService.readUserData(email);

            if (!userData) {
                return {
                    error: true,
                    response: 'Não foi possivel encontrar o usuario',
                };
            }
            const deleteResponse = await botService.deleteBot(
                email,
                selectedBot.id,
                userData.token
            );

            if (!deleteResponse.error) {
                log.success('Bot deletado com sucesso!');
            }

            if (deleteResponse.error) {
                log.error(deleteResponse.response);
                return;
            }
        }

        if (botOption.action === 'iniciar bot') {
            log.info('Vamos iniciar o seu bot');
            log.info('Vamos reefazer seu login no Whatssap');
            log.info(
                'Caso demore muito tempo aperte Ctrl + C e comece de novo a aplicação'
            );
            const client = await create({
                session: selectedBot.id,
            });
            const showWelcomeMessage = await inquirer.prompt({
                type: 'confirm',
                name: 'answer',
                message: 'Deseja mostrar sua mensagem de boas vindas:',
            });
            await doubleStrategieBet(
                email,
                selectedBot.id,
                client,
                selectedBot,
                showWelcomeMessage.answer
            );
            log.success('Sessão finalizada');
        }
    }

    return true;
}
