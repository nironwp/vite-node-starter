import axios from 'axios';
import { create } from 'mendes-bot';
import authService, { type AuthService } from './auth.service';
import { type BotInterface } from '../interfaces/bot.interface';
import type ResponseData from '../interfaces/response.interface';
import generateUniqueID from '../utils/generateUniqueID';
import * as log from '../console-logger';
import { type WhatsappConnectionInterface } from '../interfaces/whatssap-connection';

interface CreateBotInterface {
    signalType: string;
    name: string;
    gameType: string;
    finish_messages: string[];
    bet_message: string;
    green_message: string;
    red_message: string;
    welcome_messages: string[];
    finish_time: number;
    signal_interval: number;
    in_use: boolean;
    max_signal: number;
    whatsappConnectionId: string;
}

class ActionsService {
    private readonly authService: AuthService;
    constructor() {
        this.authService = authService;
    }

    async listGroups(connectionName: string): Promise<ResponseData> {
        try {
            const client = await create({
                session: connectionName,
                disableWelcome: true,
                debug: false,
                addBrowserArgs: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-logging',
                    '--log-level=3',
                ],
            });

            const groups = (await client.getAllChatsGroups()).map(
                (group: any) => {
                    return {
                        id: group.id,
                        name: group.name,
                    };
                }
            );
            void client.logout();
            return {
                error: false,
                response: groups,
            };
        } catch (error) {
            return {
                error: true,
                response: 'Erro ao buscar conexão do Whatssap',
            };
        }
    }

    async createConnectionForBot(email: string): Promise<ResponseData> {
        try {
            const id = generateUniqueID();
            const client = await create({
                session: id,
                disableWelcome: true,
                debug: false,
                addBrowserArgs: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-logging',
                    '--log-level=3',
                ],
            });

            const numberData: any = await client.getNumberProfile(
                '1111111@c.us'
            );

            log.info('Criando conexão no Whatssap');
            await client.logout();
            return await this.createWhatssapConection(
                id,
                numberData.me.id._serialized,
                Number(numberData.me.id.user),
                email
            );
        } catch (error) {
            return {
                error: true,
                response: 'Erro ao criar conexão do Whatssap',
            };
        }
    }

    async createBot(
        dataDto: CreateBotInterface,
        emaiL: string
    ): Promise<ResponseData> {
        const user = await authService.readUserData(emaiL);

        if (!user) {
            return {
                error: true,
                response: 'Usuario referente não encontrado',
            };
        }

        const data = JSON.stringify({
            game_type: dataDto.gameType,
            name: dataDto.name,
            signal_type: dataDto.signalType,
            finish_messages: [dataDto.finish_messages],
            welcome_messages: [dataDto.welcome_messages],
            bet_message: dataDto.bet_message,
            green_message: dataDto.green_message,
            red_message: dataDto.red_message,
            max_signal: dataDto.max_signal,
            signal_interval: dataDto.signal_interval,
            whatsappConnectionId: dataDto.whatsappConnectionId,
            finish_time: dataDto.finish_time,
        });

        try {
            const response = await axios.post<BotInterface>(
                'http://localhost:3000/api/bot',
                data,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + user.token,
                    },
                }
            );

            log.success('Bot criado com sucesso!');
            return {
                error: false,
                response: response.data,
            };
        } catch (error: any) {
            console.log(error);
            return {
                error: true,
                response: error.response
                    ? error.response.data.message
                    : error.message,
            };
        }
    }

    async createWhatssapConection(
        connectionName: string,
        serializedNumber: string,
        unserializedNumber: number,
        email: string
    ): Promise<ResponseData> {
        const data = JSON.stringify({
            connection_name: connectionName,
            serialized_number: serializedNumber,
            is_active: false,
            unserialized_number: unserializedNumber,
        });

        console.log(data);

        try {
            const user = await authService.readUserData(email);

            if (!user) {
                return {
                    error: true,
                    response: `Dados do usuario ${email} não encontrados`,
                };
            }
            const response = await axios.post(
                'http://localhost:3000/api/whatssap-conection/connect',
                data,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + user.token,
                    },
                }
            );

            return {
                error: false,
                response: response.data,
            };
        } catch (error: any) {
            return {
                error: true,
                response: error.response
                    ? error.response.data.message
                    : error.message,
            };
        }
    }

    async getWhatssapConnections(email: string): Promise<ResponseData> {
        const user = await this.authService.readUserData(email);

        if (!user) {
            return {
                error: true,
                response: `Não encontramos o usuario ${email} no seu armazenamento`,
            };
        }

        try {
            const response = await axios.get<WhatsappConnectionInterface[]>(
                'http://localhost:3000/api/whatssap-conection',
                {
                    headers: {
                        Authorization: 'Bearer ' + user.token,
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
                response: 'Aconteceu um erro ao tentar buscar suas conexões',
            };
        }
    }

    async getUserBots(emaiL: string) {
        const user = await this.authService.readUserData(emaiL);

        if (!user) {
            return false;
        }

        const config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'http://localhost:3000/api/bot',
            headers: {
                Authorization: 'Bearer ' + user.token,
            },
        };

        const response = await axios.request<BotInterface[]>(config);

        return response.data;
    }
}

export default new ActionsService();
