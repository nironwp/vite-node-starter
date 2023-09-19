import axios from 'axios';
import authService from './auth.service';
import type ResponseData from '../interfaces/response.interface';

export class ServerService {
    async authenticateBot(email: string, botId: string): Promise<ResponseData> {
        const userData = await authService.readUserData(email);

        if (!userData) {
            return {
                error: true,
                response: 'Falha ao buscar dados do usuario',
            };
        }
        try {
            const dataResponse = await axios.get(
                'http://localhost:3000/api/results/authenticate/' + botId,
                {
                    headers: {
                        Authorization: 'Bearer ' + userData.token,
                    },
                }
            );

            console.log(dataResponse.data)

            return {
                error: false,
                response: dataResponse.data,
            };
        } catch (error) {
            return {
                error: true,
                response: 'Erro ao criar código temporario para o usuario',
            };
        }
    }

    async getResultsDouble(
        botId: string,
        temporaryCode: string
    ): Promise<ResponseData> {
        console.log(`Codigo de uso temporario passado para a função: ${temporaryCode}`)
        try {
            const response = await axios.get(
                'http://localhost:3000/api/results/double/results/' +
                    botId +
                    '/' +
                    temporaryCode
            );

            return {
                error: false,
                response: response.data.results,
            };
        } catch (error: any) {
            console.log(error.response.data)
            return {
                error: false,
                response:
                    'Não foi possivel obter os dados mais recentes dos jogos da double',
            };
        }
    }
}

const serverService = new ServerService();

export default serverService;
