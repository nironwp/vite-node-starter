import inquirer from 'inquirer';
import actionsService from '../services/actions.service';
import listToNumberedList from '../utils/listToNumberedList';
import * as log from '../console-logger';
import createConnectionForBot from './complementars/create_bot';
import { createBetDouble } from './complementars/create_bet_double';
import deleteBetDouble from './complementars/delete_bet_double';
import botService from '../services/bot.service';
import authService from '../services/auth.service';
import type StrategieInterface from '../interfaces/strategie.interface';
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

        const selectedBot = bots[select.bot_number - 1];

        console.log('BOT SELECIONADO', selectedBot);
        const botOption = await inquirer.prompt({
            name: 'action',
            type: 'checkbox',
            message: `O que deseja fazer:`,
            choices: ['deletar bot', 'iniciar bot', 'gerenciar estratégias'],
        });

        if (botOption.action[0] === 'gerenciar estratégias') {
            const strategyOption = await inquirer.prompt({
                name: 'option',
                type: 'checkbox',
                message: 'O que deseja modificar nas estratégias:',
                choices: ['remover', 'adicionar'],
            });
            if (
                selectedBot.gameType !== 'DOUBLE' &&
                strategyOption.option[0] === 'adicionar'
            ) {
                log.error(
                    'Ainda não é possivel criar estrategias para outros jogos'
                );
                return false;
            }

            if (strategyOption.option[0] === 'adicionar') {
                const response = await createBetDouble(selectedBot, email);
                if (response.error) {
                    log.error(response.response);
                    return;
                }
            }

            if (strategyOption.option[0] === 'remover') {
                const userData = await authService.readUserData(email);

                if (!userData) {
                    return {
                        error: true,
                        response: 'Não foi possivel encontrar o usuario',
                    };
                }
                const strategies = await botService.listStrategiesBot(
                    selectedBot.id,
                    userData.token
                );

                const strategiesPrompt = listToNumberedList(
                    strategies.map((strategie: StrategieInterface) => {
                        const movedArray = strategie.preset_colors.map(
                            (presetColor: number) => {
                                if (presetColor === 1) {
                                    return '🟡';
                                } else if (presetColor === 2) {
                                    return '🔵';
                                } else if (presetColor === 0) {
                                    return '⚪';
                                }
                                return '⚪';
                            }
                        );

                        const betColor =
                            strategie.bet_color === 1
                                ? '🟡'
                                : strategie.bet_color === 2
                                ? ' 🔵'
                                : '⚪';
                        return `${movedArray} => ${betColor}`;
                    })
                );

                const strategieSelect = await inquirer.prompt([
                    {
                        name: 'selected',
                        type: 'number',
                        message: `Qual estratégia deseja remover\n ${strategiesPrompt}:`,
                    },
                ]);

                const response = await deleteBetDouble(
                    email,
                    strategies[strategieSelect.selected - 1].id
                );

                if (response.error) {
                    log.error(response.response);
                    return;
                }
            }
        }
    }

    return true;
}
