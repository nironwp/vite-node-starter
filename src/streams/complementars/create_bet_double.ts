import inquirer from 'inquirer';
import { type BotInterface } from '../../interfaces/bot.interface';
import botService from '../../services/bot.service';
import authService from '../../services/auth.service';
import type ResponseData from '../../interfaces/response.interface';

export async function createBetDouble(
    bot: BotInterface,
    emaiL: string
): Promise<ResponseData> {
    const strategie = await getStrategy();

    const userData = await authService.readUserData(emaiL);

    if (!userData) {
        return {
            error: true,
            response: 'Não conseguimos encontrar o usuario correspondente',
        };
    }

    return await botService.createStrategieDouble(
        bot.id,
        strategie.bet_color,
        strategie.preset_colors,
        userData?.token
    );
}
async function getStrategy() {
    const colorMap = {
        Amarelo: 1,
        Branco: 0,
        Azul: 2,
    };

    const betColorAnswer = await inquirer.prompt([
        {
            name: 'bet_color',
            message: 'Qual é a cor alvo dessa estrategia:',
            choices: ['Amarelo', 'Branco', 'Azul'],
            type: 'list',
        },
    ]);

    const presetColors = [];
    let continueAdding = true;

    while (continueAdding) {
        const presetColorAnswer = await inquirer.prompt([
            {
                name: 'preset_color',
                message:
                    'Qual é a próxima cor na sequência para essa estrategia?',
                choices: ['Amarelo', 'Branco', 'Azul'],
                type: 'list',
            },
            {
                name: 'add_more',
                message: 'Você gostaria de adicionar mais cores?',
                type: 'confirm',
            },
        ]);

        presetColors.push(
            colorMap[presetColorAnswer.preset_color as keyof typeof colorMap]
        );
        continueAdding = presetColorAnswer.add_more;
    }

    return {
        bet_color: colorMap[betColorAnswer.bet_color as keyof typeof colorMap],
        preset_colors: presetColors,
    };
}
