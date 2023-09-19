import { type Whatsapp } from 'mendes-bot';
import * as log from '../../console-logger';
import serverService from '../../services/server.service';
import analysisConditionToSignal from './double/analysisConditionToSignal';
import { type BotInterface } from '../../interfaces/bot.interface';
import sendExitingMessage from '../../bots/sendExitingMessage';
import { StrategieEntity } from '../../entities/strategie.entity';
import getLastResultsFromApiDouble from './double/getLastResultsFromApiDouble';
import sendWelcomeMessage from '../../bots/sendWelcomeMessage';
import sendSignalDouble from './double/sendSignalDouble';
import listToNumberedList from '../../utils/listToNumberedList';
import inquirer from 'inquirer';
import convertColorsToString, {
    convertUniqueColor,
} from '../../utils/convertColorsToString';
export default async function doubleStrategieBet(
    email: string,
    botId: string,
    client: Whatsapp,
    bot: BotInterface,
    showWelcomeMessage = true,
) {
    log.info('Se autenticando com o servidor...');

    if (!bot.target_group) {
        const clientgroups: any[] = await client.getAllChatsGroups();

        const prompt = listToNumberedList(
            clientgroups.map((group) => {
                return group.groupMetadata.subject;
            })
        );

        const targetGroup = await inquirer.prompt({
            name: 'group_selected',
            message: `Para qual grupo deseja enviar as mensagens: \n${prompt}\n`,
            type: 'input',
        });

        const selectedGroup = clientgroups[targetGroup.group_selected - 1];

        if (!selectedGroup) {
            log.error('Grupo inválido!');
            return;
        }

        bot.target_group = selectedGroup.id._serialized;

        log.info(`Grupo ${selectedGroup.groupMetadata.subject} selecionado`);
    }
    log.info('Iniciando sessão de sinais!');

    if (showWelcomeMessage) {
        await sendWelcomeMessage(
            client,
            bot.target_group,
            bot.welcome_messages.join('Alterar isso daqui também')
        );
    }
    let authentication = await serverService.authenticateBot(email, botId);

    if (authentication.error) {
        log.error(authentication.response);
        return;
    }

    let temporaryCode = authentication.response.temporary_code;

    const canSend = await analysisConditionToSignal(botId, bot);

    authentication = await serverService.authenticateBot(email, botId);

    if (authentication.error) {
        log.error(authentication.response);
        return;
    }

    temporaryCode = authentication.response.temporary_code;
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    console.log('[DEBUG] Robô está apto a enviar sinais:' + canSend);
    if (!canSend) {
        log.success('Robô parando aperte Ctrl + C para parar o processo');
        await sendExitingMessage(
            client,
            bot.target_group,
            bot.finish_messages.join('Alterar formatação das mensagens')
        );
        return;
    }

    const results = await serverService.getResultsDouble(botId, temporaryCode);
    let betColor: number | undefined;
    for (const strategie of bot.strategies) {
        const entity = new StrategieEntity(
            strategie.preset_colors,
            strategie.bet_color,
            strategie.id
        );

        const validate = entity.validateBet(results.response);

        if (validate.bet_color) {
            betColor = validate.bet_color;
            log.info(
                'Estratégia confirmada ' +
                    convertColorsToString(strategie.preset_colors) +
                    ' => ' +
                    convertUniqueColor(strategie.bet_color)
            );
            break;
        }
    }

    if (betColor) {
        if (canSend) {
            await sendSignalDouble({
                client,
                botId,
                color: betColor,
                bot,
                id: bot.target_group,
                temporaryCode,
                strategie: results.response,
            });
        }
    }

    if (canSend) {
        await getLastResultsFromApiDouble(
            results.response,
            botId,
            temporaryCode
        );
        return doubleStrategieBet(email, botId, client, bot, false);
    }
}
