import axios from 'axios';
import type ResponseData from '../interfaces/response.interface';

export class BotService {
    async removeStrategie() {}

    async createStrategieDouble(
        botId: string,
        betColor: number,
        presetColors: number[],
        token: string
    ): Promise<ResponseData> {
        const data = JSON.stringify({
            bot_id: botId,
            bet_color: betColor,
            preset_colors: presetColors,
        });

        try {
            const response = await axios.post(
                'http://localhost:3000/api/bot/strategie',
                data,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token,
                    },
                }
            );

            return {
                error: false,
                response: response.data,
            };
        } catch (error) {
            return {
                error: true,
                response: 'Aconteceu um erro ao tentar criar a estratégia',
            };
        }
    }
}

const botService = new BotService();

export default botService;
