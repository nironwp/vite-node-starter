import { PrismaClient } from '@prisma/client';
import * as log from '../../../console-logger';
import { type BotInterface } from '../../../interfaces/bot.interface.js';

const prisma = new PrismaClient();

export default async function analysisConditionToSignal(
    botId: string,
    bot: BotInterface
): Promise<boolean> {
    const targetDate = new Date();

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const entriesWithBotId = await prisma.entrie.findMany({
        where: {
            bot_id: botId,
            time: {
                gte: startOfDay,
                lt: endOfDay,
            },
        },
    });

    const totalEntries = entriesWithBotId.length;

    const currentTime = new Date();
    console.log(currentTime);

    console.log(
        `Total de entradas: ${totalEntries} objetivo ${bot.max_signal}`
    );

    if (totalEntries > bot.max_signal) {
        log.info(
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
            `Parando porque o bot atingiu o limite diario de mensagens: ` +
                totalEntries
        );
        return false;
    }

    const latestEntry = await prisma.entrie.findFirst({
        where: { bot_id: botId },
        orderBy: { time: 'desc' },
    });

    if (latestEntry) {
        const entryTime = latestEntry.time;
        const timeDifferenceInSeconds = Math.floor(
            (currentTime.getTime() - entryTime.getTime()) / 1000
        );

        if (timeDifferenceInSeconds > bot.signal_interval) {
            return true;
        } else {
            console.log(
                `O bot vai esperar ${
                    bot.signal_interval - timeDifferenceInSeconds
                } segundos`
            );

            await new Promise<void>((resolve) => {
                setTimeout(() => {
                    resolve();
                }, (bot.signal_interval - timeDifferenceInSeconds) * 1000);
            });

            log.info('Bot aguardou o tempo necessário');
        }
    }

    return true;
}
