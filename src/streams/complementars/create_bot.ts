import inquirer from 'inquirer';
import * as log from '../../console-logger';
import actionsService from '../../services/actions.service';
import type ResponseData from '../../interfaces/response.interface';
import listToNumberedList from '../../utils/listToNumberedList';
import { type WhatsappConnectionInterface } from '../../interfaces/whatssap-connection';

async function createConnectionForBot(emaiL: string): Promise<ResponseData> {
    const configuracoesGerais = await inquirer.prompt([
        {
            name: 'mensagens_finalizacao',
            type: 'editor',
            message:
                'Quais mensagens o bot deve enviar ao concluir o envio dos sinais?',
        },
        {
            name: 'tipo_sinal',
            type: 'checkbox',
            message: 'Selecione o tipo do bot:',
            choices: ['VIP', 'NORMAL'],
        },
        {
            name: 'nome_bot',
            type: 'input',
            message: 'Informe o nome do bot (para identificação futura):',
        },
        {
            name: 'jogo_bot',
            choices: ['DOUBLE'],
            type: 'checkbox',
            message:
                'Em qual jogo o bot operará? (Os sinais são baseados na nossa recomendação):',
        },
        {
            name: 'mensagem_sucesso',
            message:
                'Informe a mensagem a ser enviada quando um sinal for bem-sucedido (mensagem verde):',
            type: 'input',
        },
        {
            name: 'mensagem_falha',
            message:
                'Informe a mensagem a ser enviada quando um sinal falhar (mensagem vermelha):',
            type: 'input',
        },
        {
            name: 'mensagens_boas_vindas',
            type: 'editor',
            message: 'Quais mensagens o bot deve enviar ao ser iniciado?',
        },
        {
            name: 'tempo_finalizacao',
            type: 'number',
            message: 'Quantos minutos cada sessão de sinais deve durar?',
        },
        {
            name: 'intervalo_sinal',
            type: 'number',
            message:
                'Qual deve ser o intervalo entre cada sinal (em segundos)?',
        },
        {
            name: 'maximo_sinais',
            type: 'number',
            message:
                'Quantos sinais a sessão deve ter no máximo? (Se exceder a quantidade diária do seu plano, o bot será interrompido ao atingir o limite diário)',
        },
    ]);

    // Melhorando a exibição das variáveis.
    const variaveis = [
        {
            variavel: '[COR]',
            descricao: 'Cor da aposta de acordo com a estratégia criada',
        },
        {
            variavel: '[ESPACO]',
            descricao: 'Cria uma quebra de linha na mensagem',
        },
        // eslint-disable-next-line no-template-curly-in-string
        {
            // eslint-disable-next-line no-template-curly-in-string
            variavel: '[TEMPO_NUMERO_DE_MINUTOS]',
            descricao:
                'Substitua "NUMERO_DE_MINUTOS" pelo número desejado para representar o tempo no futuro',
        },
    ];

    log.info(
        'Variáveis que você pode usar no texto e que serão automaticamente transformadas:'
    );

    for (const v of variaveis) {
        log.info(`${v.variavel} - ${v.descricao}`);
    }

    const configuracoesSecundarias = await inquirer.prompt([
        {
            name: 'mensagem_aposta',
            type: 'editor',
            message: 'Como será a mensagem do seu sinal?',
        },
    ]);

    const whatsappConnections = await actionsService.getWhatssapConnections(
        emaiL
    );

    if (
        whatsappConnections.error ||
        typeof whatsappConnections.response === 'string'
    ) {
        return whatsappConnections;
    }

    let connectionWhatssap: WhatsappConnectionInterface = {
        id: '',
        connection_name: '',
        serialized_number: '',
        is_active: false,
        unserialized_number: 0,
        userId: '',
        group: {
            whatssap_id: '',
            name: '',
        },
    };
    if (whatsappConnections.response.length === 0) {
        log.success(
            'Perfeito! agora vamos criar uma conexão a uma conta do Whatssap que será por onde o bot enviara os sinais!'
        );

        const connection = await actionsService.createConnectionForBot(emaiL);
        connectionWhatssap = connection.response;
    } else {
        const prompt = listToNumberedList(
            whatsappConnections.response.map(
                (connection: WhatsappConnectionInterface) => {
                    return connection.unserialized_number;
                }
            )
        );

        const groupsQuestions = await inquirer.prompt([
            {
                name: 'connection',
                message: `Qual conexão deseja usar:\n${prompt}`,
                type: 'number',
            },
        ]);
        connectionWhatssap =
            whatsappConnections.response[groupsQuestions.connection - 1];
    }

    log.info('Criando Bot');

    return await actionsService.createBot(
        {
            finish_messages: configuracoesGerais.mensagens_finalizacao,
            bet_message: configuracoesSecundarias.mensagem_aposta,
            finish_time: configuracoesGerais.tempo_finalizacao,
            gameType: configuracoesGerais.jogo_bot[0],
            green_message: configuracoesGerais.mensagem_sucesso,
            in_use: false,
            max_signal: configuracoesGerais.maximo_sinais,
            signalType: configuracoesGerais.tipo_sinal[0],
            name: configuracoesGerais.nome_bot,
            red_message: configuracoesGerais.mensagem_falha,
            welcome_messages: configuracoesGerais.mensagens_boas_vindas,
            whatsappConnectionId: connectionWhatssap.id,
            signal_interval: configuracoesGerais.intervalo_sinal,
        },
        emaiL
    );
}

export default createConnectionForBot;
