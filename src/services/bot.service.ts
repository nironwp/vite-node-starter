import axios from 'axios';
import type ResponseData from '../interfaces/response.interface';
import * as log from '../console-logger';

export class BotService {
    async removeStrategieDouble(
        token: string,
        strategieId: string
    ): Promise<ResponseData> {
        try {
            const response = await axios.delete(
                'http://localhost:3000/api/bot/strategie/' + strategieId,
                {
                    headers: {
                        Authorization: 'Bearer ' + token,
                    },
                }
            );
            log.success('Estratégia removida');
            return {
                error: false,
                response: response.data,
            };
        } catch (error) {
            return {
                error: true,
                response: 'Houve um erro ao tentar deletar a estratégia',
            };
        }
    }

    async listStrategiesBot(botId: string, token: string) {
        const response = await axios.get(
            'http://localhost:3000/api/bot/strategies/' + botId,
            {
                headers: {
                    Authorization: 'Bearer ' + token,
                },
            }
        );

        return response.data;
    }

    async deleteBot() {
        
    }

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
            log.success('Estratégia criada');
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
