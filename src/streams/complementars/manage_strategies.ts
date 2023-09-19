import inquirer from 'inquirer';
import { type BotInterface } from '../../interfaces/bot.interface';
import { createBetDouble } from './create_bet_double';
import authService from '../../services/auth.service';
import botService from '../../services/bot.service';
import listToNumberedList from '../../utils/listToNumberedList';
import deleteBetDouble from './delete_bet_double';
import type StrategieInterface from '../../interfaces/strategie.interface';
import type ResponseData from '../../interfaces/response.interface';

interface ManageStrategiesProps {
    email: string;
    selectedBot: BotInterface;
}

export default async function manageStrategies({
    email,
    selectedBot,
}: ManageStrategiesProps): Promise<ResponseData> {
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
        return {
            error: true,
            response: 'O tipo de jogo desse bot ainda não está disponivel',
        };
    }

    if (strategyOption.option[0] === 'adicionar') {
        const response = await createBetDouble(selectedBot, email);
        if (response.error) {
            return {
                error: true,
                response: response.response,
            };
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
            return {
                error: true,
                response: response.response,
            };
        }
    }

    return {
        error: false,
        response: 'Ação concluída com sucesso',
    };
}
