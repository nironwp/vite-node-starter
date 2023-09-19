import { PrismaClient } from '@prisma/client';
import getLastResultsFromApiDouble from './getLastResultsFromApiDouble';
import { type BotInterface } from '../../../interfaces/bot.interface';
interface SendSignalDoubleProps {
    client: any;
    id: string;
    color: number;
    botId: string;
    strategie?: number[];
    temporaryCode: string;
    bot: BotInterface;
}

interface VerifyBetProps {
    client: any;
    strategie: number[];
    color: number;
    replyMessageId: string;
    groupId: string;
    temporaryCode: string;
    _gale?: number;
    botId: string;
    _resulted: boolean;
}
const prisma = new PrismaClient();
export default async function sendSignalDouble({
    client,
    id,
    color,
    botId,
    bot,
    temporaryCode,
    strategie = [],
}: SendSignalDoubleProps): Promise<void> {
    const colorInText =
        color === 1 ? 'AMARELO' : color === 2 ? 'AZUL' : 'BRANCO';
    console.log('cores', color, colorInText);
    const message = await client.sendText(
        id,
        [
            '*FAÇA SUA APOSTA AGORA!!*🦈✅🚀',
            `APOSTAR NO *${colorInText}*`,
            '🥇 FAZER ATÉ 3 ENTRADAS !!',
            'OS SINAIS DO MEU ROBÔ SÓ SERVEM PRA QUEM FOR CADASTRADO AO MEU LINK OK?🦈✅',
            'LINK DE CADASTRO👇🏻📊📱',
            process.env.AFFILIATE_LINK,
        ].join('\n \n')
    );

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    await verifyBet({
        client,
        color,
        groupId: id,
        temporaryCode,
        replyMessageId: message.to._serialized,
        strategie,
        _gale: 1,
        botId,
        _resulted: false,
    });

    try {
        await prisma.entrie.create({
            data: {
                time: new Date(),
                game: bot.gameType,
                bot_id: botId,
                color,
            },
        });
    } catch (error) {
        console.log('Erro ao tentar salvar BET', error);
    }
}

async function verifyBet({
    client,
    strategie,
    color,
    replyMessageId,
    groupId,
    _gale,
    temporaryCode,
    botId,
    _resulted = false,
}: VerifyBetProps): Promise<void> {
    if (_gale && _gale > 4) {
        return;
    }
    const gale = _gale ?? 1;
    console.log(`Results passed for the ${gale}: ${strategie.slice(0, 6)}`);
    const results = await getLastResultsFromApiDouble(
        strategie,
        botId,
        temporaryCode
    );

    let resulted = _resulted;
    if (resulted) {
        return;
    }

    try {
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        console.log('Gale:' + _gale);
        console.log(results);
        console.log('Resultados:', results.response[0]);
        console.log('Valor esperado:', color);
        if (results.response[0] === color) {
            await client.reply(groupId, '🤑🤑🤑GREEN🤑🤑🤑', replyMessageId);
            resulted = true;
            return;
        }

        if (gale > 3) {
            await client.reply(groupId, '❌❌❌❌❌❌', replyMessageId);
            resulted = true;
        }
    } catch (error) {
        await verifyBet({
            client,
            strategie: results.response,
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
            _gale: _gale ? _gale + 1 : 1,
            color,
            groupId,
            _resulted: resulted,
            replyMessageId,
            botId,
            temporaryCode,
        });
    }
    if (!resulted) {
        await verifyBet({
            client,
            strategie: results.response,
            _resulted: resulted,
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
            _gale: _gale ? _gale + 1 : 1,
            color,
            groupId,
            replyMessageId,
            botId,
            temporaryCode,
        });
    }
}
