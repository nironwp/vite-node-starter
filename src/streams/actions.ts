import inquirer from 'inquirer';
import actionsService from '../services/actions.service';
import listToNumberedList from '../utils/listToNumberedList';
import * as log from '../console-logger';
import createConnectionForBot from './complementars/create_bot';
import { createBetDouble } from './complementars/create_bet_double';
export default async function ActionsStream(email: string) {
    const actions = await inquirer.prompt([
        {
            name: 'action',
            type: 'checkbox',
            message: 'O que deseja fazer agora:',
            choices: ['Usar bots', 'Modificar scripts 🔒'],
        },
    ]);

    if (actions.action[0] === 'Usar bots') {
        let bots = await actionsService.getUserBots(email);
        console.log(bots);
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

        const selectedBot = bots[select.bot_number];

        const botOption = await inquirer.prompt({
            name: 'action',
            type: 'checkbox',
            message: `O que deseja fazer:`,
            choices: ['deletar bot', 'iniciar bot', 'gerenciar estratégias'],
        });

        if (botOption.option === 'gerenciar estratégias') {
            const strategyOption = await inquirer.prompt({
                name: 'option',
                message: 'O que deseja modificar nas estratégias:',
                choices: ['remover', 'adicionar'],
            });

            if (
                selectedBot.gameType !== 'DOUBLE' &&
                strategyOption.option === 'adicionar'
            ) {
                log.error(
                    'Ainda não é possivel criar estrategias para outros jogos'
                );
                return false;
            }

            if (strategyOption.option === 'adicionar') {
                await createBetDouble(selectedBot, email);
            }
        }
    }

    return true;
}
